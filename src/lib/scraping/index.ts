import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import type { ScrapedJob } from "./types";
import { isSourceEnabled } from "./config";
import { scrapeLinkedIn } from "./linkedin";
import { scrapeRemotive } from "./remotive";
import { scrapeRemoteOK } from "./remoteok";
import {
  parseUserJobCategories,
  getLinkedInQueryForCategory,
  DEFAULT_JOB_CATEGORIES,
} from "@/lib/job-categories";

export type { ScrapedJob } from "./types";

/** Categorías a scrapear en Remotive: unión de las que piden los usuarios, o por defecto software-development. Máx 4 requests/día recomendado. */
const REMOTIVE_MAX_CATEGORIES = 4;

async function getRemotiveCategories(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { jobCategories: { not: null } },
    select: { jobCategories: true },
  });
  const set = new Set<string>();
  for (const u of users) {
    const cats = parseUserJobCategories(u.jobCategories);
    cats.forEach((c) => set.add(c));
  }
  const list = set.size > 0 ? Array.from(set) : [...DEFAULT_JOB_CATEGORIES];
  return list.slice(0, REMOTIVE_MAX_CATEGORIES);
}

/**
 * Ejecuta los scrapers habilitados (ENABLE_*) en paralelo. Para uso con API key global únicamente.
 */
export async function runAllScrapers(): Promise<ScrapedJob[]> {
  const categories = await getRemotiveCategories();
  const promises: Promise<ScrapedJob[]>[] = [];
  if (isSourceEnabled("ENABLE_REMOTIVE")) promises.push(scrapeRemotive(categories));
  if (isSourceEnabled("ENABLE_REMOTEOK")) promises.push(scrapeRemoteOK());
  if (isSourceEnabled("ENABLE_LINKEDIN")) promises.push(scrapeLinkedIn());
  const results = await Promise.all(promises);
  return deduplicate(results.flat());
}

/**
 * Ejecuta el scraping completo del cron: fuentes globales (Remotive, RemoteOK, LinkedIn con key de sistema)
 * y LinkedIn por cada usuario que tenga su propia API key guardada. Usa categorías configuradas por usuarios.
 */
export async function runCronScraping(): Promise<{
  scraped: number;
  saved: number;
  firstError?: string;
}> {
  let totalScraped = 0;
  let totalSaved = 0;
  let firstError: string | undefined;

  const run = async (jobs: ScrapedJob[], userId: string | null) => {
    const n = jobs.length;
    if (n === 0) return;
    totalScraped += n;
    const result = await saveJobListings(jobs, userId);
    totalSaved += result.saved;
    if (result.firstError && !firstError) firstError = result.firstError;
  };

  if (isSourceEnabled("ENABLE_REMOTIVE")) {
    const categories = await getRemotiveCategories();
    const jobs = await scrapeRemotive(categories);
    await run(deduplicate(jobs), null);
  }
  if (isSourceEnabled("ENABLE_REMOTEOK")) {
    const jobs = await scrapeRemoteOK();
    await run(deduplicate(jobs), null);
  }

  const systemKey = process.env.SERPAPI_API_KEY?.trim();
  const systemCategories = await getRemotiveCategories();
  const systemQuery = getLinkedInQueryForCategory(systemCategories[0] ?? "software-development");
  if (isSourceEnabled("ENABLE_LINKEDIN") && systemKey) {
    const jobs = await scrapeLinkedIn(systemKey, systemQuery);
    await run(deduplicate(jobs), null);
  }

  const usersWithKey = await prisma.user.findMany({
    where: { serpApiKeyEncrypted: { not: null } },
    select: { id: true, serpApiKeyEncrypted: true, jobCategories: true },
  });

  for (const u of usersWithKey) {
    if (!u.serpApiKeyEncrypted) continue;
    try {
      const key = decrypt(u.serpApiKeyEncrypted);
      const categories = parseUserJobCategories(u.jobCategories);
      const query = getLinkedInQueryForCategory(categories[0] ?? "software-development");
      const jobs = await scrapeLinkedIn(key, query);
      await run(deduplicate(jobs), u.id);
    } catch (e) {
      console.error("[scraping] LinkedIn for user", u.id, "error:", e);
    }
  }

  return { scraped: totalScraped, saved: totalSaved, firstError };
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
export async function saveJobListings(
  jobs: ScrapedJob[],
  userId?: string | null
): Promise<{ saved: number; firstError?: string }> {
  const uid = userIdForUnique(userId);
  let saved = 0;
  let firstError: string | undefined;
  for (const j of jobs) {
    try {
      const company = String(j.company).trim().slice(0, 200);
      const role = String(j.role).trim().slice(0, 200);
      const source = String(j.source).trim().slice(0, 50);
      if (!company || !role || !source) continue;

      const category = j.category?.trim().slice(0, 50) ?? null;
      if (j.externalId != null && j.externalId !== "") {
        const payload = {
          company,
          role,
          offerLink: j.offerLink?.slice(0, 2048) ?? null,
          category,
          seniority: j.seniority?.slice(0, 100) ?? null,
          modality: j.modality?.slice(0, 50) ?? null,
          description: j.description?.slice(0, 5000) ?? null,
        };
        // Prisma no permite null en el compound unique del upsert; para global (userId null) usamos findFirst + create/update
        if (uid == null) {
          const existing = await prisma.jobListing.findFirst({
            where: { source, externalId: j.externalId, userId: null },
          });
          if (existing) {
            await prisma.jobListing.update({
              where: { id: existing.id },
              data: payload,
            });
          } else {
            await prisma.jobListing.create({
              data: {
                ...payload,
                source,
                externalId: j.externalId,
                userId: null,
              },
            });
          }
        } else {
          await prisma.jobListing.upsert({
            where: {
              source_externalId_userId: {
                source,
                externalId: j.externalId,
                userId: uid,
              },
            },
            create: {
              ...payload,
              source,
              externalId: j.externalId,
              userId: uid,
            },
            update: payload,
          });
        }
        saved++;
      } else {
        // Sin externalId: buscar por offerLink o por (source, company, role) para evitar duplicados
        let existing = j.offerLink
          ? await prisma.jobListing.findFirst({
              where: { source, offerLink: j.offerLink, userId: uid },
            })
          : null;
        if (!existing) {
          existing = await prisma.jobListing.findFirst({
            where: {
              source,
              userId: uid,
              company: { equals: company, mode: "insensitive" },
              role: { equals: role, mode: "insensitive" },
            },
          });
        }
        if (existing) {
          await prisma.jobListing.update({
            where: { id: existing.id },
            data: {
              company,
              role,
              offerLink: j.offerLink?.slice(0, 2048) ?? existing.offerLink,
              category,
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
              category,
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
      const msg = e instanceof Error ? e.message : String(e);
      if (!firstError) firstError = msg;
      console.error("[scraping] saveJobListings item error:", e);
    }
  }
  return { saved, firstError };
}
