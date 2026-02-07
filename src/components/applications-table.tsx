"use client";

import Link from "next/link";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink: string | null;
  source: string;
  tags?: string | null;
  [key: string]: unknown;
};

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const arr = JSON.parse(tags) as unknown;
    return Array.isArray(arr) ? arr.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function ApplicationsTable({
  applications,
  onUpdate,
  onOptimisticStatusChange,
}: {
  applications: Application[];
  onUpdate: () => void;
  onOptimisticStatusChange?: (id: string, updates: { status: string }) => void;
}) {
  const updateStatus = async (id: string, newStatus: string) => {
    const app = applications.find((a) => a.id === id);
    const previousStatus = app?.status;
    onOptimisticStatusChange?.(id, { status: newStatus });
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        if (previousStatus !== undefined) onOptimisticStatusChange?.(id, { status: previousStatus });
        toast.error("No se pudo actualizar el estado");
        return;
      }
      onUpdate();
    } catch {
      if (previousStatus !== undefined) onOptimisticStatusChange?.(id, { status: previousStatus });
      toast.error("Error de red");
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden min-w-0">
      <div className="overflow-x-auto min-w-0">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left font-medium p-3">Empresa</th>
              <th className="text-left font-medium p-3">Rol</th>
              <th className="text-left font-medium p-3 hidden sm:table-cell">Estado</th>
              <th className="text-left font-medium p-3 hidden md:table-cell">Fecha</th>
              <th className="text-right font-medium p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Link
                    href={`/applications/${app.id}`}
                    className="font-medium hover:underline"
                  >
                    {app.company}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">
                  <span>{app.role}</span>
                  {parseTags(app.tags).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {parseTags(app.tags).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <Select
                    value={app.status}
                    onValueChange={(v) => updateStatus(app.id, v)}
                  >
                    <SelectTrigger className="h-8 w-full min-w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">
                  {new Date(app.appliedAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {app.offerLink && (
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <a
                          href={app.offerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Ver oferta"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/applications/${app.id}`}>Ver</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
