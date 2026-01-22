import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR"): string {
  const IntlConstructor = typeof window !== 'undefined' && window.Intl ? window.Intl : global.Intl;
  return new IntlConstructor.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const IntlConstructor = typeof window !== 'undefined' && window.Intl ? window.Intl : global.Intl;
  return new IntlConstructor.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function generateSPKNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `SPK-${year}-${random.toString().padStart(3, "0")}`;
}
