"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applicationsWithoutResponse,
  upcomingOrOverdueTasks,
} from "@/lib/reminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare } from "lucide-react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  interactions: { date: string; responded: boolean }[];
  tasks: { id: string; title: string; dueAt: string; completed: boolean; type: string }[];
  [key: string]: unknown;
};

export function RemindersBlock() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const needFollowUp = applicationsWithoutResponse(applications, 5);
  const upcomingTasks = upcomingOrOverdueTasks(applications, 7);

  if (needFollowUp.length === 0 && upcomingTasks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 shrink-0" />
          Recordatorios
        </CardTitle>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
          <Link href="/applications" className="flex justify-center">Ver postulaciones</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {needFollowUp.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <MessageSquare className="h-4 w-4" />
              Sin respuesta en 5+ días ({needFollowUp.length})
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {needFollowUp.slice(0, 5).map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/applications/${app.id}`}
                    className="text-primary hover:underline"
                  >
                    {app.company} — {app.role}
                  </Link>
                </li>
              ))}
              {needFollowUp.length > 5 && (
                <li className="text-muted-foreground">y {needFollowUp.length - 5} más</li>
              )}
            </ul>
          </div>
        )}
        {upcomingTasks.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-blue-600 dark:text-blue-500">
              <Calendar className="h-4 w-4" />
              Tareas próximas o vencidas ({upcomingTasks.length})
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {upcomingTasks.slice(0, 5).map(({ task, application }) => (
                <li key={task.id}>
                  <Link
                    href={`/applications/${application.id}`}
                    className="text-primary hover:underline"
                  >
                    {application.company}: {task.title} —{" "}
                    {new Date(task.dueAt).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Link>
                </li>
              ))}
              {upcomingTasks.length > 5 && (
                <li className="text-muted-foreground">y {upcomingTasks.length - 5} más</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
