import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS class names with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes and formats Nigerian phone numbers.
 * Supports: 080..., 80..., +23480..., 23480...
 * Returns E.164 format: +234XXXXXXXXXX or original if non-standard
 */
export function formatNigerianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+234")) {
    return cleaned;
  }
  if (cleaned.startsWith("234")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+234${cleaned.slice(1)}`;
  }
  if (cleaned.length === 10) {
    return `+234${cleaned}`;
  }
  return phone;
}

/**
 * Formats amount in Nigerian Naira (₦)
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
