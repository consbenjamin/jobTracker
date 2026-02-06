import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

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
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    let csvText: string;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "No se envió archivo" },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      csvText = body.csv ?? body.data ?? "";
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
