"use client";

import { useState } from "react";
import { Shield, Download, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/finance";

export function PrivacyView({ profile }: { profile: UserProfile }) {
  const [isExporting, setIsExporting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm">("idle");

  async function handleExport() {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "valorem-export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[680px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Impostazioni" showBack />

          <header className="mt-8 mb-8">
            <p className="eyebrow-accent mb-2 text-[10px]">Impostazioni</p>
            <h1 className="m-0 font-serif text-[28px] font-normal italic leading-tight text-ink-primary">
              Privacy e dati
            </h1>
          </header>

          {/* Diritti GDPR */}
          <div className="glass-panel mb-5 rounded-[18px] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-300">
                <Shield className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div>
                <p className="eyebrow-accent text-[10px]">I tuoi diritti GDPR</p>
                <p className="m-0 mt-0.5 text-[13px] text-ink-secondary">
                  Hai il controllo completo sui tuoi dati
                </p>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-[13px] text-ink-secondary">
              {[
                "Accesso: puoi richiedere una copia di tutti i tuoi dati.",
                "Portabilità: esporta le transazioni in CSV.",
                "Rettifica: modifica i tuoi dati in qualsiasi momento dall'app.",
                "Cancellazione: elimina il tuo account per rimuovere tutti i dati.",
                "Reclamo: puoi rivolgerti al Garante per la Protezione dei Dati Personali (garante.privacy.it).",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Export dati */}
          <div className="glass-panel mb-5 rounded-[18px] p-6">
            <div className="mb-3 flex items-center gap-3">
              <Download className="h-5 w-5 text-iri-pale" strokeWidth={1.6} />
              <p className="m-0 text-[14px] font-medium text-ink-primary">Esporta i tuoi dati</p>
            </div>
            <p className="mb-4 text-[13px] text-ink-secondary">
              Scarica tutte le tue transazioni in formato CSV. Disponibile dal piano Premium.
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || (profile.plan || "free") === "free"}
              className="flex items-center gap-2 rounded-[10px] border border-iri-violet/30 bg-iri-violet/[0.1] px-4 py-2.5 text-[13px] font-medium text-iri-pale transition-all hover:bg-iri-violet/[0.18] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Esportando…" : "Esporta CSV"}
              {(profile.plan || "free") === "free" && (
                <span className="ml-1 rounded-md border border-iri-violet/25 bg-iri-violet/[0.1] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.08em] text-iri-pale">
                  Premium
                </span>
              )}
            </button>
          </div>

          {/* Link legali */}
          <div className="glass-panel mb-8 rounded-[18px] p-6">
            <p className="eyebrow mb-3 text-[9px]">Documenti legali</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Termini di Servizio", href: "/termini" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 text-[13px] text-ink-secondary transition-colors hover:text-ink-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Elimina account */}
          <div className="rounded-[14px] border border-red-500/20 bg-red-500/[0.04] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-400" strokeWidth={1.6} />
              <p className="m-0 text-[14px] font-medium text-red-300">Elimina account</p>
            </div>
            <p className="mb-4 text-[13px] text-ink-secondary">
              L&apos;eliminazione è permanente e irreversibile. Tutti i tuoi dati (transazioni, obiettivi, profilo)
              verranno cancellati definitivamente da Supabase.
            </p>
            {deleteStep === "idle" ? (
              <button
                type="button"
                onClick={() => setDeleteStep("confirm")}
                className="flex items-center gap-2 rounded-[10px] border border-red-500/30 bg-red-500/[0.08] px-4 py-2.5 text-[13px] font-medium text-red-300 transition-colors hover:bg-red-500/[0.14]"
              >
                <Trash2 className="h-4 w-4" />
                Elimina il mio account
              </button>
            ) : (
              <div className="rounded-[10px] border border-red-500/30 bg-red-500/[0.1] p-4">
                <p className="mb-3 text-[13px] font-medium text-red-300">
                  Sei sicuro? Questa azione non può essere annullata.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteStep("idle")}
                    className="rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-ink-secondary transition-colors hover:text-ink-primary"
                  >
                    Annulla
                  </button>
                  <a
                    href="/api/auth/delete-account"
                    className="flex items-center gap-2 rounded-[10px] bg-red-500 px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Sì, elimina definitivamente
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomBar activeRoute="settings" />
    </div>
  );
}
