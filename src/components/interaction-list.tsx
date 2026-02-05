"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InteractionFormDialog } from "./interaction-form-dialog";

const TYPE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  email: "Email",
  call: "Llamada",
};

type Interaction = {
  id: string;
  type: string;
  date: string;
  responded: boolean;
  textOrSummary: string | null;
  outcome: string | null;
};

export function InteractionList({
  applicationId,
  interactions,
  onUpdate,
}: {
  applicationId: string;
  interactions: Interaction[];
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Interacciones</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir interacción
        </Button>
      </CardHeader>
      <CardContent>
        <InteractionFormDialog
          applicationId={applicationId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            setOpen(false);
            onUpdate();
          }}
        />
        {interactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin interacciones. Añade una.</p>
        ) : (
          <ul className="space-y-2">
            {interactions.map((i) => (
              <li key={i.id} className="flex items-start justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {TYPE_LABELS[i.type] ?? i.type} — {i.responded ? "Respondieron" : "Escribí"}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(i.date).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {i.textOrSummary && <p className="mt-1">{i.textOrSummary}</p>}
                  {i.outcome && <p className="text-muted-foreground">{i.outcome}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/interactions/${i.id}`, { method: "DELETE" });
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
