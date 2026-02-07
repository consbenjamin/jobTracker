"use client";

import { APPLICATION_STATUSES, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { ApplicationCard } from "@/components/application-card";
import { toast } from "sonner";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink: string | null;
  source: string;
  requiresExternalForm?: boolean;
  [key: string]: unknown;
};

export function KanbanBoard({
  applications,
  onUpdate,
  onOptimisticStatusChange,
}: {
  applications: Application[];
  onUpdate: () => void;
  onOptimisticStatusChange?: (id: string, updates: { status: string }) => void;
}) {
  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    apps: applications.filter((a) => a.status === status),
  }));

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
    <div className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-4 snap-x snap-mandatory min-w-0">
      {byStatus.map(({ status, label, apps }) => (
        <div
          key={status}
          className="flex-shrink-0 w-[min(100%,280px)] min-w-[240px] sm:min-w-[260px] sm:w-72 rounded-lg border bg-muted/30 p-3 snap-start border-t-4"
          style={{ borderTopColor: STATUS_COLORS[status] ?? "var(--border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium">{label}</span>
            <span className="text-sm text-muted-foreground">{apps.length}</span>
          </div>
          <div className="space-y-2">
            {apps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onStatusChange={(newStatus) => updateStatus(app.id, newStatus)}
                onDelete={onUpdate}
                statusOptions={APPLICATION_STATUSES.map((s) => ({
                  value: s,
                  label: STATUS_LABELS[s],
                }))}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
