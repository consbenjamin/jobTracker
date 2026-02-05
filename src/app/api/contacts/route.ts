import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, name, position, channel = "LinkedIn", link, notes } = body;
    if (!applicationId || !name) {
      return NextResponse.json(
        { error: "applicationId y name son obligatorios" },
        { status: 400 }
      );
    }
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
