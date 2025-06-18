// timeUtils.ts
import { readable } from 'svelte/store';

export const now = readable(Date.now(), (set) => {
  const iv = setInterval(() => set(Date.now()), 1000);
  return () => clearInterval(iv);
});

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;

function getDayBounds(ts: number) {
  const d = new Date(ts);
  const dayStart = new Date(d).setHours(WORK_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(d).setHours(WORK_END_HOUR, 0, 0, 0);
  return { dayStart, dayEnd };
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
