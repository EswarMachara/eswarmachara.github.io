/**
 * Date helpers for the tracker.
 *
 * Calendar dates are stored as "YYYY-MM-DD". Passing such a string straight to
 * `new Date()` parses it as UTC midnight, which lands on the previous day for
 * anyone west of Greenwich and makes countdowns off by one. So every date is
 * built from its parts and compared at local midnight instead.
 */

export const MS_PER_DAY = 86_400_000;

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;
  // Reject dates the constructor silently rolled over, e.g. 2026-02-31.
  if (date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return date;
}

export function startOfToday(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Whole days from `from` (local midnight) to the given date. Negative once the
 * date has passed, 0 on the day itself. Rounding keeps this correct across the
 * 23- and 25-hour days that daylight saving transitions produce.
 */
export function daysUntil(value: string | undefined, from: Date = startOfToday()): number | null {
  if (!value) return null;
  const date = parseISODate(value);
  if (!date) return null;
  return Math.round((date.getTime() - from.getTime()) / MS_PER_DAY);
}

export function daysSince(value: string | undefined, from: Date = startOfToday()): number | null {
  const until = daysUntil(value, from);
  return until === null ? null : -until;
}

/** Shifts a stored date by a number of days and returns it in the same format. */
export function addDays(value: string, days: number): string | null {
  const date = parseISODate(value);
  if (!date) return null;
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(value: string | undefined): string {
  if (!value) return "No date";
  const date = parseISODate(value);
  if (!date) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatMonthYear(value: string): string {
  const date = parseISODate(value);
  if (!date) return value;
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "in 12 days", "today", "3 days ago". Used on countdown chips. */
export function formatCountdown(days: number | null): string {
  if (days === null) return "No deadline set";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day ago";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}
