/**
 * Cuore matematico di Valorem — versione multi-tipologia utente.
 *
 * Supporta 3 tipologie di reddito:
 *   - fixed_salary: stipendio fisso + ore lavorate
 *   - variable: entrate variabili mensili (stima)
 *   - irregular: reddito saltuario
 *
 * E 4 metriche del "traduttore di tempo":
 *   - work_hours: ore di lavoro
 *   - work_days: giornate lavorative
 *   - budget_days: giorni di budget disponibile
 *   - month_percent: percentuale del mese
 */

import type { SupabaseClient } from "@supabase/supabase-js";
/**
 * Categorie escluse dai calcoli di "spesa" perché rappresentano
 * capitale che resta dell'utente (non consumato).
 * Vengono mostrate separatamente come "Capitale investito".
 */
export const INVESTMENT_CATEGORIES = ["Investimenti"] as const;

export function isInvestment(category: string | null | undefined): boolean {
  if (!category) return false;
  return INVESTMENT_CATEGORIES.includes(category as typeof INVESTMENT_CATEGORIES[number]);
}

// ═══════════════════════════════════════════════════════════
//  TIPI TYPESCRIPT
// ═══════════════════════════════════════════════════════════

export type IncomeType = "fixed_salary" | "variable" | "irregular";
export type SafeMode = "aggressive" | "cautious" | "saving";
export type TimeMetric =
  | "work_hours"
  | "work_days"
  | "budget_days"
  | "month_percent";

export type UserProfile = {
  id: string;
  name: string | null;
  income_type: IncomeType;
  monthly_income: number;
  monthly_hours: number | null;
  work_days: number | null;
  time_metric: TimeMetric;
  savings_goal: number;
  safe_mode: SafeMode;
  onboarded: boolean;
  plan?: "free" | "premium" | "pro" | null;
};

export type FixedCost = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
};

export type Transaction = {
  id: string;
  user_id: string;
  merchant: string;
  category: string | null;
  amount: number;
  type: "expense" | "income";
  transaction_date: string;
  recurring: boolean;
  notes?: string | null;
};
export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  emoji: string;
  category: string;
  deadline: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
};
export type DeclinedSimulation = {
  id: string;
  user_id: string;
  merchant: string;
  category: string | null;
  amount: number;
  declined_at: string;
};

export type DashboardData = {
  profile: UserProfile | null;
  fixedCosts: FixedCost[];
  transactions: Transaction[];
  stats: DashboardStats;
};

export type DashboardStats = {
  safeToSpendToday: number;
  monthlyFree: number;
  spentToday: number;
  savingsPercent: number;
  remainingDays: number;
  dayOfMonth: number;
  daysInMonth: number;
  monthLabel: string;
  aiBlocks: number;
  trendVsLastMonth: number;
  coachMessage: string;
  totalFixedCosts: number;
  // Info per il traduttore di tempo
  timeMetric: TimeMetric;
  incomeType: IncomeType;
  // Funzione helper pre-calcolata
  dailyBudgetBase: number;
  hourlyRate: number;
  dailyWorkRate: number;
  safeMode: SafeMode;
  safeModeMultiplier: number;
  capitalInvested: number;
  capitalInvestedCount: number;
};

// ═══════════════════════════════════════════════════════════
//  FETCH DAL DATABASE (invariate)
// ═══════════════════════════════════════════════════════════

export async function fetchUserProfile(
  supabase: SupabaseClient
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users_profiles")
    .select("*")
    .single();

  if (error) {
    console.error("Errore fetchUserProfile:", error.message);
    return null;
  }
  return data;
}

export async function fetchFixedCosts(
  supabase: SupabaseClient
): Promise<FixedCost[]> {
  const { data, error } = await supabase
    .from("fixed_costs")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Errore fetchFixedCosts:", error.message);
    return [];
  }
  return data || [];
}

export async function fetchCurrentMonthTransactions(
  supabase: SupabaseClient
): Promise<Transaction[]> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("transaction_date", firstDay)
    .order("transaction_date", { ascending: false });
  if (error) {
    console.error("Errore fetchCurrentMonthTransactions:", error.message);
    return [];
  }
  return data || [];
}
/**
 * Legge le transazioni degli ultimi 28 giorni (per chart storico).
 */
