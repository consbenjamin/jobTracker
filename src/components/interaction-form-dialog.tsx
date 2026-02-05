"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INTERACTION_TYPES } from "@/lib/constants";

export function InteractionFormDialog({
  applicationId,
  open,
  onOpenChange,
  onSuccess,
}: {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("linkedin");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [responded, setResponded] = useState(false);
  const [textOrSummary, setTextOrSummary] = useState("");
  const [outcome, setOutcome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          type,
          date: new Date(date).toISOString(),
          responded,
          textOrSummary: textOrSummary.trim() || null,
          outcome: outcome.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setType("linkedin");
      setDate(new Date().toISOString().slice(0, 16));
      setResponded(false);
      setTextOrSummary("");
      setOutcome("");
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva interacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Fecha y hora</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="responded"
              checked={responded}
              onCheckedChange={(v) => setResponded(!!v)}
            />
            <Label htmlFor="responded">Respondieron</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textOrSummary">Texto / resumen</Label>
            <Textarea
              id="textOrSummary"
              value={textOrSummary}
              onChange={(e) => setTextOrSummary(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcome">Resultado</Label>
            <Input
              id="outcome"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Añadir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
