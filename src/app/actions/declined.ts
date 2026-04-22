"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type DeclineSimulationPayload = {
  merchant: string;
  category: string | null;
  amount: number;
};

/**
 * Registra una simulazione rifiutata nel cimitero.
 */
export async function declineSimulation(payload: DeclineSimulationPayload) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };
  if (payload.amount <= 0) return { error: "Importo non valido" };

  const { error } = await supabase.from("declined_simulations").insert({
    user_id: user.id,
    merchant: payload.merchant.trim() || "Acquisto rifiutato",
    category: payload.category,
    amount: payload.amount,
  });

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Rimuove un record dal cimitero (es. se l'utente cambia idea).
 */
export async function deleteDeclinedSimulation(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("declined_simulations")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { success: true };
}