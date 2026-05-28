"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("valorem_splash_shown") === "1") return;
    sessionStorage.setItem("valorem_splash_shown", "1");
    setVisible(true);
    const t1 = setTimeout(() => setFading(true), 900);
    const t2 = setTimeout(() => setVisible(false), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#06050C",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(168,139,250,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo mark */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #A88BFA 0%, #E879F9 50%, #60A5FA 100%)",
            backgroundSize: "200% 200%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-fraunces, serif)",
            fontStyle: "italic",
            fontSize: "28px",
            fontWeight: 400,
            color: "#0A0812",
            boxShadow: "0 0 48px rgba(168,139,250,0.55), 0 0 80px rgba(168,139,250,0.2)",
            animation: "splashGradientShift 2s ease infinite",
          }}
        >
          v
        </div>
        <span
          style={{
            fontFamily: "var(--font-fraunces, serif)",
            fontStyle: "italic",
            fontSize: "22px",
            fontWeight: 400,
            color: "#E9E4FF",
            letterSpacing: "-0.01em",
            opacity: 0.9,
          }}
        >
          valorem
        </span>
      </div>

      <style>{`
        @keyframes splashGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
