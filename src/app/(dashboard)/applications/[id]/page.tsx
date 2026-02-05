"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationDetail } from "@/components/application-detail";
import { useFocusMode } from "@/components/focus-mode-context";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink?: string | null;
  source?: string;
  seniority?: string | null;
  modality?: string | null;
  expectedSalary?: number | null;
  requiredStack?: string | null;
  requiresExternalForm?: boolean;
  externalFormLink?: string | null;
  notes?: string | null;
  checklist?: string | null;
  cvVersion?: string | null;
  contacts: unknown[];
  interactions: unknown[];
  tasks: unknown[];
  [key: string]: unknown;
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { focusMode, setFocusMode } = useFocusMode();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/applications/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, [id]);

  const refresh = () => {
    fetch(`/api/applications/${id}`)
      .then((res) => res.json())
      .then(setApplication);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Postulación no encontrada.</p>
        <Button asChild variant="outline">
          <Link href="/applications">Volver a postulaciones</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/applications">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold min-w-0 break-words sm:text-2xl">
          {application.company} — {application.role}
        </h1>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0"
          onClick={() => setFocusMode(!focusMode)}
          aria-label={focusMode ? "Salir de modo focus" : "Modo focus"}
        >
          {focusMode ? (
            <>
              <Minimize2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Salir modo focus</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Modo focus</span>
            </>
          )}
        </Button>
      </div>
      <ApplicationDetail application={application} onUpdate={refresh} />
    </div>
  );
}
