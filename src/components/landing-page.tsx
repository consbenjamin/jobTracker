"use client";

import Link from "next/link";
import {
  Briefcase,
  BarChart3,
  PlusCircle,
  Calendar,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Briefcase,
    title: "Postulaciones",
    description: "Kanban por estado, filtros y detalle con timeline de cada candidatura.",
  },
  {
    icon: PlusCircle,
    title: "Captura rápida",
    description: "Añade una postulación en menos de un minuto desde cualquier dispositivo.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Dashboard con funnel, tasa de respuesta y métricas de tu búsqueda.",
  },
  {
    icon: Calendar,
    title: "Recordatorios",
    description: "No pierdas seguimientos: recordatorios por postulación y contacto.",
  },
  {
    icon: Shield,
    title: "Tus datos seguros",
    description: "Autenticación con email, Google o GitHub. Tus datos solo tuyos.",
  },
  {
    icon: Zap,
    title: "PWA",
    description: "Instálalo en el móvil y úsalo como una app nativa.",
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/.2),transparent)] pointer-events-none" aria-hidden />
        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6 space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4 text-primary" />
            Seguimiento de búsqueda de empleo
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-balance">
            Organiza tus postulaciones y no pierdas ninguna oportunidad
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Kanban, contactos, interacciones y analytics en un solo lugar. Gratis y sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto h-11 px-6 text-base font-medium">
              <Link href="/register" className="inline-flex items-center gap-2">
                Crear cuenta gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-11 px-6 text-base">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 sm:py-16 md:py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-center mb-2">
            Todo lo que necesitas
          </h2>
          <p className="text-muted-foreground text-center text-sm sm:text-base mb-8 sm:mb-10">
            Diseñado para que tu búsqueda de empleo sea más ordenada y efectiva.
          </p>
          <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <div className="h-full rounded-xl border border-border bg-card p-4 sm:p-5 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground text-pretty">{description}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Empieza en menos de un minuto
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Regístrate con tu email o con Google/GitHub. Sin tarjeta de crédito.
          </p>
          <Button asChild size="lg" className="h-11 px-6 font-medium">
            <Link href="/register">Registrarse gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
