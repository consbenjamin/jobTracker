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
  /** SerpApi devuelve jobs_results como array de jobs o como objeto con .jobs */
  jobs_results?: SerpApiJob[] | { jobs?: SerpApiJob[] };
  serpapi_pagination?: { next_page_token?: string };
}

/**
 * Obtiene vacantes vía SerpApi Google Jobs (LinkedIn, Indeed, ZipRecruiter, etc.).
 * Una búsqueda: software developer en USA (1 página). source = valor real de "via" por oferta.
 * @param apiKey - Si se pasa, se usa esta key; si no, process.env.SERPAPI_API_KEY (para cron global o usuario).
 */
export async function scrapeLinkedIn(apiKey?: string): Promise<ScrapedJob[]> {
  const key = apiKey ?? process.env.SERPAPI_API_KEY;
  if (!key?.trim()) {
    return [];
  }

  // Una sola búsqueda por ejecución para ahorrar créditos SerpApi (free tier): software developer en USA, 1 página
  const allJobs: ScrapedJob[] = [];
  try {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: "software developer",
      location: "United States",
      api_key: key.trim(),
      gl: "us",
      hl: "en",
    });
    const url = `${SERPAPI_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return allJobs;
    const data = (await res.json()) as SerpApiJobsResponse;
    const raw = data.jobs_results;
    const jobList = Array.isArray(raw) ? raw : raw?.jobs ?? [];
    for (const job of jobList) {
      const company = job.company_name?.trim() ?? "Unknown";
      const role = job.title?.trim() ?? "Unknown";
      if (!company || !role) continue;
      const via = job.via?.trim() || "Google Jobs";
      const offerLink =
        job.link ??
        job.apply_options?.find((o) => o.link)?.link ??
        job.apply_options?.[0]?.link ??
        null;
      allJobs.push({
        company,
        role,
        offerLink: offerLink ?? null,
        source: via,
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