export async function fetchRecentTransactions(
  supabase: SupabaseClient,
  days: number = 28
): Promise<Transaction[]> {
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startISO = start.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("transaction_date", startISO)
    .order("transaction_date", { ascending: true });

  if (error) {
    console.error("Errore fetchRecentTransactions:", error.message);
    return [];
  }
  return data || [];
}
/**
 * Legge TUTTE le transazioni dell'utente, ordinate per data decrescente.
 * Usato dalla pagina /attivita. Limite di sicurezza a 1000 per performance.
 */
export async function fetchAllTransactions(
  supabase: SupabaseClient
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("Errore fetchAllTransactions:", error.message);
    return [];
  }
  return data || [];
}
/**
 * Aggrega le transazioni per giorno delle ultime N settimane.
 * Ritorna sempre N*7 punti (riempiendo i giorni senza spese con 0).
 */
export function aggregateDailySpending(
  transactions: Transaction[],
  days: number = 28
): { date: string; amount: number; label: string }[] {
  const buckets: Record<string, number> = {};
  const today = new Date();

  // Pre-popola con tutti i giorni a 0
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    buckets[key] = 0;
  }

  // Aggrega solo le spese (non le entrate, non gli investimenti)
  for (const tx of transactions) {
    if (tx.type !== "expense") continue;
    if (isInvestment(tx.category)) continue;
    if (buckets[tx.transaction_date] !== undefined) {
      buckets[tx.transaction_date] += Number(tx.amount);
    }
  }

  return Object.entries(buckets).map(([date, amount]) => {
    const d = new Date(date);
    const label = d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    });
    return { date, amount, label };
  });
}
/**
 * Legge tutte le simulazioni rifiutate (impulsi evitati) dell'utente.
 */
export async function fetchDeclinedSimulations(
  supabase: SupabaseClient
): Promise<DeclinedSimulation[]> {
  const { data, error } = await supabase
    .from("declined_simulations")
    .select("*")
    .order("declined_at", { ascending: false });

  if (error) {
    console.error("Errore fetchDeclinedSimulations:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Legge solo gli impulsi del mese corrente.
 */
export async function fetchCurrentMonthDeclined(
  supabase: SupabaseClient
): Promise<DeclinedSimulation[]> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data, error } = await supabase
    .from("declined_simulations")
    .select("*")
    .gte("declined_at", firstDay)
    .order("declined_at", { ascending: false });

  if (error) {
    console.error("Errore fetchCurrentMonthDeclined:", error.message);
    return [];
  }
  return data || [];
}
/**
 * Legge gli obiettivi attivi dell'utente.
 */
export async function fetchGoals(
  supabase: SupabaseClient
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Errore fetchGoals:", error.message);
    return [];
  }
  return data || [];
}

/**
 * Calcola quanti giorni mancano per raggiungere un obiettivo
 * al ritmo di risparmio mensile corrente.
 */
export function estimateGoalReachDate(
  goal: Goal,
  monthlySavings: number
): { daysToGo: number; targetDate: Date | null; months: number } {
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);
  if (remaining <= 0) {
    return { daysToGo: 0, targetDate: new Date(), months: 0 };
  }
  if (monthlySavings <= 0) {
    return { daysToGo: -1, targetDate: null, months: -1 };
  }

  const months = remaining / monthlySavings;
  const daysToGo = Math.ceil(months * 30);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToGo);

  return {
    daysToGo,
    targetDate,
    months: Math.round(months * 10) / 10,
  };
}

/**
 * Percentuale di completamento di un goal
 */
export function getGoalProgress(goal: Goal): number {
  const target = Number(goal.target_amount);
  const current = Number(goal.current_amount);
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
// ═══════════════════════════════════════════════════════════
//  CALCOLI SAFE-TO-SPEND (come prima, funzionano per tutti)
// ═══════════════════════════════════════════════════════════

export function getTotalFixedCosts(fixedCosts: FixedCost[]): number {
  return fixedCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
}

export function getMonthlyFreeBudget(
  profile: UserProfile,
  fixedCosts: FixedCost[]
): number {
  return (
    Number(profile.monthly_income) -
    getTotalFixedCosts(fixedCosts) -
    Number(profile.savings_goal)
  );
}

export function getSpentThisMonth(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.type === "expense" && !isInvestment(tx.category))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function getInvestedThisMonth(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.type === "expense" && isInvestment(tx.category))
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function getSpentToday(transactions: Transaction[]): number {
  const today = new Date().toISOString().split("T")[0];
  return transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        tx.transaction_date === today &&
        !isInvestment(tx.category)
    )
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
}

