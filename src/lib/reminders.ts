type InteractionLike = { date: string; responded: boolean };
type TaskLike = { dueAt: string; completed: boolean };
type AppLike = {
  id: string;
  company: string;
  role: string;
  status: string;
  interactions: InteractionLike[];
  tasks: TaskLike[];
};

/**
 * Aplicaciones que no han recibido respuesta (ninguna interacción con responded: true)
 * en los últimos X días y no están Rejected/Ghosted.
 */
export function applicationsWithoutResponse(
  applications: AppLike[],
  daysWithoutResponse: number = 5
): AppLike[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysWithoutResponse);

  return applications.filter((app) => {
    if (app.status === "Rejected" || app.status === "Ghosted") return false;
    const hasResponse = app.interactions.some((i) => i.responded);
    if (hasResponse) return false;
    const lastInteraction = app.interactions
      .map((i) => new Date(i.date).getTime())
      .sort((a, b) => b - a)[0];
    if (!lastInteraction) return true;
    return lastInteraction < cutoff.getTime();
  });
}

/**
 * Tareas con dueAt pasado o en los próximos N días, no completadas.
 */
export function upcomingOrOverdueTasks(
  applications: AppLike[],
  withinDays: number = 7
): { task: TaskLike & { id: string; title: string; type: string }; application: AppLike }[] {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + withinDays);
  const result: { task: TaskLike & { id: string; title: string; type: string }; application: AppLike }[] = [];

  for (const app of applications) {
    for (const task of app.tasks as (TaskLike & { id: string; title: string; type: string })[]) {
      if (task.completed) continue;
      const due = new Date(task.dueAt);
      if (due <= future) {
        result.push({ task, application: app });
      }
    }
  }
  result.sort((a, b) => new Date(a.task.dueAt).getTime() - new Date(b.task.dueAt).getTime());
  return result;
}
