"use client";

import { APPLICATION_STATUSES, STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { ApplicationCard } from "@/components/application-card";

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
}: {
  applications: Application[];
  onUpdate: () => void;
}) {
  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    apps: applications.filter((a) => a.status === status),
  }));

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdate();
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
