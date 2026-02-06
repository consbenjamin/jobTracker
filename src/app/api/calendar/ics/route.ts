import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createEvents, type EventAttributes } from "ics";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const applications = await prisma.application.findMany({
      where: { userId },
      include: { tasks: true },
    });
    const events: EventAttributes[] = [];
    for (const app of applications) {
      for (const task of app.tasks) {
        if (task.completed) continue;
        const due = new Date(task.dueAt);
        events.push({
          title: `${app.company}: ${task.title}`,
          start: [due.getFullYear(), due.getMonth() + 1, due.getDate(), due.getHours(), due.getMinutes()],
          duration: { minutes: 30 },
          description: `Postulación: ${app.company} — ${app.role}. Tarea: ${task.title}`,
        });
      }
    }
    if (events.length === 0) {
      return new NextResponse(
        "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:Job Tracker\nEND:VCALENDAR",
        {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="job-tracker-tareas.ics"',
          },
        }
      );
    }
    const { error, value } = createEvents(events);
    if (error) {
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
    return new NextResponse(value ?? "", {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="job-tracker-tareas.ics"',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error al generar calendario" },
      { status: 500 }
    );
  }
}
