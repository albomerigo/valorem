import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users_profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "free";
  if (plan === "free") {
    return NextResponse.json(
      { error: "Feature disponibile dal piano Premium" },
      { status: 403 }
    );
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false });

  const header = "Data,Descrizione,Categoria,Tipo,Importo,Ricorrente,Note";
  const rows = (transactions || []).map((tx) => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      tx.transaction_date,
      escape(tx.merchant || ""),
      tx.category || "",
      tx.type === "expense" ? "Uscita" : "Entrata",
      tx.amount,
      tx.recurring ? "Si" : "No",
      escape(tx.notes || ""),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="valorem-export.csv"',
    },
  });
}
