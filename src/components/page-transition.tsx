"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Aggiunge una transizione opacity al cambio di route.
 * opacity 0 (100ms) → opacity 1 (200ms)
 */
export function PageTransition() {
  const pathname = usePathname();
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip first mount — già visibile
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const main = document.getElementById("page-content");
    if (!main) return;

    // Fade out
    main.style.transition = "opacity 100ms ease-out";
    main.style.opacity = "0";

    const timer = setTimeout(() => {
      // Fade in
      main.style.transition = "opacity 200ms ease-in";
      main.style.opacity = "1";
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
