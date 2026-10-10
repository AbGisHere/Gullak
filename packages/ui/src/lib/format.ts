/** Indian-grouped rupee formatting (₹1,00,000), from integer paise. */
export function formatInr(paise: number, options: { locale?: string; decimals?: 0 | 2 } = {}): string {
  const { locale = "en-IN", decimals = 0 } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(paise / 100);
}
