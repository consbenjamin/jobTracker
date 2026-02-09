import type { ScrapedJob } from "./types";
import { JOB_CATEGORIES } from "@/lib/job-categories";

/**
 * SerpApi Google Jobs API: https://serpapi.com/google-jobs-api
 * (No confundir con la Search API general: https://serpapi.com/search-api)
 * Endpoint: GET https://serpapi.com/search?engine=google_jobs&q=...&api_key=...
 */
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
  /** Estado: Processing -> Success | Error (doc: search_metadata.status) */
  search_metadata?: { status?: string };
  /** Mensaje si la búsqueda falla (ej. API key inválida, rate limit) */
  error?: string;
  /** Doc: array de jobs; algunas respuestas pueden tener .jobs dentro de un objeto */
  jobs_results?: SerpApiJob[] | { jobs?: SerpApiJob[] };
  serpapi_pagination?: { next_page_token?: string };
}

/**
 * Obtiene vacantes vía SerpApi Google Jobs (LinkedIn, Indeed, ZipRecruiter, etc.).
 * Una búsqueda por ejecución (query configurable). source = valor real de "via" por oferta.
 * @param apiKey - Si se pasa, se usa esta key; si no, process.env.SERPAPI_API_KEY (para cron global o usuario).
 * @param searchQuery - Término de búsqueda (ej. "software developer", "marketing manager"). Por defecto "software developer".
 */
export async function scrapeLinkedIn(
  apiKey?: string,
  searchQuery: string = "software developer"
): Promise<ScrapedJob[]> {
  const key = apiKey ?? process.env.SERPAPI_API_KEY;
  if (!key?.trim()) {
    return [];
  }

  const query = searchQuery?.trim() || "software developer";
  const allJobs: ScrapedJob[] = [];
  try {
    const params = new URLSearchParams({
      engine: "google_jobs",
      q: query,
      location: "United States",
      api_key: key.trim(),
      gl: "us",
      hl: "en",
    });
    const url = `${SERPAPI_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const data = (await res.json()) as SerpApiJobsResponse;
    if (!res.ok) {
      console.error("[scraping] SerpApi HTTP", res.status, data?.error ?? res.statusText);
      return allJobs;
    }
    if (data.error) {
      console.error("[scraping] SerpApi error:", data.error);
      return allJobs;
    }
    if (data.search_metadata?.status && data.search_metadata.status !== "Success") {
      console.warn("[scraping] SerpApi status:", data.search_metadata.status);
      return allJobs;
    }
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
      const categorySlug = queryToCategorySlug(query);
      allJobs.push({
        company,
        role,
        offerLink: offerLink ?? null,
        source: via,
        category: categorySlug,
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

function queryToCategorySlug(query: string): string {
  const q = query.toLowerCase().trim();
  const found = JOB_CATEGORIES.find(
    (c) => c.linkedInQuery.toLowerCase() === q || c.id.replace(/-/g, " ") === q.replace(/-/g, " ")
  );
  return found?.id ?? "software-development";
}

function mapScheduleType(scheduleType?: string): string | null {
  if (!scheduleType) return null;
  const s = scheduleType.toLowerCase();
  if (s.includes("remote") || s.includes("remoto")) return "remoto";
  if (s.includes("full") || s.includes("part")) return "presencial";
  if (s.includes("hybrid") || s.includes("híbrido") || s.includes("hibrido")) return "hibrido";
  return null;
}
