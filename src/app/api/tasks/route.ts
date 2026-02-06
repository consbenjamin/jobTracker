import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { applicationId, title, dueAt, type = "follow_up" } = body;
    if (!applicationId || !title) {
      return NextResponse.json(
        { error: "applicationId y title son obligatorios" },
        { status: 400 }
      );
    }
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    });
    if (!app) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });

    const task = await prisma.task.create({
      data: {
        applicationId,
        title: String(title).trim(),
        dueAt: new Date(dueAt),
        type: type ?? "follow_up",
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear tarea" }, { status: 500 });
  }
}
