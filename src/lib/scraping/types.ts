/**
 * Formato común para una vacante obtenida por cualquier scraper.
 * Todas las fuentes (Adzuna, LinkedIn, etc.) mapean a esta interfaz.
 */
export interface ScrapedJob {
  company: string;
  role: string;
  offerLink: string | null;
  source: string;
  seniority?: string | null;
  modality?: string | null;
  description?: string | null;
  externalId?: string | null;
}
