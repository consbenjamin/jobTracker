import type { ScrapedJob } from "./types";

const SERPAPI_BASE = "https://serpapi.com/search";

interface SerpApiApplyOption {
  title?: string;
  link?: string;
}

interface SerpApiJob {
  title?: string;
  company_name?: string;
  location?: string;
  via?: string;
  link?: string;
  job_id?: string;
  description?: string;
  detected_extensions?: { schedule_type?: string };
  apply_options?: SerpApiApplyOption[];
}

interface SerpApiJobsResponse {
  jobs_results?: { jobs?: SerpApiJob[] };
  serpapi_pagination?: { next_page_token?: string };
}

/**
 * Obtiene vacantes de LinkedIn vía SerpApi Google Jobs.
 * Filtra solo resultados donde via === "LinkedIn".
 * Una sola búsqueda: software developer en USA (1 página).
 * Requiere SERPAPI_API_KEY en env (https://serpapi.com).
 */
export async function scrapeLinkedIn(): Promise<ScrapedJob[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.warn("[scraping] SERPAPI_API_KEY no definida; no se obtendrán vacantes de LinkedIn.");
    return [];
  }

  // Una sola búsqueda por ejecución para ahorrar créditos SerpApi (free tier): software developer en USA, 1 página
  const allJobs: ScrapedJob[] = [];
  try {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: "software developer",
      location: "United States",
      api_key: apiKey,
      gl: "us",
      hl: "en",
    });
    const url = `${SERPAPI_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return allJobs;
    const data = (await res.json()) as SerpApiJobsResponse;
    const jobList = data.jobs_results?.jobs ?? [];
    for (const job of jobList) {
      if (job.via?.toLowerCase().includes("linkedin") !== true) continue;
      const company = job.company_name?.trim() ?? "Unknown";
      const role = job.title?.trim() ?? "Unknown";
      if (!company || !role) continue;
      const offerLink =
        job.link ??
        job.apply_options?.find((o) => o.title?.toLowerCase().includes("linkedin"))?.link ??
        job.apply_options?.[0]?.link ??
        null;
      allJobs.push({
        company,
        role,
        offerLink: offerLink ?? null,
        source: "LinkedIn",
        seniority: null,
        modality: mapScheduleType(job.detected_extensions?.schedule_type),
        description: job.description?.slice(0, 5000) ?? null,
        externalId: job.job_id ?? null,
      });
    }
  } catch (e) {
    console.error("[scraping] LinkedIn (SerpApi) error:", e);
  }

  return allJobs;
}

function mapScheduleType(scheduleType?: string): string | null {
  if (!scheduleType) return null;
  const s = scheduleType.toLowerCase();
  if (s.includes("remote") || s.includes("remoto")) return "remoto";
  if (s.includes("full") || s.includes("part")) return "presencial";
  if (s.includes("hybrid") || s.includes("híbrido") || s.includes("hibrido")) return "hibrido";
  return null;
}
