"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle, Sparkles, Zap, Crown, ArrowLeft, AlertCircle } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { VARIANT_IDS } from "@/lib/lemonsqueezy";

const plans = [
  {
    key: "free",
    name: "Free",
    icon: Sparkles,
    monthlyPrice: 0,
    annualPrice: 0,
    tagline: "Per iniziare il tuo percorso",
    features: [
      "Fino a 15 transazioni/mese",
      "1 obiettivo attivo",
      "Solo mese corrente nello storico",
      "Dashboard con Safe-to-Spend",
      "Cimitero degli impulsi",
    ],
    gradient: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
    accent: "#6B7280",
    glow: "transparent",
  },
  {
    key: "premium",
    name: "Premium",
    icon: Zap,
    monthlyPrice: 4.99,
    annualPrice: 3.99,
    tagline: "Il controllo finanziario completo",
    features: [
      "Transazioni illimitate",
      "Obiettivi illimitati",
      "Storico completo a vita",
      "Export CSV/Excel",
      "Categorie personalizzate",
      "Bulk import transazioni",
      "Recap mensile completo",
      "Ricerca globale avanzata",
      "Notifiche proattive",
    ],
    gradient: "linear-gradient(135deg, rgba(168,139,250,0.14), rgba(232,121,249,0.07))",
    border: "rgba(168,139,250,0.4)",
    accent: "#A88BFA",
    glow: "rgba(168,139,250,0.25)",
    popular: true,
  },
  {
    key: "pro",
    name: "Pro",
    icon: Crown,
    monthlyPrice: 8.99,
    annualPrice: 6.99,
    tagline: "Con intelligenza artificiale · In arrivo",
    features: [
      "Tutto di Premium",
      "AI Coach con Claude API",
      "Modalità coppia 💑",
      "Report mensile via email",
      "Confronto con coetanei",
      "Sync bancario",
      "Supporto prioritario",
    ],
    gradient: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(103,232,249,0.05))",
    border: "rgba(96,165,250,0.35)",
    accent: "#60A5FA",
    glow: "rgba(96,165,250,0.2)",
    comingSoon: true,
  },
];

