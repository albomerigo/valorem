import type {
  Transaction,
  DeclinedSimulation,
  Goal,
  DashboardStats,
} from "./finance";

export type RecapData = {
  monthLabel: string;
  monthYear: string;
  year: number;
  month: number;
  totalSpent: number;
  totalIncome: number;
  netValue: number;
  transactionCount: number;
  savedFromImpulses: number;
  savedImpulsesCount: number;
  topCategory: { name: string; amount: number; percent: number } | null;
  categoryBreakdown: { name: string; amount: number; percent: number }[];
  mostExpensiveDay: { date: string; amount: number } | null;
  leastExpensiveDay: { date: string; amount: number } | null;
  daysActive: number;
  avgPerDay: number;
  trendVsPrevMonth: number | null;
  goalsProgress: { goal: Goal; monthProgress: number; monthProgressPct: number }[];
  narrativeTitle: string;
  coachQuote: string;
};

/**
 * Filtra le transazioni per un mese specifico (month: 1-12, year: YYYY).
 */
export function filterByMonth(
  txs: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return txs.filter((tx) => {
    const d = new Date(tx.transaction_date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  });
}

export function filterDeclinedByMonth(
  declined: DeclinedSimulation[],
  year: number,
  month: number
): DeclinedSimulation[] {
  return declined.filter((d) => {
    const dt = new Date(d.declined_at);
    return dt.getFullYear() === year && dt.getMonth() + 1 === month;
  });
}

function monthLabel(year: number, month: number): { label: string; labelYear: string } {
  const monthNames = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];
  return {
    label: monthNames[month - 1],
    labelYear: `${monthNames[month - 1]} ${year}`,
  };
}

/**
 * Costruisce l'intera analisi del mese per il recap.
 */
export function buildRecapData(
  year: number,
  month: number,
  allTransactions: Transaction[],
  declined: DeclinedSimulation[],
  goals: Goal[]
): RecapData {
  const txs = filterByMonth(allTransactions, year, month);
  const declinedOfMonth = filterDeclinedByMonth(declined, year, month);

  const expenses = txs.filter((t) => t.type === "expense");
  const incomes = txs.filter((t) => t.type === "income");
  const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const netValue = totalIncome - totalSpent;

  const savedFromImpulses = declinedOfMonth.reduce(
    (s, d) => s + Number(d.amount),
    0
  );

  // Categoria breakdown
  const catMap: Record<string, number> = {};
  for (const e of expenses) {
    const c = e.category || "Altro";
    catMap[c] = (catMap[c] || 0) + Number(e.amount);
  }
  const categoryBreakdown = Object.entries(catMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory =
    categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  // Giornata più costosa / virtuosa
  const dailyMap: Record<string, number> = {};
  for (const e of expenses) {
    dailyMap[e.transaction_date] =
      (dailyMap[e.transaction_date] || 0) + Number(e.amount);
  }
  const dailyEntries = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount,
  }));

  const mostExpensiveDay =
    dailyEntries.length > 0
      ? dailyEntries.reduce((max, curr) =>
          curr.amount > max.amount ? curr : max
        )
      : null;

  const leastExpensiveDay =
    dailyEntries.length > 0
      ? dailyEntries.reduce((min, curr) =>
          curr.amount < min.amount ? curr : min
        )
      : null;

  const daysActive = Object.keys(dailyMap).length;
  const avgPerDay = daysActive > 0 ? totalSpent / daysActive : 0;

  // Trend vs mese precedente
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevTxs = filterByMonth(allTransactions, prevYear, prevMonth);
  const prevSpent = prevTxs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const trendVsPrevMonth =
    prevSpent > 0 ? Math.round(((totalSpent - prevSpent) / prevSpent) * 100) : null;

  // Progressi obiettivi (semplificato: progress totale attuale - nessuna storicizzazione)
  const goalsProgress = goals
    .filter((g) => g.status === "active" || g.status === "completed")
    .map((goal) => {
      const current = Number(goal.current_amount);
      const target = Number(goal.target_amount);
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      return { goal, monthProgress: current, monthProgressPct: pct };
    });

  // Narrativa
  const { label, labelYear } = monthLabel(year, month);
  const { narrativeTitle, coachQuote } = buildNarrative({
    monthLabel: label,
    totalSpent,
    savedFromImpulses,
    savedImpulsesCount: declinedOfMonth.length,
    topCategory,
    trendVsPrevMonth,
    netValue,
    daysActive,
  });

  return {
    monthLabel: label,
    monthYear: labelYear,
    year,
    month,
    totalSpent,
    totalIncome,
    netValue,
    transactionCount: txs.length,
    savedFromImpulses,
    savedImpulsesCount: declinedOfMonth.length,
    topCategory,
    categoryBreakdown,
    mostExpensiveDay,
    leastExpensiveDay,
    daysActive,
    avgPerDay,
    trendVsPrevMonth,
    goalsProgress,
    narrativeTitle,
    coachQuote,
  };
}

