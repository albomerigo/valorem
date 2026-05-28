"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only on non-touch, large-screen devices
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.innerWidth < 768) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number;
    let isHovering = false;
    let isClicking = false;

    document.body.style.cursor = "none";

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function onMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      isHovering =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") !== null ||
        target.closest("button") !== null ||
        target.style.cursor === "pointer" ||
        getComputedStyle(target).cursor === "pointer";
    }

    function onMouseDown() {
      isClicking = true;
    }

    function onMouseUp() {
      isClicking = false;
    }

    function loop() {
      // Lerp ring toward mouse
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      if (dot) {
        dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
        dot.style.opacity = isClicking ? "0.5" : "1";
        dot.style.scale = isClicking ? "0.6" : "1";
      }

      if (ring) {
        const ringSize = isHovering ? 36 : isClicking ? 18 : 24;
        ring.style.transform = `translate(${ringX - ringSize / 2}px, ${ringY - ringSize / 2}px)`;
        ring.style.width = `${ringSize}px`;
        ring.style.height = `${ringSize}px`;
        ring.style.opacity = isClicking ? "0.4" : "0.6";
        ring.style.borderColor = isHovering ? "#A88BFA" : "rgba(168,139,250,0.5)";
        ring.style.boxShadow = isHovering
          ? "0 0 12px rgba(168,139,250,0.6)"
          : "none";
      }

      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    rafId = requestAnimationFrame(loop);

    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#A88BFA",
          zIndex: 999999,
          pointerEvents: "none",
          transition: "scale 0.15s ease, opacity 0.15s ease",
          boxShadow: "0 0 8px rgba(168,139,250,0.8)",
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "1px solid rgba(168,139,250,0.5)",
          zIndex: 999998,
          pointerEvents: "none",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.15s ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
