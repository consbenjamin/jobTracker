"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Search, ExternalLink, PlusCircle, Info, Sparkles, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type JobListing = {
  id: string;
  company: string;
  role: string;
  source: string;
  offerLink: string | null;
  modality: string | null;
  description: string | null;
  createdAt: string;
};

const SOURCES = ["Remotive", "RemoteOK", "LinkedIn"] as const;

export default function DiscoveredPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [scrapingNow, setScrapingNow] = useState(false);

  const refreshListings = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (sourceFilter !== "all") params.set("source", sourceFilter);
    fetch(`/api/job-listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setListings(data as JobListing[]);
      })
      .catch(() => setListings([]));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (sourceFilter !== "all") params.set("source", sourceFilter);
    fetch(`/api/job-listings?${params.toString()}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        setListings(data as JobListing[]);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, sourceFilter]);

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
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      fetch(`/api/job-listings?${params.toString()}`)
        .then((r) => r.json())
        .then((list: unknown) => {
          setListings(Array.isArray(list) ? list : []);
        })
        .catch(() => setListings([]))
        .finally(() => setLoading(false));
    } catch {
      toast.error("Error al ejecutar el scraping");
    } finally {
      setScrapingNow(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Vacantes descubiertas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ofertas obtenidas automáticamente por el cron. Añade las que te interesen a Mis postulaciones.
        </p>
      </div>

      {/* Fuentes / qué se scrapea */}
      <Card className="bg-muted/40">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4" />
              ¿De dónde vienen estas vacantes?
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
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
            <li><strong>Remotive</strong>: categoría software-dev (remoto).</li>
            <li><strong>RemoteOK</strong>: ofertas con tags de desarrollo (developer, software, engineer, etc.).</li>
            <li><strong>LinkedIn</strong>: búsqueda &quot;software developer&quot; en USA (requiere SerpApi configurado).</li>
          </ul>
          <p className="text-xs pt-1">
            En <Link href="/discovered/config" className="underline text-foreground">Configuración</Link> ves la frecuencia y qué fuentes están activas. Para desactivar una fuente usa en .env o Vercel: <code className="bg-muted px-1 rounded">ENABLE_REMOTIVE=false</code>, etc.
          </p>
        </CardContent>
      </Card>

      {/* Filtros y scraping manual */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empresa o rol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fuentes</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleRunScraping}
          disabled={scrapingNow}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${scrapingNow ? "animate-spin" : ""}`} />
          {scrapingNow ? "Ejecutando…" : "Ejecutar scraping ahora"}
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <h3 className="font-semibold leading-tight">{listing.role}</h3>
                <p className="text-sm text-muted-foreground">{listing.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">
                    {listing.source}
                  </span>
                  {listing.modality && (
                    <span className="text-xs text-muted-foreground">{listing.modality}</span>
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
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Ver oferta
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  onClick={() => handleAddToApplications(listing)}
                  disabled={addingId === listing.id}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  {addingId === listing.id ? "Añadiendo…" : "Añadir a postulaciones"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={`text-sm font-medium ${className ?? ""}`} {...props} />;
}
