"use client";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { NewTransactionModal } from "./new-transaction-modal";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";
import { hapticLight } from "@/lib/haptics";
import { playClick } from "@/lib/sounds";

export function FabButton() {
  const [open, setOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCustomCategories);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => { hapticLight(); playClick(); setOpen(true); }}
        title="Nuova transazione"
        className="md:hidden fixed bottom-[96px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue text-white shadow-[0_12px_32px_-6px_rgba(168,139,250,0.6)] transition-all duration-[300ms] [background-size:200%_200%] animate-gradient-shift [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] active:scale-95 active:shadow-[0_6px_16px_-4px_rgba(168,139,250,0.5)]"
      >
        <Plus className="h-6 w-6" strokeWidth={2.2} />
      </button>
      <NewTransactionModal
        isOpen={open}
        onClose={() => setOpen(false)}
        customCategories={customCategories}
      />
    </>
  );
}