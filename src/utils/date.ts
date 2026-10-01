const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Format string tanggal ISO ke representasi ramah pengguna (Today / Yesterday / Tanggal)
 */
export function formatTransactionDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (isToday) {
      return `Hari ini, ${timeStr}`;
    }
    if (isYesterday) {
      return `Kemarin, ${timeStr}`;
    }

    const day = d.getDate();
    const month = MONTH_NAMES_SHORT[d.getMonth()];
    const year = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : '';

    return `${day} ${month}${year}, ${timeStr}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format bulan dan tahun untuk Period Selector (misal: "Okt 2025")
 */
export function formatPeriodLabel(year: number, month: number): string {
  const monthName = MONTH_NAMES_SHORT[month - 1] || '';
  return `${monthName} ${year}`;
}

