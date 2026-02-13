import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * Lista las vacantes descubiertas (JobListing) del scraping.
 * Requiere sesión. Filtros opcionales: source, search (empresa o rol).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const search = searchParams.get("search");
    const modality = searchParams.get("modality"); // remoto | presencial | hibrido | unspecified
    const categoriesParam = searchParams.get("categories"); // comma-separated
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(6, parseInt(searchParams.get("limit") ?? "12", 10) || 12));
    const skip = (page - 1) * limit;

    const andParts: Record<string, unknown>[] = [
      { OR: [{ userId: null }, { userId }] },
    ];
    if (source?.trim()) andParts.push({ source: source.trim() });
    if (search?.trim()) {
      const term = search.trim();
      andParts.push({
        OR: [
          { company: { contains: term, mode: "insensitive" } },
          { role: { contains: term, mode: "insensitive" } },
        ],
      });
    }
    if (categoriesParam?.trim()) {
      const list = categoriesParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (list.length > 0) {
        andParts.push({
          OR: [{ category: { in: list } }, { category: null }],
        });
      }
    }
    if (modality?.trim()) {
      const m = modality.trim().toLowerCase();
      if (m === "unspecified" || m === "no especifica") {
        andParts.push({ modality: null });
      } else if (["remoto", "presencial", "hibrido"].includes(m)) {
        andParts.push({ modality: m });
      }
    }
    const where = { AND: andParts };

    const [list, total] = await Promise.all([
      prisma.jobListing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.jobListing.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return NextResponse.json({
      items: list,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al listar vacantes descubiertas" },
      { status: 500 }
    );
  }
}
