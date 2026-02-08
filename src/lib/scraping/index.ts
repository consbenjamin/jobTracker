import { prisma } from "@/lib/db";
import type { ScrapedJob } from "./types";
import { scrapeLinkedIn } from "./linkedin";
import { scrapeRemotive } from "./remotive";
import { scrapeRemoteOK } from "./remoteok";

export type { ScrapedJob } from "./types";

/**
 * Ejecuta todos los scrapers en paralelo y devuelve la lista deduplicada.
 * - LinkedIn: SerpApi Google Jobs (1 búsqueda USA, requiere SERPAPI_API_KEY).
 * - Remotive: API gratuita, categoría software-dev.
 * - RemoteOK: feed gratuito, filtrado por tags de desarrollo.
 */
export async function runAllScrapers(): Promise<ScrapedJob[]> {
  const [linkedin, remotive, remoteok] = await Promise.all([
    scrapeLinkedIn(),
    scrapeRemotive(),
    scrapeRemoteOK(),
  ]);
  return deduplicate([...linkedin, ...remotive, ...remoteok]);
}

function deduplicate(jobs: ScrapedJob[]): ScrapedJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = j.externalId
      ? `${j.source}:${j.externalId}`
      : `${j.source}:${j.offerLink ?? j.company}:${j.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Persiste las vacantes en JobListing. Usa upsert cuando hay externalId;
 * si no, busca por source + offerLink para evitar duplicados.
 */
export async function saveJobListings(jobs: ScrapedJob[]): Promise<number> {
  let saved = 0;
  for (const j of jobs) {
    try {
      const company = String(j.company).trim().slice(0, 200);
      const role = String(j.role).trim().slice(0, 200);
      const source = String(j.source).trim().slice(0, 50);
      if (!company || !role || !source) continue;

      if (j.externalId != null && j.externalId !== "") {
        await prisma.jobListing.upsert({
          where: {
            source_externalId: { source, externalId: j.externalId },
          },
          create: {
            company,
            role,
            offerLink: j.offerLink?.slice(0, 2048) ?? null,
            source,
            seniority: j.seniority?.slice(0, 100) ?? null,
            modality: j.modality?.slice(0, 50) ?? null,
            description: j.description?.slice(0, 5000) ?? null,
            externalId: j.externalId,
          },
          update: {
            company,
            role,
            offerLink: j.offerLink?.slice(0, 2048) ?? null,
            seniority: j.seniority?.slice(0, 100) ?? null,
            modality: j.modality?.slice(0, 50) ?? null,
            description: j.description?.slice(0, 5000) ?? null,
          },
        });
        saved++;
      } else {
        const existing = j.offerLink
          ? await prisma.jobListing.findFirst({
              where: { source, offerLink: j.offerLink },
            })
          : null;
        if (existing) {
          await prisma.jobListing.update({
            where: { id: existing.id },
            data: {
              company,
              role,
              seniority: j.seniority?.slice(0, 100) ?? null,
              modality: j.modality?.slice(0, 50) ?? null,
              description: j.description?.slice(0, 5000) ?? null,
            },
          });
          saved++;
        } else {
          await prisma.jobListing.create({
            data: {
              company,
              role,
              offerLink: j.offerLink?.slice(0, 2048) ?? null,
              source,
              seniority: j.seniority?.slice(0, 100) ?? null,
              modality: j.modality?.slice(0, 50) ?? null,
              description: j.description?.slice(0, 5000) ?? null,
            },
          });
          saved++;
        }
      }
    } catch (e) {
      console.error("[scraping] saveJobListings item error:", e);
    }
  }
  return saved;
}
