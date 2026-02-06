import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

async function interactionBelongsToUser(interactionId: string, userId: string): Promise<boolean> {
  const interaction = await prisma.interaction.findUnique({
    where: { id: interactionId },
    include: { application: { select: { userId: true } } },
  });
  return interaction?.application?.userId === userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const ok = await interactionBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Interacción no encontrada" }, { status: 404 });

    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.type !== undefined) data.type = body.type;
    if (body.date !== undefined) data.date = new Date(body.date);
    if (body.responded !== undefined) data.responded = body.responded;
    if (body.textOrSummary !== undefined) data.textOrSummary = body.textOrSummary;
    if (body.outcome !== undefined) data.outcome = body.outcome;
    const interaction = await prisma.interaction.update({ where: { id }, data });
    return NextResponse.json(interaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar interacción" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const ok = await interactionBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Interacción no encontrada" }, { status: 404 });

    await prisma.interaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar interacción" }, { status: 500 });
  }
}
