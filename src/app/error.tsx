"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-semibold">Algo salió mal</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si acabas de iniciar sesión con Google en el celular, prueba volver a entrar o usar el navegador del sistema (no el de la app).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} variant="default">
              Reintentar
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