function PricingContent() {
  const { plan: currentPlan } = usePlan();
  const [annual, setAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const cancelledParam = searchParams.get("cancelled");
  const [cancelledVisible, setCancelledVisible] = useState(cancelledParam === "true");

  // Auto-dismiss cancelled banner after 5 seconds
  useEffect(() => {
    if (cancelledParam !== "true") return;
    const t = setTimeout(() => setCancelledVisible(false), 5000);
    return () => clearTimeout(t);
  }, [cancelledParam]);

  async function openPortal() {
    try {
      const res = await fetch("/api/lemonsqueezy/portal");
      const data = await res.json() as { url?: string };
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      window.open("https://app.lemonsqueezy.com/billing", "_blank", "noopener,noreferrer");
    }
  }

  // Animated background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let offset = 0;

    const PALETTE: [number, number, number][] = [
      [168, 139, 250],
      [96, 165, 250],
      [103, 232, 249],
      [232, 121, 249],
      [168, 139, 250],
    ];

    function ledColor(t: number): [number, number, number] {
      const s = ((t % 1) + 1) % 1;
      const scaled = s * (PALETTE.length - 1);
      const i = Math.floor(scaled);
      const f = scaled - i;
      const a = PALETTE[Math.min(i, PALETTE.length - 1)];
      const b = PALETTE[Math.min(i + 1, PALETTE.length - 1)];
      return [
        Math.round(a[0] + (b[0] - a[0]) * f),
        Math.round(a[1] + (b[1] - a[1]) * f),
        Math.round(a[2] + (b[2] - a[2]) * f),
      ];
    }

    function draw() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      const W = canvas!.width;
      const H = canvas!.height;

      ctx.clearRect(0, 0, W, H);

      const orbs = [
        { x: W * 0.1, y: H * 0.2, r: 300, color: [168, 139, 250] as [number, number, number], opacity: 0.06 },
        { x: W * 0.85, y: H * 0.15, r: 250, color: [232, 121, 249] as [number, number, number], opacity: 0.05 },
        { x: W * 0.5, y: H * 0.8, r: 200, color: [96, 165, 250] as [number, number, number], opacity: 0.04 },
      ];

      orbs.forEach((orb) => {
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, `rgba(${orb.color.join(",")},${orb.opacity})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      const lineY = 2;
      const gW = W * 3;
      const gX = -(offset % 1) * W * 2;
      const lg = ctx.createLinearGradient(gX, 0, gX + gW, 0);
      for (let s = 0; s <= 12; s++) {
        const t = s / 12;
        const [r, g, b] = ledColor(t);
        lg.addColorStop(Math.min(t, 1), `rgba(${r},${g},${b},0.8)`);
      }
      ctx.fillStyle = lg;
      ctx.fillRect(0, lineY - 1, W, 2);
    }

    function loop() {
      offset = (offset + 0.004) % 1;
      draw();
      animRef.current = requestAnimationFrame(loop);
    }

    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  async function openCheckout(planKey: "premium") {
    setCheckoutLoading(true);
    try {
      const variantId = annual
        ? VARIANT_IDS[planKey].annual
        : VARIANT_IDS[planKey].monthly;

      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });

      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        alert("Errore durante il checkout. Riprova.");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("Errore durante il checkout. Riprova.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  function scrollToWaitlist() {
    waitlistRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    localStorage.setItem("valorem_pro_waitlist_email", waitlistEmail.trim());
    setWaitlistSubmitted(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0D0A1E" }}>
      {/* Animated background */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        style={{ zIndex: 0 }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12">
        {/* Banner successo */}
        {successParam === "true" && (
          <div
            className="mb-8 rounded-2xl px-6 py-4 text-center text-[14px] font-medium"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#6EE7B7",
            }}
          >
            🎉 Benvenuto in Premium! Il tuo piano è stato attivato.
          </div>
        )}

        {/* Banner pagamento annullato */}
        {cancelledVisible && (
          <div
            className="mb-8 flex items-center gap-3 rounded-2xl px-6 py-4 text-[14px] font-medium"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#FCD34D",
            }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
            <span>Il pagamento è stato annullato. Puoi riprovare quando vuoi.</span>
            <button
              onClick={() => setCancelledVisible(false)}
              className="ml-auto text-[12px] opacity-60 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.12em] transition-opacity hover:opacity-70"
            style={{ color: "rgba(168,139,250,0.7)" }}
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>

          <div style={{ height: "32px" }} />

          <div
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(168,139,250,0.08)",
              border: "1px solid rgba(168,139,250,0.2)",
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#A88BFA" }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: "#A88BFA" }}>
              Piani e prezzi
            </span>
          </div>

          <h1
            className="mt-4 font-serif text-[42px] font-normal italic leading-tight"
            style={{
              color: "#F0EEFF",
              background: "linear-gradient(135deg, #F0EEFF 0%, #A88BFA 50%, #E879F9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Investi nel tuo<br />benessere finanziario
          </h1>

          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Scegli il piano giusto per te. Cancella quando vuoi, senza penali.
          </p>

          {/* Toggle mensile/annuale */}
          <div
            className="mt-8 inline-flex items-center gap-1 rounded-2xl p-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="rounded-xl px-6 py-2.5 text-[13px] font-medium transition-all duration-300"
              style={{
                background: !annual ? "rgba(168,139,250,0.18)" : "transparent",
                color: !annual ? "#A88BFA" : "rgba(255,255,255,0.35)",
                border: !annual ? "1px solid rgba(168,139,250,0.3)" : "1px solid transparent",
                boxShadow: !annual ? "0 0 20px rgba(168,139,250,0.15)" : "none",
              }}
            >
              Mensile
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="flex items-center gap-2.5 rounded-xl px-6 py-2.5 text-[13px] font-medium transition-all duration-300"
              style={{
                background: annual ? "rgba(168,139,250,0.18)" : "transparent",
                color: annual ? "#A88BFA" : "rgba(255,255,255,0.35)",
                border: annual ? "1px solid rgba(168,139,250,0.3)" : "1px solid transparent",
                boxShadow: annual ? "0 0 20px rgba(168,139,250,0.15)" : "none",
              }}
            >
              Annuale
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#10B981",
                }}
              >
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Banner abbonato attivo */}
        {(currentPlan === "premium" || currentPlan === "pro") && (
          <div
            className="mb-8 rounded-2xl px-6 py-5"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  style={{ color: "#34D399" }}
                  strokeWidth={1.8}
                />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: "#6EE7B7" }}>
                    Sei già su Piano {currentPlan === "premium" ? "Premium" : "Pro"} 🎉
                  </p>
                  <p className="mt-0.5 text-[12px]" style={{ color: "rgba(110,231,183,0.65)" }}>
                    Gestisci il tuo abbonamento, aggiorna il metodo di pagamento o cancella dal portale clienti.
                  </p>
                </div>
              </div>
              <button
                onClick={openPortal}
                className="flex-shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all hover:opacity-80"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#6EE7B7",
                  whiteSpace: "nowrap",
                }}
              >
                Gestisci abbonamento →
              </button>
            </div>
          </div>
        )}

        {/* Piani */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const isCurrent = currentPlan === plan.key;
            const isHovered = hoveredPlan === plan.key;
            const isComingSoon = "comingSoon" in plan && plan.comingSoon;

            return (
              <div
                key={plan.key}
                onMouseEnter={() => setHoveredPlan(plan.key)}
                onMouseLeave={() => setHoveredPlan(null)}
                className="relative flex flex-col rounded-2xl transition-all duration-500"
                style={{
                  background: plan.gradient,
                  border: `1px solid ${isHovered || isCurrent ? plan.border : plan.key === "free" ? "rgba(255,255,255,0.06)" : plan.border}`,
                  backdropFilter: "blur(20px)",
                  boxShadow: isHovered && plan.glow !== "transparent"
                    ? `0 24px 60px -12px ${plan.glow}, 0 0 0 1px ${plan.border}`
                    : plan.popular
                    ? `0 16px 40px -8px ${plan.glow}`
                    : "none",
                  transform: isHovered ? "translateY(-6px) scale(1.01)" : "none",
                  padding: plan.popular || isComingSoon ? "2px" : "0",
                }}
              >
                {/* Animated border for premium */}
                {plan.popular && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, #A88BFA, #E879F9, #60A5FA, #67E8F9, #A88BFA)",
                      backgroundSize: "300% 300%",
                      animation: "borderRotate 4s linear infinite",
                      zIndex: -1,
                    }}
                  />
                )}

                {/* Animated border for Pro (coming soon) */}
                {isComingSoon && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, #60A5FA, #67E8F9, #A88BFA, #60A5FA, #67E8F9)",
                      backgroundSize: "300% 300%",
                      animation: "borderRotate 6s linear infinite",
                      zIndex: -1,
                    }}
                  />
                )}

                <div
                  className="relative flex h-full flex-col rounded-2xl p-6"
                  style={{
                    background: plan.popular
                      ? "linear-gradient(135deg, rgba(26,20,40,0.95), rgba(36,27,58,0.95))"
                      : isComingSoon
                      ? "linear-gradient(135deg, rgba(13,20,40,0.97), rgba(10,20,36,0.97))"
                      : "transparent",
                  }}
                >
                  {/* Badge popolare */}
                  {plan.popular && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        background: "linear-gradient(135deg, #A88BFA, #E879F9)",
                        color: "#0D0A1E",
                        boxShadow: "0 4px 16px rgba(168,139,250,0.4)",
                      }}
                    >
                      ✦ Più popolare
                    </div>
                  )}

                  {/* Badge prossimamente */}
                  {isComingSoon && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        background: "linear-gradient(135deg, #60A5FA, #67E8F9)",
                        color: "#0D0A1E",
                        boxShadow: "0 4px 16px rgba(96,165,250,0.4)",
                      }}
                    >
                      🚀 Prossimamente
                    </div>
                  )}

                  {/* Piano header */}
                  <div className="mb-6 flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300"
                      style={{
                        background: `${plan.accent}18`,
                        border: `1px solid ${plan.accent}30`,
                        boxShadow: isHovered ? `0 0 20px ${plan.accent}30` : "none",
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: plan.accent }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[17px] font-semibold" style={{ color: "#F0EEFF" }}>
                        {plan.name}
                      </p>
                      <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Prezzo */}
                  <div className="mb-7">
                    {price === 0 ? (
                      <div>
                        <p className="font-serif text-[42px] font-normal leading-none" style={{ color: "#F0EEFF" }}>
                          Gratis
                        </p>
                        <p className="mt-1 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Per sempre nel piano base
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="font-serif text-[42px] font-normal leading-none transition-all duration-500"
                            style={{
                              color: plan.accent,
                              textShadow: isHovered ? `0 0 30px ${plan.accent}60` : "none",
                              opacity: isComingSoon ? 0.6 : 1,
                            }}
                          >
                            €{price.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                            /mese
                          </span>
                        </div>
                        {annual ? (
                          <p className="mt-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                            Fatturato annualmente · €{(price * 12).toFixed(2).replace(".", ",")}/anno
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            o €{plan.annualPrice.toFixed(2).replace(".", ",")}/mese con piano annuale
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Early adopter banner — Pro only */}
                  {isComingSoon && (
                    <div
                      className="mb-5 rounded-xl px-3.5 py-3 text-[12px] leading-relaxed"
                      style={{
                        background: "rgba(96,165,250,0.08)",
                        border: "1px solid rgba(96,165,250,0.25)",
                        color: "#93C5FD",
                      }}
                    >
                      🎁 <span style={{ fontWeight: 600 }}>Early adopter:</span> i primi 100 iscritti ricevono 2 mesi gratis + 30% di sconto permanente
                    </div>
                  )}

                  {/* Separatore */}
                  <div
                    className="mb-6 h-px w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${plan.accent}30, transparent)`,
                    }}
                  />

                  {/* Feature list */}
                  <ul className="mb-8 flex flex-1 flex-col gap-3">
                    {plan.features.map((feature, i) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 transition-all duration-300"
                        style={{
                          transitionDelay: isHovered ? `${i * 30}ms` : "0ms",
                          transform: isHovered ? "translateX(3px)" : "none",
                        }}
                      >
                        <div
                          className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                          style={{ background: `${plan.accent}20`, border: `1px solid ${plan.accent}40` }}
                        >
                          <Check className="h-2.5 w-2.5" style={{ color: plan.accent }} strokeWidth={3} />
                        </div>
                        <span className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      className="rounded-xl py-3.5 text-center text-[13px] font-medium"
                      style={{
                        background: `${plan.accent}10`,
                        border: `1px solid ${plan.accent}25`,
                        color: plan.accent,
                      }}
                    >
                      ✦ Piano attuale
                    </div>
                  ) : plan.key === "free" ? (
                    <Link
                      href="/"
                      className="block rounded-xl py-3.5 text-center text-[13px] font-medium transition-all duration-300 hover:opacity-70"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      Continua gratis
                    </Link>
                  ) : isComingSoon ? (
                    <button
                      onClick={scrollToWaitlist}
                      className="relative w-full overflow-hidden rounded-xl py-3.5 text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background: "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(103,232,249,0.12))",
                        border: "1px solid rgba(96,165,250,0.4)",
                        color: "#93C5FD",
                        boxShadow: isHovered ? "0 8px 24px -4px rgba(96,165,250,0.4)" : "none",
                      }}
                    >
                      Entra in lista →
                    </button>
                  ) : (
                    <button
                      onClick={() => openCheckout("premium")}
                      disabled={checkoutLoading}
                      className="relative w-full overflow-hidden rounded-xl py-3.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={
                        plan.popular
                          ? {
                              background: "linear-gradient(135deg, #A88BFA, #E879F9)",
                              boxShadow: isHovered
                                ? "0 12px 32px -4px rgba(168,139,250,0.6)"
                                : "0 6px 20px -4px rgba(168,139,250,0.4)",
                            }
                          : {
                              background: `linear-gradient(135deg, ${plan.accent}25, ${plan.accent}12)`,
                              border: `1px solid ${plan.accent}40`,
                              color: plan.accent,
                              boxShadow: isHovered ? `0 8px 24px -4px ${plan.accent}40` : "none",
                            }
                      }
                    >
                      {/* Shimmer effect */}
                      <span
                        className="absolute inset-0 -translate-x-full"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                          animation: isHovered && !checkoutLoading ? "shimmer 0.6s ease" : "none",
                        }}
                      />
                      {checkoutLoading ? "Caricamento..." : plan.key === "premium" ? "Inizia con Premium →" : "Inizia con Pro →"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Waitlist Pro */}
        <div
          ref={waitlistRef}
          className="mx-auto mt-12 max-w-[600px] rounded-[24px] p-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(103,232,249,0.05))",
            border: "1px solid rgba(96,165,250,0.3)",
          }}
        >
          {/* Badge */}
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.25)",
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#60A5FA" }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#60A5FA" }}>
              Early Adopter
            </span>
          </div>

          <h2
            className="mt-2 font-serif text-[28px] font-normal italic leading-tight"
            style={{ color: "#F0EEFF" }}
          >
            Sii tra i primi a provare<br />Valorem Pro
          </h2>

          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            L&apos;AI Coach personalizzato, la modalità coppia e i report mensili automatici sono in sviluppo.
            Iscriviti adesso e ricevi <span style={{ color: "#93C5FD", fontWeight: 500 }}>2 mesi gratis + 30% di sconto permanente</span> quando uscirà.
          </p>

          {/* Contatore */}
          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium"
            style={{
              background: "rgba(96,165,250,0.07)",
              border: "1px solid rgba(96,165,250,0.18)",
              color: "#93C5FD",
            }}
          >
            🔥 23 persone già in lista
          </div>

          {/* Form */}
          <div className="mt-7">
            {waitlistSubmitted ? (
              <div
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-4 text-[14px] font-medium"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  color: "#6EE7B7",
                }}
              >
                ✓ Sei in lista! Ti avviseremo appena Pro sarà disponibile.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="la.tua@email.it"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 rounded-[14px] px-4 py-3.5 text-[14px] text-white outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(96,165,250,0.25)",
                  }}
                />
                <button
                  type="submit"
                  className="rounded-[14px] px-5 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: "linear-gradient(135deg, #60A5FA, #67E8F9)",
                    color: "#0D0A1E",
                    whiteSpace: "nowrap",
                  }}
                >
                  Desidero l&apos;accesso anticipato →
                </button>
              </form>
            )}
          </div>

          <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Zero spam. Solo una email quando Pro è disponibile.
          </p>
        </div>

        {/* Garanzia */}
        <div
          className="mt-10 flex flex-col items-center gap-2 rounded-2xl p-6 text-center"
          style={{
            background: "rgba(168,139,250,0.04)",
            border: "1px solid rgba(168,139,250,0.1)",
          }}
        >
          <p className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            🔒 Pagamenti sicuri tramite Lemon Squeezy · Cancellazione in qualsiasi momento · Nessun vincolo
          </p>
          <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            <Link href="/privacy" className="underline hover:opacity-70">Privacy</Link>
            {" · "}
            <Link href="/termini" className="underline hover:opacity-70">Termini</Link>
            {" · "}
            <Link href="/rimborsi" className="underline hover:opacity-70">Rimborsi</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes borderRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
