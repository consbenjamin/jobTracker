import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

/**
 * Crea una Application (postulación) a partir de una JobListing para el usuario actual.
 * La vacante descubierta sigue en la lista por si quieres volver a añadirla.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const listing = await prisma.jobListing.findUnique({ where: { id } });
    if (!listing) return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });

    const application = await prisma.application.create({
      data: {
        userId,
        company: listing.company,
        role: listing.role,
        offerLink: listing.offerLink,
        source: listing.source,
        status: "Applied",
        modality: listing.modality,
        notes: listing.description?.slice(0, 2000) ?? null,
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al añadir a postulaciones" },
      { status: 500 }
    );
  }
}
