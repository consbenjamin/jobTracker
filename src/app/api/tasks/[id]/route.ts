import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

async function taskBelongsToUser(taskId: string, userId: string): Promise<boolean> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { application: { select: { userId: true } } },
  });
  return task?.application?.userId === userId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const ok = await taskBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.dueAt !== undefined) data.dueAt = new Date(body.dueAt);
    if (body.completed !== undefined) data.completed = body.completed;
    if (body.type !== undefined) data.type = body.type;
    const task = await prisma.task.update({ where: { id }, data });
    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar tarea" }, { status: 500 });
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
    const ok = await taskBelongsToUser(id, userId);
    if (!ok) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar tarea" }, { status: 500 });
  }
}
