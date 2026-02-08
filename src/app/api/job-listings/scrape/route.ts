import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { runCronScraping } from "@/lib/scraping";

/**
 * POST: Ejecuta el scraping manualmente (mismo flujo que el cron).
 * Solo usuarios autenticados. Útil para actualizar vacantes sin esperar al cron.
 */
export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { scraped, saved, firstError } = await runCronScraping();
    let warning: string | undefined;
    if (scraped > 0 && saved === 0) {
      warning = firstError
        ? `No se guardó ninguna. Error: ${firstError}`
        : "Se obtuvieron vacantes pero no se guardó ninguna. ¿Ejecutaste las migraciones? (npx prisma migrate deploy)";
    }
    return NextResponse.json({ ok: true, scraped, saved, warning });
  } catch (error) {
    console.error("[scraping] manual run error:", error);
    const message =
      error instanceof Error && (error.message.includes("JobListing") || error.message.includes("does not exist"))
        ? "La tabla de vacantes no existe. Ejecuta las migraciones: npx prisma migrate deploy"
        : "Error al ejecutar el scraping";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
