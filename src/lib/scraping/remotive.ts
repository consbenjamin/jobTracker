import type { ScrapedJob } from "./types";

const REMOTIVE_API = "https://remotive.com/api/remote-jobs";

interface RemotiveJob {
  id: number;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  job_type?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
}

interface RemotiveResponse {
  jobs?: RemotiveJob[];
}

/**
 * Scraper que usa la API pública de Remotive (gratuita, sin API key).
 * Filtra por categoría software-dev. Remotive recomienda no hacer más de ~4 requests/día.
 */
export async function scrapeRemotive(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const url = `${REMOTIVE_API}?category=software-dev&limit=25`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return jobs;
    const data = (await res.json()) as RemotiveResponse;
    const list = data.jobs ?? [];
    for (const j of list) {
      const company = j.company_name?.trim() ?? "Unknown";
      const role = j.title?.trim() ?? "Unknown";
      if (!company || !role) continue;
      jobs.push({
        company,
        role,
        offerLink: j.url?.trim() ?? null,
        source: "Remotive",
        seniority: null,
        modality: "remoto",
        description: j.description?.slice(0, 5000) ?? null,
        externalId: j.id != null ? String(j.id) : null,
      });
    }
  } catch (e) {
    console.error("[scraping] Remotive error:", e);
  }
  return jobs;
}
