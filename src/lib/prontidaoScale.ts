import type { ProntidaoNome } from '../types/domain';

export const prontidaoColors: Record<ProntidaoNome, { bg: string; text: string; border: string; hex: string }> = {
  Amarela: { bg: 'bg-yellow-300', text: 'text-slate-950', border: 'border-yellow-300', hex: '#fde047' },
  Azul: { bg: 'bg-blue-400', text: 'text-white', border: 'border-blue-400', hex: '#60a5fa' },
  Verde: { bg: 'bg-emerald-400', text: 'text-slate-950', border: 'border-emerald-400', hex: '#4ade80' }
};

const rotation: ProntidaoNome[] = ['Amarela', 'Azul', 'Verde'];
const referenceDate = new Date(2026, 5, 1);

function daysBetween(start: Date, end: Date) {
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86_400_000);
}

export function getProntidaoForDate(date: Date): ProntidaoNome {
  const offset = daysBetween(referenceDate, date);
  const index = ((offset % rotation.length) + rotation.length) % rotation.length;
  return rotation[index];
}

export function getCurrentProntidaoName() {
  return getProntidaoForDate(new Date());
}

export function buildMonthlyScale(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const previousMonthDays = new Date(year, monthIndex, 0).getDate();
  const cells = [];

  for (let index = 0; index < 42; index += 1) {
    const dayOffset = index - firstWeekday + 1;
    const date = new Date(year, monthIndex, dayOffset);
    let day = dayOffset;
    let isCurrentMonth = true;

    if (dayOffset < 1) {
      day = previousMonthDays + dayOffset;
      isCurrentMonth = false;
    } else if (dayOffset > daysInMonth) {
      day = dayOffset - daysInMonth;
      isCurrentMonth = false;
    }

    cells.push({
      id: date.toISOString(),
      day,
      date,
      isCurrentMonth,
      prontidao: getProntidaoForDate(date)
    });
  }

  return cells;
}
