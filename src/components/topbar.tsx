"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Search } from "./search";
import { BackButton } from "./back-button";
import type { Transaction, Goal } from "@/lib/finance";

export function Topbar({
  userName,
  section = "Dashboard",
  transactions = [],
  goals = [],
  showBack = false,
}: {
  userName: string;
  section?: string;
  transactions?: Transaction[];
  goals?: Goal[];
  showBack?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && <BackButton />}
        <span className="font-serif italic text-[18px] md:text-[20px] font-normal text-ink-primary">
          Valorem
        </span>
       <span className="eyebrow text-ink-faint hidden md:inline">/</span>
        <span className="eyebrow-accent hidden md:inline">{section}</span>
        <span className="eyebrow text-ink-faint hidden md:inline">/</span>
        <span className="font-sans text-[12px] font-normal text-ink-secondary hidden md:inline truncate">
          {userName}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />
        <Search transactions={transactions} goals={goals} />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // next-themes richiede questo pattern per evitare hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render invisibile prima dell'hydration
    return (
      <div className="h-[34px] w-[34px]" aria-hidden="true" />
    );
  }

  const isDark = theme === "dark";

  function handleToggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isDark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      className="glass-panel-subtle group relative flex h-[34px] w-[34px] items-center justify-center rounded-[10px] transition-all duration-[350ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105 hover:border-iri-violet/30"
    >
      <div className="relative">
        <Sun
          className={`absolute inset-0 h-[14px] w-[14px] transition-all duration-[500ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-amber-300"
              : "rotate-90 scale-0 opacity-0"
          }`}
          strokeWidth={1.8}
        />
        <Moon
          className={`h-[14px] w-[14px] transition-all duration-[500ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] ${
            isDark
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-iri-violet"
          }`}
          strokeWidth={1.8}
        />
      </div>
    </button>
  );
}
