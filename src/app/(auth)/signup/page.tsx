"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "../auth-shell";
import { signUp } from "../actions";

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Benvenuto in Valorem"
      subtitle="Inizia a tradurre denaro in tempo"
      footer={
        <>
          Hai già un account?{" "}
          <Link href="/signin" className="text-iri-pale hover:text-iri-violet transition-colors">
            Accedi
          </Link>
        </>
      }
    >
      <form action={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome" name="name" type="text" placeholder="Marco" />
        <Field label="Email" name="email" type="email" placeholder="marco@email.com" />
        <Field label="Password" name="password" type="password" placeholder="Minimo 6 caratteri" minLength={6} />

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2 text-[12px] text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="relative mt-2 overflow-hidden rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] transition-all duration-[400ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(168,139,250,0.7)] disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? "Creazione account…" : "Crea account"}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-secondary">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        minLength={minLength}
        required
        className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-[14px] text-ink-primary placeholder:text-ink-muted transition-colors focus:border-iri-violet/40 focus:bg-white/[0.05] focus:outline-none"
      />
    </label>
  );
}