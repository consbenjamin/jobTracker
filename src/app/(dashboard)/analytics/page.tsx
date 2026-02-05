"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  source: string;
  interactions: { type: string; date: string; responded: boolean }[];
  [key: string]: unknown;
};

const STATUS_ORDER = ["Applied", "FollowUp", "Interview", "Rejected", "Offer", "Ghosted"];
const STATUS_LABELS: Record<string, string> = {
  Applied: "Aplicado",
  FollowUp: "Follow-up",
  Interview: "Entrevista",
  Rejected: "Rechazado",
  Offer: "Oferta",
  Ghosted: "Ghosted",
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando analytics...</p>
      </div>
    );
  }

  // Postulaciones por semana (últimas 12 semanas)
  const now = new Date();
  const weekCounts: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - 7 * (i + 1));
    const end = new Date(now);
    end.setDate(end.getDate() - 7 * i);
    const count = applications.filter((a) => {
      const d = new Date(a.appliedAt);
      return d >= start && d < end;
    }).length;
    weekCounts.push({
      week: `S${12 - i}`,
      count,
    });
  }

  // Postulaciones por mes (últimos 6 meses)
  const monthCounts: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = applications.filter((a) => {
      const ad = new Date(a.appliedAt);
      return ad >= d && ad < next;
    }).length;
    monthCounts.push({
      month: d.toLocaleDateString("es", { month: "short", year: "2-digit" }),
      count,
    });
  }

  // Tasa de respuesta: % con al menos una interacción responded: true vs resto (ghost)
  const withResponse = applications.filter((a) =>
    a.interactions?.some((i: { responded: boolean }) => i.responded)
  ).length;
  const total = applications.length;
  const responseRate = total > 0 ? Math.round((withResponse / total) * 100) : 0;
  const ghostRate = total > 0 ? 100 - responseRate : 0;

  // Funnel por estado
  const funnelData = STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: applications.filter((a) => a.status === status).length,
    status,
  }));

  // Tiempo promedio a primera respuesta (días desde appliedAt hasta primera interaction con responded: true)
  const timesToResponse: number[] = [];
  for (const app of applications) {
    const applied = new Date(app.appliedAt).getTime();
    const firstResponse = (app.interactions ?? [])
      .filter((i: { responded: boolean }) => i.responded)
      .map((i: { date: string }) => new Date(i.date).getTime())
      .sort((a: number, b: number) => a - b)[0];
    if (firstResponse != null) {
      timesToResponse.push((firstResponse - applied) / (1000 * 60 * 60 * 24));
    }
  }
  const avgDaysToResponse =
    timesToResponse.length > 0
      ? Math.round(
          timesToResponse.reduce((a, b) => a + b, 0) / timesToResponse.length
        )
      : null;

  // Canales que mejor rinden: por tipo de interacción, cuántas con responded
  const channelStats: Record<string, { total: number; responded: number }> = {};
  for (const app of applications) {
    for (const i of app.interactions ?? []) {
      const type = (i.type as string) || "other";
      if (!channelStats[type]) channelStats[type] = { total: 0, responded: 0 };
      channelStats[type].total++;
      if (i.responded) channelStats[type].responded++;
    }
  }
  const channelData = Object.entries(channelStats).map(([name, s]) => ({
    name: name === "linkedin" ? "LinkedIn" : name === "email" ? "Email" : name === "call" ? "Llamada" : name,
    total: s.total,
    responded: s.responded,
    rate: s.total > 0 ? Math.round((s.responded / s.total) * 100) : 0,
  }));

  // Empresas repetidas
  const byCompany: Record<string, Application[]> = {};
  for (const app of applications) {
    const c = (app.company as string).trim();
    if (!byCompany[c]) byCompany[c] = [];
    byCompany[c].push(app);
  }
  const repeatedCompanies = Object.entries(byCompany)
    .filter(([, apps]) => apps.length > 1)
    .map(([company, apps]) => ({
      company,
      count: apps.length,
      statuses: apps.map((a) => a.status),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Analytics</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Postulaciones, tasa de respuesta, funnel y canales.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total postulaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{responseRate}%</p>
            <p className="text-xs text-muted-foreground">
              {withResponse} con respuesta, {total - withResponse} ghost
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días a primera respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgDaysToResponse != null ? `${avgDaysToResponse} días` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Empresas repetidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{repeatedCompanies.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Postulaciones por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] sm:h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthCounts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Postulaciones" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Funnel por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] sm:h-[280px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={70} />
                  <Tooltip />
                  <Bar dataKey="value" name="Postulaciones" radius={[0, 4, 4, 0]}>
                    {funnelData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Canales (respuestas)</CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8">Sin interacciones aún.</p>
            ) : (
              <div className="h-[220px] sm:h-[280px] min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={60} />
                    <Tooltip />
                    <Bar dataKey="responded" name="Respondieron" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas con más de una postulación</CardTitle>
        </CardHeader>
        <CardContent>
          {repeatedCompanies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ninguna.</p>
          ) : (
            <ul className="space-y-2">
              {repeatedCompanies.map(({ company, count, statuses }) => (
                <li key={company} className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:items-center sm:justify-between text-sm border-b border-border last:border-0">
                  <span className="font-medium truncate">{company}</span>
                  <span className="text-muted-foreground text-xs sm:text-sm shrink-0">
                    {count} postulaciones — {statuses.map((s) => STATUS_LABELS[s] ?? s).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
