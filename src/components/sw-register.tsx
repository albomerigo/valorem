"use client";

import { useEffect } from "react";

/**
 * Registra il Service Worker per la PWA.
 * Componente senza UI — montato nel layout principale.
 */
export function SwRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => {
        console.warn("[SW] Registrazione fallita:", err);
      });
  }, []);

  return null;
}
