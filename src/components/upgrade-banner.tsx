"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function UpgradeBanner({ plan }: { plan: string }) {
  if (plan !== "free") return null;
  return (
    <div
      style={{
        background: "rgba(168,139,250,0.06)",
        border: "1px solid rgba(168,139,250,0.15)",
        borderRadius: "18px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
      }}
    >
      <Sparkles
        className="h-5 w-5 flex-shrink-0"
        style={{ color: "#A88BFA" }}
        strokeWidth={1.6}
      />
      <div style={{ flex: 1, margin: 0 }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#9CA3AF" }}>
          <span style={{ color: "#F0EEFF", fontWeight: 500 }}>
            Sblocca Valorem Premium
          </span>{" "}
          — transazioni illimitate, storico completo, export dati.
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6B7280" }}>
          Piano gratuito: 25 transazioni/mese
        </p>
      </div>
      <Link
        href="/pricing"
        style={{
          background: "linear-gradient(135deg, #A88BFA, #E879F9)",
          color: "white",
          borderRadius: "999px",
          padding: "8px 18px",
          fontSize: "13px",
          fontWeight: 500,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Scopri i piani →
      </Link>
    </div>
  );
}