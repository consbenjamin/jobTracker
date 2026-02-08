import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers, saveJobListings } from "@/lib/scraping";

/**
 * Endpoint para el cron de Vercel. Ejecuta los scrapers y persiste en JobListing.
 * Debe llamarse con Authorization: Bearer <CRON_SECRET> (configurar CRON_SECRET en Vercel).
 */
export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;
  const bearer = request.headers.get("Authorization");
  const token = bearer?.replace(/^Bearer\s+/i, "").trim();
  if (!expectedSecret || token !== expectedSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const jobs = await runAllScrapers();
    const saved = await saveJobListings(jobs);
    return NextResponse.json({ ok: true, scraped: jobs.length, saved });
  } catch (e) {
    console.error("[cron] scrape-jobs error:", e);
    return NextResponse.json(
      { ok: false, error: "Error al ejecutar scraping" },
      { status: 500 }
    );
  }
}
