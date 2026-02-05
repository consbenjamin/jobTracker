"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ExternalLink, FileText, Trash2, Copy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  appliedAt: string;
  offerLink: string | null;
  source: string;
  requiresExternalForm?: boolean;
  tags?: string | null;
  isFavorite?: boolean;
  interactions?: { date: string; responded: boolean }[];
  tasks?: { dueAt: string; completed: boolean }[];
  [key: string]: unknown;
};

function hasOverdueTask(app: Application): boolean {
  const tasks = app.tasks ?? [];
  const now = Date.now();
  return tasks.some(
    (t) => !t.completed && new Date(t.dueAt).getTime() < now
  );
}

function needsFollowUp(app: Application, days = 5): boolean {
  if (app.status === "Rejected" || app.status === "Ghosted") return false;
  const hasResponse = (app.interactions ?? []).some((i) => i.responded);
  if (hasResponse) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const lastInteraction = (app.interactions ?? [])
    .map((i) => new Date(i.date).getTime())
    .sort((a, b) => b - a)[0];
  if (!lastInteraction) return true;
  return lastInteraction < cutoff.getTime();
}

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const arr = JSON.parse(tags) as unknown;
    return Array.isArray(arr) ? arr.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
  statusOptions,
}: {
  application: Application;
  onStatusChange: (status: string) => void;
  onDelete?: () => void;
  statusOptions: { value: string; label: string }[];
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [favorite, setFavorite] = useState(!!application.isFavorite);
  useEffect(() => {
    setFavorite(!!application.isFavorite);
  }, [application.isFavorite]);

  const date = new Date(application.appliedAt).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        onDelete?.();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDuplicating(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Postulación duplicada");
        onDelete?.();
      }
    } finally {
      setDuplicating(false);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorite;
    setFavorite(next);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      onDelete?.();
    } catch {
      setFavorite(!next);
    }
  };

  const overdue = hasOverdueTask(application);
  const followUp = needsFollowUp(application);

  return (
    <Card className={cn("relative transition-shadow duration-200 hover:shadow-md animate-in fade-in-0 duration-200")}>
      {(overdue || followUp) && (
        <span
          className="absolute top-2 left-2 h-2 w-2 rounded-full shrink-0 z-[1]"
          style={{
            backgroundColor: overdue ? "var(--destructive)" : "rgb(245 158 11)",
          }}
          title={overdue ? "Tarea vencida" : "Sin respuesta en 5+ días"}
          aria-label={overdue ? "Tarea vencida" : "Sin respuesta en 5+ días"}
        />
      )}
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/applications/${application.id}`}
            className="font-semibold leading-tight hover:underline min-w-0"
          >
            {application.company}
          </Link>
          <div className="flex items-center gap-0.5 shrink-0">
            {application.requiresExternalForm && (
              <span title="Requiere formulario externo">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${favorite ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
              aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              onClick={handleFavorite}
            >
              <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              aria-label="Duplicar postulación"
              onClick={handleDuplicate}
              disabled={duplicating}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              aria-label="Eliminar postulación"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{application.role}</p>
        {parseTags(application.tags).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {parseTags(application.tags).map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{date}</span>
          <span>·</span>
          <span>{application.source}</span>
        </div>
        {application.offerLink && (
          <a
            href={application.offerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Oferta
          </a>
        )}
        <Select
          value={application.status}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Eliminar postulación</DialogTitle>
            <DialogDescription>
              ¿Eliminar {application.company} — {application.role}? Se borrarán también contactos, interacciones y tareas. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
