import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const source = await prisma.application.findUnique({
      where: { id },
    });
    if (!source) {
      return NextResponse.json(
        { error: "Postulación no encontrada" },
        { status: 404 }
      );
    }

    const duplicate = await prisma.application.create({
      data: {
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
