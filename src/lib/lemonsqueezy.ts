import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function setupLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => console.error("Lemon Squeezy error:", error),
  });
}

export const VARIANT_IDS = {
  premium: {
    monthly: process.env.NEXT_PUBLIC_LS_VARIANT_MONTHLY || "1688665",
    annual: process.env.NEXT_PUBLIC_LS_VARIANT_ANNUAL || "1688645",
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_LS_VARIANT_PRO_MONTHLY || "1761854",
    annual: process.env.NEXT_PUBLIC_LS_VARIANT_PRO_ANNUAL || "1761846",
  },
};
