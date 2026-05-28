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

  // TODO: Quando avremo i subscription_id degli utenti nel DB, usare:
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("lemon_subscription_id")
  //   .eq("id", user.id)
  //   .single();
  //
  // Se abbiamo un subscription_id reale, possiamo chiamare l'API LS:
  // const res = await fetch(
  //   `https://api.lemonsqueezy.com/v1/subscriptions/${profile.lemon_subscription_id}/customer-portal`,
  //   { headers: { Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}` } }
  // );
  // const { data } = await res.json();
  // return NextResponse.json({ url: data.attributes.urls.customer_portal });

  // Fallback: portale generico
  return NextResponse.json({ url: "https://app.lemonsqueezy.com/billing" });
}
