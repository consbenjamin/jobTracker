import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    await prisma.interaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar interacción" }, { status: 500 });
  }
}
