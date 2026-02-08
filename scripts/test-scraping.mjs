#!/usr/bin/env node
/**
 * Script de prueba: ejecuta los scrapers (Remotive, RemoteOK, LinkedIn si hay SERPAPI_API_KEY)
 * y muestra cuántas vacantes trae cada uno. No guarda en BD.
 * Uso: node scripts/test-scraping.mjs
 * Carga .env.local si existe para SERPAPI_API_KEY.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    const unquoted = value.replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = unquoted;
  }
}

loadEnvLocal();

async function remotive() {
  const url = "https://remotive.com/api/remote-jobs?category=software-dev&limit=25";
  const res = await fetch(url);
  if (!res.ok) return { source: "Remotive", count: 0, error: res.status };
  const data = await res.json();
  const list = data.jobs ?? [];
  return { source: "Remotive", count: list.length, sample: list[0] ? `${list[0].title} @ ${list[0].company_name}` : null };
}

async function remoteok() {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "JobTracker/1.0 (https://github.com)" },
  });
  if (!res.ok) return { source: "RemoteOK", count: 0, error: res.status };
  const list = await res.json();
  if (!Array.isArray(list)) return { source: "RemoteOK", count: 0, error: "invalid response" };
  const devTags = new Set(["developer", "software", "engineer", "engineering", "frontend", "backend", "fullstack", "full-stack", "devops", "react", "node", "python", "java", "typescript", "javascript", "data", "dev"]);
  let count = 0;
  let sample = null;
  for (const item of list) {
    if (count >= 30) break;
    if (!item || !item.position) continue;
    const tags = (item.tags ?? []).map((t) => String(t).toLowerCase());
    if (!tags.some((t) => devTags.has(t))) continue;
    count++;
    if (!sample) sample = `${item.position} @ ${item.company ?? "?"}`;
  }
  return { source: "RemoteOK", count, sample };
}

async function linkedin() {
  const key = process.env.SERPAPI_API_KEY?.trim();
  if (!key) return { source: "LinkedIn (SerpApi)", count: 0, skip: "No SERPAPI_API_KEY" };
  const params = new URLSearchParams({
    engine: "google_jobs",
    q: "software developer",
    location: "United States",
    api_key: key,
    gl: "us",
    hl: "en",
  });
  const url = `https://serpapi.com/search?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return { source: "LinkedIn (SerpApi)", count: 0, error: res.status };
  const data = await res.json();
  const jobs = data.jobs_results?.jobs ?? [];
  const linkedInOnly = jobs.filter((j) => j.via?.toLowerCase().includes("linkedin"));
  const sample = linkedInOnly[0] ? `${linkedInOnly[0].title} @ ${linkedInOnly[0].company_name}` : null;
  return { source: "LinkedIn (SerpApi)", count: linkedInOnly.length, sample };
}

async function main() {
  console.log("Ejecutando scraping de prueba...\n");
  const [r1, r2, r3] = await Promise.all([remotive(), remoteok(), linkedin()]);
  for (const r of [r1, r2, r3]) {
    if (r.skip) {
      console.log(`${r.source}: omitido (${r.skip})`);
    } else if (r.error) {
      console.log(`${r.source}: error ${r.error}`);
    } else {
      console.log(`${r.source}: ${r.count} vacantes`);
      if (r.sample) console.log(`  Ejemplo: ${r.sample}`);
    }
  }
  const total = [r1, r2, r3].reduce((acc, r) => acc + (r.count || 0), 0);
  console.log(`\nTotal: ${total} vacantes`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
