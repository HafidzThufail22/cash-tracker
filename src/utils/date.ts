const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTH_NAMES_FULL = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
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

/**
 * Format bulan dan tahun panjang (misal: "Oktober 2026")
 */
export function formatMonthYearFull(year: number, month: number): string {
  const monthName = MONTH_NAMES_FULL[month - 1] || '';
  return `${monthName} ${year}`;
}

/**
 * Mengambil key YYYY-MM-DD dari string tanggal ISO
 */
export function getDateKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 10);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr.slice(0, 10);
  }
}

/**
 * Format header grup tanggal di daftar transaksi (misal: "Kamis, 01 Okt 2026")
 */
export function formatDayHeader(dateKey: string): string {
  try {
    const parts = dateKey.split('-');
    if (parts.length < 3) return dateKey;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return dateKey;

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

    const dayName = DAY_NAMES[d.getDay()];
    const monthName = MONTH_NAMES_SHORT[month];
    const dayStr = day.toString().padStart(2, '0');

    if (isToday) {
      return `Hari ini, ${dayStr} ${monthName} ${year}`;
    }
    if (isYesterday) {
      return `Kemarin, ${dayStr} ${monthName} ${year}`;
    }

    return `${dayName}, ${dayStr} ${monthName} ${year}`;
  } catch {
    return dateKey;
  }
}

/**
 * Format tanggal dan jam lengkap untuk detail transaksi
 */
export function formatFullDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate().toString().padStart(2, '0');
    const monthName = MONTH_NAMES_FULL[d.getMonth()];
    const year = d.getFullYear();
    const dayName = DAY_NAMES[d.getDay()];
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${dayName}, ${day} ${monthName} ${year} • ${hours}:${minutes} WIB`;
  } catch {
    return dateStr;
  }
}

