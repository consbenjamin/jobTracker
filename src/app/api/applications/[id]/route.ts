import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const application = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        contacts: true,
        interactions: { orderBy: { date: "desc" } },
        tasks: { orderBy: { dueAt: "asc" } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!application) {
      return NextResponse.json(
        { error: "Postulación no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener postulación" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      company,
      role,
      offerLink,
      source,
      status,
      seniority,
      modality,
      expectedSalary,
      requiredStack,
      requiresExternalForm,
      externalFormLink,
      notes,
      checklist,
      cvVersion,
      appliedAt,
      tags,
      isFavorite,
    } = body;

    const data: Record<string, unknown> = {};
    if (company !== undefined) data.company = company;
    if (role !== undefined) data.role = role;
    if (offerLink !== undefined) data.offerLink = offerLink;
    if (source !== undefined) data.source = source;
    if (status !== undefined) data.status = status;
    if (seniority !== undefined) data.seniority = seniority;
    if (modality !== undefined) data.modality = modality;
    if (expectedSalary !== undefined) data.expectedSalary = Number(expectedSalary);
    if (requiredStack !== undefined) data.requiredStack = requiredStack;
    if (requiresExternalForm !== undefined) data.requiresExternalForm = requiresExternalForm;
    if (externalFormLink !== undefined) data.externalFormLink = externalFormLink;
    if (notes !== undefined) data.notes = notes;
    if (checklist !== undefined) data.checklist = checklist;
    if (cvVersion !== undefined) data.cvVersion = cvVersion;
    if (appliedAt !== undefined) data.appliedAt = new Date(appliedAt);
    if (tags !== undefined) data.tags = tags;
    if (isFavorite !== undefined) data.isFavorite = Boolean(isFavorite);

    const application = await prisma.application.updateMany({
      where: { id, userId },
      data,
    });
    if (application.count === 0) {
      return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
    }
    const updated = await prisma.application.findFirst({
      where: { id, userId },
      include: {
        contacts: true,
        interactions: { orderBy: { date: "desc" } },
        tasks: { orderBy: { dueAt: "asc" } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar postulación" },
      { status: 500 }
    );
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
    const deleted = await prisma.application.deleteMany({ where: { id, userId } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ ok: true } as const);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar postulación" },
      { status: 500 }
    );
  }
}
