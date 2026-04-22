"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counter analogico che anima il cambio di valore.
 *
 * Usa requestAnimationFrame per scorrere fluidamente dal vecchio valore
 * a quello nuovo. Quando il valore cambia (es. dopo una transazione salvata),
 * il numero "scorre" invece di cambiare di colpo.
 *
 * Esempio d'uso:
 *   <AnimatedNumber value={76.56} decimals={2} />
 *
 * Separare parte intera e decimale per formattazione EUR premium:
 *   const { int, dec } = useAnimatedCurrency(safeToSpend);
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 800,
  className = "",
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevValue.current === value) return;

    const startValue = prevValue.current;
    const endValue = value;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out-expo per effetto "rallenta alla fine"
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayed(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {displayed.toFixed(decimals).replace(".", ",")}
    </span>
  );
}

/**
 * Hook che ritorna {int, dec} animati per un importo in euro.
 * Utile per il pattern hero di Valorem dove la parte decimale è stilizzata più piccola.
 */
export function useAnimatedCurrency(
  value: number,
  duration: number = 800
): { int: string; dec: string; raw: number } {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevValue.current === value) return;

    const startValue = prevValue.current;
    const endValue = value;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayed(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = endValue;
      }
    }

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  // Split in int e decimal via Intl per gestire correttamente la divisione
  const formatted = new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(displayed);

  const [int, dec] = formatted.split(",");
  return { int, dec: dec || "00", raw: displayed };
}