"use client";

import { BarChart2, Calendar, Ghost, LogOut, Sparkles, Target } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import type { UserProfile } from "@/lib/finance";
import { splitCurrency } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";

type TopCategory = {
  name: string;
  amount: number;
  percent: number;
  top3: { name: string; amount: number; percent: number }[];
} | null;

const CAT_COLORS_PROFILO: Record<string, string> = {
  Alimentari: "#A88BFA",
  Ristorazione: "#FDA4AF",
  Trasporti: "#FCD34D",
  Abbonamento: "#93C5FD",
  Svago: "#F0ABFC",
  Salute: "#7DD3FC",
  Casa: "#C4B5FD",
  Shopping: "#E879F9",
  Investimenti: "#10B981",
  Altro: "#9CA3AF",
};

export function ProfiloView({
  profile,
  email,
  memberSince,
  stats,
  monthlySpending,
  topCategory,
  valoremScore,
}: {
  profile: UserProfile;
  email: string;
  memberSince: string;
  stats: {
    totalTransactions: number;
    activeMonths: number;
    totalSpent: number;
    totalImpulsiResistiti: number;
  };
  monthlySpending: { month: string; label: string; amount: number }[];
  topCategory?: TopCategory;
  valoremScore?: {
    score: number;
    label: string;
    color: string;
    breakdown: Record<string, number>;
  };
}) {
  const initials = (profile.name || email || "V")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const memberDate = new Date(memberSince).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const spentSplit = splitCurrency(stats.totalSpent);

  async function openPortal() {
    try {
      const res = await fetch("/api/lemonsqueezy/portal");
      const data = await res.json() as { url?: string };
      if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      window.open("https://app.lemonsqueezy.com/billing", "_blank", "noopener,noreferrer");
    }
  }

  const planLabel =
    profile.plan === "premium"
      ? "Premium"
      : profile.plan === "pro"
        ? "Pro"
        : "Free";
  const planColor =
    profile.plan === "premium"
      ? "#F59E0B"
      : profile.plan === "pro"
        ? "#C4B5FD"
        : "#A88BFA";
  const planBg =
    profile.plan === "premium"
      ? "rgba(245,158,11,0.1)"
      : profile.plan === "pro"
        ? "rgba(168,139,250,0.18)"
        : "rgba(168,139,250,0.12)";

  const coachSentence =
    stats.totalImpulsiResistiti > 10
      ? `Hai resistito a ${stats.totalImpulsiResistiti} impulsi. La disciplina è il tuo superpotere.`
      : stats.totalTransactions > 50
        ? `${stats.totalTransactions} transazioni tracciate. Ogni dato è un passo verso la libertà finanziaria.`
        : `Sei al tuo ${stats.activeMonths}° mese con Valorem. Stai costruendo consapevolezza finanziaria.`;

  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="profilo" userName={profile.name || ""} />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Profilo" showBack />

          {/* 2-column grid on desktop */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 md:mt-6">

            {/* ── COLONNA SINISTRA: identità + piano ── */}
            <div className="flex flex-col gap-4">

              {/* Avatar + identità */}
              <div className="glass-panel rounded-[20px] px-6 py-8 flex flex-col items-center gap-3 text-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-[22px] font-serif text-[28px] font-normal italic text-[#0A0812] shadow-[0_8px_28px_-6px_rgba(168,139,250,0.6)] [background-size:200%_200%] animate-gradient-shift"
                  style={{
                    background:
                      "linear-gradient(135deg, #A88BFA 0%, #E879F9 50%, #60A5FA 100%)",
                  }}
                >
                  {initials}
                </div>
                <div>
                  <h1 className="m-0 font-serif text-[28px] font-normal italic text-ink-primary">
                    {profile.name || "Utente"}
                  </h1>
                  <p className="m-0 mt-1 text-[13px] text-ink-secondary">{email}</p>
                  <p className="m-0 mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
                    <Calendar className="h-3 w-3" strokeWidth={1.8} />
                    Membro dal {memberDate}
                  </p>
                </div>
              </div>

              {/* Piano */}
              <div className="glass-panel rounded-[16px] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="eyebrow mb-2">Piano attivo</p>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium"
                      style={{
                        background: planBg,
                        color: planColor,
                        border: `1px solid ${planColor}40`,
                      }}
                    >
                      <Sparkles className="h-3 w-3" strokeWidth={1.8} />
                      {planLabel}
                    </div>
                    {(profile.plan === "premium" || profile.plan === "pro") && (
                      <button
                        onClick={openPortal}
                        className="mt-2 block text-left text-[11px] text-iri-pale transition-colors hover:text-ink-primary"
                      >
                        Gestisci abbonamento →
                      </button>
                    )}
                    {profile.plan === "free" && (
                      <a
                        href="/pricing"
                        className="mt-2 block text-[11px] text-iri-pale transition-colors hover:text-ink-primary"
                      >
                        Passa a Premium →
                      </a>
                    )}
                  </div>
                  {profile.plan === "free" && (
                    <a
                      href="/pricing"
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-white shadow-[0_6px_20px_-6px_rgba(168,139,250,0.6)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift hover:-translate-y-0.5"
                    >
                      Upgrade
                    </a>
                  )}
                </div>
              </div>

              {/* Logout */}
              <div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-[13px] font-medium text-red-400 transition-all hover:bg-red-400/10"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.8} />
                    Esci dall&apos;account
                  </button>
                </form>
              </div>
            </div>

            {/* ── COLONNA DESTRA: statistiche + coach + sparkline + categorie ── */}
            <div className="flex flex-col gap-4">

              {/* Stats 2×2 */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={<BarChart2 className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />}
                  label="Transazioni totali"
                  value={String(stats.totalTransactions)}
                />
                <StatCard
                  icon={<Calendar className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />}
                  label="Mesi attivi"
                  value={String(stats.activeMonths)}
                />
                <StatCard
                  icon={<Target className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />}
                  label="Speso in totale"
                  value={`${spentSplit.int},${spentSplit.dec}€`}
                />
                <StatCard
                  icon={<Ghost className="h-4 w-4 text-iri-pale" strokeWidth={1.8} />}
                  label="Impulsi resistiti"
                  value={String(stats.totalImpulsiResistiti)}
                />
              </div>

              {/* Valorem Score */}
              {valoremScore && (
                <div className="glass-panel rounded-[20px] px-5 py-5">
                  <p className="eyebrow mb-4">Valorem Score</p>
                  <div className="flex items-center gap-6">
                    {/* Ring */}
                    <div className="relative h-[100px] w-[100px] flex-shrink-0">
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                        <defs>
                          <linearGradient id="scoreRingGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#A88BFA" />
                            <stop offset="100%" stopColor="#E879F9" />
                          </linearGradient>
                          <filter id="scoreRingGlow">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(168,139,250,0.08)" strokeWidth="5" />
                        <circle
                          cx="50" cy="50" r="40" fill="none"
                          stroke={valoremScore.color}
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - valoremScore.score / 100)}
                          transform="rotate(-90 50 50)"
                          filter="url(#scoreRingGlow)"
                          style={{ transition: "stroke-dashoffset 1s ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className="font-serif text-[28px] font-normal leading-none [letter-spacing:-0.04em]"
                          style={{ color: valoremScore.color }}
                        >
                          {valoremScore.score}
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.1em] text-ink-muted mt-0.5">
                          {valoremScore.label}
                        </span>
                      </div>
                    </div>
                    {/* Breakdown bars */}
                    <div className="flex flex-1 flex-col gap-2">
                      {(
                        [
                          { key: "risparmio", label: "Risparmio", max: 30 },
                          { key: "budget", label: "Budget", max: 25 },
                          { key: "trend", label: "Trend", max: 20 },
                          { key: "impulsi", label: "Disciplina", max: 15 },
                          { key: "obiettivi", label: "Obiettivi", max: 10 },
                        ] as const
                      ).map(({ key, label, max }) => {
                        const val = valoremScore.breakdown[key] ?? 0;
                        const pct = Math.round((val / max) * 100);
                        return (
                          <div key={key}>
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-ink-muted">{label}</span>
                              <span className="font-mono-tabular text-[10px] text-ink-secondary">
                                {val}/{max}
                              </span>
                            </div>
                            <div className="relative h-[4px] overflow-hidden rounded-full bg-white/[0.05]">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                                style={{
                                  width: `${pct}%`,
                                  background: valoremScore.color,
                                  opacity: 0.75,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Coach sentence */}
              <div className="glass-panel rounded-[16px] px-5 py-4">
                <p className="eyebrow mb-2">Il tuo coach dice</p>
                <p className="m-0 font-serif text-[15px] italic leading-[1.6] text-ink-primary">
                  {coachSentence}
                </p>
              </div>

              {/* Sparkline spese ultimi 6 mesi */}
              {monthlySpending.length > 0 && (
                <div className="glass-panel rounded-[16px] px-5 py-4">
                  <p className="eyebrow mb-4">Andamento spese</p>
                  <SparklineChart data={monthlySpending} />
                </div>
              )}

              {/* Le tue abitudini */}
              {topCategory && topCategory.top3.length > 0 && (
                <div className="glass-panel rounded-[16px] px-5 py-4">
                  <p className="eyebrow mb-1">Le tue abitudini</p>
                  <p className="mb-4 font-serif text-[14px] italic leading-[1.5] text-ink-secondary">
                    La tua categoria principale è{" "}
                    <span className="text-ink-primary">{topCategory.name}</span>{" "}
                    — {topCategory.percent}% delle tue spese negli ultimi 3 mesi.
                  </p>
                  <div className="flex flex-col gap-3">
                    {topCategory.top3.map((cat) => {
                      const color = CAT_COLORS_PROFILO[cat.name] ?? "#A88BFA";
                      const { int, dec } = splitCurrency(cat.amount);
                      return (
                        <div key={cat.name}>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="text-[13px] text-ink-secondary">{cat.name}</span>
                            <span className="font-mono-tabular text-[12px] text-ink-muted">
                              {int},{dec}€ · {cat.percent}%
                            </span>
                          </div>
                          <div className="relative h-[5px] overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                              style={{ width: `${cat.percent}%`, background: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="profilo" />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-[16px] px-4 py-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg border border-iri-violet/25 bg-iri-violet/[0.08]">
        {icon}
      </div>
      <p className="eyebrow m-0 text-[9px]">{label}</p>
      <p className="m-0 mt-1 font-mono-tabular text-[20px] font-medium text-ink-primary">
        {value}
      </p>
    </div>
  );
}

function SparklineChart({
  data,
}: {
  data: { month: string; label: string; amount: number }[];
}) {
  const W = 400;
  const H = 60;
  const PAD = { left: 4, right: 4, top: 8, bottom: 4 };
  const max = Math.max(...data.map((d) => d.amount), 1);
  const n = data.length;

  const toX = (i: number) =>
    PAD.left + (i / (n - 1)) * (W - PAD.left - PAD.right);
  const toY = (v: number) =>
    PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.amount), ...d }));

  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    linePath += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }

  const areaPath =
    linePath + ` L ${pts[n - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        style={{ height: 60 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A88BFA" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#A88BFA" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#A88BFA"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#A88BFA" />
        ))}
      </svg>
      <div
        className="mt-1.5 flex justify-between"
        style={{ padding: `0 ${PAD.left}px` }}
      >
        {data.map((d) => (
          <span key={d.month} className="text-[9px] capitalize text-ink-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
