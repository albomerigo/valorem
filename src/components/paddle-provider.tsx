"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { initPaddle, type Paddle } from "@/lib/paddle";

const PaddleContext = createContext<Paddle | undefined>(undefined);

export function PaddleProvider({ children }: { children: ReactNode }) {
  const [paddle, setPaddle] = useState<Paddle | undefined>(undefined);

  useEffect(() => {
    initPaddle().then((p) => {
      if (p) setPaddle(p);
    });
  }, []);

  return (
    <PaddleContext.Provider value={paddle}>{children}</PaddleContext.Provider>
  );
}

/** Restituisce l'istanza Paddle inizializzata (undefined finché non è pronta). */
export function usePaddle(): Paddle | undefined {
  return useContext(PaddleContext);
}
