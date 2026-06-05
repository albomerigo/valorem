"use client";

import { Sidebar } from "@/components/sidebar";
import { BottomBar } from "@/components/bottom-bar";
import { Topbar } from "@/components/topbar";
import { ProfileSection } from "../sections/profile-section";
import type { UserProfile } from "@/lib/finance";

export function AccountView({
  profile,
  email,
}: {
  profile: UserProfile;
  email: string;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="hidden md:block fixed left-0 top-0 z-20 h-screen w-[64px]">
        <Sidebar activeRoute="settings" />
      </div>

      <div className="md:ml-[64px] min-h-screen pb-36 md:pb-0">
        <div className="mx-auto max-w-[680px] px-4 py-5 md:px-8 md:py-7">
          <Topbar userName={profile.name || "ospite"} section="Impostazioni" showBack />

          <header className="mt-8 mb-8">
            <p className="eyebrow-accent mb-2 text-[10px]">Impostazioni</p>
            <h1 className="m-0 font-serif text-[28px] font-normal italic leading-tight text-ink-primary">
              Account
            </h1>
          </header>

          {/* Email (read-only) */}
          <div className="glass-panel mb-4 rounded-[18px] p-6">
            <p className="eyebrow mb-2 text-[9px]">Email</p>
            <p className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-ink-secondary">
              {email}
            </p>
            <p className="mt-1.5 text-[11px] text-ink-muted">
              L&apos;email non può essere modificata da qui.
            </p>
          </div>

          <ProfileSection profile={profile} />

          {/* Elimina account */}
          <div className="mt-8 rounded-[14px] border border-red-500/20 bg-red-500/[0.04] p-5">
            <p className="m-0 text-[13px] font-medium text-red-300">Zona pericolosa</p>
            <p className="mt-1 mb-3 text-[12px] text-ink-secondary">
              L&apos;eliminazione dell&apos;account è permanente e irreversibile. Tutti i tuoi dati verranno cancellati.
            </p>
            <a
              href="/settings/privacy"
              className="inline-flex items-center rounded-[10px] border border-red-500/30 bg-red-500/[0.08] px-4 py-2 text-[12px] font-medium text-red-300 transition-colors hover:bg-red-500/[0.14]"
            >
              Elimina account →
            </a>
          </div>
        </div>
      </div>

      <BottomBar activeRoute="settings" />
    </div>
  );
}
