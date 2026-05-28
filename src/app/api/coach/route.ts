import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { promptType, context } = await req.json();

  const prompts: Record<string, string> = {
    analyze_month: `Sei Valorem Coach, un coach finanziario italiano empatico e diretto. NON sei un consulente finanziario — sei un osservatore delle abitudini. Rispondi SEMPRE in italiano in 3-4 frasi max, tono caldo e personale.

L'utente si chiama ${context.name}.
Questo mese ha speso €${context.totalSpent} in ${context.transactionCount} transazioni.
La categoria principale è ${context.topCategory} (€${context.topCategoryAmount}).
Il suo budget libero mensile è €${context.monthlyFree}.
Safe-to-Spend oggi: €${context.safeToSpend}.

Analizza brevemente il suo mese. Sii specifico sui suoi dati reali.`,

    save_more: `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${context.name}.
Questo mese ha speso €${context.totalSpent} su un budget di €${context.monthlyFree}.
Le sue categorie di spesa sono: ${context.categories}.
Ha ${context.daysLeft} giorni rimasti nel mese.

Dai 2 consigli pratici e specifici su come potrebbe risparmiare di più questo mese.`,

    top_category: `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${context.name}.
La sua categoria di spesa principale è ${context.topCategory} con €${context.topCategoryAmount} (${context.topCategoryPercent}% del totale).

Commenta questa abitudine in modo empatico e non giudicante. Fai una domanda riflessiva alla fine.`,

    goals_check: `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${context.name}.
Ha ${context.goalsCount} obiettivi attivi.
Il suo Safe-to-Spend oggi è €${context.safeToSpend}.
Questo mese ha speso €${context.totalSpent} su €${context.monthlyFree} di budget.

Valuta se è in linea con i suoi obiettivi e dai un incoraggiamento specifico.`,

    monthly_trend: `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${context.name}.
Questo mese ha speso €${context.totalSpent}.
Il mese scorso aveva speso €${context.prevMonthSpent}.
La differenza è ${context.trendPercent > 0 ? "+" : ""}${context.trendPercent}%.

Commenta questo andamento in modo personale e motivante.`,
  };

  const prompt = prompts[promptType];
  if (!prompt)
    return NextResponse.json(
      { error: "Tipo prompt non valido" },
      { status: 400 }
    );

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    }),
  });

  const data = await response.json();
console.log("Gemini response:", JSON.stringify(data));
const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Il Coach non è disponibile al momento.";
  return NextResponse.json({ message: text });
}
