export const APPLICATION_STATUSES = [
  "Applied",
  "FollowUp",
  "Interview",
  "Rejected",
  "Offer",
  "Ghosted",
] as const;

/** Colores por estado (mismo orden que APPLICATION_STATUSES): azul, cyan, ámbar, rojo, verde, gris */
export const STATUS_COLORS: Record<string, string> = {
  Applied: "#3b82f6",
  FollowUp: "#06b6d4",
  Interview: "#f59e0b",
  Rejected: "#ef4444",
  Offer: "#22c55e",
  Ghosted: "#6b7280",
};

export const STATUS_LABELS: Record<string, string> = {
  Applied: "Aplicado",
  FollowUp: "Follow-up",
  Interview: "Entrevista",
  Rejected: "Rechazado",
  Offer: "Oferta",
  Ghosted: "Ghosted",
};

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
