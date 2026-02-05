"use client";

import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickCapturePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 sm:space-y-6 px-1 sm:px-0">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Captura rápida</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Añade una postulación en menos de un minuto. El resto lo completas después.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nueva postulación</CardTitle>
          <CardDescription>
            Empresa, rol, link y fuente. Opcional: estado y fecha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationForm
            minimal
            onSuccess={() => router.push("/applications")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
