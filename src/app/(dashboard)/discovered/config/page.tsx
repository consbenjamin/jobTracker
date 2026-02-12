"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, ArrowLeft, Clock, Check, X, Key, Briefcase } from "lucide-react";
import { toast } from "sonner";

type Source = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type Config = {
  scheduleTime: string;
  sources: Source[];
};

type JobCategory = { id: string; label: string };

export default function ScrapingConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSerpApiKey, setHasSerpApiKey] = useState<boolean | null>(null);
  const [serpApiKeyInput, setSerpApiKeyInput] = useState("");
  const [serpApiSaving, setSerpApiSaving] = useState(false);
  const [jobCategoriesList, setJobCategoriesList] = useState<JobCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoriesSaving, setCategoriesSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/scraping-config")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (data && typeof data === "object" && "scheduleTime" in data && "sources" in data) {
          setConfig(data as Config);
        }
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/serpapi-key")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (data && typeof data === "object" && "hasKey" in data) {
          setHasSerpApiKey(data.hasKey as boolean);
        }
      })
      .catch(() => {
        if (!cancelled) setHasSerpApiKey(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/user/job-categories")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (data && typeof data === "object" && "categories" in data && "selected" in data) {
          const d = data as { categories: JobCategory[]; selected: string[] };
          setJobCategoriesList(d.categories ?? []);
          setSelectedCategories(Array.isArray(d.selected) ? d.selected : []);
        }
      })
      .catch(() => {
        if (!cancelled) setJobCategoriesList([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveSerpApiKey = async () => {
    setSerpApiSaving(true);
    try {
      const res = await fetch("/api/user/serpapi-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: serpApiKeyInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al guardar");
        return;
      }
      setHasSerpApiKey(data.hasKey);
      setSerpApiKeyInput("");
      toast.success(data.hasKey ? "API key guardada (cifrada)." : "API key borrada.");
    } catch {
      toast.error("Error al guardar la API key");
    } finally {
      setSerpApiSaving(false);
    }
  };

  const handleCategoryToggle = async (id: string, checked: boolean) => {
    const next = checked
      ? [...selectedCategories, id]
      : selectedCategories.filter((c) => c !== id);
    if (next.length === 0) {
      toast.error("Elige al menos una categoría");
      return;
    }
    setSelectedCategories(next);
    setCategoriesSaving(true);
    try {
      const res = await fetch("/api/user/job-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al guardar categorías");
        setSelectedCategories(selectedCategories);
        return;
      }
      if (data.selected) setSelectedCategories(data.selected);
      toast.success("Categorías actualizadas.");
    } catch {
      toast.error("Error al guardar las categorías");
      setSelectedCategories(selectedCategories);
    } finally {
      setCategoriesSaving(false);
    }
  };

  const handleRemoveSerpApiKey = async () => {
    setSerpApiSaving(true);
    try {
      const res = await fetch("/api/user/serpapi-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Error al borrar");
        return;
      }
      setHasSerpApiKey(false);
      toast.success("API key borrada.");
    } catch {
      toast.error("Error al borrar la API key");
    } finally {
      setSerpApiSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/discovered" aria-label="Volver">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configuración de scraping
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fuentes y frecuencia. Para activar o desactivar fuentes, usa las variables de entorno en Vercel o .env.
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : config ? (
        <>
          <Card>
            <CardHeader>
              <h2 className="text-base font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Frecuencia
              </h2>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">{config.scheduleTime}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Tu API key de SerpApi (opcional)
              </h2>
              <p className="text-sm text-muted-foreground">
                Si quieres vacantes de LinkedIn con tu propia cuota, guarda aquí tu API key de{" "}
                <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="underline">serpapi.com</a>.
                Se guarda cifrada y nunca se muestra ni se envía al frontend.
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {hasSerpApiKey === null ? (
                <Skeleton className="h-10 w-full max-w-md" />
              ) : hasSerpApiKey ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Tienes una API key guardada. Las vacantes de LinkedIn se obtendrán con tu key en cada ejecución del cron.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveSerpApiKey}
                    disabled={serpApiSaving}
                  >
                    {serpApiSaving ? "Borrando…" : "Borrar API key"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="password"
                    placeholder="Pega aquí tu API key"
                    value={serpApiKeyInput}
                    onChange={(e) => setSerpApiKeyInput(e.target.value)}
                    className="max-w-md"
                    autoComplete="off"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveSerpApiKey}
                    disabled={serpApiSaving || !serpApiKeyInput.trim()}
                  >
                    {serpApiSaving ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Categorías de trabajo que buscas
              </h2>
              <p className="text-sm text-muted-foreground">
                Elige en qué áreas quieres ver vacantes (Remotive, Google Jobs, etc.). Por defecto se usa Software Development.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              {jobCategoriesList.length === 0 ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {jobCategoriesList.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer rounded-md p-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(cat.id, checked === true)
                        }
                        disabled={categoriesSaving}
                      />
                      <span className="text-sm">{cat.label}</span>
                    </label>
                  ))}
                </div>
              )}
              {categoriesSaving && (
                <p className="text-xs text-muted-foreground mt-2">Guardando…</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-medium">Fuentes</h2>
              <p className="text-sm text-muted-foreground">
                Cada fuente se puede desactivar con una variable de entorno en <code className="bg-muted px-1 rounded">.env</code> o Vercel:{" "}
                <code className="bg-muted px-1 rounded">ENABLE_REMOTIVE=false</code>,{" "}
                <code className="bg-muted px-1 rounded">ENABLE_REMOTEOK=false</code>,{" "}
                <code className="bg-muted px-1 rounded">ENABLE_LINKEDIN=false</code>.
              </p>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {config.sources.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="mt-0.5">
                    {s.enabled ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {s.name}
                      {s.enabled ? (
                        <span className="text-xs font-normal text-muted-foreground">(activa)</span>
                      ) : (
                        <span className="text-xs font-normal text-muted-foreground">(desactivada)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se pudo cargar la configuración. Revisa que estés autenticado.
          </CardContent>
        </Card>
      )}

      <Button variant="outline" asChild>
        <Link href="/discovered">Volver a Vacantes descubiertas</Link>
      </Button>
    </div>
  );
}
