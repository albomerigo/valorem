/**
 * Valorem Score — 0 to 100 measure of monthly financial health.
 */
export function calculateValoremScore(data: {
  savingsPercent: number;
  trendVsLastMonth: number;
  impulsiResistiti: number;
  totalSpent: number;
  monthlyFree: number;
  goalsOnTrack: number;
  totalGoals: number;
  transactionCount: number;
}): {
  score: number;
  label: string;
  color: string;
  breakdown: Record<string, number>;
} {
  const {
    savingsPercent,
    trendVsLastMonth,
    impulsiResistiti,
    totalSpent,
    monthlyFree,
    goalsOnTrack,
    totalGoals,
  } = data;

  // Risparmio — 30 punti
  const savingsPoints = Math.min(30, (savingsPercent / 100) * 30);

  // Budget rispettato — 25 punti
  let budgetPoints = 25;
  if (monthlyFree > 0 && totalSpent > monthlyFree) {
    budgetPoints = Math.max(0, 25 - ((totalSpent / monthlyFree) - 1) * 50);
  }

  // Trend miglioramento — 20 punti
  let trendPoints = 0;
  if (trendVsLastMonth <= -10) trendPoints = 20;
  else if (trendVsLastMonth <= 0) trendPoints = 10;
  else if (trendVsLastMonth <= 10) trendPoints = 5;

  // Disciplina impulsi — 15 punti
  const impulsiPoints = Math.min(15, impulsiResistiti * 3);

  // Obiettivi — 10 punti
  const goalsPoints =
    totalGoals > 0 ? (goalsOnTrack / totalGoals) * 10 : 5;

  const score = Math.round(
    Math.min(100, Math.max(0,
      savingsPoints + budgetPoints + trendPoints + impulsiPoints + goalsPoints
    ))
  );

  let label: string;
  let color: string;

  if (score >= 85) {
    label = "Eccellente";
    color = "#10B981";
  } else if (score >= 70) {
    label = "Ottimo";
    color = "#60A5FA";
  } else if (score >= 55) {
    label = "Buono";
    color = "#A88BFA";
  } else if (score >= 40) {
    label = "In crescita";
    color = "#F59E0B";
  } else {
    label = "Da migliorare";
    color = "#F87171";
  }

  return {
    score,
    label,
    color,
    breakdown: {
      risparmio: Math.round(savingsPoints),
      budget: Math.round(budgetPoints),
      trend: Math.round(trendPoints),
      impulsi: Math.round(impulsiPoints),
      obiettivi: Math.round(goalsPoints),
    },
  };
}
