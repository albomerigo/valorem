"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { usePaddle } from "@/components/paddle-provider";
import { createClient } from "@/lib/supabase/client";
import { usePlan } from "@/hooks/usePlan";

// ── Price IDs Paddle ────────────────────────────────────────
const PRICES = {
  premium: {
    monthly: "pri_01krdva8kjak6s2kszq70z5rg8",
    annual: "pri_01krdv8fvn03vmvarp5n57wc0c",
  },
  pro: {
    monthly: "pri_01krdveqzjax8z5pty0c92re7d",
    annual: "pri_01krdvdhby1xgrkpf1ehfax1ss",
  },
};

// ── Dati piani ──────────────────────────────────────────────
const plans = [
  {
    key: "free",
    name: "Free",
    icon: Sparkles,
    iconColor: "#9CA3AF",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "Per iniziare a tenere traccia delle tue finanze.",
    features: [
      "Fino a 50 transazioni/mese",
      "1 obiettivo di risparmio",
      "Dashboard base",
      "Accesso web e PWA",
    ],
    cta: "Piano attuale",
    highlight: false,
  },
  {
    key: "premium",
    name: "Premium",
    icon: Zap,
    iconColor: "#A88BFA",
    monthlyPrice: 4.99,
    annualPrice: 3.99,
    description: "Per chi vuole il controllo completo delle spese.",
    features: [
      "Transazioni illimitate",
      "Obiettivi illimitati",
      "Grafici avanzati e analisi comportamentale",
      "Esportazione dati CSV",
      "Supporto prioritario",
    ],
    cta: "Inizia con Premium",
    highlight: true,
  },
  {
    key: "pro",
    name: "Pro",
    icon: Crown,
    iconColor: "#60A5FA",
    monthlyPrice: 9.99,
    annualPrice: 7.99,
    description: "Per professionisti e famiglie con esigenze avanzate.",
    features: [
      "Tutto di Premium",
      "API access per integrazioni",
      "Multi-account e condivisione familiare",
      "Report mensili via email",
      "SLA garantito 99.9%",
    ],
    cta: "Inizia con Pro",
    highlight: false,
  },
];

export default function PricingPage() {
  const paddle = usePaddle();
  const { plan: currentPlan } = usePlan();
  const [annual, setAnnual] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  function openCheckout(planKey: "premium" | "pro") {
    if (!paddle) {
      alert("Pagamenti non ancora pronti, riprova tra qualche secondo.");
      return;
    }
    const priceId = annual ? PRICES[planKey].annual : PRICES[planKey].monthly;
    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customData: userId ? { user_id: userId } : undefined,
    });
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0D0A1E" }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors"
            style={{ color: "rgba(168,139,250,0.7)" }}
          >
            ← Dashboard
          </Link>
          <h1 className="mt-4 font-serif text-[40px] font-normal italic leading-tight text-white">
            Scegli il tuo piano
          </h1>
          <p
            className="mt-3 text-[15px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Investi nel tuo controllo finanziario. Cancella quando vuoi.
          </p>

          {/* Toggle mensile/annuale */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => setAnnual(false)}
              className="rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-200"
              style={{
                background: !annual ? "rgba(168,139,250,0.2)" : "transparent",
                color: !annual ? "#A88BFA" : "rgba(255,255,255,0.4)",
                border: !annual ? "1px solid rgba(168,139,250,0.3)" : "1px solid transparent",
              }}
            >
              Mensile
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-200"
              style={{
                background: annual ? "rgba(168,139,250,0.2)" : "transparent",
                color: annual ? "#A88BFA" : "rgba(255,255,255,0.4)",
                border: annual ? "1px solid rgba(168,139,250,0.3)" : "1px solid transparent",
              }}
            >
              Annuale
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(168,139,250,0.2)", color: "#A88BFA" }}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Piani */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const isCurrent = currentPlan === plan.key;
            const isPaid = plan.key !== "free";

            return (
              <div
                key={plan.key}
                className="relative flex flex-col rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: plan.highlight
                    ? "linear-gradient(135deg, rgba(168,139,250,0.12), rgba(232,121,249,0.06))"
                    : "rgba(255,255,255,0.025)",
                  border: plan.highlight
                    ? "1px solid rgba(168,139,250,0.35)"
                    : "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(16px)",
                  boxShadow: plan.highlight
                    ? "0 20px 60px -12px rgba(168,139,250,0.2)"
                    : "none",
                }}
              >
                {/* Badge "Più popolare" */}
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-semibold"
                    style={{
                      background: "linear-gradient(90deg, #A88BFA, #E879F9)",
                      color: "#0D0A1E",
                    }}
                  >
                    Più popolare
                  </div>
                )}

                {/* Header piano */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: `${plan.iconColor}18`,
                      border: `1px solid ${plan.iconColor}30`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: plan.iconColor }} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold text-white">{plan.name}</p>
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* Prezzo */}
                <div className="mb-6">
                  {price === 0 ? (
                    <p className="font-mono text-[36px] font-bold text-white">
                      Gratis
                    </p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span
                        className="font-mono text-[36px] font-bold"
                        style={{ color: plan.iconColor }}
                      >
                        €{price.toFixed(2)}
                      </span>
                      <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                        /mese
                      </span>
                    </div>
                  )}
                  {annual && price > 0 && (
                    <p className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Fatturato annualmente · €{(price * 12).toFixed(2)}/anno
                    </p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="mb-8 flex flex-col gap-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: plan.iconColor }}
                        strokeWidth={2.5}
                      />
                      <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div
                    className="rounded-xl py-3 text-center text-[13px] font-medium"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Piano attuale
                  </div>
                ) : plan.key === "free" ? (
                  <Link
                    href="/"
                    className="block rounded-xl py-3 text-center text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Continua gratis
                  </Link>
                ) : (
                  <button
                    onClick={() => openCheckout(plan.key as "premium" | "pro")}
                    className="w-full rounded-xl py-3 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={
                      plan.highlight
                        ? {
                            background:
                              "linear-gradient(135deg, #A88BFA, #E879F9)",
                            boxShadow: "0 8px 24px -4px rgba(168,139,250,0.5)",
                          }
                        : {
                            background:
                              `linear-gradient(135deg, ${plan.iconColor}30, ${plan.iconColor}15)`,
                            border: `1px solid ${plan.iconColor}40`,
                            color: plan.iconColor,
                          }
                    }
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p
          className="mt-10 text-center text-[12px]"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          Pagamenti sicuri tramite Paddle · Cancellazione in qualsiasi momento ·{" "}
          <Link href="/privacy" className="underline hover:opacity-70">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/termini" className="underline hover:opacity-70">
            Termini
          </Link>
        </p>
      </div>
    </div>
  );
}
