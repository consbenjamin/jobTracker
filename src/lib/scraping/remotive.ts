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
 * @param categories - Slugs de categoría (ej. ["software-development", "marketing"]). Si vacío, usa ["software-development"].
 * Remotive recomienda no hacer más de ~4 requests/día.
 */
export async function scrapeRemotive(
  categories: string[] = ["software-development"]
): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const toFetch =
    categories.length > 0 ? categories : ["software-development"];
  const limit = Math.max(10, Math.floor(25 / toFetch.length));

  for (const category of toFetch) {
    try {
      const url = `${REMOTIVE_API}?category=${encodeURIComponent(category)}&limit=${limit}`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) continue;
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
          category,
          seniority: null,
          modality: "remoto",
          description: j.description?.slice(0, 5000) ?? null,
          externalId: j.id != null ? String(j.id) : null,
        });
      }
    } catch (e) {
      console.error("[scraping] Remotive error:", e);
    }
  }
  return jobs;
}
