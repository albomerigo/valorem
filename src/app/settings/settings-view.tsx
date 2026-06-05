"use client";

import Link from "next/link";
import {
  User,
  BarChart2,
  CreditCard,
  Bell,
  Sparkles,
  Shield,
  Newspaper,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import type { UserProfile } from "@/lib/finance";
import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { FabButton } from "@/components/fab-button";
import { Topbar } from "@/components/topbar";

const SETTINGS_SECTIONS = [
  {
    href: "/settings/account",
    icon: User,
    iconColor: "#60A5FA",
    iconBg: "rgba(96,165,250,0.12)",
    iconBorder: "rgba(96,165,250,0.25)",
    label: "Account",
    sub: "Nome, email, tipo di reddito",
  },
  {
    href: "/settings/dati",
    icon: BarChart2,
    iconColor: "#A88BFA",
    iconBg: "rgba(168,139,250,0.12)",
    iconBorder: "rgba(168,139,250,0.25)",
    label: "Dati finanziari",
    sub: "Reddito, ore lavoro, budget e categorie",
  },
  {
    href: "/settings/abbonamento",
    icon: CreditCard,
    iconColor: "#F59E0B",
    iconBg: "rgba(245,158,11,0.1)",
    iconBorder: "rgba(245,158,11,0.25)",
    label: "Abbonamento",
    sub: "Piano attuale, fatture, upgrade",
  },
  {
    href: "/settings/personalizzazione",
    icon: Sparkles,
    iconColor: "#E879F9",
    iconBg: "rgba(232,121,249,0.1)",
    iconBorder: "rgba(232,121,249,0.25)",
    label: "Personalizzazione",
    sub: "Suoni, aptico, micro-interazioni",
  },
  {
    href: "/settings/privacy",
    icon: Shield,
    iconColor: "#10B981",
    iconBg: "rgba(16,185,129,0.1)",
    iconBorder: "rgba(16,185,129,0.25)",
    label: "Privacy e dati",
    sub: "Export, cancellazione account, GDPR",
  },
  {
    href: "/novita",
    icon: Newspaper,
    iconColor: "#C4B5FD",
    iconBg: "rgba(196,181,253,0.1)",
    iconBorder: "rgba(196,181,253,0.25)",
    label: "Novità",
    sub: "Changelog e aggiornamenti",
    badge: "New",
  },
  {
    href: "/guida",
    icon: BookOpen,
    iconColor: "#7DD3FC",
    iconBg: "rgba(125,211,252,0.1)",
    iconBorder: "rgba(125,211,252,0.25)",
    label: "Guida",
    sub: "Come usare Valorem",
  },
];

export function SettingsView({ profile }: { profile: UserProfile }) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[680px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Impostazioni" showBack />

          <header className="mt-8 mb-8">
            <h1 className="m-0 font-serif text-[32px] font-normal italic leading-tight text-ink-primary">
              Impostazioni
            </h1>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-secondary">
              Configura Valorem per il tuo stile di vita.
            </p>
          </header>

          <div className="flex flex-col gap-2">
            {SETTINGS_SECTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className="glass-panel group flex items-center gap-4 rounded-[14px] px-5 py-4 transition-all duration-[250ms] hover:border-iri-violet/25 hover:translate-x-[2px]"
                >
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px]"
                    style={{
                      background: s.iconBg,
                      border: `1px solid ${s.iconBorder}`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: s.iconColor }} strokeWidth={1.6} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="m-0 text-[14px] font-medium text-ink-primary">{s.label}</p>
                      {s.badge && (
                        <span
                          className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide"
                          style={{
                            background: "rgba(168,139,250,0.2)",
                            color: "#C4B5FD",
                            border: "1px solid rgba(168,139,250,0.3)",
                          }}
                        >
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <p className="m-0 mt-0.5 text-[12px] text-ink-secondary">{s.sub}</p>
                  </div>

                  <ChevronRight
                    className="h-4 w-4 flex-shrink-0 text-ink-muted transition-transform duration-[200ms] group-hover:translate-x-[2px]"
                    strokeWidth={1.8}
                  />
                </Link>
              );
            })}
          </div>

          {/* Altro */}
          <div className="mt-10 border-t border-white/[0.05] pt-6">
            <p className="mb-3 text-[9px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              Altro
            </p>
            <p className="text-center text-[11px] text-ink-muted">
              <Link href="/termini" className="hover:text-ink-secondary transition-colors">
                Termini di Servizio
              </Link>
              {" · "}
              <Link href="/privacy" className="hover:text-ink-secondary transition-colors">
                Privacy Policy
              </Link>
              {" · "}
              <span className="text-ink-muted/60">Versione 2.0.0</span>
            </p>
          </div>
        </div>
      </div>

      <FabButton />
      <BottomBar activeRoute="settings" />
    </div>
  );
}
