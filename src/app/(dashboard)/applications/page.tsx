"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KanbanBoard } from "@/components/kanban-board";
import { ApplicationsTable } from "@/components/applications-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Briefcase, LayoutGrid, List, Search, X, Download, Star, Upload, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink: string | null;
  source: string;
  tags?: string | null;
  isFavorite?: boolean;
  [key: string]: unknown;
};

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const arr = JSON.parse(tags) as unknown;
    return Array.isArray(arr) ? arr.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: { row: number; message: string }[] } | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  const allTags = Array.from(
    new Set(applications.flatMap((a) => parseTags(a.tags)))
  ).sort();

  const effectiveTagsFilter = tagsFilter.filter((t) => allTags.includes(t));

  const filtered = applications.filter((a) => {
    if (companyFilter && !a.company.toLowerCase().includes(companyFilter.toLowerCase())) return false;
    if (roleFilter && !a.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    const d = new Date(a.appliedAt);
    if (fromDate) {
      const fromStart = new Date(fromDate + "T00:00:00");
      if (d < fromStart) return false;
    }
    if (toDate) {
      const toEnd = new Date(toDate + "T23:59:59.999");
      if (d > toEnd) return false;
    }
    if (favoriteFilter && !a.isFavorite) return false;
    if (effectiveTagsFilter.length > 0) {
      const appTags = parseTags(a.tags);
      if (!effectiveTagsFilter.some((t) => appTags.includes(t))) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
    setFavoriteFilter(false);
    setTagsFilter([]);
  };

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.set("file", importFile);
      const res = await fetch("/api/applications/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({ created: data.created, errors: data.errors ?? [] });
        refresh();
        if (data.created > 0) {
          toast.success(`Importación completada: ${data.created} postulación(es) creada(s)`);
        }
        if (data.errors?.length === 0) {
          setImportFile(null);
          setTimeout(() => setImportOpen(false), 1500);
        }
      } else {
        setImportResult({ created: 0, errors: [{ row: 0, message: data.error ?? "Error" }] });
      }
    } catch {
      setImportResult({ created: 0, errors: [{ row: 0, message: "Error de red" }] });
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportResult(null);
    setImportFile(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-36" />
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
          {APPLICATION_STATUSES.map((status) => (
            <div
              key={status}
              className="flex-shrink-0 w-[min(100%,280px)] min-w-[260px] sm:w-72 rounded-lg border bg-muted/30 p-3 space-y-2"
            >
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-6" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">Postulaciones</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/quick-capture" className="flex items-center justify-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Captura rápida
            </Link>
          </Button>
        </div>
        <EmptyState
          icon={Briefcase}
          title="No hay postulaciones"
          description="Añade tu primera postulación para empezar a hacer seguimiento."
          actionLabel="Añadir postulación"
          actionHref="/quick-capture"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
        <h1 className="text-xl font-bold sm:text-2xl shrink-0">Postulaciones</h1>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex rounded-md border shrink-0">
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("kanban")}
              aria-label="Vista Kanban"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
              aria-label="Vista lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a
              href="/api/applications?export=csv"
              download="postulaciones.csv"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </a>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="shrink-0">
            <Upload className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Importar CSV</span>
          </Button>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <a href="/api/calendar/ics" download="job-tracker-tareas.ics" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Calendario</span>
            </a>
          </Button>
          <Button asChild className="w-full sm:w-auto shrink-0">
            <Link href="/quick-capture" className="flex items-center justify-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Captura rápida
            </Link>
          </Button>
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 shrink-0" />
            Filtros
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-end">
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground">Empresa</label>
              <Input
                placeholder="Empresa"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground">Rol</label>
              <Input
                placeholder="Rol"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full min-w-0">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground">Desde</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <label className="text-xs text-muted-foreground">Hasta</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full min-w-0"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-col gap-1 min-w-0">
                <label className="text-xs text-muted-foreground">Etiquetas</label>
                <Select
                  value={tagsFilter[0] && allTags.includes(tagsFilter[0]) ? tagsFilter[0] : "all"}
                  onValueChange={(v) =>
                    setTagsFilter(v === "all" ? [] : v ? [v] : [])
                  }
                >
                  <SelectTrigger className="w-full min-w-0">
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquiera</SelectItem>
                    {allTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap sm:col-span-2 md:col-span-1">
              <Checkbox
                id="favoriteFilter"
                checked={favoriteFilter}
                onCheckedChange={(v) => setFavoriteFilter(!!v)}
              />
              <Label htmlFor="favoriteFilter" className="text-sm flex items-center gap-1 cursor-pointer shrink-0">
                <Star className="h-4 w-4" />
                Solo favoritas
              </Label>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && applications.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-sm text-muted-foreground">Ningún resultado con estos filtros.</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="min-w-0 overflow-x-auto">
          <ApplicationsTable applications={filtered} onUpdate={refresh} />
        </div>
      ) : (
        <div className="min-w-0 -mx-1 px-1 sm:mx-0 sm:px-0">
          <KanbanBoard applications={filtered} onUpdate={refresh} />
        </div>
      )}

      <Dialog open={importOpen} onOpenChange={(open) => !open && closeImport()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar CSV</DialogTitle>
            <DialogDescription>
              Sube un archivo CSV con columnas: company, role, status, appliedAt, source, seniority, modality, offerLink, notes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Archivo CSV</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {importResult && (
              <div className="text-sm space-y-1">
                <p className="font-medium text-green-600 dark:text-green-500">
                  {importResult.created} postulación(es) creada(s).
                </p>
                {importResult.errors.length > 0 && (
                  <p className="text-amber-600 dark:text-amber-500">
                    {importResult.errors.length} error(es): fila {importResult.errors.map((e) => e.row).join(", ")}.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeImport}>Cerrar</Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? "Importando…" : "Importar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
