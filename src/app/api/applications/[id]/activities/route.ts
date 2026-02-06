import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const app = await prisma.application.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!app) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });

    const activities = await prisma.activity.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al listar actividad" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const app = await prisma.application.findFirst({
      where: { id, userId },
    });
    if (!app) {
      return NextResponse.json(
        { error: "Postulación no encontrada" },
        { status: 404 }
      );
    }
    const body = await request.json();
    const { type, payload } = body;
    if (!type || typeof type !== "string") {
      return NextResponse.json(
        { error: "type es obligatorio" },
        { status: 400 }
      );
    }
    const activity = await prisma.activity.create({
      data: {
        applicationId: id,
        type: type.trim(),
        payload: payload != null ? JSON.stringify(payload) : null,
      },
    });
    return NextResponse.json(activity);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear actividad" },
      { status: 500 }
    );
  }
}
