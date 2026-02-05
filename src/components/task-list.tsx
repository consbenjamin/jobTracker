"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { TaskFormDialog } from "./task-form-dialog";

const TYPE_LABELS: Record<string, string> = {
  follow_up: "Follow-up",
  email: "Email",
  call: "Llamada",
};

type Task = {
  id: string;
  title: string;
  dueAt: string;
  completed: boolean;
  type: string;
};

export function TaskList({
  applicationId,
  tasks,
  onUpdate,
}: {
  applicationId: string;
  tasks: Task[];
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleCompleted = async (id: string, completed: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    onUpdate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tareas</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir tarea
        </Button>
      </CardHeader>
      <CardContent>
        <TaskFormDialog
          applicationId={applicationId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            setOpen(false);
            onUpdate();
          }}
        />
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin tareas. Añade una.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded border p-3 text-sm">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(v) => toggleCompleted(t.id, !!v)}
                />
                <div className="flex-1 min-w-0">
                  <p className={t.completed ? "line-through text-muted-foreground" : "font-medium"}>
                    {t.title}
                  </p>
                  <p className="text-muted-foreground">
                    {TYPE_LABELS[t.type] ?? t.type} —{" "}
                    {new Date(t.dueAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
                    onUpdate();
                  }}
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
