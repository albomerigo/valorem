"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Transizione cinematica al cambio di route:
 * - fade out: opacity 0 + translateX(-8px) + blur(4px) in 120ms
 * - fade in: opacity 1 + translateX(0) + blur(0) in 250ms ease-out
 *
 * Più barra di avanzamento (top loader) viola→magenta→blu.
 */
export function PageTransition() {
  const pathname = usePathname();
  const mountedRef = useRef(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const barTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Crea la barra una volta
  useEffect(() => {
    const bar = document.createElement("div");
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      z-index: 99998;
      pointer-events: none;
      background: linear-gradient(90deg, #A88BFA, #E879F9, #60A5FA);
      transition: width 200ms ease-out, opacity 150ms ease;
      opacity: 0;
    `;
    document.body.appendChild(bar);
    barRef.current = bar;
    return () => {
      bar.remove();
    };
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const main = document.getElementById("page-content");
    const bar = barRef.current;

    // Cancella timer precedenti
    barTimersRef.current.forEach(clearTimeout);
    barTimersRef.current = [];

    // ── Barra: avvio ──
    if (bar) {
      bar.style.transition = "width 200ms ease-out, opacity 80ms ease";
      bar.style.opacity = "1";
      bar.style.width = "0%";
      // Forza reflow
      void bar.offsetWidth;
      bar.style.transition = "width 200ms ease-out, opacity 80ms ease";
      bar.style.width = "70%";
    }

    // ── Pagina: fade out ──
    if (main) {
      main.style.transition =
        "opacity 120ms ease-in, transform 120ms ease-in, filter 120ms ease-in";
      main.style.opacity = "0";
      main.style.transform = "translateX(-8px)";
      main.style.filter = "blur(4px)";
    }

    // ── Fade in dopo 120ms ──
    const t1 = setTimeout(() => {
      if (main) {
        main.style.transition =
          "opacity 250ms ease-out, transform 250ms ease-out, filter 250ms ease-out";
        main.style.opacity = "1";
        main.style.transform = "translateX(0)";
        main.style.filter = "blur(0)";
      }

      // Barra: completa a 100%
      if (bar) {
        bar.style.transition = "width 100ms ease-out, opacity 150ms ease";
        bar.style.width = "100%";
      }
    }, 120);

    // ── Barra: sparisce dopo che raggiunge 100% ──
    const t2 = setTimeout(() => {
      if (bar) {
        bar.style.opacity = "0";
        const t3 = setTimeout(() => {
          if (bar) bar.style.width = "0%";
        }, 200);
        barTimersRef.current.push(t3);
      }
    }, 350);

    barTimersRef.current.push(t1, t2);

    return () => {
      barTimersRef.current.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
