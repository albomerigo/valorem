"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  TrendingUp,
  Wallet,
  Clock,
  CalendarDays,
  Calendar,
  Percent,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  Receipt,
  Target,
  Sparkles,
} from "lucide-react";
import {
  WizardShell,
  NumberField,
  TextField,
  ChoiceCard,
  NavButtons,
} from "./wizard-shell";
import { OnboardingIntro } from "./onboarding-intro";
import { completeOnboarding } from "./actions";
import type { IncomeType, TimeMetric } from "@/lib/finance";

type FixedCostEntry = { name: string; amount: number };

const TOTAL_STEPS = 5;

function AllReadyScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, #1A1530 0%, #0A0812 40%, #060508 100%)",
      }}
    >
      <div className="relative w-full max-w-[560px] text-center">
        {/* Aura */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 animate-rotate-slow"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.5) 25%, rgba(232,121,249,0.4) 50%, rgba(96,165,250,0.45) 75%, rgba(168,139,250,0) 100%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center animate-slide-up">
          {/* Check icon animato */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/[0.1]">
            <CheckCircle className="h-10 w-10 text-emerald-400" strokeWidth={1.5} />
          </div>

          <h1 className="m-0 font-serif text-[38px] font-normal italic leading-tight text-ink-primary md:text-[48px]">
            Valorem è pronto per te.
          </h1>
          <p className="mt-4 max-w-[400px] text-[15px] leading-[1.6] text-ink-secondary">
            Porta con te la consapevolezza — ogni giorno.
          </p>

          {/* 3 feature cards */}
          <div className="mt-8 grid w-full grid-cols-3 gap-3">
            {[
              { icon: Receipt, label: "Traccia le spese", desc: "Ogni euro diventa tempo" },
              { icon: Target, label: "Imposta obiettivi", desc: "Dai un nome ai desideri" },
              { icon: Sparkles, label: "Leggi il Coach", desc: "Insight quotidiani" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-3 py-4 text-center"
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-iri-violet/20 to-iri-magenta/10 text-iri-pale">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </div>
                <p className="text-[11px] font-medium text-ink-primary">{label}</p>
                <p className="mt-0.5 text-[10px] text-ink-secondary">{desc}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-8 flex items-center gap-2 rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)]"
          >
            Vai alla dashboard
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
          <p className="mt-3 text-[11px] text-ink-muted">
            Redirect automatico tra pochi secondi…
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [showAllReady, setShowAllReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [incomeType, setIncomeType] = useState<IncomeType | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyHours, setMonthlyHours] = useState(160);
  const [workDays, setWorkDays] = useState(22);
  const [timeMetric, setTimeMetric] = useState<TimeMetric | null>(null);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [fixedCosts, setFixedCosts] = useState<FixedCostEntry[]>([
    { name: "", amount: 0 },
  ]);
  const [step, setStep] = useState(0);

  // Mostra le slide intro prima del wizard
  if (showIntro) {
    return <OnboardingIntro onComplete={() => setShowIntro(false)} />;
  }

  // Schermata "Tutto pronto" dopo il completamento
  if (showAllReady) {
    return <AllReadyScreen />;
  }

  async function handleComplete() {
    if (!incomeType || !timeMetric) return;
    setError(null);
    setPending(true);
    const result = await completeOnboarding({
      name,
      incomeType,
      monthlyIncome,
      monthlyHours: timeMetric === "work_hours" ? monthlyHours : null,
      workDays: timeMetric === "work_days" ? workDays : null,
      timeMetric,
      savingsGoal,
      fixedCosts,
    });
    if (result?.error) {
      setError(result.error);
      setPending(false);
    } else {
      setShowAllReady(true);
    }
  }

  // ── STEP 0 — nome ──
  if (step === 0) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, #1A1530 0%, #0A0812 40%, #060508 100%)",
        }}
      >
        <div className="w-full max-w-[440px] animate-slide-up">
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] text-[32px]"
              style={{
                background: "linear-gradient(135deg, rgba(168,139,250,0.2), rgba(232,121,249,0.1))",
                border: "1px solid rgba(168,139,250,0.3)",
              }}
            >
              👋
            </div>
            <h1 className="font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
              Come ti chiami?
            </h1>
            <p className="mt-2 text-[14px] text-ink-secondary">
              Il tuo Coach ti chiamerà per nome.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setStep(1); }}
              placeholder="Il tuo nome"
              autoFocus
              className="w-full rounded-[14px] px-5 py-4 text-[18px] font-serif italic text-ink-primary outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(168,139,250,0.25)",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(168,139,250,0.6)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(168,139,250,0.25)")}
            />
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue py-4 text-[14px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-6px_rgba(168,139,250,0.5)] transition-all [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
            >
              Continua →
            </button>
            {!name.trim() && (
              <button
                type="button"
                onClick={() => { setName(""); setStep(1); }}
                className="text-center text-[12px] text-ink-muted transition-colors hover:text-ink-secondary"
              >
                Salta
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 1 — tipologia reddito ──
  if (step === 1) {
    const canProceed = incomeType !== null;
    return (
      <WizardShell
        step={1}
        totalSteps={TOTAL_STEPS}
        title="Parliamo di te"
        subtitle="Valorem si adatta alla tua situazione finanziaria"
      >
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
              Il tuo reddito è…
            </p>
            <div className="flex flex-col gap-2">
              <ChoiceCard
                icon={<Briefcase className="h-4 w-4" strokeWidth={1.7} />}
                title="Stipendio fisso"
                description="Lavoro dipendente, busta paga regolare ogni mese"
                selected={incomeType === "fixed_salary"}
                onClick={() => setIncomeType("fixed_salary")}
              />
              <ChoiceCard
                icon={<TrendingUp className="h-4 w-4" strokeWidth={1.7} />}
                title="Entrate variabili"
                description="Freelance, P.IVA, commerciale, attività autonoma"
                selected={incomeType === "variable"}
                onClick={() => setIncomeType("variable")}
              />
              <ChoiceCard
                icon={<Wallet className="h-4 w-4" strokeWidth={1.7} />}
                title="Reddito saltuario"
                description="Studente, casalingo/a, pensionato, entrate discontinue"
                selected={incomeType === "irregular"}
                onClick={() => setIncomeType("irregular")}
              />
            </div>
          </div>
        </div>
        <NavButtons canProceed={canProceed} isLast={false} pending={false} onNext={() => setStep(2)} />
      </WizardShell>
    );
  }

  // ── STEP 2 — importo mensile ──
  if (step === 2) {
    const canProceed = monthlyIncome > 0;
    const title =
      incomeType === "fixed_salary"
        ? "Il tuo stipendio mensile"
        : incomeType === "variable"
        ? "Il tuo reddito medio mensile"
        : "Quanto hai a disposizione al mese";
    const subtitle =
      incomeType === "fixed_salary"
        ? "Lo stipendio netto che ricevi ogni mese"
        : incomeType === "variable"
        ? "Una stima realistica delle tue entrate medie"
        : "Paghetta, borsa di studio, supporto familiare, risparmi";
    const label =
      incomeType === "fixed_salary" ? "Stipendio netto mensile" : "Entrata media mensile";

    return (
      <WizardShell step={2} totalSteps={TOTAL_STEPS} title={title} subtitle={subtitle}>
        <NumberField
          label={label}
          value={monthlyIncome}
          onChange={setMonthlyIncome}
          placeholder="1000"
          suffix="€"
        />
        {incomeType !== "fixed_salary" && (
          <p className="mt-3 text-[11px] leading-[1.6] text-ink-secondary">
            Se le tue entrate variano mese per mese, usa una media realistica.
            Potrai aggiornarla in qualsiasi momento.
          </p>
        )}
        <NavButtons
          canProceed={canProceed}
          isLast={false}
          pending={false}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      </WizardShell>
    );
  }

  // ── STEP 3 — scelta della metrica del tempo ──
  if (step === 3) {
    const canProceed =
      timeMetric !== null &&
      (timeMetric === "work_hours"
        ? monthlyHours > 0
        : timeMetric === "work_days"
        ? workDays > 0
        : true);

    return (
      <WizardShell
        step={3}
        totalSteps={TOTAL_STEPS}
        title="Come vuoi misurare le spese"
        subtitle="Ogni acquisto sarà tradotto in questa unità"
      >
        <div className="flex flex-col gap-2">
          <ChoiceCard
            icon={<Clock className="h-4 w-4" strokeWidth={1.7} />}
            title="Ore di lavoro"
            description="Ideale se lavori a ore certificabili. Es. 42€ = 2h 49m"
            selected={timeMetric === "work_hours"}
            onClick={() => setTimeMetric("work_hours")}
          />
          <ChoiceCard
            icon={<CalendarDays className="h-4 w-4" strokeWidth={1.7} />}
            title="Giornate lavorative"
            description="Se lavori a giornata piena. Es. 42€ = 1/2 giornata"
            selected={timeMetric === "work_days"}
            onClick={() => setTimeMetric("work_days")}
          />
          <ChoiceCard
            icon={<Calendar className="h-4 w-4" strokeWidth={1.7} />}
            title="Giorni di budget"
            description="Vede le spese come porzioni del tuo mese. Universale"
            selected={timeMetric === "budget_days"}
            onClick={() => setTimeMetric("budget_days")}
          />
          <ChoiceCard
            icon={<Percent className="h-4 w-4" strokeWidth={1.7} />}
            title="Percentuale del mese"
            description="Per chi ama l'analisi. Es. 42€ = 1,8% del tuo mese"
            selected={timeMetric === "month_percent"}
            onClick={() => setTimeMetric("month_percent")}
          />
        </div>

        {timeMetric === "work_hours" && (
          <div className="mt-4 flex flex-col gap-3">
            <NumberField
              label="Ore lavorate al mese"
              value={monthlyHours}
              onChange={setMonthlyHours}
              placeholder="160"
              suffix="h"
            />
            {monthlyIncome > 0 && monthlyHours > 0 && (
              <p className="text-[11px] text-ink-secondary">
                Tariffa oraria:{" "}
                <span className="iri-text font-medium">
                  {(monthlyIncome / monthlyHours).toFixed(2).replace(".", ",")} €/h
                </span>
              </p>
            )}
          </div>
        )}

        {timeMetric === "work_days" && (
          <div className="mt-4 flex flex-col gap-3">
            <NumberField
              label="Giornate lavorative al mese"
              value={workDays}
              onChange={setWorkDays}
              placeholder="22"
              suffix="g"
            />
            {monthlyIncome > 0 && workDays > 0 && (
              <p className="text-[11px] text-ink-secondary">
                Tariffa giornaliera:{" "}
                <span className="iri-text font-medium">
                  {(monthlyIncome / workDays).toFixed(2).replace(".", ",")} €/giorno
                </span>
              </p>
            )}
          </div>
        )}

        <NavButtons
          canProceed={canProceed}
          isLast={false}
          pending={false}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      </WizardShell>
    );
  }

  // ── STEP 4 — obiettivo risparmio ──
  if (step === 4) {
    const canProceed = savingsGoal >= 0;
    const percentOfIncome =
      monthlyIncome > 0 ? Math.round((savingsGoal / monthlyIncome) * 100) : 0;

    return (
      <WizardShell
        step={4}
        totalSteps={TOTAL_STEPS}
        title="Quanto vuoi mettere da parte"
        subtitle="Valorem proteggerà questo importo ogni mese dal tuo budget libero"
      >
        <div className="flex flex-col gap-4">
          <NumberField
            label="Obiettivo di risparmio mensile"
            value={savingsGoal}
            onChange={setSavingsGoal}
            placeholder="100"
            suffix="€"
          />
          {savingsGoal > 0 && monthlyIncome > 0 && (
            <p className="text-[11px] text-ink-secondary">
              È circa il{" "}
              <span className="iri-text font-medium">{percentOfIncome}%</span>{" "}
              della tua entrata.{" "}
              {percentOfIncome < 10 && "Un inizio prudente, perfetto per partire."}
              {percentOfIncome >= 10 && percentOfIncome < 25 && "Un obiettivo realistico."}
              {percentOfIncome >= 25 && "Un target ambizioso — serve disciplina."}
            </p>
          )}
          {savingsGoal === 0 && (
            <p className="text-[11px] text-ink-secondary">
              Puoi lasciare 0 se ora non vuoi risparmiare — potrai attivarlo dopo dalle impostazioni.
            </p>
          )}
        </div>
        <NavButtons
          canProceed={canProceed}
          isLast={false}
          pending={false}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      </WizardShell>
    );
  }

  // ── STEP 5 — costi fissi ──
  return (
    <WizardShell
      step={5}
      totalSteps={TOTAL_STEPS}
      title="Le tue spese fisse"
      subtitle="Affitto, bollette, abbonamenti — quello che esce ogni mese"
    >
      <div className="flex flex-col gap-3">
        {fixedCosts.map((cost, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <TextField
                label={i === 0 ? "Nome" : ""}
                value={cost.name}
                onChange={(v) => {
                  const next = [...fixedCosts];
                  next[i] = { ...next[i], name: v };
                  setFixedCosts(next);
                }}
                placeholder="Affitto"
              />
            </div>
            <div className="w-[130px]">
              <NumberField
                label={i === 0 ? "Importo" : ""}
                value={cost.amount}
                onChange={(v) => {
                  const next = [...fixedCosts];
                  next[i] = { ...next[i], amount: v };
                  setFixedCosts(next);
                }}
                placeholder="0"
                suffix="€"
              />
            </div>
            {fixedCosts.length > 1 && (
              <button
                type="button"
                onClick={() => setFixedCosts(fixedCosts.filter((_, idx) => idx !== i))}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-ink-muted transition-colors hover:border-red-500/30 hover:text-red-300"
                title="Rimuovi"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFixedCosts([...fixedCosts, { name: "", amount: 0 }])}
          className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.1] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-secondary transition-colors hover:border-iri-violet/30 hover:text-iri-pale"
        >
          <Plus className="h-3 w-3" />
          Aggiungi costo fisso
        </button>

        <p className="mt-1 text-[11px] text-ink-secondary">
          Puoi lasciare tutto vuoto e aggiungerli dopo — non è obbligatorio.
        </p>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}
      </div>

      <NavButtons
        canProceed={true}
        isLast={true}
        pending={pending}
        onBack={() => setStep(4)}
        onNext={handleComplete}
      />
    </WizardShell>
  );
}