"use client";

import { useState, useTransition } from "react";
import { Tag, Plus, Trash2, Zap } from "lucide-react";
import Link from "next/link";
import {
  createCustomCategory,
  deleteCustomCategory,
  type CustomCategory,
} from "../categories-actions";
import { SectionCard, FeedbackLine } from "./section-primitives";

const EMOJI_OPTIONS = [
  "🏠", "🚗", "✈️", "🐾", "💊", "🎓", "💼", "🎁",
  "🏋️", "🎵", "📱", "🌿", "☕", "🍕", "👗", "🔧",
];

const COLOR_OPTIONS = [
  "#A88BFA", "#E879F9", "#60A5FA", "#67E8F9",
  "#10B981", "#F59E0B", "#F87171", "#C084FC",
];

export function CustomCategoriesSection({
  plan,
  initialCategories,
}: {
  plan: string;
  initialCategories: CustomCategory[];
}) {
  const [categories, setCategories] = useState<CustomCategory[]>(initialCategories);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏠");
  const [color, setColor] = useState("#A88BFA");
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isPremium = plan === "premium" || plan === "pro";

  function flash(type: "saved" | "error", msg: string) {
    setStatus(type);
    setMessage(msg);
    setTimeout(() => setStatus("idle"), 2500);
  }

  function handleAdd() {
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createCustomCategory(name.trim(), emoji, color);
      if (res.error) { flash("error", res.error); return; }
      setCategories((prev) => [
        ...prev,
        { id: Date.now().toString(), name: name.trim(), emoji, color },
      ]);
      setName("");
      flash("saved", "Categoria aggiunta");
    });
  }

  function handleDelete(id: string, catName: string) {
    startTransition(async () => {
      const res = await deleteCustomCategory(id);
      if (res.error) { flash("error", res.error); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      flash("saved", `"${catName}" rimossa`);
    });
  }

  return (
    <SectionCard
      icon={<Tag className="h-4 w-4" strokeWidth={1.8} />}
      title="Categorie personalizzate"
      subtitle="Crea le tue categorie per organizzare le spese"
    >
      {!isPremium ? (
        <div className="rounded-[12px] border border-iri-violet/20 bg-iri-violet/[0.05] p-4">
          <p className="mb-3 text-[13px] text-ink-secondary">
            Le categorie personalizzate sono disponibili dal piano Premium.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-r from-iri-violet to-iri-magenta px-4 py-2 text-[12px] font-medium text-white transition-all hover:opacity-90"
          >
            <Zap className="h-3.5 w-3.5" />
            Upgrade a Premium
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Lista categorie esistenti */}
          {categories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center gap-3 rounded-[10px] border border-white/[0.04] bg-white/[0.01] px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                >
                  <span className="text-[18px]">{cat.emoji}</span>
                  <span className="flex-1 text-[13px] text-ink-primary">{cat.name}</span>
                  <span
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ background: cat.color }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={isPending}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/25 text-red-300/80 opacity-0 transition-all duration-[200ms] hover:border-red-500/50 hover:bg-red-500/[0.1] hover:text-red-300 group-hover:opacity-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {categories.length === 0 && (
            <p className="py-2 text-center text-[12px] text-ink-secondary">
              Nessuna categoria personalizzata ancora
            </p>
          )}

          {/* Form aggiungi */}
          {categories.length < 10 && (
            <div className="rounded-[12px] border border-dashed border-white/[0.1] p-4">
              <p className="eyebrow mb-3 text-[10px]">Nuova categoria</p>

              {/* Nome */}
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Nome categoria (max 20 caratteri)"
                className="mb-3 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-ink-primary placeholder:text-ink-muted focus:border-iri-violet/40 focus:outline-none"
              />

              {/* Emoji */}
              <p className="mb-1.5 text-[11px] text-ink-secondary">Emoji</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`flex h-9 w-9 items-center justify-center rounded-[8px] border text-[18px] transition-all ${
                      emoji === e
                        ? "border-iri-violet/60 bg-iri-violet/[0.15]"
                        : "border-white/[0.06] hover:border-white/[0.16]"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              {/* Colore */}
              <p className="mb-1.5 text-[11px] text-ink-secondary">Colore</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      color === c ? "border-white/80 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!name.trim() || isPending}
                className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-iri-violet/40 bg-iri-violet/[0.1] py-2 text-[12px] font-medium text-iri-pale transition-all hover:bg-iri-violet/[0.18] disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                Aggiungi categoria
              </button>
            </div>
          )}

          {categories.length >= 10 && (
            <p className="text-center text-[12px] text-ink-secondary">
              Limite di 10 categorie raggiunto
            </p>
          )}

          <FeedbackLine status={status} message={message} />
        </div>
      )}
    </SectionCard>
  );
}
