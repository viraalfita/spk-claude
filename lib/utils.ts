import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting with multiple currency support
const currencyFormats: Record<
  string,
  { locale: string; currency: string; decimals?: number }
> = {
  IDR: { locale: "id-ID", currency: "IDR", decimals: 0 },
  USD: { locale: "en-US", currency: "USD", decimals: 2 },
  SGD: { locale: "en-SG", currency: "SGD", decimals: 2 },
  EUR: { locale: "de-DE", currency: "EUR", decimals: 2 },
  MYR: { locale: "ms-MY", currency: "MYR", decimals: 2 },
};

export function formatCurrency(
  amount: number,
  currency: string = "IDR",
): string {
  const format = currencyFormats[currency] || currencyFormats.IDR;
  const IntlConstructor =
    typeof window !== "undefined" && window.Intl ? window.Intl : global.Intl;

  return new IntlConstructor.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
    minimumFractionDigits: format.decimals ?? 0,
    maximumFractionDigits: format.decimals ?? 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const IntlConstructor =
    typeof window !== "undefined" && window.Intl ? window.Intl : global.Intl;
  return new IntlConstructor.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Generate SPK number with year and sequential number
// Note: For production use, this should query the database to get the last number
export function generateSPKNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `SPK-${year}-${random.toString().padStart(3, "0")}`;
}

// Calculate payment amount based on percentage
export function calculatePaymentAmount(
  contractValue: number,
  percentage: number,
): number {
  return (contractValue * percentage) / 100;
}

// Validate payment terms sum to 100% (if all are percentage-based)
export function validatePaymentPercentages(
  percentages: (number | null | undefined)[],
): { valid: boolean; total: number } {
  const validPercentages = percentages.filter(
    (p) => p !== null && p !== undefined,
  ) as number[];

  if (validPercentages.length === 0) {
    return { valid: true, total: 0 }; // No percentage validation needed
  }

  const sum = validPercentages.reduce((acc, p) => acc + p, 0);
  return {
    valid: sum <= 100,
    total: Math.round(sum * 100) / 100, // Round to 2 decimal places
  };
}
