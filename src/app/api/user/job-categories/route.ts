import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import {
  JOB_CATEGORIES,
  parseUserJobCategories,
  DEFAULT_JOB_CATEGORIES,
} from "@/lib/job-categories";

/**
 * GET: Devuelve las categorías disponibles y las seleccionadas por el usuario.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { jobCategories: true },
    });
    const selected = parseUserJobCategories(user?.jobCategories ?? null);
    return NextResponse.json({
      categories: JOB_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
      selected,
      defaultCategories: DEFAULT_JOB_CATEGORIES,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al consultar categorías" }, { status: 500 });
  }
}

/**
 * POST: Actualiza las categorías de trabajo que busca el usuario.
 * Body: { categories: string[] } — array de ids (ej. ["software-development", "marketing"]).
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const raw = body?.categories;
    const ids = Array.isArray(raw)
      ? raw.filter((x: unknown) => typeof x === "string").map((x: string) => x.trim())
      : [];
    const validIds = ids.filter((id) => JOB_CATEGORIES.some((c) => c.id === id));
    const json = validIds.length > 0 ? JSON.stringify(validIds) : null;

    await prisma.user.update({
      where: { id: userId },
      data: { jobCategories: json },
    });
    return NextResponse.json({
      selected: validIds.length > 0 ? validIds : parseUserJobCategories(null),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al guardar las categorías" },
      { status: 500 }
    );
  }
}
