"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, BarChart3, PlusCircle, TrendingUp, Calendar, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RemindersBlock } from "@/components/reminders-block";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  isFavorite?: boolean;
  [key: string]: unknown;
};

export default function HomePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Job Tracker</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Seguimiento de postulaciones, contactos e interacciones.
        </p>
      </div>
      {!loading && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
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
                <Calendar className="h-4 w-4" />
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
                <Award className="h-4 w-4" />
                Ofertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{offersCount}</p>
              <p className="text-xs text-muted-foreground">Estado oferta</p>
            </CardContent>
          </Card>
        </div>
      )}
      {!loading && favorites.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
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
                    className="text-primary hover:underline font-medium"
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
              <Briefcase className="h-5 w-5" />
              Postulaciones
            </CardTitle>
            <CardDescription>
              Kanban por estado, filtros y detalle con timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/applications">Ver postulaciones</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Captura rápida
            </CardTitle>
            <CardDescription>
              Añade una postulación en menos de un minuto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/quick-capture">Nueva postulación</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              Dashboard con funnel, tasa de respuesta y más.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/analytics">Ver analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
