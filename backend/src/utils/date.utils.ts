export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPastDaysDateStrings(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    result.push(formatDateString(d));
  }
  return result;
}

export function getWeekStartAndEnd(): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startDate: formatDateString(monday),
    endDate: formatDateString(sunday),
  };
}
