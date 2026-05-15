"use client";

import Link from "next/link";
import { Home, ListOrdered, Ghost, Target, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";

type Route = "dashboard" | "activity" | "cimitero" | "goals" | "settings" | "storico";

const items: { icon: typeof Home; label: string; route: Route; href: string }[] = [
  { icon: Home, label: "Home", route: "dashboard", href: "/" },
  { icon: ListOrdered, label: "Attività", route: "activity", href: "/attivita" },
  { icon: Ghost, label: "Cimitero", route: "cimitero", href: "/cimitero" },
  { icon: Target, label: "Obiettivi", route: "goals", href: "/obiettivi" },
  { icon: History, label: "Storico", route: "storico", href: "/storico" },
];

/**
 * Bottom bar di navigazione per mobile.
 * Si sostituisce alla sidebar desktop quando schermo < 768px.
 */
export function BottomBar({
  activeRoute = "dashboard",
}: {
  activeRoute?: Route;
}) {
  const { plan } = usePlan();

  return (
   <nav
      className="glass-panel-strong fixed bottom-0 left-0 right-0 z-30 flex md:hidden items-center justify-around border-t border-white/[0.06] px-2 pt-2"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      {items.map((item) => (
        <BottomLink key={item.route} {...item} active={item.route === activeRoute} />
      ))}
      {plan === "free" && (
        <Link
          href="/pricing"
          className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-all duration-[250ms] active:scale-95"
          style={{ color: "#A88BFA" }}
        >
          <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.6} />
          <span className="text-[9px] font-medium uppercase tracking-[0.04em]">Upgrade</span>
        </Link>
      )}
    </nav>
  );
}

function BottomLink({
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
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-2 transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] active:scale-95",
        active
          ? "text-iri-pale"
          : "text-ink-muted active:text-ink-primary"
      )}
    >
      {active && (
        <span className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-iri-violet via-iri-magenta to-iri-blue shadow-[0_0_12px_rgba(168,139,250,0.8)]" />
      )}
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.6} />
      <span className="text-[9px] font-medium uppercase tracking-[0.04em]">
        {label}
      </span>
    </Link>
  );
}