import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import type { ScrapedJob } from "./types";
import { isSourceEnabled } from "./config";
import { scrapeLinkedIn } from "./linkedin";
import { scrapeRemotive } from "./remotive";
import { scrapeRemoteOK } from "./remoteok";

export type { ScrapedJob } from "./types";

/**
 * Ejecuta los scrapers habilitados (ENABLE_*) en paralelo. Para uso con API key global únicamente.
 */
export async function runAllScrapers(): Promise<ScrapedJob[]> {
  const promises: Promise<ScrapedJob[]>[] = [];
  if (isSourceEnabled("ENABLE_REMOTIVE")) promises.push(scrapeRemotive());
  if (isSourceEnabled("ENABLE_REMOTEOK")) promises.push(scrapeRemoteOK());
  if (isSourceEnabled("ENABLE_LINKEDIN")) promises.push(scrapeLinkedIn());
  const results = await Promise.all(promises);
  return deduplicate(results.flat());
}

/**
 * Ejecuta el scraping completo del cron: fuentes globales (Remotive, RemoteOK, LinkedIn con key de sistema)
 * y LinkedIn por cada usuario que tenga su propia API key guardada.
 */
export async function runCronScraping(): Promise<{ scraped: number; saved: number }> {
  let totalScraped = 0;
  let totalSaved = 0;

  const run = async (jobs: ScrapedJob[], userId: string | null) => {
    const n = jobs.length;
    if (n === 0) return;
    totalScraped += n;
    totalSaved += await saveJobListings(jobs, userId);
  };

  if (isSourceEnabled("ENABLE_REMOTIVE")) {
    const jobs = await scrapeRemotive();
    await run(jobs, null);
  }
  if (isSourceEnabled("ENABLE_REMOTEOK")) {
    const jobs = await scrapeRemoteOK();
    await run(deduplicate(jobs), null);
  }

  const systemKey = process.env.SERPAPI_API_KEY?.trim();
  if (isSourceEnabled("ENABLE_LINKEDIN") && systemKey) {
    const jobs = await scrapeLinkedIn(systemKey);
    await run(deduplicate(jobs), null);
  }

  const usersWithKey = await prisma.user.findMany({
    where: { serpApiKeyEncrypted: { not: null } },
    select: { id: true, serpApiKeyEncrypted: true },
  });

  for (const u of usersWithKey) {
    if (!u.serpApiKeyEncrypted) continue;
    try {
      const key = decrypt(u.serpApiKeyEncrypted);
      const jobs = await scrapeLinkedIn(key);
      await run(deduplicate(jobs), u.id);
    } catch (e) {
      console.error("[scraping] LinkedIn for user", u.id, "error:", e);
    }
  }

  return { scraped: totalScraped, saved: totalSaved };
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

const userIdForUnique = (userId: string | null | undefined) => userId ?? null;

/**
 * Persiste las vacantes en JobListing. Usa upsert cuando hay externalId; si no, busca por source + offerLink + userId.
 * @param userId - Si se pasa, las filas se asocian a ese usuario (p. ej. LinkedIn con API key del usuario). null = global.
 */
export async function saveJobListings(jobs: ScrapedJob[], userId?: string | null): Promise<number> {
  const uid = userIdForUnique(userId);
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
            source_externalId_userId: {
              source,
              externalId: j.externalId,
              userId: uid as string,
            },
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
            userId: uid,
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
              where: { source, offerLink: j.offerLink, userId: uid },
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
              userId: uid,
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
