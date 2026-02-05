const KEY_DAYS_WITHOUT_RESPONSE = "job-tracker-reminder-days-without-response";
const KEY_TASKS_WITHIN_DAYS = "job-tracker-reminder-tasks-within-days";
const DEFAULT_DAYS_WITHOUT_RESPONSE = 5;
const DEFAULT_TASKS_WITHIN_DAYS = 7;

export function getDaysWithoutResponse(): number {
  if (typeof window === "undefined") return DEFAULT_DAYS_WITHOUT_RESPONSE;
  const v = localStorage.getItem(KEY_DAYS_WITHOUT_RESPONSE);
  if (v == null) return DEFAULT_DAYS_WITHOUT_RESPONSE;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 1 ? n : DEFAULT_DAYS_WITHOUT_RESPONSE;
}

export function setDaysWithoutResponse(days: number): void {
  if (typeof window === "undefined") return;
  const n = Math.max(1, Math.floor(days));
  localStorage.setItem(KEY_DAYS_WITHOUT_RESPONSE, String(n));
}

export function getTasksWithinDays(): number {
  if (typeof window === "undefined") return DEFAULT_TASKS_WITHIN_DAYS;
  const v = localStorage.getItem(KEY_TASKS_WITHIN_DAYS);
  if (v == null) return DEFAULT_TASKS_WITHIN_DAYS;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 1 ? n : DEFAULT_TASKS_WITHIN_DAYS;
}

export function setTasksWithinDays(days: number): void {
  if (typeof window === "undefined") return;
  const n = Math.max(1, Math.floor(days));
  localStorage.setItem(KEY_TASKS_WITHIN_DAYS, String(n));
}
