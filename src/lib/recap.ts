import type {
  Transaction,
  DeclinedSimulation,
  Goal,
  DashboardStats,
} from "./finance";
import { isInvestment } from "./finance";

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
  capitalInvested: number;
  capitalInvestedCount: number;
  mostExpensiveDay: { date: string; amount: number } | null;
  leastExpensiveDay: { date: string; amount: number } | null;
  daysActive: number;
  avgPerDay: number;
  trendVsPrevMonth: number | null;
  prevMonthData: { spent: number; income: number; transactionCount: number } | null;
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

  const allExpenses = txs.filter((t) => t.type === "expense");
  const expenses = allExpenses.filter((t) => !isInvestment(t.category));
  const investmentExpenses = allExpenses.filter((t) => isInvestment(t.category));
  const incomes = txs.filter((t) => t.type === "income");
  const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const capitalInvested = investmentExpenses.reduce((s, t) => s + Number(t.amount), 0);
  const capitalInvestedCount = investmentExpenses.length;
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
    .filter((t) => t.type === "expense" && !isInvestment(t.category))
    .reduce((s, t) => s + Number(t.amount), 0);
  const trendVsPrevMonth =
    prevSpent > 0 ? Math.round(((totalSpent - prevSpent) / prevSpent) * 100) : null;
  const prevMonthData =
    prevTxs.length > 0
      ? {
          spent: prevSpent,
          income: prevTxs
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + Number(t.amount), 0),
          transactionCount: prevTxs.length,
        }
      : null;

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
    year,
    month,
    monthLabel: label,
    totalSpent,
    capitalInvested,
    capitalInvestedCount,
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
    capitalInvested,
    capitalInvestedCount,
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
    prevMonthData,
    goalsProgress,
    narrativeTitle,
    coachQuote,
  };
}

/**
 * Genera la narrativa (titolo eroico + citazione Coach) tramite sistema a punti.
 * Il segnale con più punti vince; stessa scena ogni mese grazie all'hash deterministico.
 */
