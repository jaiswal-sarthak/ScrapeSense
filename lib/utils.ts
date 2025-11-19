import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (value?: string | Date, locale = "en-US") => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "—";
  }
};

export const safeJson = <T>(value: unknown, fallback: T): T => {
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    if (typeof value === "object" && value !== null) {
      return value as T;
    }
  } catch {
    // ignore
  }
  return fallback;
};

