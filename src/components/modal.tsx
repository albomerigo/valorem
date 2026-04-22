"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Modal base di Valorem. Si apre/chiude in base a `open`.
 * Bordo iridescente, aura dietro, chiusura con ESC o click fuori.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(6, 5, 8, 0.75)" }}
      onClick={onClose}
    >
     <div
        className="border-gradient relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-gradient-to-b from-surface-3 to-surface-2 p-5 md:p-7 max-h-[90vh] overflow-y-auto md:max-h-none"
        onClick={(e) => e.stopPropagation()}
      >
        <AuraBackdrop />

        <div className="relative z-10">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="m-0 font-serif text-[22px] font-normal italic text-ink-primary">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-[12px] text-ink-secondary">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-ink-muted transition-colors hover:border-white/[0.18] hover:text-ink-primary"
              title="Chiudi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function AuraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
      <div
        className="absolute left-1/2 top-0 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/3 rounded-full animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.4) 25%, rgba(232,121,249,0.3) 50%, rgba(96,165,250,0.35) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}