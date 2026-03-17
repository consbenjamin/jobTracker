import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * GET: Devuelve si el usuario tiene activado el auto-ghost para Applied.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { autoGhostApplied: true },
    });
    return NextResponse.json({ enabled: user?.autoGhostApplied ?? true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al consultar configuración" }, { status: 500 });
  }
}

/**
 * POST: { enabled: boolean }
 */
export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const enabled = Boolean(body?.enabled);

    await prisma.user.update({
      where: { id: userId },
      data: { autoGhostApplied: enabled },
    });

    return NextResponse.json({ enabled });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 });
  }
}

