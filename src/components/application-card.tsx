"use client";

import { useState } from "react";
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
import { ExternalLink, FileText, Trash2 } from "lucide-react";
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
  [key: string]: unknown;
};

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

  return (
    <Card className={cn("transition-shadow hover:shadow-md")}>
      <CardHeader className="p-3 pb-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/applications/${application.id}`}
            className="font-medium leading-tight hover:underline min-w-0"
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
