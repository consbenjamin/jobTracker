import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

function escapeCsvCell(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const exportCsv = searchParams.get("export") === "csv";
    const search = searchParams.get("search");
    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const tagsParam = searchParams.get("tags"); // comma-separated
    const isFavoriteParam = searchParams.get("isFavorite");

    const andParts: Record<string, unknown>[] = [];
    if (search?.trim()) {
      const term = search.trim();
      andParts.push({
        OR: [
          { company: { contains: term, mode: "insensitive" } },
          { role: { contains: term, mode: "insensitive" } },
        ],
      });
    }
    if (company) andParts.push({ company: { contains: company } });
    if (role) andParts.push({ role: { contains: role } });
    if (status) andParts.push({ status });
    if (from || to) {
      const appliedAt: Record<string, string> = {};
      if (from) appliedAt.gte = from;
      if (to) appliedAt.lte = to;
      andParts.push({ appliedAt });
    }
    if (tagsParam?.trim()) {
      const tagList = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        andParts.push({
          OR: tagList.map((tag) => ({
            tags: { contains: tag },
          })),
        });
      }
    }
    if (isFavoriteParam === "true" || isFavoriteParam === "1") {
      andParts.push({ isFavorite: true });
    }
    andParts.push({ userId });
    const where = andParts.length > 0 ? { AND: andParts } : {};

    const applications = await prisma.application.findMany({
      where,
      include: exportCsv ? undefined : { contacts: true, interactions: true, tasks: true },
      orderBy: { appliedAt: "desc" },
    });

    if (exportCsv) {
      const headers = ["company", "role", "status", "appliedAt", "source", "seniority", "modality", "offerLink", "notes"];
      const rows = applications.map((a) => {
        const record = a as Record<string, unknown>;
        const appliedAt = record.appliedAt instanceof Date ? record.appliedAt.toISOString() : record.appliedAt;
        return headers.map((h) =>
          h === "appliedAt" ? escapeCsvCell(String(appliedAt ?? "")) : escapeCsvCell(record[h] as string | null)
        ).join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="postulaciones-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al listar postulaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const {
      company,
      role,
      offerLink,
      source = "LinkedIn",
      status = "Applied",
      seniority,
      modality,
      expectedSalary,
      requiredStack,
      requiresExternalForm = false,
      externalFormLink,
      notes,
      checklist,
      cvVersion,
      appliedAt,
      tags,
      isFavorite,
    } = body;

    if (!company || !role) {
      return NextResponse.json(
        { error: "company y role son obligatorios" },
        { status: 400 }
      );
    }
    const MAX_TEXT = 2000;
    const MAX_LINK = 2048;
    const str = (v: unknown, max: number): string | null =>
      v != null && typeof v === "string" ? v.slice(0, max) : null;
    const tagsVal =
      tags == null
        ? null
        : Array.isArray(tags)
          ? JSON.stringify(tags).slice(0, MAX_TEXT)
          : str(tags, MAX_TEXT);
    const companyS = String(company).trim().slice(0, 200);
    const roleS = String(role).trim().slice(0, 200);
    if (!companyS || !roleS) {
      return NextResponse.json(
        { error: "company y role no pueden estar vacíos" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId,
        company: companyS,
        role: roleS,
        offerLink: str(offerLink, MAX_LINK) ?? null,
        source: (source && String(source).slice(0, 50)) ?? "LinkedIn",
        status: (status && String(status).slice(0, 50)) ?? "Applied",
        seniority: str(seniority, 100),
        modality: str(modality, 50),
        expectedSalary: expectedSalary != null ? Number(expectedSalary) : null,
        requiredStack: str(requiredStack, MAX_TEXT),
        requiresExternalForm: Boolean(requiresExternalForm),
        externalFormLink: str(externalFormLink, MAX_LINK) ?? null,
        notes: str(notes, MAX_TEXT),
        checklist: str(checklist, MAX_TEXT),
        cvVersion: str(cvVersion, 50),
        appliedAt: appliedAt ? new Date(appliedAt) : undefined,
        tags: tagsVal,
        isFavorite: Boolean(isFavorite),
      },
    });
    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear postulación" },
      { status: 500 }
    );
  }
}
