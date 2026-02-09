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
    const categoriesParam = searchParams.get("categories"); // comma-separated: "software-development,marketing"

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
    const where = { AND: andParts };

    const list = await prisma.jobListing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al listar vacantes descubiertas" },
      { status: 500 }
    );
  }
}
