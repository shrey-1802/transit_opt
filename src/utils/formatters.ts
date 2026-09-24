/**
 * TransitOps Indian Numbering & Currency Formatter (en-IN)
 * Handles formatting for INR (₹) and Indian number format (lakhs/crores/thousands)
 */

/**
 * Formats a number using Indian numbering system (e.g. 1,00,000 or 2,500)
 */
export const formatNumber = (
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', options);
};

/**
 * Formats a monetary value in Indian Rupees (₹) with Indian digit grouping.
 * e.g., formatINR(150000) => "₹1,50,000"
 * e.g., formatINR(45.5, 2) => "₹45.50"
 */
export const formatINR = (
  value: number | string | null | undefined,
  fractionDigits?: number
): string => {
  if (value === null || value === undefined || value === '') return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);

  if (fractionDigits !== undefined) {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  }

  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Formats currency with fixed 2 decimal digits for expenses and precise financial logs
 */
export const formatINRCurrency = (
  value: number | string | null | undefined
): string => {
  return formatINR(value, 2);
};
