/**
 * Registro de eventos de seguridad (OWASP A09).
 * NUNCA registrar contraseñas, tokens, API keys ni datos sensibles.
 */

type SecurityEvent =
  | { type: "auth_register_attempt"; ip: string; success: boolean; reason?: string }
  | { type: "auth_register_rate_limited"; ip: string }
  | { type: "auth_unauthorized"; path: string; method: string }
  | { type: "cron_unauthorized"; reason: string };

function safeString(value: unknown, maxLen = 200): string {
  if (value == null) return "";
  const s = String(value).slice(0, maxLen);
  return s.replace(/[\s\n\r]+/g, " ").trim();
}

export function logSecurityEvent(event: SecurityEvent): void {
  const timestamp = new Date().toISOString();
  const payload = { timestamp, ...event };
  if (process.env.NODE_ENV === "production") {
    console.warn("[security]", JSON.stringify(payload));
  } else {
    console.warn("[security]", payload);
  }
}

export function logSecurityError(message: string, context?: Record<string, unknown>): void {
  const sanitized: Record<string, unknown> = { message: safeString(message) };
  if (context) {
    for (const [k, v] of Object.entries(context)) {
      if (k.toLowerCase().includes("password") || k.toLowerCase().includes("token") || k.toLowerCase().includes("secret")) continue;
      sanitized[k] = typeof v === "string" ? safeString(v) : v;
    }
  }
  console.error("[security]", sanitized);
}
