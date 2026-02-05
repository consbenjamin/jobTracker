"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink: string | null;
  source: string;
  [key: string]: unknown;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando postulaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Postulaciones</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/quick-capture" className="flex items-center justify-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Captura rápida
          </Link>
        </Button>
      </div>
      <KanbanBoard applications={applications} onUpdate={refresh} />
    </div>
  );
}
