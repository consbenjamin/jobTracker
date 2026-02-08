# Seguridad – Job Tracker

Checklist de controles de seguridad aplicados antes del despliegue.

---

## 1. Variables de entorno y secretos

- [x] `.env` y `.env*.local` están en `.gitignore` (no se suben al repo).
- [x] No se usan variables `NEXT_PUBLIC_*` para secretos (solo para datos no sensibles).
- [x] `AUTH_SECRET` es obligatorio en producción: la app lanza error al arrancar si falta.

**En producción:** Configura `AUTH_SECRET`, `DATABASE_URL` y `AUTH_URL` en Vercel; no las incluyas en el código ni en el repo.

---

## 2. Autenticación y autorización

- [x] Las rutas de API (excepto `/api/auth/*` y `/api/auth/register`) exigen sesión (`getSessionUserId()`); si no hay sesión responden 401.
- [x] Todas las operaciones sobre recursos (applications, contacts, tasks, interactions) comprueban que el recurso pertenece al usuario (`userId` en queries o helpers como `contactBelongsToUser`).
- [x] El middleware protege las páginas del dashboard; las rutas públicas son `/`, `/login`, `/register`, `/auth-error`.

---

## 3. Validación de entradas

- [x] **Registro:** email con formato válido (regex), longitud máxima de email y contraseña; contraseña mínimo 8 caracteres, máximo 128; bcrypt con 10 rounds.
- [x] **POST applications:** límites de longitud en campos de texto (company, role, notes, links, etc.) para evitar payloads enormes y abusos.
- [x] Se usa Prisma (ORM) para todas las consultas; no hay SQL crudo, reduciendo riesgo de inyección SQL.

---

## 4. Headers de seguridad (Next.js)

- [x] **X-Frame-Options: DENY** – reduce riesgo de clickjacking.
- [x] **X-Content-Type-Options: nosniff** – evita MIME sniffing.
- [x] **Referrer-Policy: strict-origin-when-cross-origin** – controla qué se envía en Referer.
- [x] **Permissions-Policy** – restringe acceso a cámara, micrófono, geolocalización.
- [x] **Strict-Transport-Security (HSTS)** – solo en producción; fuerza HTTPS.

Configuración en `next.config.js` → `headers()`.

---

## 5. Dependencias

- [x] `npm audit` sin vulnerabilidades conocidas (ejecutar de nuevo antes de cada despliegue: `npm audit`).

---

## 6. Respuestas de error

- [x] En catch de las API se devuelve un mensaje genérico (ej. "Error al registrar") y no detalles internos ni stack traces al cliente.

---

## Recomendaciones adicionales (opcional)

- **Rate limiting:** En producción (p. ej. Vercel) puedes añadir límite de peticiones por IP en `/api/auth/register` y en login para mitigar fuerza bruta y registro masivo.
- **CSP (Content-Security-Policy):** Si quieres endurecer más el front, puedes añadir una política con nonce para scripts (el script de tema en `layout.tsx` es estático y controlado por el código).
- **Auditoría periódica:** Ejecutar `npm audit` y actualizar dependencias con parches de seguridad.
- **AUTH_URL:** En producción debe ser la URL pública de la app (ej. `https://tu-app.vercel.app`) para que los callbacks de OAuth funcionen bien.
