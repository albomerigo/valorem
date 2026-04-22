"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Target,
  Settings,
  LogOut,
  Plus,
  Ghost,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";
import { NewTransactionModal } from "./new-transaction-modal";

type Route = "dashboard" | "activity" | "cimitero" | "goals" | "settings";

const navItems: { icon: typeof Home; label: string; route: Route; href: string }[] = [
  { icon: Home, label: "Dashboard", route: "dashboard", href: "/" },
  { icon: ListOrdered, label: "Attività", route: "activity", href: "/attivita" },
  { icon: Ghost, label: "Cimitero Impulsi", route: "cimitero", href: "/cimitero" },
  { icon: Target, label: "Obiettivi", route: "goals", href: "/obiettivi" },
];

export function Sidebar({ activeRoute = "dashboard" }: { activeRoute?: Route }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <aside className="glass-panel-subtle hidden md:flex h-full flex-col items-center gap-1.5 border-l-0 border-t-0 border-b-0 py-5">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue font-serif italic text-base font-medium text-[#0A0812] shadow-[0_4px_20px_-4px_rgba(168,139,250,0.5)] [background-size:200%_200%] animate-gradient-shift">
          v
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          title="Nuova transazione"
          className="group relative mb-2 flex h-9 w-9 items-center justify-center rounded-[10px] border border-iri-violet/30 bg-gradient-to-br from-iri-violet/[0.18] to-iri-magenta/[0.10] text-iri-pale transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.08] hover:border-iri-violet/60 hover:from-iri-violet/[0.28] hover:text-ink-primary hover:shadow-[0_0_16px_rgba(168,139,250,0.4)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </button>

        {navItems.map((item) => (
          <NavLink key={item.label} {...item} active={item.route === activeRoute} />
        ))}

        <div className="flex-1" />

        <NavLink
          icon={Settings}
          label="Impostazioni"
          route="settings"
          href="/settings"
          active={activeRoute === "settings"}
        />

        <form action={signOut}>
          <button
            type="submit"
            title="Esci"
            className="group relative flex h-9 w-9 items-center justify-center rounded-[10px] text-ink-muted transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:scale-[1.08] hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </aside>

      <NewTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
        "group relative flex h-9 w-9 items-center justify-center rounded-[10px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)]",
        active
          ? "bg-gradient-to-br from-iri-violet/20 to-iri-blue/10 text-ink-primary"
          : "text-ink-muted hover:scale-[1.08] hover:bg-iri-violet/[0.12] hover:text-ink-primary"
      )}
    >
      {active && (
        <span className="absolute -left-[1px] top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm bg-gradient-to-b from-iri-violet to-iri-magenta shadow-[0_0_12px_rgba(168,139,250,0.8)]" />
      )}
      <Icon className="h-4 w-4" />
    </Link>
  );
}