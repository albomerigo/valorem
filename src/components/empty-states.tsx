"use client";

import {
  Sparkles,
  Ghost,
  Target,
  Inbox,
  Receipt,
  Compass,
} from "lucide-react";

/**
 * Empty states di Valorem.
 * Ogni stato è una piccola narrazione: SVG minimal + messaggio del Coach.
 * Sostituisce gli stati vuoti "tecnici" con narrativa premium.
 */

// ═══════════════════════════════════════════════════════════
//  SHELL BASE
// ═══════════════════════════════════════════════════════════

function EmptyShell({
  illustration,
  eyebrow,
  title,
  description,
  action,
}: {
  illustration: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass-panel-subtle relative overflow-hidden rounded-[20px] border-dashed py-14 px-6">
      {/* Aura sfumata */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(168, 139, 250, 0.15), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[420px] flex-col items-center text-center">
        <div className="mb-5">{illustration}</div>
        <p className="eyebrow-accent mb-2 text-[10px]">{eyebrow}</p>
        <h3 className="m-0 font-serif text-[22px] font-normal italic leading-[1.2] text-ink-primary">
          {title}
        </h3>
        <p className="mt-3 max-w-[340px] text-[13px] leading-[1.6] text-ink-secondary">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ILLUSTRATIONS — SVG minimali iridescenti
// ═══════════════════════════════════════════════════════════

function BlankCanvasIllustration() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.4) 25%, rgba(232,121,249,0.3) 50%, rgba(96,165,250,0.35) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(14px)",
        }}
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.03]">
        <Sparkles
          className="h-6 w-6 text-iri-pale animate-pulse-dot"
          strokeWidth={1.4}
        />
      </div>
    </div>
  );
}

function GhostIllustration() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full animate-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(168,139,250,0.2) 0%, rgba(125,211,252,0.1) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/[0.06]">
        <Ghost className="h-7 w-7 text-cyan-300" strokeWidth={1.3} />
      </div>
    </div>
  );
}

function CompassIllustration() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 90deg, transparent, rgba(168,139,250,0.5), transparent, rgba(232,121,249,0.4), transparent)",
          filter: "blur(18px)",
          opacity: 0.4,
        }}
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-iri-violet/25 bg-gradient-to-br from-iri-violet/[0.1] to-iri-magenta/[0.05]">
        <Compass className="h-7 w-7 text-iri-pale" strokeWidth={1.4} />
      </div>
    </div>
  );
}

function InboxIllustration() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <Inbox className="h-7 w-7 text-ink-muted" strokeWidth={1.3} />
      </div>
    </div>
  );
}

function ReceiptIllustration() {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(168,139,250,0.15), transparent 60%)",
          filter: "blur(16px)",
        }}
      />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.03]">
        <Receipt className="h-7 w-7 text-iri-pale/80" strokeWidth={1.4} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  VARIANTI ESPORTATE — una per scenario
// ═══════════════════════════════════════════════════════════

/**
 * Dashboard → utente loggato con zero transazioni in questo mese
 */
export function EmptyDashboard({ userName }: { userName: string }) {
  return (
    <EmptyShell
      illustration={<BlankCanvasIllustration />}
      eyebrow="La tua giornata"
      title={`${userName}, la tela è bianca`}
      description="Il mese è appena iniziato. Ogni transazione che registrerai comincerà a dare forma alla tua storia finanziaria."
    />
  );
}

/**
 * Lista transazioni in Dashboard → nessun movimento
 */
export function EmptyTransactionsList({
  onAddTransaction,
}: {
  onAddTransaction?: () => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] px-10 py-10 text-center"
      style={{
        background: "rgba(168,139,250,0.06)",
        border: "1px solid rgba(168,139,250,0.15)",
        borderRadius: "20px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(168,139,250,0.14), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto flex max-w-[400px] flex-col items-center">
        {/* Icona */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue shadow-[0_12px_32px_-8px_rgba(168,139,250,0.55)] [background-size:200%_200%] animate-gradient-shift">
          <Sparkles className="h-7 w-7 text-white" strokeWidth={1.6} />
        </div>

        <h3 className="m-0 font-serif text-[22px] font-normal italic leading-[1.2] text-ink-primary">
          Inizia il tuo percorso finanziario
        </h3>
        <p className="mt-3 text-[13px] leading-[1.6] text-ink-secondary">
          Aggiungi la tua prima transazione per vedere Valorem in azione
        </p>

        {onAddTransaction && (
          <button
            type="button"
            onClick={onAddTransaction}
            className="mt-6 flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-6 py-3 text-[13px] font-medium text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[300ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)]"
          >
            <Target className="h-4 w-4" strokeWidth={2} />
            Aggiungi la prima transazione
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Pagina Attività → nessuna transazione mai registrata
 */
export function EmptyActivity() {
  return (
    <EmptyShell
      illustration={<InboxIllustration />}
      eyebrow="Storia finanziaria"
      title="Il tuo racconto inizia ora"
      description="Quando avrai inserito la prima spesa, comincerai a vedere schemi, abitudini, direzioni. Ogni transazione conta."
    />
  );
}

/**
 * Pagina Attività con filtri che non trovano nulla
 */
export function EmptyActivityFiltered({ onReset }: { onReset: () => void }) {
  return (
    <EmptyShell
      illustration={<InboxIllustration />}
      eyebrow="Filtri attivi"
      title="Niente in questa vista"
      description="Nessuna transazione corrisponde ai filtri che hai impostato. Prova ad allargare il periodo o rimuovere le categorie."
      action={
        <button
          type="button"
          onClick={onReset}
          className="rounded-[10px] border border-iri-violet/25 bg-iri-violet/[0.08] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-iri-pale transition-colors hover:border-iri-violet/45 hover:bg-iri-violet/[0.15] hover:text-ink-primary"
        >
          Rimuovi filtri
        </button>
      }
    />
  );
}

/**
 * Cimitero degli Impulsi → nessun rifiuto ancora
 */
export function EmptyCimitero() {
  return (
    <EmptyShell
      illustration={<GhostIllustration />}
      eyebrow="Capitale invisibile"
      title="Qui riposerà la tua disciplina"
      description="Ogni volta che rifiuterai un acquisto dal simulatore, quell'importo diventerà tempo di libertà futura. Il Cimitero celebra ciò che NON hai speso."
    />
  );
}

/**
 * Cimitero filtrato per mese corrente con zero risultati
 */
export function EmptyCimiteroMonth() {
  return (
    <EmptyShell
      illustration={<GhostIllustration />}
      eyebrow="Mese corrente"
      title="Mese ancora giovane"
      description="Non hai rifiutato nessun impulso questo mese. Quando userai il simulatore e sceglierai di rinunciare, ogni rifiuto troverà casa qui."
    />
  );
}

/**
 * Obiettivi → nessun goal creato
 */
export function EmptyGoals({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyShell
      illustration={<CompassIllustration />}
      eyebrow="Destinazioni future"
      title="Dove vuoi arrivare?"
      description="Un viaggio, una casa, un fondo di emergenza. Dai un nome al tuo desiderio e Valorem calcola la rotta al tuo ritmo di risparmio reale."
      action={
        <button
          type="button"
          onClick={onCreate}
          className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-6px_rgba(168,139,250,0.55)] transition-all duration-[300ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
        >
          Crea il primo obiettivo
        </button>
      }
    />
  );
}