import Link from "next/link";
import { Briefcase, BarChart3, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RemindersBlock } from "@/components/reminders-block";

export default function HomePage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Job Tracker</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Seguimiento de postulaciones, contactos e interacciones.
        </p>
      </div>
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
