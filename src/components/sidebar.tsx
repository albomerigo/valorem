"use client";

import Link from "next/link";
import {
  Home,
  Target,
  Settings,
  Plus,
  Ghost,
  ListOrdered,
  Sparkles,
  History,
  Upload,
  User,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NewTransactionModal } from "./new-transaction-modal";
import { usePlan } from "@/hooks/usePlan";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";

export type Route =
  | "dashboard"
  | "activity"
  | "cimitero"
  | "goals"
  | "coach"
  | "settings"
  | "storico"
  | "import"
  | "novita"
  | "profilo"
  | "rimborsi";

// Struttura a gruppi con separatori
const navGroups: {
  label: string;
  items: { icon: typeof Home; label: string; route: Route; href: string }[];
}[] = [
  {
    label: "Navigazione",
    items: [
      { icon: Home, label: "Dashboard", route: "dashboard", href: "/" },
      { icon: ListOrdered, label: "Attività", route: "activity", href: "/attivita" },
    ],
  },
  {
    label: "Finanze",
    items: [
      { icon: Ghost, label: "Cimitero", route: "cimitero", href: "/cimitero" },
      { icon: Target, label: "Obiettivi", route: "goals", href: "/obiettivi" },
      { icon: Sparkles, label: "Coach", route: "coach", href: "/coach" },
    ],
  },
  {
    label: "Dati",
    items: [
      { icon: History, label: "Storico", route: "storico", href: "/storico" },
      { icon: Upload, label: "Importa", route: "import", href: "/import" },
      { icon: Newspaper, label: "Novità", route: "novita", href: "/novita" },
    ],
  },
];