function buildNarrative(ctx: {
  year: number;
  month: number;
  monthLabel: string;
  totalSpent: number;
  capitalInvested: number;
  capitalInvestedCount: number;
  savedFromImpulses: number;
  savedImpulsesCount: number;
  topCategory: { name: string; amount: number; percent: number } | null;
  trendVsPrevMonth: number | null;
  netValue: number;
  daysActive: number;
}): { narrativeTitle: string; coachQuote: string } {
  const { year, month, monthLabel, capitalInvested, capitalInvestedCount, savedFromImpulses, savedImpulsesCount, topCategory, trendVsPrevMonth, netValue } = ctx;
  const M = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const hash = year * 12 + month;
  function pick<T>(items: T[]): T { return items[hash % items.length]; }

  // Sistema a punti
  const scores: Record<string, number> = {};

  if (capitalInvested > 200 && capitalInvestedCount >= 2) scores.investimento = 10;
  else if (capitalInvested > 0) scores.investimento = 3;

  if (savedFromImpulses >= 200 && savedImpulsesCount >= 3) scores.impulsi = 9;
  else if (savedFromImpulses >= 50) scores.impulsi = 4;

  if (trendVsPrevMonth !== null && trendVsPrevMonth <= -15) scores.trend_pos = 10;
  else if (trendVsPrevMonth !== null && trendVsPrevMonth <= -5) scores.trend_pos = 6;

  if (trendVsPrevMonth !== null && trendVsPrevMonth >= 20) scores.trend_neg = 7;

  if (netValue > 300) scores.bilancio = 8;
  else if (netValue > 0) scores.bilancio = 4;

  if (topCategory && topCategory.percent >= 50) scores.categoria = 6;

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const scenario = sorted[0]?.[0] ?? "default";

  switch (scenario) {
    case "investimento":
      if (capitalInvested > 200 && capitalInvestedCount >= 2) {
        return pick([
          {
            narrativeTitle: `${M} — il mese del costruttore`,
            coachQuote: `Hai investito ${capitalInvested.toFixed(0)}€ in ${capitalInvestedCount} operazioni. Non è una spesa — è capitale che smette di dormire e inizia a lavorare. Ogni euro investito oggi è un'ora che domani non dovrai vendere.`,
          },
          {
            narrativeTitle: `${M} — il mese del seminatore`,
            coachQuote: `${capitalInvested.toFixed(0)}€ piantati in ${capitalInvestedCount} versamenti. I semi finanziari non si vedono crescere subito — ma tra qualche anno ricorderai questo mese come il punto di partenza. Stai costruendo qualcosa di reale.`,
          },
          {
            narrativeTitle: `${M} — il mese del visionario`,
            coachQuote: `Chi investe pensa al domani mentre vive oggi. Questo mese hai fatto esattamente questo: ${capitalInvested.toFixed(0)}€ che cambieranno forma e torneranno moltiplicati. La visione precede sempre il risultato.`,
          },
        ]);
      }
      return pick([
        {
          narrativeTitle: `${M} — il mese del costruttore`,
          coachQuote: `Anche un primo passo conta. Hai messo ${capitalInvested.toFixed(0)}€ al lavoro invece di lasciarli fermi. La costanza nel tempo trasforma anche piccoli versamenti in qualcosa di significativo.`,
        },
        {
          narrativeTitle: `${M} — il mese del seminatore`,
          coachQuote: `${capitalInvested.toFixed(0)}€ investiti: il seme è piantato. Non importa quanto piccolo sia l'inizio — ciò che conta è la direzione. Il futuro si costruisce con decisioni come questa, ripetute nel tempo.`,
        },
        {
          narrativeTitle: `${M} — il mese del visionario`,
          coachQuote: `Hai scelto di mettere ${capitalInvested.toFixed(0)}€ al lavoro questo mese. È una scelta di mentalità prima che di numeri. Chi comincia a pensare al futuro oggi, lo vive meglio domani.`,
        },
      ]);

    case "impulsi":
      return pick([
        {
          narrativeTitle: `${M} — il mese del Guardiano`,
          coachQuote: `Hai detto di no ${savedImpulsesCount} volte. Ogni rifiuto è un piccolo atto di fedeltà verso il tuo futuro. ${savedFromImpulses.toFixed(0)}€ sono rimasti con te invece di andarsene nel nulla del consumo impulsivo. Questa è la disciplina che costruisce libertà.`,
        },
        {
          narrativeTitle: `${M} — il mese della Fortezza`,
          coachQuote: `${savedFromImpulses.toFixed(0)}€ salvati, ${savedImpulsesCount} impulsi respinti. Hai costruito muri invisibili attorno al tuo futuro finanziario. Non è privazione — è strategia. La fortezza non si vede finché non serve, ma quando serve è già lì.`,
        },
        {
          narrativeTitle: `${M} — il mese della Volontà`,
          coachQuote: `La volontà non è assenza di desiderio — è scegliere quale desiderio serve davvero. Questo mese hai scelto ${savedImpulsesCount} volte, lasciando ${savedFromImpulses.toFixed(0)}€ al tuo futuro invece che all'impulso del momento. Questo è autocontrollo concreto.`,
        },
      ]);

    case "trend_pos":
      return pick([
        {
          narrativeTitle: `${M} — il mese della svolta`,
          coachQuote: `Hai speso il ${Math.abs(trendVsPrevMonth!)}% in meno rispetto al mese scorso. Un cambiamento di questa scala non capita per caso — è il risultato di scelte consapevoli ripetute. Continua così e questo ritmo diventerà la tua normalità.`,
        },
        {
          narrativeTitle: `${M} — il mese del risveglio`,
          coachQuote: `Qualcosa è cambiato questo mese: le spese sono calate del ${Math.abs(trendVsPrevMonth!)}%. Chiamarlo risveglio non è retorica — è quello che succede quando smetti di agire per abitudine e inizi a scegliere. Questo mese hai scelto meglio.`,
        },
        {
          narrativeTitle: `${M} — il mese della disciplina`,
          coachQuote: `Un calo del ${Math.abs(trendVsPrevMonth!)}% rispetto al mese scorso non nasce dal nulla. Nasce da piccole decisioni quotidiane che si sommano. La disciplina non si sente mentre la eserciti — si vede solo quando guardi indietro, come stai facendo adesso.`,
        },
      ]);

    case "trend_neg":
      return pick([
        {
          narrativeTitle: `${M} — un mese da osservare`,
          coachQuote: `Le tue spese sono salite del ${trendVsPrevMonth}% rispetto al mese scorso. Non è un giudizio, è un'osservazione. A volte i mesi più costosi sono quelli più ricchi di vita — il dato è neutro, sei tu che sai cosa c'era dietro.`,
        },
        {
          narrativeTitle: `${M} — il mese della generosità`,
          coachQuote: `Hai speso di più questo mese — il ${trendVsPrevMonth}% in più rispetto al mese precedente. Forse era necessario, forse era atteso, forse era semplicemente vivere. L'importante è che tu sappia la differenza tra generosità verso te stesso e automatismo inconsapevole.`,
        },
        {
          narrativeTitle: `${M} — un mese vissuto in pieno`,
          coachQuote: `+${trendVsPrevMonth}% rispetto al mese scorso. I mesi più spesi sono spesso i più vissuti. La domanda da porti non è "ho speso troppo?" ma "ne valeva la pena?". Solo tu puoi rispondere — e la risposta cambia tutto.`,
        },
      ]);

    case "bilancio":
      if (netValue > 300) {
        return pick([
          {
            narrativeTitle: `${M} — il mese del surplus`,
            coachQuote: `Hai chiuso il mese con ${netValue.toFixed(0)}€ in più di quelli che sono usciti. È una vittoria silenziosa ma fondamentale: hai vissuto dentro i tuoi mezzi e ancora te ne resta. Questo è l'ingrediente dei sogni che si avverano.`,
          },
          {
            narrativeTitle: `${M} — il mese dell'abbondanza`,
            coachQuote: `${netValue.toFixed(0)}€ di bilancio positivo. L'abbondanza non è avere tutto — è avere più di quanto consumi. Questo mese ci sei riuscito, e ogni euro di surplus è un grado di libertà in più che ti stai regalando.`,
          },
          {
            narrativeTitle: `${M} — il mese della solidità`,
            coachQuote: `Un bilancio positivo di ${netValue.toFixed(0)}€ non è fortuna — è la somma di scelte quotidiane che si sono accumulate. La solidità finanziaria si costruisce esattamente così: un mese alla volta, una scelta alla volta.`,
          },
        ]);
      }
      return pick([
        {
          narrativeTitle: `${M} — il mese del surplus`,
          coachQuote: `Hai chiuso in positivo: le entrate hanno superato le uscite. Non importa il margine — quello che conta è la direzione. Ogni mese in verde è un passo verso la libertà finanziaria che stai costruendo.`,
        },
        {
          narrativeTitle: `${M} — il mese della solidità`,
          coachQuote: `Bilancio positivo questo mese. Niente di clamoroso, ma niente che si rompe. La solidità non è glamour — è la base su cui costruire tutto il resto. Stai tenendo la rotta.`,
        },
        {
          narrativeTitle: `${M} — il mese della costanza`,
          coachQuote: `Entrate maggiori delle uscite — semplice eppure potente. La costanza nel mantenere il bilancio positivo è più preziosa di un colpo di fortuna. Stai dimostrando di poterlo fare sistematicamente.`,
        },
      ]);

    case "categoria":
      return pick([
        {
          narrativeTitle: `${M} — sotto il segno di ${topCategory!.name}`,
          coachQuote: `Il ${topCategory!.percent}% delle tue spese è finito in ${topCategory!.name}. Non è giusto né sbagliato — è uno specchio. La domanda interessante è: rispecchia una priorità vera o è l'inerzia che decide per te?`,
        },
        {
          narrativeTitle: `${M} — il mese del ${topCategory!.name}`,
          coachQuote: `${topCategory!.name} ha dominato questo mese con il ${topCategory!.percent}% della spesa totale. Ogni euro racconta qualcosa di te. Questo mese racconta che ${topCategory!.name} era — consapevolmente o no — la tua priorità numero uno.`,
        },
        {
          narrativeTitle: `${M} — ${topCategory!.name} come priorità`,
          coachQuote: `Quando una categoria assorbe il ${topCategory!.percent}% delle spese, non è caso: è un messaggio. ${topCategory!.name} ha parlato forte questo mese. Nel prossimo hai una nuova occasione di scegliere se confermarlo o ribilanciare.`,
        },
      ]);

    default:
      return pick([
        {
          narrativeTitle: `${M} — un mese di equilibrio`,
          coachQuote: `Non ci sono state svolte drammatiche, in meglio o in peggio. Questo non è un fallimento: è la solidità di una pratica. Le grandi trasformazioni nascono dalla ripetizione paziente di scelte ordinarie. Tu stai costruendo proprio quello.`,
        },
        {
          narrativeTitle: `${M} — il mese della costanza`,
          coachQuote: `La costanza è la virtù meno celebrata della finanza personale. Non c'è stato niente di straordinario questo mese — e va benissimo. La crescita reale si costruisce nel silenzio dei mesi ordinari, non solo in quelli eclatanti.`,
        },
        {
          narrativeTitle: `${M} — il mese delle fondamenta`,
          coachQuote: `Mesi come questo sembrano invisibili, ma sono le fondamenta di tutto il resto. Stai tenendo la rotta — e farlo senza motivi clamorosi è in realtà la forma più sofisticata di autodisciplina finanziaria.`,
        },
        {
          narrativeTitle: `${M} — un mese di consapevolezza`,
          coachQuote: `Hai tracciato le tue spese, hai guardato i numeri, sei qui. Questo atto di consapevolezza, ripetuto mese dopo mese, è più potente di qualsiasi trucco finanziario. Il dato che hai davanti vale più di qualsiasi consiglio generico.`,
        },
      ]);
  }
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