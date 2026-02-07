"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Hay un problema con la configuración del servidor. Comprueba que la base de datos exista y que la variable DATABASE_URL en tu entorno sea correcta.",
  AccessDenied: "No tienes permiso para acceder.",
  Verification: "El enlace de verificación ha caducado o ya se usó.",
  Default: "Algo salió mal al iniciar sesión.",
};

function AuthErrorInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;
  const isConfigError = error === "Configuration";

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Error al iniciar sesión</CardTitle>
          </div>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        {isConfigError && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              En Railway, revisa la pestaña Variables o Connect del servicio PostgreSQL y copia la URL de conexión correcta (el nombre de la base suele ser <code className="rounded bg-muted px-1">railway</code>, no <code className="rounded bg-muted px-1">railwayc</code>).
            </p>
          </CardContent>
        )}
        <CardFooter>
          <Button asChild variant="default">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error al iniciar sesión</CardTitle>
              <CardDescription>Cargando…</CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <AuthErrorInner />
    </Suspense>
  );
}
