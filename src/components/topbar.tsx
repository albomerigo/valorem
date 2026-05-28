"use client";

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
        <div className="hidden md:block"><Search transactions={transactions} goals={goals} /></div>
      </div>
    </div>
  );
}
