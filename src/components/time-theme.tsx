"use client";

import { useEffect } from "react";

/**
 * Applica una classe CSS al body in base all'ora del giorno:
 * - 6:00–18:00: nessuna classe (tema normale)
 * - 18:00–24:00: classe "evening" (sfondo leggermente più scuro/bluastro)
 * - 0:00–6:00:  classe "night"   (sfondo ancora più scuro)
 */
export function TimeTheme() {
  useEffect(() => {
    const h = new Date().getHours();
    document.body.classList.remove("evening", "night");
    if (h >= 18) document.body.classList.add("evening");
    else if (h < 6) document.body.classList.add("night");
  }, []);

  return null;
}
