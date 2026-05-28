"use client";

import { useEffect, useState, useRef } from "react";

export function PushNotification() {
  const [showBanner, setShowBanner] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check all conditions
    const notifSupported = typeof Notification !== "undefined";
    if (!notifSupported) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem("valorem_push_dismissed") === "1") return;

    // Show banner after 30 seconds
    timerRef.current = setTimeout(() => {
      setShowBanner(true);
    }, 30_000);

    // Check time every minute to fire 20:00 local notification
    function checkTime() {
      const now = new Date();
      if (now.getHours() === 20 && now.getMinutes() === 0) {
        if (Notification.permission === "granted") {
          new Notification("Valorem — come è andata oggi?", {
            body: "Hai 2 minuti per registrare le spese di oggi e mantenere il tuo streak.",
            icon: "/icon-192.png",
          });
        }
      }
    }

    intervalRef.current = setInterval(checkTime, 60_000);
    checkTime(); // run immediately too in case it's exactly 20:00

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleActivate() {
    setShowBanner(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Valorem — notifiche attivate 🎉", {
          body: "Ti ricorderemo ogni sera alle 20:00 di registrare le spese.",
          icon: "/icon-192.png",
        });
      }
    } catch {
      // ignore
    }
  }

  function handleDismiss() {
    localStorage.setItem("valorem_push_dismissed", "1");
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:max-w-sm"
      style={{
        background: "linear-gradient(135deg, rgba(12,8,24,0.95), rgba(10,6,20,0.98))",
        border: "1px solid rgba(168,139,250,0.3)",
        borderRadius: "18px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        padding: "16px 18px",
        animation: "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <p className="m-0 text-[14px] font-medium text-ink-primary leading-[1.5]">
        🔔 Vuoi ricevere un reminder serale per registrare le spese del giorno?
      </p>
      <p className="m-0 mt-1 text-[12px] text-ink-muted leading-[1.5]">
        Ti notificheremo ogni sera alle 20:00 mentre sei sull&apos;app.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleActivate}
          className="flex-1 rounded-[10px] py-2 text-[13px] font-medium text-white transition-all hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #A88BFA, #E879F9)",
            boxShadow: "0 4px 12px -4px rgba(168,139,250,0.5)",
          }}
        >
          Sì, attiva
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-1 rounded-[10px] py-2 text-[13px] text-ink-muted transition-colors hover:text-ink-primary"
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          No grazie
        </button>
      </div>
    </div>
  );
}
