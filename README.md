# Job Tracker

Seguimiento de postulaciones, contactos, interacciones y tareas para búsqueda de empleo. MVP listo para portfolio/CV.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Prisma** + SQLite (desarrollo) / PostgreSQL (producción)
- **Tailwind CSS** + componentes tipo shadcn/ui
- **Recharts** para gráficos del dashboard

## Funciones

- **Entidades:** Application (postulación), Contact, Interaction, Task
- **Captura rápida:** formulario de 1 minuto (empresa, rol, link, fuente, estado, fecha)
- **Timeline** por postulación: eventos ordenados (postulé → escribí → respondieron → tareas)
- **Kanban** por estado (Applied, Follow-up, Interview, Rejected, Offer, Ghosted) con filtros por empresa, rol, fecha
- **Recordatorios:** postulaciones sin respuesta en X días y tareas próximas/vencidas
- **Notas y checklist** en cada postulación (portfolio, formulario externo, referral)
- **Dashboard analytics:** postulaciones por mes, tasa de respuesta, funnel por estado, tiempo a respuesta, canales, empresas repetidas

## Cómo ejecutar

```bash
# Instalar dependencias
npm install

# Variables de entorno (opcional; por defecto usa SQLite local)
cp .env.example .env

# Crear base de datos y generar cliente Prisma
npm run db:push

# Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run db:push` — sincronizar schema con la base de datos
- `npm run db:studio` — abrir Prisma Studio

## Próximos pasos (post-MVP)

- Heatmap de horas/días donde responden más
- Comparador de versiones de CV (A/B)
- Score de postulación (alineación con stack) y correlación con resultados
- Autenticación (NextAuth) para multi-usuario

## Licencia

MIT
