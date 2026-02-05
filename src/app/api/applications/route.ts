import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};
    if (company) where.company = { contains: company };
    if (role) where.role = { contains: role };
    if (status) where.status = status;
    if (from || to) {
      where.appliedAt = {};
      if (from) (where.appliedAt as Record<string, string>).gte = from;
      if (to) (where.appliedAt as Record<string, string>).lte = to;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        contacts: true,
        interactions: true,
        tasks: true,
      },
      orderBy: { appliedAt: "desc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al listar postulaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company,
      role,
      offerLink,
      source = "LinkedIn",
      status = "Applied",
      seniority,
      modality,
      expectedSalary,
      requiredStack,
      requiresExternalForm = false,
      externalFormLink,
      notes,
      checklist,
      cvVersion,
      appliedAt,
    } = body;

    if (!company || !role) {
      return NextResponse.json(
        { error: "company y role son obligatorios" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        company,
        role,
        offerLink: offerLink ?? null,
        source: source ?? "LinkedIn",
        status: status ?? "Applied",
        seniority: seniority ?? null,
        modality: modality ?? null,
        expectedSalary: expectedSalary != null ? Number(expectedSalary) : null,
        requiredStack: requiredStack ?? null,
        requiresExternalForm: Boolean(requiresExternalForm),
        externalFormLink: externalFormLink ?? null,
        notes: notes ?? null,
        checklist: checklist ?? null,
        cvVersion: cvVersion ?? null,
        appliedAt: appliedAt ? new Date(appliedAt) : undefined,
      },
    });
    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear postulación" },
      { status: 500 }
    );
  }
}
