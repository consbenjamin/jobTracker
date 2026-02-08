import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { SCRAPE_SCHEDULE, SCRAPE_SCHEDULE_LABEL, SCRAPE_SOURCES, isSourceEnabled } from "@/lib/scraping/config";

/**
 * Devuelve la configuración visible del scraping: frecuencia y fuentes (con enabled según env).
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const sources = SCRAPE_SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    enabled: isSourceEnabled(s.envKey),
  }));

  return NextResponse.json({
    schedule: SCRAPE_SCHEDULE,
    scheduleLabel: SCRAPE_SCHEDULE_LABEL,
    sources,
  });
}
