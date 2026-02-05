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
    if (body.name !== undefined) data.name = body.name;
    if (body.position !== undefined) data.position = body.position;
    if (body.channel !== undefined) data.channel = body.channel;
    if (body.link !== undefined) data.link = body.link;
    if (body.notes !== undefined) data.notes = body.notes;
    const contact = await prisma.contact.update({ where: { id }, data });
    return NextResponse.json(contact);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar contacto" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar contacto" }, { status: 500 });
  }
}