export function Sidebar({
  activeRoute = "dashboard",
  userName,
}: {
  activeRoute?: Route;
  userName?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { plan } = usePlan();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

  useEffect(() => {
    getCustomCategories().then(setCustomCategories);
  }, []);

  const planLabel =
    plan === "free" ? "Upgrade" : plan === "premium" ? "Premium" : "Pro";
  const planColor =
    plan === "free" ? "#A88BFA" : plan === "premium" ? "#F59E0B" : "#C4B5FD";
  const planBg =
    plan === "free"
      ? "rgba(168,139,250,0.12)"
      : plan === "premium"
      ? "rgba(245,158,11,0.1)"
      : "rgba(168,139,250,0.18)";
  const planBorder =
    plan === "free"
      ? "1px solid rgba(168,139,250,0.3)"
      : plan === "premium"
      ? "1px solid rgba(245,158,11,0.3)"
      : "1px solid rgba(168,139,250,0.5)";

  return (
    <>
      <aside
        className="group fixed left-0 top-0 z-20 hidden h-screen w-[64px] overflow-hidden transition-all duration-300 hover:w-[220px] md:flex flex-col items-start gap-0 py-5 border-r border-white/[0.06]"
        style={{ background: "#0D0A1E", borderRight: "1px solid rgba(168,139,250,0.08)" }}
      >
        {/* Logo */}
        <div className="mb-3 flex h-10 w-full flex-shrink-0 items-center px-[13px]">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue font-serif italic text-base font-medium text-[#0A0812] shadow-[0_4px_20px_-4px_rgba(168,139,250,0.5)] [background-size:200%_200%] animate-gradient-shift">
            v
          </div>
          <span className="ml-3 whitespace-nowrap font-serif italic text-[16px] text-ink-primary opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
            valorem
          </span>
        </div>

        {/* Add transaction */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Nuova transazione"
          className="mb-3 flex h-9 w-full flex-shrink-0 items-center rounded-[10px] border border-iri-violet/30 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.10] px-[13px] text-iri-pale transition-all duration-[300ms] hover:border-iri-violet/60 hover:from-iri-violet/[0.28] hover:text-ink-primary hover:shadow-[0_0_16px_rgba(168,139,250,0.35)]"
        >
          <Plus className="h-4 w-4 flex-shrink-0" strokeWidth={2.2} />
          <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
            Nuova transazione
          </span>
        </button>

        {/* Nav groups */}
        {navGroups.map((group, gi) => (
          <div key={group.label} className="w-full">
            {/* Separatore con label (visibile solo quando espansa) */}
            {gi > 0 && (
              <div className="my-2 flex items-center gap-2 px-[13px]">
                <div
                  className="h-[1px] flex-1"
                  style={{ background: "rgba(168,139,250,0.1)" }}
                />
                <span
                  className="whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.18em] opacity-0 transition-all duration-200 delay-75 group-hover:opacity-100"
                  style={{ color: "rgba(168,139,250,0.5)" }}
                >
                  {group.label}
                </span>
                <div
                  className="h-[1px] flex-1"
                  style={{ background: "rgba(168,139,250,0.1)" }}
                />
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.label}
                {...item}
                active={item.route === activeRoute}
              />
            ))}
          </div>
        ))}

        <div className="flex-1" />

        {/* Separatore Strumenti */}
        <div className="my-2 flex w-full items-center gap-2 px-[13px]">
          <div
            className="h-[1px] flex-1"
            style={{ background: "rgba(168,139,250,0.1)" }}
          />
          <span
            className="whitespace-nowrap text-[8px] font-medium uppercase tracking-[0.18em] opacity-0 transition-all duration-200 delay-75 group-hover:opacity-100"
            style={{ color: "rgba(168,139,250,0.5)" }}
          >
            Account
          </span>
          <div
            className="h-[1px] flex-1"
            style={{ background: "rgba(168,139,250,0.1)" }}
          />
        </div>

        {/* Plan */}
        <Link
          href="/pricing"
          title={planLabel}
          className="flex h-9 w-full flex-shrink-0 items-center rounded-[10px] px-[13px] transition-all duration-[300ms] hover:opacity-80"
          style={{ background: planBg, border: planBorder }}
        >
          <Sparkles
            className="h-4 w-4 flex-shrink-0"
            style={{ color: planColor }}
            strokeWidth={1.8}
          />
          <span
            className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0"
            style={{ color: planColor }}
          >
            {planLabel}
          </span>
        </Link>

        {/* Settings */}
        <NavLink
          icon={Settings}
          label="Impostazioni"
          route="settings"
          href="/settings"
          active={activeRoute === "settings"}
        />

        {/* Profilo */}
        <Link
          href="/profilo"
          title={userName || "Profilo"}
          className={cn(
            "relative flex h-9 w-full flex-shrink-0 items-center rounded-[10px] px-[13px] transition-all duration-[300ms]",
            activeRoute === "profilo"
              ? "bg-iri-violet/[0.15] text-ink-primary"
              : "text-ink-muted hover:bg-iri-violet/[0.12] hover:text-ink-primary"
          )}
        >
          {activeRoute === "profilo" && (
            <span className="absolute -left-[1px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm bg-gradient-to-b from-iri-violet to-iri-magenta shadow-[0_0_12px_rgba(168,139,250,0.8)]" />
          )}
          <div className="relative flex-shrink-0">
            <User
              className={cn(
                "transition-all duration-300",
                "h-4 w-4 group-hover:h-5 group-hover:w-5"
              )}
            />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
          </div>
          <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
            {(() => {
              const s = userName || "Profilo";
              return s.length > 18 ? s.slice(0, 17) + "…" : s;
            })()}
          </span>
        </Link>
      </aside>

      <NewTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customCategories={customCategories}
      />
    </>
  );
}

function NavLink({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  route: Route;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "relative flex h-9 w-full flex-shrink-0 items-center rounded-[10px] px-[13px] transition-all duration-[300ms]",
        active
          ? "bg-iri-violet/[0.15] text-ink-primary"
          : "text-ink-muted hover:bg-iri-violet/[0.12] hover:text-ink-primary"
      )}
    >
      {active && (
        <span className="absolute -left-[1px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm bg-gradient-to-b from-iri-violet to-iri-magenta shadow-[0_0_12px_rgba(168,139,250,0.8)]" />
      )}
      <Icon
        className="flex-shrink-0 transition-all duration-300 h-4 w-4 group-hover:h-5 group-hover:w-5"
      />
      <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
        {label}
      </span>
    </Link>
  );
}
