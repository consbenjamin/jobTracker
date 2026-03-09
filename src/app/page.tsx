"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Briefcase,
  BarChart3,
  PlusCircle,
  TrendingUp,
  Calendar,
  Award,
  Star,
  Puzzle,
  ArrowUpRight,
  CheckCircle2,
  Chrome,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RemindersBlock } from "@/components/reminders-block";
import { LandingPage } from "@/components/landing-page";
import { ensureArray } from "@/lib/utils";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  isFavorite?: boolean;
  [key: string]: unknown;
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      <div>
        <Skeleton className="h-8 w-48 sm:w-64" />
        <Skeleton className="h-4 w-full max-w-md mt-2" />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DashboardContent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => setApplications(ensureArray<Application>(data)))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  // Skeleton solo cuando ya estamos autenticados y cargando datos del dashboard
  if (loading) {
    return <DashboardSkeleton />;
  }

  const activeCount = applications.filter(
    (a) => a.status !== "Rejected" && a.status !== "Ghosted"
  ).length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekCount = applications.filter((a) => {
    const status = a.status as string;
    const applied = new Date(a.appliedAt);
    return (
      (status === "Applied" || status === "FollowUp" || status === "Interview") &&
      applied >= weekAgo
    );
  }).length;
  const offersCount = applications.filter((a) => a.status === "Offer").length;
  const favorites = applications.filter((a) => a.isFavorite).slice(0, 10);

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Job Tracker</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Seguimiento de postulaciones, contactos e interacciones.
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0" />
                Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Sin rechazo ni ghosted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                En proceso (7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{thisWeekCount}</p>
              <p className="text-xs text-muted-foreground">Aplicado / follow-up / entrevista</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 shrink-0" />
                Ofertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{offersCount}</p>
              <p className="text-xs text-muted-foreground">Estado oferta</p>
            </CardContent>
          </Card>
        </div>
      {favorites.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
              Destacadas
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/applications">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {favorites.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-primary hover:underline font-medium break-words"
                  >
                    {app.company} — {app.role}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <RemindersBlock />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 shrink-0" />
              Postulaciones
            </CardTitle>
            <CardDescription>
              Kanban por estado, filtros y detalle con timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full min-w-0 sm:w-auto">
              <Link href="/applications" className="flex items-center justify-center min-w-0">
                Ver postulaciones
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 shrink-0" />
              Captura rápida
            </CardTitle>
            <CardDescription>
              Añade una postulación en menos de un minuto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full min-w-0 sm:w-auto">
              <Link href="/quick-capture" className="flex items-center justify-center min-w-0">
                Nueva postulación
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 shrink-0" />
              Analytics
            </CardTitle>
            <CardDescription>
              Dashboard con funnel, tasa de respuesta y más.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full min-w-0 sm:w-auto">
              <Link href="/analytics" className="flex items-center justify-center min-w-0">
                Ver analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm sm:col-span-2 md:col-span-3">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-primary/15 via-primary/5 to-transparent md:block"
            aria-hidden
          />
          <CardHeader className="relative gap-4 pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Chrome className="h-3.5 w-3.5 shrink-0" />
                  Disponible en Chrome
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary shadow-sm">
                    <Puzzle className="h-5 w-5 shrink-0" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl sm:text-2xl">
                      Extensión para LinkedIn
                    </CardTitle>
                    <CardDescription className="max-w-2xl text-sm leading-6 sm:text-base">
                      Captura una vacante de LinkedIn y añádela a Postulaciones con un clic, sin copiar y pegar datos manualmente.
                    </CardDescription>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full min-w-0 sm:w-auto">
                <a
                  href="https://chromewebstore.google.com/detail/jobtracker-linkedin-saver/cncgbgfaofodegldoicoohgofnfjbaaf?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 min-w-0"
                >
                  Instalar en Chrome
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
              {[
                "Guarda ofertas directamente desde LinkedIn.",
                "Empresa, rol y enlace se completan más rápido.",
                "Tu flujo sigue en Postulaciones como siempre.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-border/60 bg-background/70 p-3 backdrop-blur-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { status } = useSession();

  // Mientras se resuelve la sesión o si no hay sesión: mostrar landing.
  // Así no se muestra el dashboard/skeleton a usuarios no logueados ni carga infinita.
  if (status === "loading" || status === "unauthenticated") {
    return <LandingPage />;
  }

  return <DashboardContent />;
}
