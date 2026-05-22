import { NextRequest, NextResponse } from "next/server";
import { setupLemonSqueezy } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const { variantId } = await req.json();

  setupLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID || "123456";

  const checkout = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: user.email,
      custom: { user_id: user.id },
    },
    checkoutOptions: {
      embed: false,
      media: false,
      logo: true,
    },
    productOptions: {
      redirectUrl: `${
        process.env.NEXT_PUBLIC_APP_URL ||
        "https://valorem-albomerigo-2081s-projects.vercel.app"
      }/pricing?success=true`,
      receiptButtonText: "Torna a Valorem",
      receiptThankYouNote: "Benvenuto in Valorem Premium! 🎉",
    },
  });

  const url = checkout.data?.data?.attributes?.url;
  if (!url)
    return NextResponse.json(
      { error: "Errore creazione checkout" },
      { status: 500 }
    );

  return NextResponse.json({ url });
}
