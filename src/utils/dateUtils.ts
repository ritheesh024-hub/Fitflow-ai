/**
 * Date and Timezone Utilities for FitFlow AI
 */

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateDaysAgoStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return 'Today';
  const today = getTodayDateStr();
  if (dateStr === today) return 'Today';

  const yesterday = getDateDaysAgoStr(1);
  if (dateStr === yesterday) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return '';
  return timeStr;
}

export function getWeekRange(): { start: string; end: string; days: string[] } {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(getDateDaysAgoStr(i));
  }
  return {
    start: days[0],
    end: days[days.length - 1],
    days,
  };
}

export function getMonthRange(): { start: string; end: string; days: string[] } {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(getDateDaysAgoStr(i));
  }
  return {
    start: days[0],
    end: days[days.length - 1],
    days,
  };
}
