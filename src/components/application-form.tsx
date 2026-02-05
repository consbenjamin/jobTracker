"use client";

import { useState } from "react";
import {
  APPLICATION_STATUSES,
  SOURCES,
  MODALITIES,
} from "@/lib/constants";
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
import { Card, CardContent } from "@/components/ui/card";

const STATUS_LABELS: Record<string, string> = {
  Applied: "Aplicado",
  FollowUp: "Follow-up",
  Interview: "Entrevista",
  Rejected: "Rechazado",
  Offer: "Oferta",
  Ghosted: "Ghosted",
};

type Application = {
  id: string;
  company: string;
  role: string;
  offerLink?: string | null;
  source?: string;
  status?: string;
  appliedAt: string;
  seniority?: string | null;
  modality?: string | null;
  expectedSalary?: number | null;
  requiredStack?: string | null;
  requiresExternalForm?: boolean;
  externalFormLink?: string | null;
  notes?: string | null;
  cvVersion?: string | null;
  tags?: string | null;
  [key: string]: unknown;
};

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  try {
    const arr = JSON.parse(tags) as unknown;
    return Array.isArray(arr) ? arr.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function ApplicationForm({
  application,
  onSuccess,
  onCancel,
  minimal,
}: {
  application?: Application | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  minimal?: boolean;
}) {
  const isEdit = !!application?.id;
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(application?.company ?? "");
  const [role, setRole] = useState(application?.role ?? "");
  const [offerLink, setOfferLink] = useState(application?.offerLink ?? "");
  const [source, setSource] = useState(application?.source ?? "LinkedIn");
  const [status, setStatus] = useState(application?.status ?? "Applied");
  const [appliedAt, setAppliedAt] = useState(
    application?.appliedAt
      ? new Date(application.appliedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [seniority, setSeniority] = useState(application?.seniority ?? "");
  const [modality, setModality] = useState(application?.modality ?? "");
  const [expectedSalary, setExpectedSalary] = useState(
    application?.expectedSalary != null ? String(application.expectedSalary) : ""
  );
  const [requiredStack, setRequiredStack] = useState(
    application?.requiredStack ?? ""
  );
  const [requiresExternalForm, setRequiresExternalForm] = useState(
    application?.requiresExternalForm ?? false
  );
  const [externalFormLink, setExternalFormLink] = useState(
    application?.externalFormLink ?? ""
  );
  const [notes, setNotes] = useState(application?.notes ?? "");
  const [cvVersion, setCvVersion] = useState(application?.cvVersion ?? "");
  const [tags, setTags] = useState<string[]>(() => parseTags(application?.tags ?? null));
  const [tagInput, setTagInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;
    setLoading(true);
    try {
      const url = isEdit ? `/api/applications/${application.id}` : "/api/applications";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? {
            company: company.trim(),
            role: role.trim(),
            offerLink: offerLink.trim() || null,
            source,
            status,
            appliedAt: new Date(appliedAt).toISOString(),
            seniority: seniority.trim() || null,
            modality: modality || null,
            expectedSalary: expectedSalary ? Number(expectedSalary) : null,
            requiredStack: requiredStack.trim() || null,
            requiresExternalForm,
            externalFormLink: externalFormLink.trim() || null,
            notes: notes.trim() || null,
            cvVersion: cvVersion.trim() || null,
            tags: tags.length > 0 ? JSON.stringify(tags) : null,
          }
        : {
            company: company.trim(),
            role: role.trim(),
            offerLink: offerLink.trim() || null,
            source,
            status,
            appliedAt: new Date(appliedAt).toISOString(),
            seniority: seniority.trim() || null,
            modality: modality || null,
            expectedSalary: expectedSalary ? Number(expectedSalary) : null,
            requiredStack: requiredStack.trim() || null,
            requiresExternalForm,
            externalFormLink: externalFormLink.trim() || null,
            notes: notes.trim() || null,
            cvVersion: cvVersion.trim() || null,
            tags: tags.length > 0 ? JSON.stringify(tags) : null,
          };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="offerLink">Link oferta</Label>
            <Input
              id="offerLink"
              type="url"
              value={offerLink}
              onChange={(e) => setOfferLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appliedAt">Fecha postulación</Label>
            <Input
              id="appliedAt"
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
            />
          </div>
          {!minimal && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority</Label>
                  <Input
                    id="seniority"
                    value={seniority}
                    onChange={(e) => setSeniority(e.target.value)}
                    placeholder="Junior, Mid, Senior..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Select value={modality} onValueChange={setModality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODALITIES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Salario esperado</Label>
                <Input
                  id="expectedSalary"
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="Ej. 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requiredStack">Stack requerido</Label>
                <Input
                  id="requiredStack"
                  value={requiredStack}
                  onChange={(e) => setRequiredStack(e.target.value)}
                  placeholder="React, Node, etc."
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requiresExternalForm"
                  checked={requiresExternalForm}
                  onCheckedChange={(v) => setRequiresExternalForm(!!v)}
                />
                <Label htmlFor="requiresExternalForm">Requiere formulario externo</Label>
              </div>
              {requiresExternalForm && (
                <div className="space-y-2">
                  <Label htmlFor="externalFormLink">Link formulario externo</Label>
                  <Input
                    id="externalFormLink"
                    type="url"
                    value={externalFormLink}
                    onChange={(e) => setExternalFormLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Etiquetas</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                        className="hover:text-destructive"
                        aria-label={`Quitar ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <Input
                    id="tags"
                    className="w-32 min-w-0"
                    placeholder="Añadir..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const v = (e.key === "," ? tagInput.replace(/,/g, "") : tagInput).trim();
                        if (v && !tags.includes(v)) {
                          setTags((t) => [...t, v]);
                          setTagInput("");
                        } else if (e.key === ",") {
                          setTagInput((prev) => prev.replace(/,/g, "").trim());
                        }
                      }
                    }}
                    onBlur={() => {
                      const v = tagInput.trim();
                      if (v && !tags.includes(v)) {
                        setTags((t) => [...t, v]);
                        setTagInput("");
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvVersion">Versión CV (A/B)</Label>
                <Input
                  id="cvVersion"
                  value={cvVersion}
                  onChange={(e) => setCvVersion(e.target.value)}
                  placeholder="A, B, v1..."
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
