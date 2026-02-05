"use client";

const TYPE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  email: "Email",
  call: "Llamada",
};

type AppLike = {
  id: string;
  appliedAt: string;
  interactions?: unknown[];
  tasks?: unknown[];
};

export function Timeline({ application }: { application: AppLike }) {
  type Event = {
    date: string;
    type: "applied" | "interaction" | "task";
    label: string;
    detail?: string;
  };

  const events: Event[] = [
    {
      date: application.appliedAt,
      type: "applied",
      label: "Postulé",
      detail: undefined,
    },
  ];

  const interactions = (application.interactions ?? []) as { date: string; type: string; responded: boolean; textOrSummary?: string | null }[];
  interactions.forEach((i) => {
    events.push({
      date: i.date,
      type: "interaction",
      label: i.responded ? "Respondieron" : "Escribí",
      detail: TYPE_LABELS[i.type] ?? i.type + (i.textOrSummary ? `: ${i.textOrSummary.slice(0, 50)}...` : ""),
    });
  });

  const tasks = (application.tasks ?? []) as { dueAt: string; title: string; completed: boolean }[];
  tasks.forEach((t) => {
    if (t.completed) {
      events.push({
        date: t.dueAt,
        type: "task",
        label: "Tarea completada",
        detail: t.title,
      });
    }
  });

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (events.length <= 1) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-semibold mb-2">Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Solo postulación por ahora. Añade interacciones y tareas para ver el timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold mb-4 text-base">Timeline</h3>
      <ul className="space-y-0 relative pl-4 border-l-2 border-muted">
        {events.map((ev, i) => (
          <li key={i} className="flex gap-3 py-3 first:pt-0 last:pb-0 relative">
            <span className="absolute -left-[9px] top-4 h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-muted-foreground">
                {new Date(ev.date).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="font-medium text-sm">{ev.label}</span>
              {ev.detail && <span className="text-sm text-muted-foreground">{ev.detail}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
