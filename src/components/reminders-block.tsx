"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  applicationsWithoutResponse,
  upcomingOrOverdueTasks,
} from "@/lib/reminders";
import {
  getDaysWithoutResponse,
  setDaysWithoutResponse,
  getTasksWithinDays,
  setTasksWithinDays,
} from "@/lib/reminder-settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Calendar, MessageSquare, Settings } from "lucide-react";

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
  const [daysWithoutResponse, setDaysWithoutResponseState] = useState(5);
  const [tasksWithinDays, setTasksWithinDaysState] = useState(7);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDays, setSettingsDays] = useState("5");
  const [settingsTasksDays, setSettingsTasksDays] = useState("7");

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setDaysWithoutResponseState(getDaysWithoutResponse());
    setTasksWithinDaysState(getTasksWithinDays());
  }, []);

  const needFollowUp = applicationsWithoutResponse(applications, daysWithoutResponse);
  const upcomingTasks = upcomingOrOverdueTasks(applications, tasksWithinDays);

  const openSettings = () => {
    setSettingsDays(String(getDaysWithoutResponse()));
    setSettingsTasksDays(String(getTasksWithinDays()));
    setSettingsOpen(true);
  };

  const saveSettings = () => {
    const d = Math.max(1, parseInt(settingsDays, 10) || 5);
    const t = Math.max(1, parseInt(settingsTasksDays, 10) || 7);
    setDaysWithoutResponse(d);
    setTasksWithinDays(t);
    setDaysWithoutResponseState(d);
    setTasksWithinDaysState(t);
    setSettingsOpen(false);
  };

  if (loading) return null;

  if (needFollowUp.length === 0 && upcomingTasks.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 shrink-0" />
            Recordatorios
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={openSettings} aria-label="Configurar recordatorios">
              <Settings className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/applications" className="flex justify-center">Ver postulaciones</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay recordatorios pendientes.</p>
        </CardContent>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar recordatorios</DialogTitle>
              <DialogDescription>
                Días para considerar &quot;sin respuesta&quot; y ventana de tareas próximas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="settings-days">Días sin respuesta (follow-up)</Label>
                <Input
                  id="settings-days"
                  type="number"
                  min={1}
                  value={settingsDays}
                  onChange={(e) => setSettingsDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-tasks">Días para tareas próximas</Label>
                <Input
                  id="settings-tasks"
                  type="number"
                  min={1}
                  value={settingsTasksDays}
                  onChange={(e) => setSettingsTasksDays(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancelar</Button>
              <Button onClick={saveSettings}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 shrink-0" />
          Recordatorios
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={openSettings} aria-label="Configurar recordatorios">
            <Settings className="h-4 w-4" />
          </Button>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
            <Link href="/applications" className="flex justify-center">Ver postulaciones</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {needFollowUp.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <MessageSquare className="h-4 w-4" />
              Sin respuesta en {daysWithoutResponse}+ días ({needFollowUp.length})
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
              Tareas próximas o vencidas (próximos {tasksWithinDays} días) ({upcomingTasks.length})
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
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar recordatorios</DialogTitle>
            <DialogDescription>
              Días para considerar &quot;sin respuesta&quot; y ventana de tareas próximas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="settings-days">Días sin respuesta (follow-up)</Label>
              <Input
                id="settings-days"
                type="number"
                min={1}
                value={settingsDays}
                onChange={(e) => setSettingsDays(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-tasks">Días para tareas próximas</Label>
              <Input
                id="settings-tasks"
                type="number"
                min={1}
                value={settingsTasksDays}
                onChange={(e) => setSettingsTasksDays(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>Cancelar</Button>
            <Button onClick={saveSettings}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
