import type { ScrapedJob } from "./types";

const REMOTEOK_API = "https://remoteok.com/api";

const DEV_TAGS = new Set([
  "developer",
  "software",
  "engineer",
  "engineering",
  "frontend",
  "backend",
  "fullstack",
  "full-stack",
  "devops",
  "sre",
  "mobile",
  "ios",
  "android",
  "react",
  "node",
  "python",
  "java",
  "typescript",
  "javascript",
  "data",
  "dev",
]);

interface RemoteOKJob {
  id?: string | number;
  slug?: string;
  company?: string;
  position?: string;
  tags?: string[];
  description?: string;
  location?: string;
  apply_url?: string;
  url?: string;
}

/**
 * Scraper que usa el feed público de RemoteOK (gratuito, sin API key).
 * Filtra por tags de desarrollo (developer, software, engineer, etc.) y limita a 30 ofertas.
 */
export async function scrapeRemoteOK(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const res = await fetch(REMOTEOK_API, {
      headers: { "User-Agent": "JobTracker/1.0 (https://github.com)" },
      next: { revalidate: 0 },
    });
    if (!res.ok) return jobs;
    const raw = (await res.json()) as unknown;
    const list = Array.isArray(raw) ? raw : [];
    let count = 0;
    const maxJobs = 30;
    for (const item of list) {
      if (count >= maxJobs) break;
      const j = item as RemoteOKJob;
      if (typeof j !== "object" || j === null || !j.position) continue;
      const tags = (j.tags ?? []).map((t) => String(t).toLowerCase());
      const isDev = tags.some((t) => DEV_TAGS.has(t));
      if (!isDev) continue;
      const company = j.company?.trim() ?? "Unknown";
      const role = j.position?.trim() ?? "Unknown";
      if (!company || !role) continue;
      jobs.push({
        company,
        role,
        offerLink: j.apply_url?.trim() ?? j.url?.trim() ?? null,
        source: "RemoteOK",
        category: "software-development", // RemoteOK se filtra por tags de desarrollo
        seniority: null,
        modality: "remoto",
        description: typeof j.description === "string" ? j.description.slice(0, 5000) : null,
        externalId: j.id != null ? String(j.id) : j.slug ?? null,
      });
      count++;
    }
  } catch (e) {
    console.error("[scraping] RemoteOK error:", e);
  }
  return jobs;
}
