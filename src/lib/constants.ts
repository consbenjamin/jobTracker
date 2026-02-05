export const APPLICATION_STATUSES = [
  "Applied",
  "FollowUp",
  "Interview",
  "Rejected",
  "Offer",
  "Ghosted",
] as const;

export const SOURCES = ["LinkedIn", "Otra"] as const;

export const MODALITIES = ["remoto", "hibrido", "presencial"] as const;

export const CONTACT_CHANNELS = ["LinkedIn", "email"] as const;

export const INTERACTION_TYPES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
  { value: "call", label: "Llamada" },
] as const;

export const TASK_TYPES = [
  { value: "follow_up", label: "Follow-up" },
  { value: "email", label: "Email" },
  { value: "call", label: "Llamada" },
] as const;

export const CHECKLIST_ITEMS = [
  "portfolio",
  "formulario_externo",
  "referral",
] as const;

export const CHECKLIST_LABELS: Record<string, string> = {
  portfolio: "Portfolio",
  formulario_externo: "Formulario externo",
  referral: "Referral",
};
