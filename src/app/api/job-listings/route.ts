import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { clampSearch, clampFilterField, clampTagList, clampPage, clampLimit } from "@/lib/input-validation";

/**
 * Lista las vacantes descubiertas (JobListing) del scraping.
 * Requiere sesión. Filtros opcionales: source, search (empresa o rol).
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const source = clampFilterField(searchParams.get("source"));
    const search = clampSearch(searchParams.get("search"));
    const modalityRaw = searchParams.get("modality"); // remoto | presencial | hibrido | unspecified
    const categoriesParam = searchParams.get("categories"); // comma-separated
    const page = clampPage(parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = clampLimit(parseInt(searchParams.get("limit") ?? "12", 10) || 12, 12, 50);
    const skip = (page - 1) * limit;

    const andParts: Record<string, unknown>[] = [
      { OR: [{ userId: null }, { userId }] },
    ];
    if (source) andParts.push({ source });
    if (search) {
      andParts.push({
        OR: [
          { company: { contains: search, mode: "insensitive" } },
          { role: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    if (categoriesParam) {
      const list = clampTagList(categoriesParam.split(","));
      if (list.length > 0) {
        andParts.push({
          OR: [{ category: { in: list } }, { category: null }],
        });
      }
    }
    const modality = modalityRaw?.trim().toLowerCase();
    if (modality) {
      const m = modality;
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
