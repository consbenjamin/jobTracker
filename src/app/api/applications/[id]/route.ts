import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        contacts: true,
        interactions: { orderBy: { date: "desc" } },
        tasks: { orderBy: { dueAt: "asc" } },
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

    const application = await prisma.application.update({
      where: { id },
      data,
    });
    return NextResponse.json(application);
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
    const { id } = await params;
    await prisma.application.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al eliminar postulación" },
      { status: 500 }
    );
  }
}
