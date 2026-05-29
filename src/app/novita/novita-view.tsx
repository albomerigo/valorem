"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";

/* ──────────────────────────────────────────────
   UPDATE DATA
────────────────────────────────────────────── */
const UPDATES = [
  {
    date: "Maggio 2026",
    version: "2.0",
    badge: "Major",
    badgeColor: "#A88BFA",
    title: "AI Coach con Claude",
    description:
      "Il tuo coach finanziario personale. Analizza le tue spese, suggerisce miglioramenti e risponde alle tue domande basandosi sui tuoi dati reali.",
    features: [
      "5 analisi predefinite",
      "Domande personalizzate",
      "Powered by Claude AI",
    ],
  },
  {
    date: "Maggio 2026",
    version: "1.9",
    badge: "Feature",
    badgeColor: "#10B981",
    title: "Valorem Score",
    description:
      "Il tuo punteggio finanziario personale da 0 a 100. Misura risparmio, disciplina, obiettivi e trend mensile in un unico numero.",
    features: ["Score 0-100", "5 componenti misurati", "Storico nel profilo"],
  },
  {
    date: "Aprile 2026",
    version: "1.8",
    badge: "Feature",
    badgeColor: "#60A5FA",
    title: "Bulk Import CSV/Excel",
    description:
      "Importa centinaia di transazioni in pochi secondi da qualsiasi file CSV o Excel. Mappatura automatica delle colonne.",
    features: ["CSV e Excel", "Auto-detect colonne", "Preview prima dell'import"],
  },
  {
    date: "Aprile 2026",
    version: "1.7",
    badge: "Design",
    badgeColor: "#F59E0B",
    title: "Redesign completo",
    description:
      "Nuova hero card, sistema colori semantici, glassmorphism profondo, cursore custom e splash screen animata.",
    features: ["Glassmorphism profondo", "Cursore custom", "Splash screen"],
  },
];

/* ──────────────────────────────────────────────
   MAIN VIEW
────────────────────────────────────────────── */
export function NovitaView({ userName }: { userName: string }) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar userName={userName} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[860px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={userName || "ospite"} section="Novità" showBack />

          <header className="mt-8 mb-12">
            <p className="eyebrow-accent mb-2 text-[10px]">Aggiornamenti</p>
            <h1 className="m-0 font-serif text-[36px] font-normal italic leading-tight text-ink-primary md:text-[48px]">
              Cosa c&apos;è di nuovo
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-secondary max-w-[480px]">
              Ogni aggiornamento è pensato per rendere la tua relazione con il denaro più
              consapevole e senza stress.
            </p>
          </header>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[108px] top-0 bottom-0 w-[1px] hidden md:block"
              style={{ background: "linear-gradient(180deg, rgba(168,139,250,0.3), transparent)" }}
            />

            <div className="flex flex-col gap-0">
              {UPDATES.map((update, i) => (
                <div
                  key={update.version}
                  className="relative flex flex-col md:flex-row gap-0 md:gap-8 pb-12"
                  style={{
                    opacity: 0,
                    animation: `slideUp 400ms ease ${i * 80}ms forwards`,
                  }}
                >
                  {/* Left column: date (desktop) */}
                  <div className="hidden md:block w-[108px] flex-shrink-0 pt-1 text-right pr-8">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted leading-tight">
                      {update.date}
                    </p>
                  </div>

                  {/* Dot on the line */}
                  <div
                    className="absolute hidden md:flex items-center justify-center"
                    style={{ left: 108, top: 6, transform: "translateX(-50%)" }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-[#0a0812]"
                      style={{ background: update.badgeColor }}
                    />
                  </div>

                  {/* Right column: content */}
                  <div className="flex-1 md:pl-8">
                    {/* Mobile date */}
                    <p className="md:hidden text-[10px] uppercase tracking-[0.1em] text-ink-muted mb-2">
                      {update.date}
                    </p>

                    <div
                      className="rounded-[18px] p-6 transition-all hover:border-white/[0.12]"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Badge + version */}
                      <div className="mb-4 flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{
                            background: `${update.badgeColor}18`,
                            border: `1px solid ${update.badgeColor}40`,
                            color: update.badgeColor,
                          }}
                        >
                          {update.badge}
                        </span>
                        <span
                          className="font-mono-tabular text-[10px]"
                          style={{ color: "rgba(255,255,255,0.25)" }}
                        >
                          v{update.version}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className="m-0 font-serif italic text-[20px] leading-tight text-ink-primary mb-2"
                      >
                        {update.title}
                      </h2>

                      {/* Description */}
                      <p className="m-0 text-[14px] leading-[1.65] text-ink-secondary mb-4">
                        {update.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {update.features.map((f) => (
                          <span
                            key={f}
                            className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[11px]"
                            style={{
                              background: "rgba(168,139,250,0.07)",
                              border: "1px solid rgba(168,139,250,0.15)",
                              color: "#C4B5FD",
                            }}
                          >
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-[12px] text-ink-muted">
            Hai un suggerimento?{" "}
            <a
              href="mailto:support@valorem.app"
              className="text-iri-pale transition-colors hover:text-ink-primary"
            >
              Scrivici
            </a>{" "}
            · Valorem è in continua evoluzione.
          </p>
        </div>
      </div>

      <BottomBar />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Named export for back-compat
export { NovitaView as default };
