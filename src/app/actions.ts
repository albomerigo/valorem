"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/signin");
}

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════

export async function createTransaction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const merchant = formData.get("merchant") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as "income" | "expense";
  const transaction_date = formData.get("transaction_date") as string;
  const recurring = formData.get("recurring") === "true";
  const notes = formData.get("notes") as string;

  if (!amount || !merchant || !category || !type || !transaction_date) {
    return { success: false, error: "Campi obbligatori mancanti" };
  }

  // Feature gating: max 15 transactions/month for free plan
  const { data: profileData } = await supabase
    .from("users_profiles")
    .select("plan")
    .eq("user_id", user.id)
    .single();

  const plan = profileData?.plan || "free";
  if (plan === "free") {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const { count } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("transaction_date", monthStart);

    if ((count ?? 0) >= 15) {
      return { success: false, error: "LIMIT_REACHED" };
    }
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount,
    merchant,
    category,
    type,
    transaction_date,
    recurring,
    notes,
  });

  if (error) {
    console.error("Errore createTransaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/attivita");

  return { success: true };
}

export async function updateTransaction(
  transactionId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const merchant = formData.get("merchant") as string;
  const category = formData.get("category") as string;
  const type = formData.get("type") as "income" | "expense";
  const transaction_date = formData.get("transaction_date") as string;
  const recurring = formData.get("recurring") === "true";
  const notes = formData.get("notes") as string;

  if (!amount || !merchant || !category || !type || !transaction_date) {
    return { success: false, error: "Campi obbligatori mancanti" };
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      amount,
      merchant,
      category,
      type,
      transaction_date,
      recurring,
      notes,
    })
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Errore updateTransaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/attivita");

  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Errore deleteTransaction:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/attivita");

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// IMPULSI (Cimitero)
// ═══════════════════════════════════════════════════════════

export async function createDeclinedImpulse(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const item_name = formData.get("item_name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const reason = formData.get("reason") as string;

  const { error } = await supabase.from("declined_impulses").insert({
    user_id: user.id,
    item_name,
    amount,
    category,
    reason,
  });

  if (error) {
    console.error("Errore createDeclinedImpulse:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/cimitero");

  return { success: true };
}

export async function deleteDeclinedImpulse(impulseId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const { error } = await supabase
    .from("declined_impulses")
    .delete()
    .eq("id", impulseId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/cimitero");

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// OBIETTIVI
// ═══════════════════════════════════════════════════════════

export async function createGoal(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const name = formData.get("name") as string;
  const target_amount = parseFloat(formData.get("target_amount") as string);
  const current_amount = parseFloat(
    (formData.get("current_amount") as string) || "0"
  );
  const emoji = formData.get("emoji") as string;

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    name,
    target_amount,
    current_amount,
    emoji,
  });

  if (error) {
    console.error("Errore createGoal:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/obiettivi");

  return { success: true };
}

export async function depositToGoal(goalId: string, amount: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("current_amount")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { success: false, error: "Obiettivo non trovato" };
  }

  const newAmount = Number(goal.current_amount) + amount;

  const { error } = await supabase
    .from("goals")
    .update({ current_amount: newAmount })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/obiettivi");

  return { success: true };
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/obiettivi");

  return { success: true };
}

// ═══════════════════════════════════════════════════════════
// IMPOSTAZIONI PROFILO
// ═══════════════════════════════════════════════════════════

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  const name = formData.get("name") as string;
  const monthly_income = parseFloat(formData.get("monthly_income") as string);
  const income_type = formData.get("income_type") as string;
  const time_metric = formData.get("time_metric") as string;
  const monthly_hours = formData.get("monthly_hours")
    ? parseFloat(formData.get("monthly_hours") as string)
    : null;
  const work_days = formData.get("work_days")
    ? parseFloat(formData.get("work_days") as string)
    : null;
  const savings_goal = parseFloat(
    (formData.get("savings_goal") as string) || "0"
  );
  const safe_mode = formData.get("safe_mode") as string;

  const { error } = await supabase
    .from("users_profiles")
    .update({
      name,
      monthly_income,
      income_type,
      time_metric,
      monthly_hours,
      work_days,
      savings_goal,
      safe_mode,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Errore updateProfile:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/settings");

  return { success: true };
}

export async function updateFixedCosts(
  costs: { name: string; amount: number }[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autenticato" };
  }

  // Cancella tutti i costi fissi esistenti e reinserisce
  await supabase.from("fixed_costs").delete().eq("user_id", user.id);

  if (costs.length > 0) {
    const { error } = await supabase.from("fixed_costs").insert(
      costs.map((c) => ({
        user_id: user.id,
        name: c.name,
        amount: c.amount,
      }))
    );

    if (error) {
      console.error("Errore updateFixedCosts:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/");
  revalidatePath("/settings");

  return { success: true };
}