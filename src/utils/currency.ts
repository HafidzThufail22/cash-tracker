/**
 * Format angka nominal ke format mata uang Rupiah Indonesia (IDR)
 * Contoh: 2450000 -> "Rp 2.450.000"
 */
export function formatRupiah(amount: number, withPrefix: boolean = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (withPrefix) {
    return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format angka nominal bertanda (+ / -) untuk transaksi
 * Contoh income: +Rp 1.200.000
 * Contoh expense: -Rp 850.000
 */
export function formatSignedRupiah(amount: number, type: 'income' | 'expense' | 'transfer'): string {
  const absFormatted = Math.abs(Math.round(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (type === 'income') {
    return `+Rp ${absFormatted}`;
  }
  if (type === 'expense') {
    return `-Rp ${absFormatted}`;
  }
  return `Rp ${absFormatted}`;
}

