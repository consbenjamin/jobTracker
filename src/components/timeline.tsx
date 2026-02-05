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
      <h3 className="font-semibold mb-4">Timeline</h3>
      <ul className="space-y-3">
        {events.map((ev, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="text-muted-foreground shrink-0 w-24">
              {new Date(ev.date).toLocaleDateString("es", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="font-medium">{ev.label}</span>
            {ev.detail && <span className="text-muted-foreground">— {ev.detail}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
