"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, Clock, UserCheck } from "lucide-react";

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  icon: typeof Sparkles;
};

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: "Un'app diversa",
    title: "Non sono una banca.\nSono un coach.",
    description:
      "Non sono qui per dirti cosa fare. Sono qui per aiutarti a vedere chiaramente le tue scelte.",
    buttonLabel: "Continua",
    icon: Sparkles,
  },
  {
    id: 2,
    eyebrow: "Il valore del tempo",
    title: "Ogni euro è tempo\ndella tua vita.",
    description:
      "Un caffè non è 2 euro: sono 8 minuti del tuo lavoro. Quando lo vedi così, tutto cambia.",
    buttonLabel: "Continua",
    icon: Clock,
  },
  {
    id: 3,
    eyebrow: "Pronto a iniziare?",
    title: "Dimmi chi sei,\nio faccio il resto.",
    description:
      "Serve qualche dato per iniziare. Resta tutto tuo: privato, sicuro, modificabile quando vuoi.",
    buttonLabel: "Cominciamo",
    icon: UserCheck,
  },
];

/**
 * Onboarding narrativo — 3 slide empatiche prima del form tecnico.
 * Parametro `onComplete` viene chiamato quando l'utente finisce l'ultima slide.
 */
export function OnboardingIntro({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const Icon = slide.icon;

  function handleNext() {
    if (isLast) {
      onComplete();
    } else {
      setCurrent((c) => c + 1);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-10">
      {/* Aura magnetica di sfondo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(168, 139, 250, 0.25), transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(232, 121, 249, 0.15), transparent 60%), radial-gradient(ellipse 70% 50% at 85% 15%, rgba(96, 165, 250, 0.15), transparent 65%)",
        }}
      />

      {/* Contenuto slide */}
      <div
        key={slide.id}
        className="mx-auto flex max-w-[520px] flex-col items-center text-center animate-slide-up"
      >
        {/* Icona in alto */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[22px] border border-iri-violet/30 bg-iri-violet/[0.08]">
          <Icon className="h-9 w-9 text-iri-pale" strokeWidth={1.3} />
        </div>

        {/* Eyebrow */}
        <p className="eyebrow-accent mb-5 text-[11px]">{slide.eyebrow}</p>

        {/* Titolo grande serif */}
        <h1
          className="m-0 font-serif text-[38px] md:text-[48px] font-normal italic leading-[1.08] text-ink-primary [letter-spacing:-0.02em]"
          style={{ whiteSpace: "pre-line" }}
        >
          {slide.title}
        </h1>

        {/* Descrizione */}
        <p className="mt-6 max-w-[440px] text-[15px] md:text-[16px] leading-[1.65] text-ink-secondary">
          {slide.description}
        </p>

        {/* Pulsante CTA */}
        <button
          type="button"
          onClick={handleNext}
          className="relative mt-10 flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_12px_32px_-8px_rgba(168,139,250,0.55)] transition-all duration-[350ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-10px_rgba(168,139,250,0.7)] active:scale-95"
        >
          {slide.buttonLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>

        {/* Skip intro (solo se non sei all'ultima) */}
        {!isLast && (
          <button
            type="button"
            onClick={onComplete}
            className="mt-5 text-[11px] uppercase tracking-[0.15em] text-ink-muted transition-colors hover:text-ink-secondary"
          >
            Salta l&apos;introduzione
          </button>
        )}
      </div>

      {/* Indicator puntini in basso */}
      <div className="mt-12 flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrent(i)}
            title={`Vai alla slide ${i + 1}`}
            className="group relative h-2 transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ width: i === current ? 28 : 8 }}
          >
            <span
              className={`absolute inset-0 rounded-full transition-all duration-[350ms] ${
                i === current
                  ? "bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue"
                  : "bg-ink-faint group-hover:bg-ink-muted"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}