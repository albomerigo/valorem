import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/*
-- Esegui questa query SQL in Supabase per creare la tabella:

CREATE TABLE landing_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text,
  text text NOT NULL,
  stars integer DEFAULT 5,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
*/

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("landing_reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (err: any) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, role, text, stars } = await req.json();

    if (!name || !text || !stars) {
      return NextResponse.json(
        { error: "Nome, recensione e valutazione sono obbligatori." },
        { status: 400 }
      );
    }

    const parsedStars = parseInt(stars, 10);
    if (isNaN(parsedStars) || parsedStars < 1 || parsedStars > 5) {
      return NextResponse.json(
        { error: "La valutazione deve essere compresa tra 1 e 5." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("landing_reviews")
      .insert({
        name,
        role: role || null,
        text,
        stars: parsedStars,
        approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting review:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    console.error("Reviews submit error:", err);
    return NextResponse.json({ error: "Qualcosa è andato storto." }, { status: 500 });
  }
}
