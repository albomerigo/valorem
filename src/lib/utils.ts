import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classi CSS Tailwind gestendo i conflitti.
 * Utility standard nei progetti shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatta un numero come valuta EUR italiana "completa".
 * Esempio: 1234.5 -> "1.234,50 €"
 */
export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Spezza un importo in { intero, decimali } per l'uso tipografico
 * in UI dove vogliamo la parte intera grande e i centesimi piccoli.
 *
 * Esempio:
 *   splitCurrency(42.3)    -> { int: "42", dec: "30" }
 *   splitCurrency(76.56)   -> { int: "76", dec: "56" }
 *   splitCurrency(1000)    -> { int: "1.000", dec: "00" }
 *   splitCurrency(12)      -> { int: "12", dec: "00" }
 *
 * Usa Intl.NumberFormat per l'arrotondamento corretto (niente float bugs).
 */
export function splitCurrency(amount: number): { int: string; dec: string } {
  const safe = Math.round(amount * 100) / 100;

  const intFormatter = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  });
  const int = intFormatter.format(Math.trunc(safe));

  const cents = Math.round((Math.abs(safe) - Math.trunc(Math.abs(safe))) * 100);
  const dec = cents.toString().padStart(2, "0");

  return { int, dec };
}