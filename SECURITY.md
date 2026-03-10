# Seguridad y OWASP Top 10

Este documento describe cómo el proyecto aplica las mitigaciones del [OWASP Top 10](https://owasp.org/Top10/) (edición 2021 y consideraciones 2025).

## A01 – Broken Access Control

- **Control de acceso en APIs**: Todas las rutas API que manejan datos por usuario exigen autenticación mediante `getSessionUserId()` o `verifyBearerTokenAndGetUserId()` (extensión). Si no hay sesión/token válido se devuelve `401`.
- **Propiedad de recursos**: En rutas con `[id]`, las consultas Prisma incluyen siempre `userId` en el `where` (o comprueban pertenencia vía relación), de modo que un usuario no puede leer/modificar recursos de otro.
- **Middleware**: Las rutas de dashboard (`/applications`, `/quick-capture`, `/analytics`) están protegidas por middleware; las API se protegen en cada handler porque algunas aceptan Bearer token (extensión) además de sesión.

## A02 – Cryptographic Failures

- **Contraseñas**: Se hashean con **bcrypt** (cost 10) en registro; no se almacenan en claro.
- **Secrets**: Tokens de extensión se almacenan como hash HMAC-SHA256 (con `AUTH_SECRET`); API keys (p. ej. SerpAPI) se cifran con **AES-256-GCM** antes de guardar en BD (`src/lib/encrypt.ts`).
- **Transporte**: En producción se fuerza HTTPS mediante el header `Strict-Transport-Security` (HSTS).

## A03 – Injection

- **Base de datos**: Se usa **Prisma** con consultas parametrizadas; no hay concatenación de SQL con entrada de usuario.
- **Entrada en APIs**: Se aplican límites de longitud y listas acotadas en filtros y búsquedas (`src/lib/input-validation.ts`): longitud máxima de búsqueda, de filtros, de listas de tags/categorías y de paginación.

## A04 – Insecure Design

- **Redirects**: Las URLs de redirección (OAuth, callback) se validan en `auth` y en el handler de NextAuth para evitar open redirects (solo mismo origen o rutas relativas permitidas).

## A05 – Security Misconfiguration

- **Headers HTTP** (en `next.config.js`):
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` restringiendo cámara, micrófono, geolocalización
  - `Content-Security-Policy` (CSP) para limitar orígenes de scripts, estilos, imágenes y conexiones
  - En producción: `Strict-Transport-Security` (HSTS)
- **Secrets**: `AUTH_SECRET` es obligatorio en producción (validado al cargar `auth`).

## A06 – Vulnerable and Outdated Components

- Ejecutar periódicamente:
  ```bash
  npm audit
  npm audit fix
  ```
- Revisar dependencias y actualizar según las recomendaciones de seguridad.

## A07 – Identification and Authentication Failures

- **Autenticación**: NextAuth con JWT, proveedores OAuth (Google, GitHub) y Credentials con bcrypt.
- **Rate limiting**: El endpoint de registro (`/api/auth/register`) tiene límite de intentos por IP (ventana de 1 minuto) para mitigar abusos y fuerza bruta (`src/lib/rate-limit.ts`).
- **Email account linking**: Actualmente `allowDangerousEmailAccountLinking` está en `true` por conveniencia; en entornos más estrictos valorar desactivarlo y manejar cuentas vinculadas por otro medio.

## A08 – Software and Data Integrity Failures

- Usar `package-lock.json` en instalaciones para fijar versiones.
- No instalar paquetes desde fuentes no fiables; revisar integridad de dependencias.

## A09 – Security Logging and Monitoring Failures

- **Registro de seguridad** (`src/lib/security-logger.ts`): Eventos como intentos de registro (éxito/fallo), rate limit en registro y accesos no autorizados al cron se registran **sin incluir contraseñas, tokens ni secretos**.
- En producción se recomienda enviar estos logs a un sistema de monitoreo (p. ej. agregador de logs o SIEM).

## A10 – Server-Side Request Forgery (SSRF)

- No se realizan peticiones HTTP a URLs proporcionadas por el usuario. Los scrapers (SerpAPI, Remotive, RemoteOK) usan URLs y parámetros controlados por el servidor o por configuración interna.

---

## Buenas prácticas adicionales

- **Variables de entorno**: No subir `.env` al repositorio; usar ejemplos (`.env.example`) sin valores reales.
- **Cron**: El endpoint `/api/cron/scrape-jobs` debe protegerse con `CRON_SECRET` (Bearer) y solo llamarse desde el planificador (p. ej. Vercel Cron).
- **Extensión**: El token de extensión es un secreto por usuario; se transmite solo por HTTPS y se valida con HMAC en servidor.
