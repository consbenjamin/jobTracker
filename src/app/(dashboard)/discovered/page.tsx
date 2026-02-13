"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { Search, ExternalLink, PlusCircle, Info, Sparkles, Settings, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [6, 12, 24, 50] as const;

type JobListing = {
  id: string;
  company: string;
  role: string;
  source: string;
  category: string | null;
  offerLink: string | null;
  modality: string | null;
  description: string | null;
  createdAt: string;
};

const SOURCES = ["Remotive", "RemoteOK", "LinkedIn"] as const;

const MODALITY_OPTIONS = [
  { value: "all", label: "Todas las modalidades" },
  { value: "remoto", label: "Remoto" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
  { value: "unspecified", label: "No especifica" },
] as const;

function formatCategoryLabel(slug: string | null): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function DiscoveredPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("mine");
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [scrapingNow, setScrapingNow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/job-categories")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (data && typeof data === "object" && "selected" in data) {
          const sel = (data as { selected: string[] }).selected;
          setUserCategories(Array.isArray(sel) ? sel : []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const buildListingsParams = useCallback(
    (pageNum: number) => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (modalityFilter !== "all") params.set("modality", modalityFilter);
      if (categoryFilter === "mine" && userCategories.length > 0) {
        params.set("categories", userCategories.join(","));
      }
      params.set("page", String(pageNum));
      params.set("limit", String(pageSize));
      return params;
    },
    [search, sourceFilter, modalityFilter, categoryFilter, pageSize, userCategories.join(",")]
  );

  const filtersKey = `${search}|${sourceFilter}|${modalityFilter}|${categoryFilter}|${pageSize}|${userCategories.join(",")}`;
  const prevFiltersKey = useRef(filtersKey);
  const prevPageSizeRef = useRef(pageSize);
  const skipNextFetchRef = useRef(false);

  const fetchListings = useCallback(
    (pageNum: number) => {
      setLoading(true);
      fetch(`/api/job-listings?${buildListingsParams(pageNum)}`)
        .then((res) => res.json())
        .then((data: unknown) => {
          if (!data || typeof data !== "object" || !("items" in data)) {
            setListings([]);
            setTotal(0);
            setTotalPages(1);
            return;
          }
          const d = data as { items: JobListing[]; total: number; page: number; totalPages: number };
          setListings(Array.isArray(d.items) ? d.items : []);
          setTotal(typeof d.total === "number" ? d.total : 0);
          setTotalPages(typeof d.totalPages === "number" ? d.totalPages : 1);
        })
        .catch(() => {
          setListings([]);
          setTotal(0);
          setTotalPages(1);
        })
        .finally(() => setLoading(false));
    },
    [buildListingsParams]
  );

  // Refetch explícito cuando cambia pageSize (evita tener que cambiar de página para ver el resultado)
  useEffect(() => {
    if (prevPageSizeRef.current !== pageSize) {
      prevPageSizeRef.current = pageSize;
      prevFiltersKey.current = filtersKey; // filtersKey ya está actualizado en este render (incluye pageSize)
      setPage(1);
      skipNextFetchRef.current = true; // evita doble fetch del efecto principal
      fetchListings(1);
    }
  }, [pageSize, fetchListings]);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    const filtersJustChanged = prevFiltersKey.current !== filtersKey;
    if (filtersJustChanged) {
      prevFiltersKey.current = filtersKey;
      setPage(1);
      skipNextFetchRef.current = true;
    }
    const pageToFetch = filtersJustChanged ? 1 : page;
    fetchListings(pageToFetch);
  }, [page, filtersKey, fetchListings]);

  const handleAddToApplications = async (listing: JobListing) => {
    setAddingId(listing.id);
    try {
      const res = await fetch(`/api/job-listings/${listing.id}/apply`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al añadir");
        return;
      }
      toast.success(`"${listing.role}" en ${listing.company} añadido a postulaciones`);
      window.open(`/applications/${data.id}`, "_self");
    } catch {
      toast.error("Error al añadir a postulaciones");
    } finally {
      setAddingId(null);
    }
  };

  const handleRunScraping = async () => {
    setScrapingNow(true);
    try {
      const res = await fetch("/api/job-listings/scrape", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al ejecutar el scraping");
        return;
      }
      const scraped = data.scraped ?? 0;
      const saved = data.saved ?? 0;
      toast.success(`Scraping listo: ${scraped} vacantes obtenidas, ${saved} guardadas.`);
      if (data.warning) toast.warning(data.warning);
      setPage(1);
      fetchListings(1);
    } catch {
      toast.error("Error al ejecutar el scraping");
    } finally {
      setScrapingNow(false);
    }
  };

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      <div className="min-w-0">
        <h1 className="text-xl font-bold sm:text-2xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 shrink-0" />
          Vacantes descubiertas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ofertas obtenidas automáticamente por el cron. Añade las que te interesen a Mis postulaciones.
        </p>
      </div>

      <Card className="bg-muted/40 min-w-0 overflow-hidden">
        <CardHeader className="py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              ¿De dónde vienen estas vacantes?
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="w-fit">
              <Link href="/discovered/config" className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                Configuración
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
          <p>
            Un cron ejecuta el scraping <strong>una vez al día</strong> (9:00 UTC) y guarda ofertas aquí.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Remotive</strong>: según las categorías que elijas en Configuración (Software Development, Marketing, etc.).</li>
            <li><strong>RemoteOK</strong>: ofertas con tags de desarrollo (developer, software, engineer, etc.).</li>
            <li><strong>LinkedIn</strong>: búsqueda según tu primera categoría en Configuración (requiere SerpApi).</li>
          </ul>
          <p className="text-xs pt-1">
            En <Link href="/discovered/config" className="underline text-foreground">Configuración</Link> ves la frecuencia y qué fuentes están activas. Para desactivar una fuente usa en .env o Vercel: <code className="bg-muted px-1 rounded">ENABLE_REMOTIVE=false</code>, etc.
          </p>
        </CardContent>
      </Card>

      {/* Filtros y scraping */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 shrink-0" />
            Filtros
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative flex-1 min-w-0 w-full sm:max-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar empresa o rol…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full min-w-0"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[160px] min-w-0">
                <SelectValue placeholder="Fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fuentes</SelectItem>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={modalityFilter} onValueChange={setModalityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] min-w-0">
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                {MODALITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px] min-w-0">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mine">
                  Mis categorías{userCategories.length > 0 ? ` (${userCategories.length})` : ""}
                </SelectItem>
                <SelectItem value="all">Todas las categorías</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleRunScraping}
              disabled={scrapingNow}
              className="w-full sm:w-auto shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 shrink-0 ${scrapingNow ? "animate-spin" : ""}`} />
              <span className="truncate">{scrapingNow ? "Ejecutando…" : "Ejecutar scraping"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista y paginación */}
      {loading ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
            <Card key={i} className="min-w-0 flex flex-col">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="pt-0">
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Sin vacantes descubiertas"
          description="Usa «Ejecutar scraping ahora» para obtener ofertas. Si el scraping dice que guardó vacantes y aquí no aparece nada, ejecuta en tu base de datos: npx prisma migrate deploy"
          actionLabel="Ir a Postulaciones"
          actionHref="/applications"
        />
      ) : (
        <>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {listings.map((listing) => (
              <Card key={listing.id} className="flex flex-col min-w-0 overflow-hidden">
                <CardHeader className="pb-2 min-w-0">
                  <h3 className="font-semibold leading-tight truncate" title={listing.role}>
                    {listing.role}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate" title={listing.company}>
                    {listing.company}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-muted shrink-0">
                      {listing.source}
                    </span>
                    {listing.category && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                        {formatCategoryLabel(listing.category)}
                      </span>
                    )}
                    {listing.modality && (
                      <span className="text-xs text-muted-foreground shrink-0">{listing.modality}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 mt-auto flex flex-wrap gap-2">
                  {listing.offerLink && (
                    <a
                      href={listing.offerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="outline" size="sm" className="shrink-0">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Ver oferta
                      </Button>
                    </a>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleAddToApplications(listing)}
                    disabled={addingId === listing.id}
                    className="shrink-0"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                    {addingId === listing.id ? "Añadiendo…" : "Añadir"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {listings.length > 0 && (
            <Card className="min-w-0 overflow-hidden">
              <CardContent className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 order-2 sm:order-1">
                    <p className="text-sm text-muted-foreground">
                      {startItem}–{endItem} de {total} vacantes
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                          const n = parseInt(v, 10);
                          if (!isNaN(n)) {
                            setPageSize(n);
                            setPage(1);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">por página</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page <= 1}
                      className="shrink-0"
                      aria-label="Primera página"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="shrink-0"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[6rem] text-center px-2">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="shrink-0"
                      aria-label="Página siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                      className="shrink-0"
                      aria-label="Última página"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

