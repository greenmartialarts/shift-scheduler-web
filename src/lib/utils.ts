import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Robustly converts various date input formats to ISO 8601 string.
 * Supports: ISO strings, localized strings like "MM/DD/YYYY, HH:MM AM/PM",
 * and standard datetime-local outputs (YYYY-MM-DDTHH:mm).
 */
export function parseToISO(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    // Try native Date parsing first
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // If the original string didn't have a T (like a space), new Date() handles it,
      // but we want to ensure a clean ISO string for Zod .datetime()
      return date.toISOString();
    }

    // Manual parse for common localized formats like "04/25/2026, 06:45 AM"
    // Handles formats with or without commas, and various whitespace
    const localizedRegex = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = dateStr.trim().match(localizedRegex);

    if (match) {
      const [, m, d, y, h, min, ampm] = match;
      let hour = parseInt(h);
      if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      const parsedDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), hour, parseInt(min));
      return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    }

    return null;
  } catch (err) {
    console.error("Error parsing date to ISO:", dateStr, err);
    return null;
  }
}
