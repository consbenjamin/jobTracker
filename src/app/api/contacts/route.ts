import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const { applicationId, name, position, channel = "LinkedIn", link, notes } = body;
    if (!applicationId || !name) {
      return NextResponse.json(
        { error: "applicationId y name son obligatorios" },
        { status: 400 }
      );
    }
    const app = await prisma.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    });
    if (!app) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });

    const contact = await prisma.contact.create({
      data: {
        applicationId,
        name: String(name).trim(),
        position: position?.trim() ?? null,
        channel: channel ?? "LinkedIn",
        link: link?.trim() ?? null,
        notes: notes?.trim() ?? null,
      },
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear contacto" }, { status: 500 });
  }
}
