"use client";

import Link from "next/link";
import { Calendar, ArrowRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { getPreviousMonth, formatMonthSlug } from "@/lib/recap";

/**
 * Banner in dashboard che invita a guardare il recap del mese appena passato.
 * Appare solo nei primi 10 giorni del nuovo mese.
 * Può essere chiuso — la scelta è persistita in localStorage.
 */
export function RecapBanner() {
  const [visible, setVisible] = useState(false);
  const { year, month } = getPreviousMonth();
  const slug = formatMonthSlug(year, month);

  useEffect(() => {
    const today = new Date();
    const dayOfMonth = today.getDate();

    // Mostra solo nei primi 10 giorni del mese
    if (dayOfMonth > 10) {
      setVisible(false);
      return;
    }

    // Controlla se l'utente ha già chiuso questo banner
    const dismissKey = `recap-dismissed-${slug}`;
    const dismissed = localStorage.getItem(dismissKey);
    setVisible(!dismissed);
  }, [slug]);

  function handleDismiss() {
    const dismissKey = `recap-dismissed-${slug}`;
    localStorage.setItem(dismissKey, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const monthNames = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  const monthName = monthNames[month - 1];

  return (
    <div
      className="glass-panel-strong relative overflow-hidden rounded-[16px] p-4 animate-slide-up"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(168, 139, 250, 0.08), rgba(232, 121, 249, 0.04))",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(232, 121, 249, 0.15), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-iri-violet/25 bg-iri-violet/[0.08]">
            <Calendar className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />
          </div>
          <div>
            <p className="eyebrow-accent text-[10px]">Nuovo</p>
            <p className="m-0 mt-0.5 text-[13px] text-ink-primary">
              Il tuo Recap di {monthName} è pronto 🎬
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/recap/${slug}`}
            className="relative flex items-center gap-2 overflow-hidden rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_8px_24px_-6px_rgba(168,139,250,0.55)] transition-all duration-[300ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
          >
            Guardalo
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            title="Nascondi"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white/[0.05] hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}