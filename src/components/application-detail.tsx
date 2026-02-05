"use client";

import { useState } from "react";
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
import { Trash2 } from "lucide-react";

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
            <CardTitle>Datos de la postulación</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Editar
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
          <CardTitle>Checklist</CardTitle>
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
          <CardTitle>Notas</CardTitle>
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
