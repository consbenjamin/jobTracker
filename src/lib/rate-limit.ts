/**
 * Rate limiting simple en memoria (OWASP A07 - mitigación de fuerza bruta).
 * En producción con múltiples instancias considerar Redis o similar.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 5; // máx intentos de registro por IP por ventana

function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Comprueba si la IP está dentro del límite. Si no, devuelve true (rate limited).
 */
export function isRateLimited(request: Request, keyPrefix: string = "default"): boolean {
  const id = getClientId(request);
  const key = `${keyPrefix}:${id}`;
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) return true;
  return false;
}

/**
 * Rate limit para registro: 5 intentos por minuto por IP.
 */
export function isRegisterRateLimited(request: Request): boolean {
  return isRateLimited(request, "register");
}
