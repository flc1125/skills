import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseSkillMetadataDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const isoDate = new Date(value);

  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatSkillPublishedAt(value?: string | null, now = new Date()): string | null {
  const date = parseSkillMetadataDate(value);

  if (!date) {
    return null;
  }

  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return formatSkillDate(date);
  }

  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;
  const days = Math.floor(diffMs / dayMs);

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  return formatSkillDate(date);
}

function isYesterday(date: Date, now: Date): boolean {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  return date >= yesterdayStart && date < todayStart;
}

function formatSkillDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}
