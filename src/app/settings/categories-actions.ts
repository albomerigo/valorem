"use server";

/*
  SQL da eseguire su Supabase Dashboard → SQL Editor:

  CREATE TABLE custom_categories (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    emoji      TEXT NOT NULL DEFAULT '•',
    color      TEXT NOT NULL DEFAULT '#A88BFA',
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX custom_categories_user_id_idx ON custom_categories(user_id);

  ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own categories"
    ON custom_categories FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own categories"
    ON custom_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own categories"
    ON custom_categories FOR DELETE
    USING (auth.uid() = user_id);
*/

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CustomCategory = {
  id: string;
  name: string;
  emoji: string;
  color: string;
};

export async function getCustomCategories(): Promise<CustomCategory[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("custom_categories")
    .select("id, name, emoji, color")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function createCustomCategory(
  name: string,
  emoji: string,
  color: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato" };

  const trimmed = name.trim().slice(0, 20);
  if (!trimmed) return { error: "Il nome è obbligatorio" };

  // Limite 10 categorie custom
  const { count } = await supabase
    .from("custom_categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= 10) return { error: "Limite di 10 categorie raggiunto" };

  const { error } = await supabase.from("custom_categories").insert({
    user_id: user.id,
    name: trimmed,
    emoji,
    color,
  });

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function deleteCustomCategory(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("custom_categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}
