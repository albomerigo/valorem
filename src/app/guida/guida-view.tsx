"use client";

import {
  ShieldCheck,
  Clock,
  Ghost,
  Target,
  BarChart2,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";

const SECTIONS = [
  {
    icon: ShieldCheck,
    color: "#A88BFA",
    bg: "rgba(168,139,250,0.08)",
    border: "rgba(168,139,250,0.2)",
    title: "Safe-to-Spend",
    text: "Il Safe-to-Spend è quanto puoi spendere oggi senza compromettere il budget del mese. Valorem lo calcola ogni giorno sottraendo spese fisse, obiettivi di risparmio e quanto hai già speso.",
    example: {
      label: "Esempio pratico",
      content: "Reddito €2.000 · Fissi €600 · Risparmio €200 · Già speso €180 = Safe-to-Spend di €34,52 oggi",
    },
  },
  {
    icon: Clock,
    color: "#7DD3FC",
    bg: "rgba(125,211,252,0.08)",
    border: "rgba(125,211,252,0.2)",
    title: "Traduttore di tempo",
    text: "Ogni euro che spendi viene tradotto nel tempo che hai lavorato per guadagnarlo. Questo cambia la prospettiva: non 'costa 80€' ma 'costa 4 ore di lavoro'.",
    example: {
      label: "Esempio pratico",
      content: "Tariffa oraria €18/h · Cena al ristorante €45 → equivale a 2h 30m di lavoro",
    },
  },
  {
    icon: Ghost,
    color: "#F0ABFC",
    bg: "rgba(240,171,252,0.08)",
    border: "rgba(240,171,252,0.2)",
    title: "Cimitero degli Impulsi",
    text: "Ogni volta che simuli un acquisto e lo rifiuti, l'importo viene salvato nel Cimitero. A fine mese vedi quanto hai salvato grazie alla tua disciplina — in euro e in tempo.",
    example: {
      label: "Come si usa",
      content: "Vai su Dashboard → Simula acquisto → Inserisci importo → Clicca 'Non comprare' → L'importo va nel Cimitero",
    },
  },
  {
    icon: Target,
    color: "#FCD34D",
    bg: "rgba(252,211,77,0.08)",
    border: "rgba(252,211,77,0.2)",
    title: "Obiettivi",
    text: "Imposta obiettivi di risparmio con un nome e un importo target. Valorem li tiene separati dal budget libero e ti mostra i progressi. Puoi avere più obiettivi attivi contemporaneamente.",
    example: {
      label: "Esempio pratico",
      content: "Obiettivo 'Vacanza estate' €1.500 · Hai accantonato €400 → Progresso 26,7% · Mancano €1.100",
    },
  },
  {
    icon: BarChart2,
    color: "#86EFAC",
    bg: "rgba(134,239,172,0.08)",
    border: "rgba(134,239,172,0.2)",
    title: "Recap mensile",
    text: "A fine mese, Valorem genera un riepilogo completo: totale speso, categoria principale, trend rispetto al mese precedente, impulsi evitati, capitale investito.",
    example: {
      label: "Dove trovarlo",
      content: "Dashboard → 'Recap di [mese corrente]' · Storico → tutti i mesi passati",
    },
  },
  {
    icon: Sparkles,
    color: "#C4B5FD",
    bg: "rgba(196,181,253,0.08)",
    border: "rgba(196,181,253,0.2)",
    title: "AI Coach · Solo Pro",
    text: "Il Coach analizza i tuoi dati reali e risponde a domande specifiche: come stai andando questo mese, dove potresti risparmiare, qual è la tua abitudine principale. Nessun consiglio generico.",
    example: {
      label: "Come si usa",
      content: "Sidebar → Coach · Scegli una domanda → Il Coach risponde in 3-4 frasi basate sui tuoi numeri reali",
    },
  },
];

export function GuidaView({ userName }: { userName: string }) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar userName={userName} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[900px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={userName || "ospite"} section="Guida" showBack />

          <header className="mt-8 mb-10">
            <p className="eyebrow-accent mb-2 text-[10px]">Come funziona Valorem</p>
            <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary md:text-[42px]">
              Tutto quello che devi sapere
            </h1>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-secondary">
              Una guida pratica alle funzionalità principali — dalla dashboard alle analisi AI.
            </p>
          </header>

          <div className="flex flex-col gap-8">
            {SECTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="relative rounded-[20px] px-6 py-6"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Number */}
                  <span
                    className="absolute right-5 top-5 font-mono-tabular text-[11px] font-medium"
                    style={{ color: s.color, opacity: 0.5 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: s.color }} strokeWidth={1.6} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="m-0 text-[18px] font-medium text-ink-primary">
                        {s.title}
                      </h2>
                      <p className="mt-2 text-[14px] leading-[1.65] text-ink-secondary">
                        {s.text}
                      </p>

                      {/* Example card */}
                      <div
                        className="mt-4 rounded-[12px] px-4 py-3"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}
                      >
                        <p
                          className="mb-1 text-[9px] font-semibold uppercase tracking-[0.14em]"
                          style={{ color: s.color }}
                        >
                          {s.example.label}
                        </p>
                        <p className="m-0 font-serif text-[13px] italic leading-[1.55] text-ink-primary">
                          {s.example.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
