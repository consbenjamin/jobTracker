import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, type, date, responded = false, textOrSummary, outcome } = body;
    if (!applicationId || !type) {
      return NextResponse.json(
        { error: "applicationId y type son obligatorios" },
        { status: 400 }
      );
    }
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
