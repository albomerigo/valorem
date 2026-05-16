"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface HelpTooltipProps {
  title: string;
  content: string;
  example?: string;
}

export function HelpTooltip({ title, content, example }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (open) {
      setOpen(false);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverW = 260;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - popoverW - 8));
      setPos({ top: rect.bottom + 8, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;
    const handle = () => setOpen(false);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label={`Informazioni: ${title}`}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "rgba(168,139,250,0.12)",
          border: "1px solid rgba(168,139,250,0.22)",
          color: "rgba(168,139,250,0.75)",
          fontSize: 10,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          flexShrink: 0,
          lineHeight: 1,
          transition: "background 200ms, border-color 200ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(168,139,250,0.22)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(168,139,250,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(168,139,250,0.12)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(168,139,250,0.22)";
        }}
      >
        ?
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            zIndex: 9999,
            width: 260,
            background: "rgba(13,10,30,0.97)",
            border: "1px solid rgba(168,139,250,0.2)",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            animation: "htFadeIn 150ms ease-out both",
          }}
        >
          <style>{`
            @keyframes htFadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#F0EEFF",
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(168,139,250,0.5)",
                padding: 2,
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>

          {/* Separator */}
          <div
            style={{
              height: 1,
              background: "rgba(168,139,250,0.15)",
              marginBottom: 10,
            }}
          />

          {/* Content */}
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#7C6FA0",
              lineHeight: 1.65,
            }}
          >
            {content}
          </p>

          {/* Example */}
          {example && (
            <div
              style={{
                marginTop: 10,
                background: "rgba(168,139,250,0.08)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontStyle: "italic",
                  color: "#A88BFA",
                  lineHeight: 1.55,
                }}
              >
                {example}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
