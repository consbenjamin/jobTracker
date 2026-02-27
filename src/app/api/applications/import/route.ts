import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { verifyBearerTokenAndGetUserId } from "@/lib/extension-token";

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < lines[i].length; j++) {
      const c = lines[i][j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
        values.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    // 1) Intentar autenticar por Bearer token (extensión)
    let userId = await verifyBearerTokenAndGetUserId(request);
    // 2) Si no hay token válido, caer a sesión normal
    if (!userId) {
      userId = await getSessionUserId();
      if (!userId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    let csvText: string;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json();

      // Modo 1: payload JSON de la extensión de LinkedIn
      // {
      //   job: {
      //     title,
      //     company,
      //     seniority?,
      //     stack?,
      //     location?,
      //     url,
      //     description?
      //   }
      // }
      if (body && typeof body === "object" && body.job && typeof body.job === "object") {
        const {
          title,
          company,
          seniority,
          stack,
          location,
          url,
          description,
        } = body.job as {
          title?: string;
          company?: string;
          seniority?: string;
          stack?: string;
          location?: string;
          url?: string;
          description?: string;
        };

        let companyS = String(company ?? "").trim().slice(0, 200);
        let roleS = String(title ?? "").trim().slice(0, 200);
        if (!companyS) companyS = "LinkedIn (sin empresa)";
        if (!roleS) roleS = "Oferta sin título";

        const MAX_TEXT = 2000;
        const MAX_LINK = 2048;
        const str = (v: unknown, max: number): string | null =>
          v != null && typeof v === "string" ? v.slice(0, max) : null;

        const application = await prisma.application.create({
          data: {
            userId,
            company: companyS,
            role: roleS,
            offerLink: str(url, MAX_LINK),
            source: "linkedin_extension",
            status: "Applied",
            seniority: str(seniority, 100),
            requiredStack: str(stack, MAX_TEXT),
            notes: (() => {
              const loc = location
                ? `Ubicación: ${String(location).slice(0, MAX_TEXT - 11)}`
                : "";
              const desc = str(description, MAX_TEXT);
              if (loc && desc) return `${loc}\n\n${desc}`;
              if (loc) return loc;
              return desc;
            })(),
          },
        });

        return NextResponse.json(application, { status: 201 });
      }

      // Modo 2: compatibilidad hacia atrás con importación CSV vía JSON
      csvText = body.csv ?? body.data ?? "";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No se envió archivo" },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else {
      csvText = await request.text();
    }

    const rows = parseCsv(csvText);
    const created: string[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const company = (r.company ?? r.Company ?? "").trim();
      const role = (r.role ?? r.Role ?? "").trim();
      if (!company || !role) {
        errors.push({ row: i + 2, message: "Falta empresa o rol" });
        continue;
      }
      try {
        const app = await prisma.application.create({
          data: {
            userId,
            company,
            role,
            offerLink: (r.offerLink ?? r.offer_link ?? "").trim() || null,
            source: (r.source ?? "LinkedIn").trim() || "LinkedIn",
            status: (r.status ?? "Applied").trim() || "Applied",
            seniority: (r.seniority ?? "").trim() || null,
            modality: (r.modality ?? "").trim() || null,
            expectedSalary:
              r.expectedSalary != null || r.expected_salary != null
                ? Number((r.expectedSalary ?? r.expected_salary ?? 0)) || null
                : null,
            requiredStack: (r.requiredStack ?? r.required_stack ?? "").trim() || null,
            notes: (r.notes ?? "").trim() || null,
            appliedAt: r.appliedAt ?? r.applied_at
              ? new Date(r.appliedAt ?? r.applied_at)
              : undefined,
          },
        });
        created.push(app.id);
      } catch (err) {
        errors.push({
          row: i + 2,
          message: err instanceof Error ? err.message : "Error al crear",
        });
      }
    }

    return NextResponse.json({ created: created.length, errors });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al importar CSV" },
      { status: 500 }
    );
  }
}
