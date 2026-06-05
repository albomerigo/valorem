import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "",
      },
      body: JSON.stringify({
        email,
        listIds: [3],
        updateEnabled: true,
      }),
    });

  if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
      const error = await response.json().catch(() => ({}));
      if (error.code === "duplicate_parameter") {
        return NextResponse.json({ success: true, message: "Sei già in lista!" });
      }
      return NextResponse.json({ error: "Errore Brevo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API Waitlist Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
