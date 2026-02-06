import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const source = await prisma.application.findFirst({
      where: { id, userId },
    });
    if (!source) {
      return NextResponse.json(
        { error: "Postulación no encontrada" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.application.create({
      data: {
        userId,
        company: source.company,
        role: source.role,
        offerLink: source.offerLink,
        source: source.source,
        status: "Applied",
        seniority: source.seniority,
        modality: source.modality,
        expectedSalary: source.expectedSalary,
        requiredStack: source.requiredStack,
        requiresExternalForm: source.requiresExternalForm,
        externalFormLink: source.externalFormLink,
        notes: source.notes,
        checklist: source.checklist,
        cvVersion: source.cvVersion,
        tags: source.tags,
        isFavorite: false,
      },
    });
    return NextResponse.json(duplicate);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al duplicar postulación" },
      { status: 500 }
    );
  }
}