/**
 * Genera la narrativa (titolo eroico + citazione Coach) in base ai dati.
 * Le scelte sono ordinate per priorità: se c'è un evento notevole, prende quello.
 */
function buildNarrative(ctx: {
  monthLabel: string;
  totalSpent: number;
  savedFromImpulses: number;
  savedImpulsesCount: number;
  topCategory: { name: string; amount: number; percent: number } | null;
  trendVsPrevMonth: number | null;
  netValue: number;
  daysActive: number;
}): { narrativeTitle: string; coachQuote: string } {
  const { monthLabel, savedFromImpulses, savedImpulsesCount, topCategory, trendVsPrevMonth, netValue } = ctx;
  const capitalMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  // PRIORITÀ 1 — salvataggio significativo dal cimitero
  if (savedFromImpulses >= 200 && savedImpulsesCount >= 3) {
    return {
      narrativeTitle: `${capitalMonth} — il mese del Guardiano`,
      coachQuote: `Hai detto di no ${savedImpulsesCount} volte. Ogni rifiuto è stato un piccolo atto di fedeltà verso il tuo futuro. ${savedFromImpulses.toFixed(
        0
      )}€ sono rimasti con te invece di andarsene nel nulla del consumo impulsivo. Questa è la disciplina che costruisce libertà.`,
    };
  }

  // PRIORITÀ 2 — trend positivo forte (spesa ridotta)
  if (trendVsPrevMonth !== null && trendVsPrevMonth <= -10) {
    return {
      narrativeTitle: `${capitalMonth} — il mese della svolta`,
      coachQuote: `Hai speso il ${Math.abs(
        trendVsPrevMonth
      )}% in meno rispetto al mese scorso. Un cambiamento di questa scala non capita per caso — è il risultato di scelte consapevoli ripetute. Continua così e questo ritmo diventerà la tua normalità.`,
    };
  }

  // PRIORITÀ 3 — trend negativo (spesa aumentata)
  if (trendVsPrevMonth !== null && trendVsPrevMonth >= 15) {
    return {
      narrativeTitle: `${capitalMonth} — un mese da osservare`,
      coachQuote: `Le tue spese sono salite del ${trendVsPrevMonth}% rispetto al mese scorso. Non è un giudizio, è un'osservazione. A volte i mesi più costosi sono quelli più ricchi di vita — altre volte segnalano abitudini da rivedere. Solo tu sai distinguere.`,
    };
  }

  // PRIORITÀ 4 — bilancio positivo
  if (netValue > 0) {
    return {
      narrativeTitle: `${capitalMonth} — il mese del surplus`,
      coachQuote: `Hai chiuso il mese con ${netValue.toFixed(
        0
      )}€ in più di quelli che sono usciti. È una vittoria silenziosa ma fondamentale: hai vissuto dentro i tuoi mezzi e ancora te ne resta. Questo è l'ingrediente dei sogni che si avverano.`,
    };
  }

  // PRIORITÀ 5 — top categoria dominante
  if (topCategory && topCategory.percent >= 40) {
    return {
      narrativeTitle: `${capitalMonth} — sotto il segno di ${topCategory.name}`,
      coachQuote: `Il ${topCategory.percent}% delle tue spese è finito in ${topCategory.name}. Non è giusto né sbagliato, è solo uno specchio. La domanda interessante è: è così che vuoi distribuire il tuo tempo-denaro, o è capitato per inerzia? Nel prossimo mese hai una seconda occasione di scegliere.`,
    };
  }

  // DEFAULT — mese sereno e regolare
  return {
    narrativeTitle: `${capitalMonth} — un mese di equilibrio`,
    coachQuote: `Non ci sono state svolte drammatiche, in meglio o in peggio. Questo non è un fallimento: è la solidità di una pratica. Le grandi trasformazioni nascono dalla ripetizione paziente di scelte ordinarie. Tu stai costruendo proprio quello.`,
  };
}

/**
 * Ritorna il mese precedente in formato (year, month).
 * Usato per suggerire il recap "del mese appena passato".
 */
export function getPreviousMonth(): { year: number; month: number } {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: prev.getFullYear(), month: prev.getMonth() + 1 };
}

/**
 * Formatta "2025-10" da year e month.
 */
export function formatMonthSlug(year: number, month: number): string {
  return `${year}-${month.toString().padStart(2, "0")}`;
}

/**
 * Parsifica "2025-10" in {year, month}.
 */
export function parseMonthSlug(slug: string): { year: number; month: number } | null {
  const match = slug.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1]);
  const month = parseInt(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}