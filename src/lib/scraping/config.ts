/**
 * Configuración visible del scraping: fuentes y frecuencia.
 * Activar/desactivar fuentes: ENABLE_REMOTIVE, ENABLE_REMOTEOK, ENABLE_LINKEDIN (true por defecto; "false" para desactivar).
 */

export const SCRAPE_SCHEDULE = "0 9 * * *";
export const SCRAPE_SCHEDULE_LABEL = "Una vez al día (9:00 UTC)";

export const SCRAPE_SOURCES = [
  {
    id: "Remotive",
    name: "Remotive",
    description: "Categorías según preferencias del usuario (Software Development, Marketing, etc.). API gratuita.",
    envKey: "ENABLE_REMOTIVE",
  },
  {
    id: "RemoteOK",
    name: "RemoteOK",
    description: "Feed público filtrado por tags de desarrollo (developer, software, engineer, etc.). Máx. 30 ofertas.",
    envKey: "ENABLE_REMOTEOK",
  },
  {
    id: "LinkedIn",
    name: "Google Jobs (SerpApi)",
    description: "SerpApi Google Jobs: ofertas de LinkedIn, Indeed, ZipRecruiter, etc. 1 búsqueda «software developer» en USA. Requiere SERPAPI_API_KEY.",
    envKey: "ENABLE_LINKEDIN",
  },
] as const;

export function isSourceEnabled(envKey: string): boolean {
  const v = process.env[envKey];
  if (v === undefined || v === "") return true;
  return v.toLowerCase() !== "false" && v !== "0";
}
