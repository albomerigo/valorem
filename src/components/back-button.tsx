"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.2,0.8,0.2,1)] hover:scale-105"
      style={{
        background: "rgba(168,139,250,0.08)",
        border: "1px solid rgba(168,139,250,0.15)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(168,139,250,0.15)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = "rgba(168,139,250,0.08)")
      }
    >
      <ArrowLeft className="h-4 w-4" style={{ color: "#A88BFA" }} strokeWidth={2} />
    </button>
  );
}
