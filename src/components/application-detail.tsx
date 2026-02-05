"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CHECKLIST_ITEMS, CHECKLIST_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/components/application-form";
import { Timeline } from "@/components/timeline";
import { ContactList } from "@/components/contact-list";
import { InteractionList } from "@/components/interaction-list";
import { TaskList } from "@/components/task-list";
import { toast } from "sonner";
import { Trash2, Copy, Star, MessageSquare, Activity, Link2, FileText, ListChecks, Users, CalendarCheck } from "lucide-react";

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
  activities?: { id: string; type: string; payload: string | null; createdAt: string }[];
  isFavorite?: boolean;
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

function parseChecklist(checklist: string | null): Record<string, boolean> {
  if (!checklist) return {};
  try {
    return JSON.parse(checklist) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function ApplicationDetail({
  application,
  onUpdate,
}: {
  application: Application;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [favorite, setFavorite] = useState(!!application.isFavorite);
  const [activityNote, setActivityNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  useEffect(() => {
    setFavorite(!!application.isFavorite);
  }, [application.isFavorite]);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(
    () => parseChecklist(application.checklist ?? null)
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/applications");
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  };

  const saveChecklist = async (next: Record<string, boolean>) => {
    setChecklistState(next);
    await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist: JSON.stringify(next) }),
    });
    onUpdate();
  };

  const toggleChecklist = (key: string) => {
    const next = { ...checklistState, [key]: !checklistState[key] };
    saveChecklist(next);
  };

  const saveNotes = async (notes: string) => {
    await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    onUpdate();
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/duplicate`, {
        method: "POST",
      });
      if (res.ok) {
        const duplicate = await res.json();
        router.push(`/applications/${duplicate.id}`);
      }
    } finally {
      setDuplicating(false);
    }
  };

  const handleFavorite = async () => {
    const next = !favorite;
    setFavorite(next);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: next }),
      });
      onUpdate();
    } catch {
      setFavorite(!next);
    }
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success("Link copiado");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleAddActivityNote = async () => {
    const text = activityNote.trim();
    if (!text) return;
    setAddingNote(true);
    try {
      await fetch(`/api/applications/${application.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "note_added", payload: { text } }),
      });
      setActivityNote("");
      onUpdate();
    } finally {
      setAddingNote(false);
    }
  };

  const activities = (application.activities ?? []) as { id: string; type: string; payload: string | null; createdAt: string }[];

  return (
    <div className="space-y-6">
      {editing ? (
        <ApplicationForm
          application={application}
          onSuccess={() => {
            setEditing(false);
            onUpdate();
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 shrink-0" />
              Datos de la postulación
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFavorite}
                className={favorite ? "text-amber-500 border-amber-500" : ""}
              >
                <Star className={`h-4 w-4 sm:mr-1 ${favorite ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{favorite ? "Quitar destacada" : "Destacar"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Link2 className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{linkCopied ? "Link copiado" : "Copiar link"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={duplicating}
              >
                <Copy className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{duplicating ? "Duplicando…" : "Duplicar postulación"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Empresa</Label>
                <p className="font-medium">{application.company}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rol</Label>
                <p className="font-medium">{application.role}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <p className="font-medium">{STATUS_LABELS[application.status] ?? application.status}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Fuente</Label>
                <p className="font-medium">{application.source}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Fecha postulación</Label>
                <p className="font-medium">
                  {new Date(application.appliedAt).toLocaleDateString("es", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {application.seniority && (
                <div>
                  <Label className="text-muted-foreground">Seniority</Label>
                  <p className="font-medium">{application.seniority}</p>
                </div>
              )}
              {application.modality && (
                <div>
                  <Label className="text-muted-foreground">Modalidad</Label>
                  <p className="font-medium">{application.modality}</p>
                </div>
              )}
              {application.expectedSalary != null && (
                <div>
                  <Label className="text-muted-foreground">Salario esperado</Label>
                  <p className="font-medium">{application.expectedSalary}</p>
                </div>
              )}
              {application.requiredStack && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">Stack requerido</Label>
                  <p className="font-medium">{application.requiredStack}</p>
                </div>
              )}
              {application.requiresExternalForm === true && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground">Formulario externo</Label>
                  {application.externalFormLink ? (
                    <a
                      href={application.externalFormLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {application.externalFormLink}
                    </a>
                  ) : (
                    <p className="font-medium">Sí</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 shrink-0" />
            Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {CHECKLIST_ITEMS.map((key) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={!!checklistState[key]}
                  onCheckedChange={() => toggleChecklist(key)}
                />
                {CHECKLIST_LABELS[key]}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 shrink-0" />
            Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesEditor
            initialNotes={(application.notes ?? "") as string}
            onSave={saveNotes}
          />
        </CardContent>
      </Card>

      <Timeline application={application} />

      <ContactList applicationId={application.id} contacts={application.contacts as { id: string; name: string; position: string | null; channel: string; link: string | null; notes: string | null }[]} onUpdate={onUpdate} />

      <InteractionList applicationId={application.id} interactions={application.interactions as { id: string; type: string; date: string; responded: boolean; textOrSummary: string | null; outcome: string | null }[]} onUpdate={onUpdate} />

      <TaskList applicationId={application.id} tasks={application.tasks as { id: string; title: string; dueAt: string; completed: boolean; type: string }[]} onUpdate={onUpdate} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Añadir nota rápida..."
              value={activityNote}
              onChange={(e) => setActivityNote(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              size="sm"
              onClick={handleAddActivityNote}
              disabled={!activityNote.trim() || addingNote}
            >
              {addingNote ? "Guardando…" : "Añadir"}
            </Button>
          </div>
          {activities.length > 0 ? (
            <ul className="space-y-2 text-sm border-t pt-4">
              {activities.map((act) => {
                let label = act.type;
                let payloadText = "";
                if (act.type === "note_added" && act.payload) {
                  try {
                    const p = JSON.parse(act.payload) as { text?: string };
                    payloadText = p.text ?? "";
                  } catch {
                    payloadText = act.payload;
                  }
                } else if (act.payload) {
                  try {
                    const p = JSON.parse(act.payload);
                    payloadText = typeof p === "string" ? p : JSON.stringify(p);
                  } catch {
                    payloadText = act.payload;
                  }
                }
                if (act.type === "note_added") label = "Nota";
                if (act.type === "status_change") label = "Cambio de estado";
                return (
                  <li key={act.id} className="flex flex-col gap-0.5 py-1 border-b border-border last:border-0">
                    <span className="font-medium text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {label}
                    </span>
                    {payloadText && <p className="text-foreground pl-4">{payloadText}</p>}
                    <span className="text-xs text-muted-foreground pl-4">
                      {new Date(act.createdAt).toLocaleString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aún no hay actividad. Añade una nota arriba.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar postulación</DialogTitle>
            <DialogDescription>
              ¿Eliminar esta postulación de {application.company} — {application.role}? Se borrarán también sus contactos, interacciones y tareas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotesEditor({
  initialNotes,
  onSave,
}: {
  initialNotes: string;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const handleBlur = () => {
    if (notes === initialNotes) return;
    setSaving(true);
    onSave(notes);
    setSaving(false);
  };

  return (
    <Textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      onBlur={handleBlur}
      placeholder="Notas sobre esta postulación..."
      className="min-h-[100px]"
    />
  );
}
