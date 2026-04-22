"use client";

import Link from "next/link";

/**
 * Shell grafica condivisa tra le pagine /signin e /signup.
 * Mantiene il look premium di Valorem con aura animata dietro il card.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% 0%, #1A1530 0%, #0A0812 40%, #060508 100%)",
      }}
    >
      <div className="relative w-full max-w-[420px]">
        <AuraBackdrop />

        <div className="relative z-10 flex flex-col items-center">
          <Link
            href="/"
            className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-iri-violet via-iri-magenta to-iri-blue font-serif italic text-lg font-medium text-[#0A0812] shadow-[0_10px_28px_-8px_rgba(168,139,250,0.55)] [background-size:200%_200%] animate-gradient-shift"
          >
            v
          </Link>

          <div className="border-gradient relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-surface-3/80 to-surface-2/80 p-8 backdrop-blur-sm">
            <div className="mb-6 text-center">
              <h1 className="m-0 font-serif text-[26px] font-normal italic text-ink-primary">
                {title}
              </h1>
              <p className="mt-1.5 text-[13px] text-ink-secondary">
                {subtitle}
              </p>
            </div>

            {children}
          </div>

          <div className="mt-6 text-center text-[12px] text-ink-secondary">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuraBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.5) 25%, rgba(232,121,249,0.4) 50%, rgba(96,165,250,0.45) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(80px)",
        }}
      />
    </div>
  );
}