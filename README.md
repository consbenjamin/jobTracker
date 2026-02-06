# Job Tracker

Seguimiento de postulaciones, contactos, interacciones y tareas para búsqueda de empleo. MVP listo para portfolio/CV.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + PostgreSQL (Railway en producción)
- **Tailwind CSS** + componentes tipo shadcn/ui (Radix UI)
- **Recharts** para gráficos del dashboard
- **Sonner** para notificaciones toast
- **PWA**: manifest y service worker para instalación como app

## Funcionalidades

### Entidades

- **Application** (postulación): empresa, rol, link, fuente, estado, seniority, modalidad, salario esperado, stack requerido, notas, checklist, etiquetas, favorita
- **Contact**: contacto por postulación (nombre, posición, canal LinkedIn/email, link, notas)
- **Interaction**: interacción (LinkedIn, email, llamada) con fecha, si hubo respuesta y resultado
- **Task**: tarea con fecha límite (follow-up, email, llamada)
- **Activity**: historial de cambios (estados, notas, creación)

### Dashboard / Inicio

- **Métricas**: Activas (sin rechazo ni ghosted), En proceso (últimos 7 días), Ofertas
- **Postulaciones destacadas**: favoritas recientes
- **Recordatorios**: postulaciones sin respuesta en X días y tareas próximas/vencidas (configurables)
- Accesos rápidos a Postulaciones, Captura rápida y Analytics

### Postulaciones

- **Vista Kanban** y **Vista Lista** con toggle
- **Filtros**: empresa, rol, estado, rango de fechas, solo favoritas, etiquetas
- **Exportar CSV**: todas las postulaciones filtradas
- **Importar CSV**: columnas `company`, `role`, `status`, `appliedAt`, `source`, `seniority`, `modality`, `offerLink`, `notes`
- **Exportar calendario ICS**: tareas pendientes para Google Calendar / Apple Calendar
- **Duplicar** postulación desde el detalle

### Detalle de postulación

- **Timeline** de actividades ordenadas
- **Contactos**: añadir, editar, eliminar
- **Interacciones**: añadir, editar, eliminar (tipo, fecha, si respondieron, resumen)
- **Tareas**: añadir, editar, marcar completadas, eliminar
- **Checklist**: portfolio, formulario externo, referral
- **Notas** y **actividad** (historial)
- **Favorita**: marcar/desmarcar
- **Modo focus**: oculta navegación para concentrarse

### Captura rápida

- Formulario minimalista (empresa, rol, link, fuente) para añadir una postulación en menos de un minuto

### Analytics

- Total de postulaciones
- Tasa de respuesta (% con al menos una respuesta vs ghost)
- Días promedio a primera respuesta
- Empresas con más de una postulación
- Gráfico de postulaciones por mes
- Funnel por estado (Applied, Follow-up, Interview, Rejected, Offer, Ghosted)
- Canales (LinkedIn, Email, Llamada) con total y respuestas
- Lista de empresas repetidas

### UI / UX

- **Tema claro/oscuro** con toggle (persistido en localStorage)
- **Búsqueda global** en nav (`/` para buscar por empresa o rol)
- **Navegación responsive** con menú móvil
- **PWA** instalable
- **Atajos**: `Ctrl/Cmd+N` → captura rápida, `/` → foco en búsqueda
- **Autenticación**: login con Google, GitHub o email/contraseña; cada usuario ve solo sus postulaciones

## Instalación local

### Requisitos

- Node.js 18+
- npm

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-repo> job-tracker
cd job-tracker

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env y pon tu DATABASE_URL (PostgreSQL, ej. de Railway).

# 4. Crear tablas en la base de datos (primera vez: crea la migración)
npm run db:migrate
# O, si solo quieres sincronizar el schema sin migraciones: npm run db:push

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

| Variable      | Descripción                      | Ejemplo           |
|---------------|----------------------------------|-------------------|
| `DATABASE_URL`| URL de PostgreSQL                | `postgresql://...` (Railway u otro) |
| `AUTH_SECRET` | Secreto para NextAuth (obligatorio en producción) | Generar con `npx auth secret` |
| `AUTH_URL`    | URL de la app (NextAuth)         | `http://localhost:3000` (local) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth Google (opcional) | Desde Google Cloud Console |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | OAuth GitHub (opcional) | Desde GitHub Developer Settings |

