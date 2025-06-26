// timeUtils.ts
import { readable, get } from 'svelte/store';
import { settings } from '$lib/stores/settings';

// Emits a new Date() exactly at each local midnight
export const dayBoundary = readable(new Date(), (set) => {
  // Schedule the next tick at the upcoming midnight
  function scheduleNext() {
    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0, 0
    );
    const msUntil = nextMidnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      set(new Date());
      scheduleNext();
    }, msUntil);

    return () => clearTimeout(timer);
  }

  return scheduleNext();
});

export const now = readable(Date.now(), (set) => {
  const iv = setInterval(() => set(Date.now()), 1000);
  return () => clearInterval(iv);
});

// Emits whenever the configured day end time is reached
export const dayEndBoundary = readable(Date.now(), (set) => {
  let timer: ReturnType<typeof setTimeout>;
  function schedule() {
    clearTimeout(timer);
    const { dayEnd } = get(settings);
    const [h, m] = dayEnd.split(':').map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
    const ms = next.getTime() - now.getTime();
    timer = setTimeout(() => {
      set(Date.now());
      schedule();
    }, ms);
  }
  schedule();
  const unsubscribe = settings.subscribe(schedule);
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
});

function getDayBounds(ts: number) {
  const { dayStart, dayEnd } = get(settings);
  const [startHour, startMinute] = dayStart.split(':').map(Number);
  const [endHour, endMinute] = dayEnd.split(':').map(Number);
  const d = new Date(ts);
  const start = new Date(d).setHours(startHour, startMinute, 0, 0);
  const end = new Date(d).setHours(endHour, endMinute, 0, 0);
  return { dayStart: start, dayEnd: end };
}

export function getTotalMs(
  periods: Array<{ start: number; end?: number | null }>,
  nowTs: number
): number {
  const { dayStart, dayEnd } = getDayBounds(nowTs);
  return periods.reduce((sum, p) => {
    const s = Math.max(p.start, dayStart);
    const e = Math.min(p.end ?? nowTs, dayEnd);
    return sum + Math.max(0, e - s);
  }, 0);
}

export function getTotalActiveMs(
  periods: Array<{ start: number; end?: number | null }>,
  nowTs: number
): number {
  return periods.reduce((sum, p) => {
    const end = p.end ?? nowTs;
    return sum + Math.max(0, end - p.start);
  }, 0);
}

export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function getLastDaysTotals(
  periods: Array<{ start: number; end?: number | null }>,
  numberOfDays: number,
  referenceTime: number = Date.now()
): { date: string; duration: string }[] {
  const results: { date: string; duration: string }[] = [];

  for (let dayOffset = 1; dayOffset <= numberOfDays; dayOffset++) {
    // Determine the midnight start of the target day in local time
    const dayStartDate = new Date(referenceTime - dayOffset * 24 * 60 * 60 * 1000);
    dayStartDate.setHours(0, 0, 0, 0);

    // Compute millisecond bounds for the entire day
    const dayStartMs = dayStartDate.getTime();
    const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

    // Aggregate total milliseconds of any period overlapping this day
    const totalMs = periods.reduce((sum, p) => {
      const s = Math.max(p.start, dayStartMs);
      const e = Math.min(p.end ?? dayEndMs, dayEndMs);
      return sum + Math.max(0, e - s);
    }, 0);

    // Build date string in yyyy-MM-dd format
    const yyyy = dayStartDate.getFullYear();
    const mm = String(dayStartDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayStartDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Convert milliseconds to hh:mm:ss using the existing formatter
    const durationStr = formatMs(totalMs);

    results.push({ date: dateStr, duration: durationStr });
  }

  return results;
}