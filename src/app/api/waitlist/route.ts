import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email non valida" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    console.log("API Key presente:", !!apiKey);
    console.log("API Key primi 10 chars:", apiKey?.slice(0, 10));

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey || "",
      },
      body: JSON.stringify({
        email,
        listIds: [3],
        updateEnabled: true,
      }),
    });

    const responseText = await response.text();
    console.log("Brevo status:", response.status);
    console.log("Brevo response:", responseText);

    if (response.status === 200 || response.status === 201 || response.status === 204) {
      return NextResponse.json({ success: true });
    }

    const error = JSON.parse(responseText || "{}");
    if (error.code === "duplicate_parameter") {
      return NextResponse.json({ success: true, message: "Sei già in lista!" });
    }

    return NextResponse.json({ error: "Errore Brevo: " + responseText }, { status: 500 });

  } catch (err) {
    console.error("API Waitlist Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}