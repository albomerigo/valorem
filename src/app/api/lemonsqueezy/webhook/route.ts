import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  // Verifica firma
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    meta?: {
      event_name?: string;
      custom_data?: { user_id?: string };
    };
    data?: {
      attributes?: { status?: string; variant_id?: any };
    };
  };

  const eventName = payload.meta?.event_name;
  const userId = payload.meta?.custom_data?.user_id;

  if (!userId) return NextResponse.json({ ok: true });

  const supabase = await createClient();

  if (
    eventName === "subscription_created" ||
    eventName === "subscription_updated"
  ) {
    const status = payload.data?.attributes?.status;
    const variantId = payload.data?.attributes?.variant_id?.toString();
    const proVariants = ["1761854", "1761846"];
    const plan = status === "active" ? (proVariants.includes(variantId || "") ? "pro" : "premium") : "free";

    await supabase
      .from("users_profiles")
      .update({ plan })
      .eq("id", userId);
  }

  if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    await supabase
      .from("users_profiles")
      .update({ plan: "free" })
      .eq("id", userId);
  }

  return NextResponse.json({ ok: true });
}
