import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Mappa price ID → piano ───────────────────────────────────
const PRICE_TO_PLAN: Record<string, "premium" | "pro"> = {
  pri_01krdva8kjak6s2kszq70z5rg8: "premium", // Premium mensile
  pri_01krdv8fvn03vmvarp5n57wc0c: "premium", // Premium annuale
  pri_01krdveqzjax8z5pty0c92re7d: "pro",     // Pro mensile
  pri_01krdvdhby1xgrkpf1ehfax1ss: "pro",     // Pro annuale
};

/**
 * Verifica la firma del webhook Paddle (HMAC-SHA256).
 * Paddle invia: Paddle-Signature: ts=TIMESTAMP;h1=HASH
 */
async function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): Promise<boolean> {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => p.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const payload = `${ts}:${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === h1;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verifica firma se il secret è configurato
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signatureHeader = request.headers.get("Paddle-Signature");
    const valid = await verifyPaddleSignature(rawBody, signatureHeader, webhookSecret);
    if (!valid) {
      console.error("Paddle webhook: firma non valida");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event.event_type as string;
  const data = event.data as Record<string, unknown> | undefined;
  if (!data) {
    return NextResponse.json({ ok: true });
  }

  // Client Supabase con service role (bypass RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const customData = data.custom_data as Record<string, string> | undefined;
  const userId = customData?.user_id;

  if (!userId) {
    console.warn("Paddle webhook: user_id mancante in custom_data", { eventType });
    return NextResponse.json({ ok: true });
  }

  if (eventType === "subscription.created" || eventType === "subscription.updated") {
    const items = data.items as Array<{ price: { id: string } }> | undefined;
    const priceId = items?.[0]?.price?.id;
    const plan = (priceId && PRICE_TO_PLAN[priceId]) || "free";

    const { error } = await supabase
      .from("users_profiles")
      .update({ plan })
      .eq("user_id", userId);

    if (error) {
      console.error("Paddle webhook: errore aggiornamento piano", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Paddle webhook: piano aggiornato a "${plan}" per user ${userId}`);
  }

  if (eventType === "subscription.canceled") {
    const { error } = await supabase
      .from("users_profiles")
      .update({ plan: "free" })
      .eq("user_id", userId);

    if (error) {
      console.error("Paddle webhook: errore reset piano", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Paddle webhook: piano resettato a "free" per user ${userId}`);
  }

  return NextResponse.json({ ok: true });
}
