// timeUtils.ts
import { readable, get } from 'svelte/store';
import { settings } from '$lib/stores/settings';

export const now = readable(Date.now(), (set) => {
  const iv = setInterval(() => set(Date.now()), 1000);
  return () => clearInterval(iv);
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

export function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
