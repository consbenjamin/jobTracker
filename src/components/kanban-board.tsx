"use client";

import { useState } from "react";
import Link from "next/link";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { ApplicationCard } from "@/components/application-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

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

const STATUS_LABELS: Record<string, string> = {
  Applied: "Aplicado",
  FollowUp: "Follow-up",
  Interview: "Entrevista",
  Rejected: "Rechazado",
  Offer: "Oferta",
  Ghosted: "Ghosted",
};

export function KanbanBoard({
  applications,
  onUpdate,
}: {
  applications: Application[];
  onUpdate: () => void;
}) {
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = applications.filter((a) => {
    if (companyFilter && !a.company.toLowerCase().includes(companyFilter.toLowerCase())) return false;
    if (roleFilter && !a.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    const d = new Date(a.appliedAt);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate + "T23:59:59")) return false;
    return true;
  });

  const byStatus = APPLICATION_STATUSES.map((status) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    apps: filtered.filter((a) => a.status === status),
  }));

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
    setStatusFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4" />
            Filtros
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 w-full min-w-0 sm:w-40">
            <label className="text-xs text-muted-foreground">Empresa</label>
            <Input
              placeholder="Empresa"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 w-full min-w-0 sm:w-40">
            <label className="text-xs text-muted-foreground">Rol</label>
            <Input
              placeholder="Rol"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 w-full min-w-0 sm:w-36">
            <label className="text-xs text-muted-foreground">Estado</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 w-full min-w-0 sm:w-36">
            <label className="text-xs text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-1 w-full min-w-0 sm:w-36">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        </CardContent>
      </Card>

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {byStatus.map(({ status, label, apps }) => (
          <div
            key={status}
            className="flex-shrink-0 w-[min(100%,280px)] min-w-[260px] sm:w-72 rounded-lg border bg-muted/30 p-3 snap-start"
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
    </div>
  );
}
