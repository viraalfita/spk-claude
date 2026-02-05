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
  const format = currencyFormats[currency];
  const IntlConstructor =
    typeof window !== "undefined" && window.Intl ? window.Intl : global.Intl;

  if (format) {
    return new IntlConstructor.NumberFormat(format.locale, {
      style: "currency",
      currency: format.currency,
      minimumFractionDigits: format.decimals ?? 0,
      maximumFractionDigits: format.decimals ?? 0,
    }).format(amount);
  }

  // For unknown/custom currencies, use the actual currency code with generic formatting
  try {
    return new IntlConstructor.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // If the currency code is not valid for Intl, format manually
    return `${currency} ${new IntlConstructor.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
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

// Generate SPK date prefix for the format ELX/SPK/YYYYMMDD/###
// The full number is generated server-side with sequential increment from the database
export function generateSPKDatePrefix(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `ELX/SPK/${year}${month}${day}`;
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

// Format number with thousand separators for display
export function formatNumberWithSeparators(
  value: number | string,
  currency: string = "IDR"
): string {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  // Determine locale based on currency
  const localeMap: Record<string, string> = {
    IDR: "id-ID",
    USD: "en-US",
    SGD: "en-SG",
    EUR: "de-DE",
    MYR: "ms-MY",
  };

  const locale = localeMap[currency] || "en-US";
  const IntlConstructor = typeof window !== "undefined" && window.Intl ? window.Intl : global.Intl;

  return new IntlConstructor.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Parse formatted string back to number
export function parseFormattedNumber(value: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleanValue = value.replace(/[^\d.,-]/g, "")
    .replace(/,/g, "") // Remove thousand separators
    .replace(/\.(?=.*\.)/g, ""); // Keep only last decimal point

  return parseFloat(cleanValue) || 0;
}

// Format percentage for display
export function formatPercentageDisplay(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  return numValue.toString();
}

// Parse percentage input
export function parsePercentageInput(value: string): number {
  const cleanValue = value.replace(/[^\d.]/g, "");
  const parsed = parseFloat(cleanValue) || 0;
  return Math.min(100, Math.max(0, parsed)); // Clamp between 0-100
}
