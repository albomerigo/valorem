"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  Ghost,
  Target,
  BarChart2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { HelpTooltip } from "@/components/help-tooltip";

/* ──────────────────────────────────────────────
   SAFE-TO-SPEND DEMO
────────────────────────────────────────────── */
function SafeToSpendDemo() {
  const [reddito, setReddito] = useState(2000);
  const [fissi, setFissi] = useState(600);
  const [speso, setSpeso] = useState(180);
  const DAYS = 30;

  const budgetLibero = reddito - fissi;
  const rimasto = budgetLibero - speso;
  const oggi = parseFloat((rimasto / DAYS).toFixed(2));

  const color =
    oggi >= 20 ? "#10B981" : oggi >= 5 ? "#F59E0B" : "#F87171";

  return (
    <div
      className="mt-5 rounded-[16px] p-5 flex flex-col gap-5"
      style={{ background: "rgba(168,139,250,0.06)", border: "1px solid rgba(168,139,250,0.18)" }}
    >
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-iri-pale">
        Demo interattiva
      </p>

      {/* Sliders */}
      <div className="flex flex-col gap-4">
        {[
          { label: "Reddito mensile", value: reddito, min: 500, max: 5000, step: 50, set: setReddito, color: "#A88BFA" },
          { label: "Costi fissi", value: fissi, min: 0, max: 2000, step: 50, set: setFissi, color: "#F59E0B" },
          { label: "Già speso", value: speso, min: 0, max: 1000, step: 10, set: setSpeso, color: "#F87171" },
        ].map((s) => (
          <div key={s.label}>
            <div className="flex justify-between mb-1">
              <span className="text-[12px] text-ink-secondary">{s.label}</span>
              <span className="text-[12px] font-medium font-mono-tabular" style={{ color: s.color }}>
                €{s.value}
              </span>
            </div>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: s.color }}
            />
          </div>
        ))}
      </div>

      {/* Formula */}
      <div
        className="rounded-[12px] px-4 py-3 text-[12px] text-ink-secondary"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        €{reddito} − €{fissi} fissi − €{speso} già speso = €{rimasto} ÷ {DAYS} giorni
      </div>

      {/* Result */}
      <div className="text-center">
        <p className="m-0 text-[11px] uppercase tracking-[0.1em] text-ink-muted mb-1">
          Puoi spendere oggi
        </p>
        <p
          className="m-0 font-serif italic leading-none"
          style={{ fontSize: 56, color }}
        >
          €{oggi < 0 ? "0,00" : oggi.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
        </p>
        {oggi < 0 && (
          <p className="mt-1 text-[12px]" style={{ color: "#F87171" }}>
            Budget superato di €{Math.abs(rimasto).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   TRADUTTORE TEMPO DEMO
────────────────────────────────────────────── */
function TraduttoreDemo() {
  const [importo, setImporto] = useState(45);
  const [tariffa, setTariffa] = useState(18);
  const WORK_DAY_HOURS = 8;

  const totalMinutes = Math.round((importo / tariffa) * 60);
  const ore = Math.floor(totalMinutes / 60);
  const minuti = totalMinutes % 60;
  const percGiornata = Math.min((totalMinutes / (WORK_DAY_HOURS * 60)) * 100, 100);

  return (
    <div
      className="mt-5 rounded-[16px] p-5 flex flex-col gap-4"
      style={{ background: "rgba(125,211,252,0.05)", border: "1px solid rgba(125,211,252,0.18)" }}
    >
      <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7DD3FC]">
        Demo interattiva
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block mb-1 text-[11px] text-ink-muted">Importo €</label>
          <input
            type="number"
            min={1}
            max={9999}
            value={importo}
            onChange={(e) => setImporto(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-[10px] bg-transparent px-3 py-2 text-[14px] font-medium text-ink-primary outline-none"
            style={{ border: "1px solid rgba(125,211,252,0.3)" }}
          />
        </div>
        <div>
          <label className="block mb-1 text-[11px] text-ink-muted">Tariffa oraria</label>
          <select
            value={tariffa}
            onChange={(e) => setTariffa(Number(e.target.value))}
            className="w-full rounded-[10px] bg-[#0a0812] px-3 py-2 text-[14px] text-ink-primary outline-none"
            style={{ border: "1px solid rgba(125,211,252,0.3)" }}
          >
            {[10, 12, 15, 18, 20, 25, 30, 40].map((v) => (
              <option key={v} value={v}>€{v}/h</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="text-center py-2">
        <p className="m-0 font-serif italic text-[32px]" style={{ color: "#7DD3FC" }}>
          {ore > 0 ? `${ore}h ` : ""}{minuti}min
        </p>
        <p className="m-0 text-[12px] text-ink-muted">di lavoro per €{importo}</p>
      </div>

      {/* Progress bar — giornata 8h */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-ink-muted">Proporzione giornata lavorativa (8h)</span>
          <span className="text-[10px] font-mono-tabular" style={{ color: "#7DD3FC" }}>
            {percGiornata.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(125,211,252,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${percGiornata}%`, background: "linear-gradient(90deg, #7DD3FC, #60A5FA)" }}
          />
        </div>
        {percGiornata >= 100 && (
          <p className="mt-1 text-[11px]" style={{ color: "#F87171" }}>
            Oltre una giornata intera di lavoro!
          </p>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MINI CARD GLASSMORPHISM (per sezioni statiche)
────────────────────────────────────────────── */
interface MiniCardProps {
  color: string;
  bg: string;
  border: string;
  type: "cimitero" | "obiettivi" | "recap" | "coach";
}
function MiniGlassCard({ color, bg, border, type }: MiniCardProps) {
  if (type === "cimitero") {
    return (
      <div
        className="mt-5 rounded-[14px] p-4"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Ghost className="h-4 w-4" style={{ color }} strokeWidth={1.6} />
          <span className="text-[11px] font-medium" style={{ color }}>Cimitero degli impulsi</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { name: "AirPods Pro", amount: 279 },
            { name: "Sneakers Nike", amount: 120 },
            { name: "Cena di lusso", amount: 85 },
          ].map((item) => (
            <div key={item.name} className="flex justify-between items-center rounded-[8px] px-3 py-2"
              style={{ background: "rgba(240,171,252,0.06)", border: "1px solid rgba(240,171,252,0.12)" }}>
              <span className="text-[12px] text-ink-secondary line-through opacity-60">{item.name}</span>
              <span className="text-[12px] font-mono-tabular" style={{ color: "#10B981" }}>+€{item.amount}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] font-medium" style={{ color: "#10B981" }}>
          Hai risparmiato €484 questo mese ✓
        </p>
      </div>
    );
  }

  if (type === "obiettivi") {
    return (
      <div className="mt-5 rounded-[14px] p-4" style={{ background: bg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-4 w-4" style={{ color }} strokeWidth={1.6} />
          <span className="text-[11px] font-medium" style={{ color }}>I tuoi obiettivi</span>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { name: "Vacanza estate", current: 400, target: 1500 },
            { name: "Fondo emergenze", current: 1200, target: 2000 },
          ].map((g) => {
            const perc = Math.round((g.current / g.target) * 100);
            return (
              <div key={g.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-ink-secondary">{g.name}</span>
                  <span className="text-[11px] font-mono-tabular" style={{ color }}>
                    {perc}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(252,211,77,0.1)" }}>
                  <div className="h-full rounded-full" style={{ width: `${perc}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "recap") {
    return (
      <div className="mt-5 rounded-[14px] p-4" style={{ background: bg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="h-4 w-4" style={{ color }} strokeWidth={1.6} />
          <span className="text-[11px] font-medium" style={{ color }}>Recap · Aprile 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Spese totali", value: "€1.240" },
            { label: "Risparmio", value: "18%" },
            { label: "Cat. principale", value: "Alimentari" },
            { label: "Impulsi evitati", value: "3" },
          ].map((k) => (
            <div key={k.label} className="rounded-[8px] px-3 py-2"
              style={{ background: "rgba(134,239,172,0.06)", border: "1px solid rgba(134,239,172,0.12)" }}>
              <p className="m-0 text-[9px] uppercase tracking-wide text-ink-muted">{k.label}</p>
              <p className="m-0 text-[14px] font-medium" style={{ color }}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "coach") {
    return (
      <div className="mt-5 rounded-[14px] p-4" style={{ background: bg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" style={{ color }} strokeWidth={1.6} />
          <span className="text-[11px] font-medium" style={{ color }}>AI Coach · risposta</span>
        </div>
        <p className="m-0 font-serif italic text-[13px] leading-[1.7] text-ink-primary">
          "Questo mese hai speso il 28% in più rispetto ad aprile, principalmente in ristorazione.
          Considera di portare il pranzo al lavoro per 2-3 giorni a settimana — potresti risparmiare
          fino a €80 al mese."
        </p>
        <div className="mt-2 flex items-center gap-1">
          <Flame className="h-3 w-3 text-iri-pale" strokeWidth={2} />
          <span className="text-[10px] text-ink-muted">Basato sui tuoi dati reali</span>
        </div>
      </div>
    );
  }

  return null;
}

/* ──────────────────────────────────────────────
   SECTIONS DATA
────────────────────────────────────────────── */
const SECTIONS = [
  {
    icon: ShieldCheck,
    color: "#A88BFA",
    bg: "rgba(168,139,250,0.08)",
    border: "rgba(168,139,250,0.2)",
    title: "Safe-to-Spend",
    text: "Il Safe-to-Spend è quanto puoi spendere oggi senza compromettere il budget del mese. Valorem lo calcola ogni giorno sottraendo spese fisse, obiettivi di risparmio e quanto hai già speso.",
    demoType: "safe" as const,
  },
  {
    icon: Clock,
    color: "#7DD3FC",
    bg: "rgba(125,211,252,0.08)",
    border: "rgba(125,211,252,0.2)",
    title: "Traduttore di tempo",
    text: "Ogni euro che spendi viene tradotto nel tempo che hai lavorato per guadagnarlo. Questo cambia la prospettiva: non 'costa 80€' ma 'costa 4 ore di lavoro'.",
    demoType: "time" as const,
  },
  {
    icon: Ghost,
    color: "#F0ABFC",
    bg: "rgba(240,171,252,0.08)",
    border: "rgba(240,171,252,0.2)",
    title: "Cimitero degli Impulsi",
    text: "Ogni volta che simuli un acquisto e lo rifiuti, l'importo viene salvato nel Cimitero. A fine mese vedi quanto hai salvato grazie alla tua disciplina — in euro e in tempo.",
    demoType: "cimitero" as const,
  },
  {
    icon: Target,
    color: "#FCD34D",
    bg: "rgba(252,211,77,0.08)",
    border: "rgba(252,211,77,0.2)",
    title: "Obiettivi",
    text: "Imposta obiettivi di risparmio con un nome e un importo target. Valorem li tiene separati dal budget libero e ti mostra i progressi. Puoi avere più obiettivi attivi contemporaneamente.",
    demoType: "obiettivi" as const,
  },
  {
    icon: BarChart2,
    color: "#86EFAC",
    bg: "rgba(134,239,172,0.08)",
    border: "rgba(134,239,172,0.2)",
    title: "Recap mensile",
    text: "A fine mese, Valorem genera un riepilogo completo: totale speso, categoria principale, trend rispetto al mese precedente, impulsi evitati, capitale investito.",
    demoType: "recap" as const,
  },
  {
    icon: Sparkles,
    color: "#C4B5FD",
    bg: "rgba(196,181,253,0.08)",
    border: "rgba(196,181,253,0.2)",
    title: "AI Coach · Solo Pro",
    text: "Il Coach analizza i tuoi dati reali e risponde a domande specifiche: come stai andando questo mese, dove potresti risparmiare, qual è la tua abitudine principale. Nessun consiglio generico.",
    demoType: "coach" as const,
  },
];

type DemoType = "safe" | "time" | "cimitero" | "obiettivi" | "recap" | "coach";

/* ──────────────────────────────────────────────
   SECTION CARD
────────────────────────────────────────────── */
function SectionCard({
  section,
  index,
}: {
  section: (typeof SECTIONS)[0];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div
      className="relative rounded-[20px] px-6 py-6"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Number */}
      <span
        className="absolute right-5 top-5 font-mono-tabular text-[11px] font-medium"
        style={{ color: section.color, opacity: 0.5 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{ background: section.bg, border: `1px solid ${section.border}` }}
        >
          <Icon className="h-6 w-6" style={{ color: section.color }} strokeWidth={1.6} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="m-0 text-[18px] font-medium text-ink-primary">{section.title}</h2>
          <p className="mt-2 text-[14px] leading-[1.65] text-ink-secondary">{section.text}</p>

          {/* Demo button */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-[12px] font-medium transition-all hover:opacity-80"
            style={{
              background: section.bg,
              border: `1px solid ${section.border}`,
              color: section.color,
            }}
          >
            {open ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2} />
                Nascondi demo
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
                Prova la demo →
              </>
            )}
          </button>

          {/* Expanded demo */}
          {open && (
            <div className="animate-slide-up" style={{ animationFillMode: "both" }}>
              {section.demoType === "safe" && <SafeToSpendDemo />}
              {section.demoType === "time" && <TraduttoreDemo />}
              {(["cimitero", "obiettivi", "recap", "coach"] as DemoType[]).includes(section.demoType) && (
                <MiniGlassCard
                  color={section.color}
                  bg={section.bg}
                  border={section.border}
                  type={section.demoType as "cimitero" | "obiettivi" | "recap" | "coach"}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN VIEW
────────────────────────────────────────────── */
export function GuidaView({ userName }: { userName: string }) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar userName={userName} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={userName || "ospite"} section="Guida" showBack />

          <header className="relative mt-8 mb-10">
            <p className="eyebrow-accent mb-2 text-[10px]">Come funziona Valorem</p>
            <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary md:text-[42px]">
              Tutto quello che devi sapere
            </h1>
            <HelpTooltip
              title="Guida a Valorem"
              content="Scopri come funzionano tutte le funzionalità di Valorem con esempi pratici e demo interattive."
            />
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-secondary">
              Una guida pratica alle funzionalità principali — clicca su "Prova la demo" per
              interagire con ogni concetto.
            </p>
          </header>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((s, i) => (
              <SectionCard key={s.title} section={s} index={i} />
            ))}
          </div>

          <p className="mt-10 text-center text-[12px] text-ink-muted">
            Hai domande?{" "}
            <a
              href="mailto:support@valorem.app"
              className="text-iri-pale transition-colors hover:text-ink-primary"
            >
              Scrivici
            </a>
          </p>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
