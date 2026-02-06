import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

async function contactBelongsToUser(contactId: string, userId: string): Promise<boolean> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: { application: { select: { userId: true } } },
  });
  return contact?.application?.userId === userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const ok = await contactBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });

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
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const ok = await contactBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });

    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar contacto" }, { status: 500 });
  }
}
