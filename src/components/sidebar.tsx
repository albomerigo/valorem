"use client";

import Link from "next/link";
import {
  Home,
  Target,
  Settings,
  LogOut,
  Plus,
  Ghost,
  ListOrdered,
  Sparkles,
  History,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { signOut } from "@/app/(auth)/actions";
import { NewTransactionModal } from "./new-transaction-modal";
import { usePlan } from "@/hooks/usePlan";
import { getCustomCategories } from "@/app/settings/categories-actions";
import type { CustomCategory } from "@/app/settings/categories-actions";

export type Route =
  | "dashboard"
  | "activity"
  | "cimitero"
  | "goals"
  | "settings"
  | "storico"
  | "import";

const navItems: { icon: typeof Home; label: string; route: Route; href: string }[] = [
  { icon: Home, label: "Dashboard", route: "dashboard", href: "/" },
  { icon: ListOrdered, label: "Attività", route: "activity", href: "/attivita" },
  { icon: Ghost, label: "Cimitero", route: "cimitero", href: "/cimitero" },
  { icon: Target, label: "Obiettivi", route: "goals", href: "/obiettivi" },
  { icon: History, label: "Storico", route: "storico", href: "/storico" },
  { icon: Upload, label: "Importa", route: "import", href: "/import" },
];

export function Sidebar({ activeRoute = "dashboard" }: { activeRoute?: Route }) {
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
      {/*
        The aside is position:fixed so it floats over content when expanded.
        The container div in each page keeps md:ml-[64px] for content offset.
      */}
      <aside className="group fixed left-0 top-0 z-20 hidden h-screen w-[64px] overflow-hidden transition-all duration-300 hover:w-[220px] md:flex flex-col items-start gap-1 py-5 border-r border-white/[0.06]" style={{ background: "#0D0A1E", borderRight: "1px solid rgba(168,139,250,0.08)" }}>
        <div className="mb-2 flex h-10 w-full flex-shrink-0 items-center px-[13px]">
          <Link
            href="/profilo"
            title="Profilo"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue font-serif italic text-base font-medium text-[#0A0812] shadow-[0_4px_20px_-4px_rgba(168,139,250,0.5)] [background-size:200%_200%] animate-gradient-shift transition-opacity hover:opacity-80"
          >
            v
          </Link>
          <span className="ml-3 whitespace-nowrap font-serif italic text-[16px] text-ink-primary opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
            valorem
          </span>
        </div>

        {/* Add transaction */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Nuova transazione"
          className="mb-1 flex h-9 w-full flex-shrink-0 items-center rounded-[10px] border border-iri-violet/30 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.10] px-[13px] text-iri-pale transition-all duration-[300ms] hover:border-iri-violet/60 hover:from-iri-violet/[0.28] hover:text-ink-primary hover:shadow-[0_0_16px_rgba(168,139,250,0.35)]"
        >
          <Plus className="h-4 w-4 flex-shrink-0" strokeWidth={2.2} />
          <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
            Nuova transazione
          </span>
        </button>

        {/* Nav items */}
        {navItems.map((item) => (
          <NavLink key={item.route} {...item} active={item.route === activeRoute} />
        ))}

        <div className="flex-1" />

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

        {/* Logout */}
        <form action={signOut} className="w-full flex-shrink-0">
          <button
            type="submit"
            title="Esci"
            className="flex h-9 w-full items-center rounded-[10px] px-[13px] text-ink-muted transition-all duration-[300ms] hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
              Esci
            </span>
          </button>
        </form>
      </aside>

      <NewTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} customCategories={customCategories} />
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
          ? "bg-gradient-to-br from-iri-violet/20 to-iri-blue/10 text-ink-primary"
          : "text-ink-muted hover:bg-iri-violet/[0.12] hover:text-ink-primary"
      )}
    >
      {active && (
        <span className="absolute -left-[1px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm bg-gradient-to-b from-iri-violet to-iri-magenta shadow-[0_0_12px_rgba(168,139,250,0.8)]" />
      )}
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="ml-3 whitespace-nowrap text-[12px] font-medium opacity-0 translate-x-[-6px] transition-all duration-200 delay-75 group-hover:opacity-100 group-hover:translate-x-0">
        {label}
      </span>
    </Link>
  );
}