## Scripts

| Script               | Descripción                          |
|----------------------|--------------------------------------|
| `npm run dev`        | Servidor de desarrollo               |
| `npm run build`      | Build de producción                  |
| `npm run start`      | Servidor de producción               |
| `npm run lint`       | Linter                               |
| `npm run db:generate`    | Generar cliente Prisma          |
| `npm run db:push`        | Sincronizar schema con la BD (sin migraciones) |
| `npm run db:migrate`     | Crear y aplicar migraciones (desarrollo) |
| `npm run db:migrate:deploy` | Aplicar migraciones en producción |
| `npm run db:studio`       | Abrir Prisma Studio              |

## Deploy (Railway + Vercel)

### 1. PostgreSQL en Railway

1. Entra en [railway.app](https://railway.app) e inicia sesión.
2. **New Project** → crea un proyecto (puedes darle nombre, ej. `job-tracker`).
3. En el proyecto, **Add Service** → **Database** → **PostgreSQL**.
4. Railway crea el servicio. Haz clic en el servicio **PostgreSQL**.
5. Pestaña **Variables**: verás variables como `DATABASE_URL` o `POSTGRES_URL`.  
   - Si ves `POSTGRES_URL`, esa es la URL de conexión (Prisma acepta esa URL como `DATABASE_URL`).  
   - Si ves `DATABASE_URL`, úsala tal cual.  
   Copia el valor (icono de copiar).
6. Opcional: en **Settings** del servicio PostgreSQL puedes ver **Connect** y la connection string; es la misma que en Variables.

### 2. Configurar la app con la URL de Railway

- **En tu Mac (desarrollo):** pega la URL en `.env`:
  ```env
  DATABASE_URL="postgresql://postgres:xxxxx@xxxxx.railway.app:6543/railway"
  ```
- Crea la primera migración y aplica a Railway:
  ```bash
  npm run db:migrate
  ```
  Cuando pida nombre de migración, usa por ejemplo `init`.

### 3. Desplegar la app en Vercel

1. Sube el repo a GitHub (si no está ya).
2. En [vercel.com](https://vercel.com), importa el proyecto desde GitHub.
3. En **Environment Variables** del proyecto en Vercel, añade:
   - `DATABASE_URL` = la misma URL de Railway (la que copiaste).
4. Deploy. Después del primer deploy, en Vercel ejecuta las migraciones (Build command o un paso post-deploy):
   - En **Settings → General → Build & Development Settings**, en **Build Command** puedes dejar `npm run build`.  
   - Añade en **Settings** un script de post-deploy o ejecuta una vez en tu Mac apuntando a producción:
     ```bash
     DATABASE_URL="<tu-url-railway>" npm run db:migrate:deploy
     ```
   Así las tablas existen en Railway antes de que la app en Vercel las use.

Listo: base de datos en Railway y app en Vercel usando esa misma `DATABASE_URL`.

## Estructura de la app

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── analytics/       # Dashboard analytics
│   │   ├── applications/    # Lista + detalle
│   │   └── quick-capture/   # Formulario rápido
│   ├── api/                 # API routes
│   │   ├── applications/    # CRUD, import, export CSV
│   │   ├── calendar/ics/    # Export calendario
│   │   ├── contacts/
│   │   ├── interactions/
│   │   └── tasks/
│   ├── layout.tsx
│   └── page.tsx             # Inicio
├── components/
│   ├── ui/                  # Botones, cards, inputs, etc.
│   ├── kanban-board.tsx
│   ├── application-detail.tsx
│   ├── reminders-block.tsx
│   ├── theme-toggle.tsx
│   └── ...
└── lib/
    ├── db.ts
    ├── constants.ts
    └── reminders.ts
```

## Próximos pasos (post-MVP)

- Heatmap de horas/días donde responden más
- Comparador de versiones de CV (A/B)
- Score de postulación (alineación con stack) y correlación con resultados
- Autenticación (NextAuth) para multi-usuario

## Licencia

MIT
