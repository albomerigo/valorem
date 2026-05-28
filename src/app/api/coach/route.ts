import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const prompts: Record<string, (ctx: Record<string, unknown>) => string> = {
  analyze_month: (ctx) => `Sei Valorem Coach, un coach finanziario italiano empatico e diretto. NON sei un consulente finanziario — sei un osservatore delle abitudini. Rispondi SEMPRE in italiano in 3-4 frasi max, tono caldo e personale.

L'utente si chiama ${ctx.name}.
Questo mese ha speso €${ctx.totalSpent} in ${ctx.transactionCount} transazioni.
La categoria principale è ${ctx.topCategory} (€${ctx.topCategoryAmount}).
Il suo budget libero mensile è €${ctx.monthlyFree}.
Safe-to-Spend oggi: €${ctx.safeToSpend}.

Analizza brevemente il suo mese. Sii specifico sui suoi dati reali.`,

  save_more: (ctx) => `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${ctx.name}.
Questo mese ha speso €${ctx.totalSpent} su un budget di €${ctx.monthlyFree}.
Le sue categorie di spesa sono: ${ctx.categories}.
Ha ${ctx.daysLeft} giorni rimasti nel mese.

Dai 2 consigli pratici e specifici su come potrebbe risparmiare di più questo mese.`,

  top_category: (ctx) => `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${ctx.name}.
La sua categoria di spesa principale è ${ctx.topCategory} con €${ctx.topCategoryAmount} (${ctx.topCategoryPercent}% del totale).

Commenta questa abitudine in modo empatico e non giudicante. Fai una domanda riflessiva alla fine.`,

  goals_check: (ctx) => `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${ctx.name}.
Ha ${ctx.goalsCount} obiettivi attivi.
Il suo Safe-to-Spend oggi è €${ctx.safeToSpend}.
Questo mese ha speso €${ctx.totalSpent} su €${ctx.monthlyFree} di budget.

Valuta se è in linea con i suoi obiettivi e dai un incoraggiamento specifico.`,

  monthly_trend: (ctx) => `Sei Valorem Coach, un coach finanziario italiano empatico. Rispondi in italiano in 3-4 frasi max.

L'utente si chiama ${ctx.name}.
Questo mese ha speso €${ctx.totalSpent}.
Il mese scorso aveva speso €${ctx.prevMonthSpent}.
La differenza è ${Number(ctx.trendPercent) > 0 ? "+" : ""}${ctx.trendPercent}%.

Commenta questo andamento in modo personale e motivante.`,
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { promptType, context } = await req.json();

  const promptFn = prompts[promptType];
  if (!promptFn) return NextResponse.json({ error: "Tipo prompt non valido" }, { status: 400 });

  const prompt = promptFn(context);

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" 
    ? message.content[0].text 
    : "Il Coach non è disponibile al momento.";

  return NextResponse.json({ message: text });
}