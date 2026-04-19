import { format, addDays, subDays, parseISO } from "date-fns";

export function todayDate(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "EEEE, MMMM d, yyyy");
}

export function formatShortDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "MMM d");
}

export function nextDay(dateStr: string): string {
  return format(addDays(parseISO(dateStr), 1), "yyyy-MM-dd");
}

export function prevDay(dateStr: string): string {
  return format(subDays(parseISO(dateStr), 1), "yyyy-MM-dd");
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayDate();
}

export function isFuture(dateStr: string): boolean {
  return dateStr > todayDate();
}

export function isPast(dateStr: string): boolean {
  return dateStr < todayDate();
}

/** Format a UTC ISO timestamp to local time, e.g. "7:00 PM" */
export function formatGameTime(utcString: string): string {
  const date = new Date(utcString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
