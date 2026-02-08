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

    const { scraped, saved } = await runCronScraping();
    return NextResponse.json({ ok: true, scraped, saved });
  } catch (error) {
    console.error("[scraping] manual run error:", error);
    return NextResponse.json(
      { error: "Error al ejecutar el scraping" },
      { status: 500 }
    );
  }
}
