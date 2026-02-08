# Despliegue: Vercel (app) + Railway (PostgreSQL)

> **Antes de desplegar:** Revisa [SECURITY.md](./SECURITY.md) para el checklist de seguridad aplicado y recomendaciones.

Tu app es **Next.js full-stack**: el "backend" son las API routes (`src/app/api/`) que se ejecutan en el mismo despliegue que el frontend. La arquitectura recomendada es:

- **Vercel** → App Next.js completa (páginas + API routes).
- **Railway** → Solo la base de datos PostgreSQL.

---

## 1. Base de datos en Railway

1. Entra en [railway.app](https://railway.app) y crea un proyecto.
2. **Add Service** → **Database** → **PostgreSQL**.
3. Railway crea el servicio y te da una **DATABASE_URL**. En el servicio Postgres:
   - Pestaña **Variables** (o **Connect**) → copia `DATABASE_URL` (o la connection string que muestre).
4. Opcional: en **Settings** del servicio, activa **Public Networking** solo si necesitas conectar desde fuera de Railway; para Vercel no suele hacer falta si usas la variable interna.

Guarda esa `DATABASE_URL` para el paso de Vercel.

---

## 2. Ejecutar migraciones en la DB de Railway

En tu máquina, con la URL de Railway:

```bash
# Usa la misma DATABASE_URL que luego pondrás en Vercel
export DATABASE_URL="postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"

# Aplicar migraciones
npx prisma migrate deploy
```

Así la base de datos en Railway tiene el esquema actualizado.

---

## 3. Desplegar la app en Vercel

1. Sube el repo a GitHub (si no está ya).
2. Entra en [vercel.com](https://vercel.com) → **Add New** → **Project** → importa el repo.
3. **Framework Preset**: Next.js (detectado automáticamente).
4. **Root Directory**: dejar por defecto (raíz del repo).
5. **Build and Output Settings**: normalmente no hace falta tocar; Vercel usa `next build`.

### Variables de entorno en Vercel

En el proyecto → **Settings** → **Environment Variables**, añade:

| Variable | Valor | Notas |
|---------|--------|--------|
| `DATABASE_URL` | `postgresql://...` de Railway | La que copiaste en el paso 1 |
| `AUTH_SECRET` | Una cadena aleatoria segura | Ej: `openssl rand -base64 32` |
| `AUTH_URL` | `https://tu-dominio.vercel.app` | URL final de la app (tras el primer deploy puede ser `https://xxx.vercel.app`) |

Si usas login con Google/GitHub:

| Variable | Valor |
|----------|--------|
| `AUTH_GOOGLE_ID` | Client ID de Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | Client Secret |
| `AUTH_GITHUB_ID` | Client ID de GitHub OAuth App |
| `AUTH_GITHUB_SECRET` | Client Secret |

**Importante:** Después de cambiar `AUTH_URL` o cualquier variable, haz un **Redeploy** del proyecto en Vercel.

---

## 4. Build en Vercel

Vercel ejecutará:

- `npm install` (o tu package manager)
- `prisma generate` (si está en `postinstall` o en el build)
- `next build`

Para que Prisma se genere en el build, en `package.json` debe existir algo como:

```json
"scripts": {
  "build": "prisma generate && next build"
}
```

Si no está, añade `prisma generate` antes de `next build`. Las migraciones **no** se ejecutan en Vercel; las aplicas tú con `prisma migrate deploy` contra la DB de Railway (paso 2).

---

## 5. Resumen del flujo

```
Usuario → https://tu-app.vercel.app (Vercel)
              ↓
         Next.js (páginas + API routes en Vercel)
              ↓
         DATABASE_URL → PostgreSQL en Railway
```

- **Frontend**: Vercel.
- **Backend (lógica)**: API routes de Next.js en Vercel (serverless).
- **Base de datos**: Railway (PostgreSQL).

---

## Alternativa: backend separado en Railway

Si en el futuro quisieras un **servidor API separado** en Railway (por ejemplo Express/Fastify) y el frontend en Vercel solo como cliente:

1. Crear un proyecto nuevo (p. ej. `job-tracker-api`) con Express/Fastify.
2. Mover la lógica de `src/app/api/*` a rutas de ese servidor.
3. Desplegar ese proyecto en Railway como servicio Node.
4. En el frontend Next.js (en Vercel), reemplazar las llamadas a `/api/...` por la URL del API en Railway (p. ej. `https://tu-api.railway.app/...`).

Para tu estructura actual, **no es necesario**: desplegar todo Next.js en Vercel y la DB en Railway es la opción más simple y recomendada.
