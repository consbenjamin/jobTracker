"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { ContactFormDialog } from "./contact-form-dialog";

type Contact = {
  id: string;
  name: string;
  position: string | null;
  channel: string;
  link: string | null;
  notes: string | null;
};

export function ContactList({
  applicationId,
  contacts,
  onUpdate,
}: {
  applicationId: string;
  contacts: Contact[];
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 shrink-0" />
          Contactos
        </CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir contacto
        </Button>
      </CardHeader>
      <CardContent>
        <ContactFormDialog
          applicationId={applicationId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            setOpen(false);
            onUpdate();
          }}
        />
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin contactos. Añade uno.</p>
        ) : (
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li key={c.id} className="flex items-start justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">{c.name}</p>
                  {c.position && <p className="text-muted-foreground">{c.position}</p>}
                  <p className="text-muted-foreground">{c.channel}</p>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {c.link}
                    </a>
                  )}
                  {c.notes && <p className="mt-1 text-muted-foreground">{c.notes}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await fetch(`/api/contacts/${c.id}`, { method: "DELETE" });
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
