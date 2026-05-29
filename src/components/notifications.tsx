"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, X, TrendingUp, Calendar, Target, Flame, Star } from "lucide-react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Transaction, DashboardStats } from "@/lib/finance";

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */
type NotifType = "recap" | "budget" | "goal" | "monday" | "streak";

interface AppNotification {
  id: string;
  type: NotifType;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}

const STORAGE_KEY = "valorem_notifications";

/* ──────────────────────────────────────────────
   STORAGE HELPERS
────────────────────────────────────────────── */
function loadNotifs(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function saveNotifs(notifs: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 2) return "Ora";
  if (minutes < 60) return `${minutes} min fa`;
  if (hours < 24) return `${hours}h fa`;
  return `${days}g fa`;
}

/* ──────────────────────────────────────────────
   NOTIFICATION ICON
────────────────────────────────────────────── */
function NotifIcon({ type }: { type: NotifType }) {
  const map: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
    recap: { icon: Calendar, color: "#C4B5FD", bg: "rgba(168,139,250,0.12)" },
    budget: { icon: TrendingUp, color: "#FCD34D", bg: "rgba(245,158,11,0.12)" },
    goal: { icon: Target, color: "#6EE7B7", bg: "rgba(16,185,129,0.12)" },
    monday: { icon: Star, color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
    streak: { icon: Flame, color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  };
  const cfg = map[type];
  const Icon = cfg.icon;
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px]"
      style={{ background: cfg.bg }}
    >
      <Icon className="h-4 w-4" style={{ color: cfg.color }} strokeWidth={1.8} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   NOTIFICATION BELL
────────────────────────────────────────────── */
export function NotificationBell({
  transactions = [],
  stats,
}: {
  transactions?: Transaction[];
  stats?: DashboardStats;
}) {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Seed & generate notifications
  const generateNotifs = useCallback(() => {
    const existing = loadNotifs();
    const existingIds = new Set(existing.map((n) => n.id));
    const newOnes: AppNotification[] = [];
    const now = Date.now();
    const today = new Date();

    // "Recap di [mese] è pronto" — primi 10 giorni del mese
    if (today.getDate() <= 10) {
      const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const monthLabel = prevDate.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
      const id = `recap_${prevDate.getFullYear()}_${prevDate.getMonth()}`;
      if (!existingIds.has(id)) {
        const slug = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
        newOnes.push({
          id,
          type: "recap",
          message: `Il tuo recap di ${monthLabel} è pronto`,
          timestamp: now - 3600000,
          read: false,
          link: `/recap/${slug}`,
        });
      }
    }

    // "80% budget mensile"
    if (stats) {
      const spent = stats.monthlyFree - stats.remainingBudget;
      const pct = stats.monthlyFree > 0 ? spent / stats.monthlyFree : 0;
      const id = `budget_80_${today.getFullYear()}_${today.getMonth()}`;
      if (pct >= 0.8 && !existingIds.has(id)) {
        newOnes.push({
          id,
          type: "budget",
          message: `Hai raggiunto l'80% del budget mensile`,
          timestamp: now - 1800000,
          read: false,
          link: "/",
        });
      }
    }

    // "Nuova settimana" — lunedì
    if (today.getDay() === 1) {
      const weekId = `monday_${today.getFullYear()}_${Math.floor(today.getTime() / (7 * 86400000))}`;
      if (!existingIds.has(weekId)) {
        newOnes.push({
          id: weekId,
          type: "monday",
          message: "Nuova settimana, nuovo inizio 🌟",
          timestamp: now - 7200000,
          read: false,
          link: "/",
        });
      }
    }

    if (newOnes.length > 0) {
      const updated = [...newOnes, ...existing].slice(0, 20);
      saveNotifs(updated);
      return updated;
    }
    return existing;
  }, [stats]);

  useEffect(() => {
    setMounted(true);
    setNotifs(generateNotifs());
  }, [generateNotifs]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function markRead(id: string) {
    setNotifs((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifs(updated);
      return updated;
    });
  }

  function markAllRead() {
    setNotifs((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifs(updated);
      return updated;
    });
  }

  const unreadCount = notifs.filter((n) => !n.read).length;

  if (!mounted) return null;

  const panel = open ? (
    <div
      ref={panelRef}
      className="fixed z-[200] rounded-[18px] shadow-2xl"
      style={{
        top: btnRef.current
          ? btnRef.current.getBoundingClientRect().bottom + 8
          : 60,
        right: 16,
        width: 320,
        background: "rgba(10,8,22,0.96)",
        border: "1px solid rgba(168,139,250,0.2)",
        backdropFilter: "blur(24px)",
        maxHeight: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="m-0 text-[12px] font-semibold text-ink-primary">Notifiche</p>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="flex items-center gap-1 text-[10px] text-iri-pale transition-opacity hover:opacity-70"
            >
              <CheckCheck className="h-3 w-3" strokeWidth={2} />
              Segna tutto
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.05]"
          >
            <X className="h-3.5 w-3.5 text-ink-muted" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto flex-1">
        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Check className="mb-2 h-6 w-6 text-emerald-400" strokeWidth={2} />
            <p className="text-[13px] text-ink-secondary">Tutto in ordine ✓</p>
          </div>
        ) : (
          notifs.map((n) => {
            const item = (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] cursor-pointer"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: n.read ? "transparent" : "rgba(168,139,250,0.03)",
                }}
                onClick={() => {
                  markRead(n.id);
                  setOpen(false);
                }}
              >
                <NotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <p
                    className="m-0 text-[12px] leading-[1.4]"
                    style={{ color: n.read ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.9)" }}
                  >
                    {n.message}
                  </p>
                  <p className="m-0 mt-1 text-[10px] text-ink-muted">{relativeTime(n.timestamp)}</p>
                </div>
                {!n.read && (
                  <span
                    className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ background: "#A88BFA" }}
                  />
                )}
              </div>
            );

            return n.link ? (
              <Link href={n.link} key={n.id} style={{ textDecoration: "none" }}>
                {item}
              </Link>
            ) : (
              item
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-[10px] transition-colors hover:bg-white/[0.05]"
        title="Notifiche"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Bell className="h-4 w-4 text-ink-muted" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "#A88BFA" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {mounted && typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
    </>
  );
}
