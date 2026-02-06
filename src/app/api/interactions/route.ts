import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { applicationId, type, date, responded = false, textOrSummary, outcome } = body;
    if (!applicationId || !type) {
      return NextResponse.json(
        { error: "applicationId y type son obligatorios" },
        { status: 400 }
      );
    }
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    });
    if (!app) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });

    const interaction = await prisma.interaction.create({
      data: {
        applicationId,
        type: String(type),
        date: date ? new Date(date) : undefined,
        responded: Boolean(responded),
        textOrSummary: textOrSummary?.trim() ?? null,
        outcome: outcome?.trim() ?? null,
      },
    });
    return NextResponse.json(interaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear interacción" }, { status: 500 });
  }
}
