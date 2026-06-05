import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/contacts/lists/3",
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY || "",
        },
        next: { revalidate: 60 } // cache list count for 60 seconds
      }
    );
    
    if (!response.ok) {
      throw new Error("Brevo request failed");
    }

    const data = await response.json();
    const count = typeof data.totalSubscribers === "number" ? data.totalSubscribers : 23;
    const remaining = Math.max(0, 100 - count);
    
    return NextResponse.json({ count, remaining });
  } catch (err) {
    console.error("API Waitlist Count Fetch Error:", err);
    // Return default fallback numbers on fetch error or when API key is missing
    return NextResponse.json({ count: 23, remaining: 77 });
  }
}
