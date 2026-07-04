export function today(): string {
  return Temporal.Now.plainDateISO().toString();
}

export function startOfWeek(date: string): string {
  const plainDate = Temporal.PlainDate.from(date);
  return plainDate.subtract({ days: plainDate.dayOfWeek - 1 }).toString();
}

export function weekDays(date: string): string[] {
  const monday = Temporal.PlainDate.from(startOfWeek(date));
  return Array.from({ length: 7 }, (_, index) => monday.add({ days: index }).toString());
}

export function compareDates(a: string, b: string): number {
  return Temporal.PlainDate.compare(a, b);
}

export function isBefore(a: string, b: string): boolean {
  return compareDates(a, b) < 0;
}

export function isToday(date: string): boolean {
  return date === today();
}

export function isOverdue(dueDate: string, completed: boolean): boolean {
  return !completed && isBefore(dueDate, today());
}

// Incomplete tasks overdue from a previous week accumulate onto this week's Monday.
export function bucketDate(dueDate: string, completed: boolean, weekStart: string): string {
  if (completed) return dueDate;
  return isBefore(dueDate, weekStart) ? weekStart : dueDate;
}

export function formatWeekday(date: string): string {
  return Temporal.PlainDate.from(date).toLocaleString("en-US", { weekday: "short" });
}

export function formatDayNumber(date: string): number {
  return Temporal.PlainDate.from(date).day;
}