export function getRemainingDays(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
}

export function getDayOfMonth(): number {
  return new Date().getDate();
}

export function getDaysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getMonthLabel(): string {
  const month = new Date().getMonth() + 1;
  return `Mese ${month.toString().padStart(2, "0")}`;
}

/**
 * Ritorna il moltiplicatore del Safe-to-Spend in base alla modalità.
 */
export function getSafeModeMultiplier(mode: SafeMode): number {
  if (mode === "cautious") return 0.9;
  if (mode === "saving") return 0.8;
  return 1.0; // aggressive
}

export function getSafeToSpendToday(
  profile: UserProfile,
  fixedCosts: FixedCost[],
  transactions: Transaction[]
): number {
  const freeBudget = getMonthlyFreeBudget(profile, fixedCosts);
  const alreadySpent = getSpentThisMonth(transactions);
  const daysLeft = getRemainingDays();
  if (daysLeft <= 0) return 0;

  const baseDaily = (freeBudget - alreadySpent) / daysLeft;
  const multiplier = getSafeModeMultiplier(profile.safe_mode);
  return baseDaily * multiplier;
}

export function getSavingsPercent(
  profile: UserProfile,
  fixedCosts: FixedCost[],
  transactions: Transaction[]
): number {
  const goal = Number(profile.savings_goal);
  if (goal <= 0) return 0;
  const freeBudget = getMonthlyFreeBudget(profile, fixedCosts);
  const spent = getSpentThisMonth(transactions);
  if (freeBudget <= 0) return 0;
  const preserved = freeBudget - spent;
  const percent = (preserved / freeBudget) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

// ═══════════════════════════════════════════════════════════
//  TRADUTTORE DI TEMPO — la parte che cambia per tipologia
// ═══════════════════════════════════════════════════════════

/**
 * Converte un importo in "tempo" in base alla metrica scelta dall'utente.
 *
 * work_hours → "2h 49m"
 * work_days → "2 giorni 3h"
 * budget_days → "1,4 giorni"
 * month_percent → "1,8% del mese"
 */
export function amountToTimeLabel(
  amount: number,
  stats: DashboardStats
): string {
  const metric = stats.timeMetric;

  switch (metric) {
    case "work_hours": {
      const rate = stats.hourlyRate;
      if (rate <= 0) return "—";
      const totalMinutes = Math.round((amount / rate) * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      if (h === 0) return `${m}m`;
      return `${h}h ${m.toString().padStart(2, "0")}m`;
    }

    case "work_days": {
      const rate = stats.dailyWorkRate;
      if (rate <= 0) return "—";
      const days = amount / rate;
      if (days < 1) {
        const hours = Math.round(days * 8); // 8h lavorative
        return `${hours}h lavoro`;
      }
      const fullDays = Math.floor(days);
      const remainderHours = Math.round((days - fullDays) * 8);
      if (remainderHours === 0) return `${fullDays}g lavoro`;
      return `${fullDays}g ${remainderHours}h`;
    }

    case "budget_days": {
      const rate = stats.dailyBudgetBase;
      if (rate <= 0) return "—";
      const days = amount / rate;
      if (days < 1) {
        return `${Math.round(days * 100)}% di una giornata`;
      }
      return `${days.toFixed(1).replace(".", ",")} giorni`;
    }

    case "month_percent": {
      const income = stats.monthlyFree + stats.totalFixedCosts; // entrata lorda mensile
      if (income <= 0) return "—";
      const percent = (amount / income) * 100;
      if (percent < 0.1) return "<0,1% del mese";
      return `${percent.toFixed(1).replace(".", ",")}% del mese`;
    }
  }
}

/**
 * Etichetta da mostrare sotto il Safe-to-Spend hero
 * ("≡ 2h 18m del tuo tempo" / "≡ 1,4 giorni di budget" / ecc.)
 */
export function timeLabelWithPrefix(
  amount: number,
  stats: DashboardStats
): string {
  return `≡ ${amountToTimeLabel(amount, stats)}`;
}

// ═══════════════════════════════════════════════════════════
//  ENTRY POINT DASHBOARD
// ═══════════════════════════════════════════════════════════

export async function loadDashboardData(
  supabase: SupabaseClient
): Promise<DashboardData> {
  const [profile, fixedCosts, transactions] = await Promise.all([
    fetchUserProfile(supabase),
    fetchFixedCosts(supabase),
    fetchCurrentMonthTransactions(supabase),
  ]);

  if (!profile || !profile.onboarded) {
    return {
      profile,
      fixedCosts,
      transactions,
      stats: emptyStats(profile),
    };
  }

  const monthlyFree = getMonthlyFreeBudget(profile, fixedCosts);
  const daysInMonth = getDaysInMonth();

  const hourlyRate =
    profile.monthly_hours && profile.monthly_hours > 0
      ? Number(profile.monthly_income) / Number(profile.monthly_hours)
      : 0;
  const dailyWorkRate =
    profile.work_days && profile.work_days > 0
      ? Number(profile.monthly_income) / Number(profile.work_days)
      : 0;
  const dailyBudgetBase = daysInMonth > 0 ? monthlyFree / daysInMonth : 0;

  const stats: DashboardStats = {
    safeToSpendToday: getSafeToSpendToday(profile, fixedCosts, transactions),
    monthlyFree,
    spentToday: getSpentToday(transactions),
    savingsPercent: getSavingsPercent(profile, fixedCosts, transactions),
    remainingDays: getRemainingDays(),
    dayOfMonth: getDayOfMonth(),
    daysInMonth,
    monthLabel: getMonthLabel(),
    totalFixedCosts: getTotalFixedCosts(fixedCosts),
    aiBlocks: 0,
    trendVsLastMonth: 0,
    coachMessage: buildCoachMessage(profile, transactions),
    timeMetric: profile.time_metric,
    incomeType: profile.income_type,
   dailyBudgetBase,
    hourlyRate,
    dailyWorkRate,
    safeMode: profile.safe_mode,
    safeModeMultiplier: getSafeModeMultiplier(profile.safe_mode),
    capitalInvested: getInvestedThisMonth(transactions),
    capitalInvestedCount: transactions.filter(
      (tx) => tx.type === "expense" && isInvestment(tx.category)
    ).length,
  };

  return { profile, fixedCosts, transactions, stats };
}

function emptyStats(profile: UserProfile | null): DashboardStats {
  return {
    safeToSpendToday: 0,
    monthlyFree: 0,
    spentToday: 0,
    savingsPercent: 0,
    remainingDays: getRemainingDays(),
    dayOfMonth: getDayOfMonth(),
    daysInMonth: getDaysInMonth(),
    monthLabel: getMonthLabel(),
    totalFixedCosts: 0,
    aiBlocks: 0,
    trendVsLastMonth: 0,
    coachMessage:
      "Completa la configurazione del tuo profilo per iniziare a tradurre denaro in tempo.",
    timeMetric: profile?.time_metric || "work_hours",
    incomeType: profile?.income_type || "fixed_salary",
    dailyBudgetBase: 0,
    hourlyRate: 0,
    dailyWorkRate: 0,
    safeMode: profile?.safe_mode || "aggressive",
    safeModeMultiplier: 1,
    capitalInvested: 0,
    capitalInvestedCount: 0,
  };
}

function buildCoachMessage(
  profile: UserProfile,
  transactions: Transaction[]
): string {
  const name = profile.name || "ciao";
  const spent = getSpentThisMonth(transactions);

  if (spent === 0) {
    return `${name}, il mese è appena iniziato. Ogni scelta che farai conta — comincia con calma.`;
  }
  return `${name}, il tuo ritmo di spesa è sotto controllo. Stai gestendo bene — continua così.`;
}

// Etichetta per la sezione "del tuo tempo/budget" (usata in hero)
export function getTimeMetricSuffix(metric: TimeMetric): string {
  switch (metric) {
    case "work_hours":
      return "del tuo tempo";
    case "work_days":
      return "di lavoro";
    case "budget_days":
      return "di budget";
    case "month_percent":
      return "del tuo mese";
  }
}