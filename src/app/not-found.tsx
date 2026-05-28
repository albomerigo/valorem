import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  const stars = [
    { left: "6%", top: "14%", delay: "0.2s" },
    { left: "90%", top: "22%", delay: "1.1s" },
    { left: "15%", top: "80%", delay: "0.6s" },
    { left: "78%", top: "76%", delay: "1.8s" },
    { left: "52%", top: "8%", delay: "2.4s" },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "#06050C" }}
    >
      {/* Ambient orbs */}
      <div
        className="pointer-events-none absolute left-[18%] top-[25%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 animate-rotate-slow"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,139,250,0) 0%, rgba(168,139,250,0.5) 25%, rgba(232,121,249,0.4) 50%, rgba(96,165,250,0.45) 75%, rgba(168,139,250,0) 100%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[10%] top-[60%] h-[300px] w-[300px] rounded-full opacity-25 animate-breathe"
        style={{
          background:
            "radial-gradient(circle, rgba(232,121,249,0.4) 0%, rgba(168,139,250,0.2) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[15%] left-[60%] h-[200px] w-[200px] rounded-full opacity-20 animate-float-y"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.4) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="pointer-events-none absolute h-[2px] w-[2px] rounded-full bg-white/50 animate-twinkle"
          style={{ left: s.left, top: s.top, animationDelay: s.delay }}
        />
      ))}

      {/* Ghost fluttuante */}
      <div className="pointer-events-none absolute right-[12%] top-[30%] opacity-20 animate-float-y">
        <Ghost
          className="h-12 w-12"
          style={{ color: "#A88BFA" }}
          strokeWidth={1.2}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* 404 */}
        <p
          className="font-serif italic leading-none [letter-spacing:-0.06em]"
          style={{
            fontSize: "clamp(80px, 20vw, 120px)",
            background: "linear-gradient(135deg, #A88BFA 0%, #E879F9 55%, #60A5FA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </p>

        <h1 className="mt-2 font-serif text-[22px] md:text-[28px] italic font-normal text-ink-primary">
          Questa pagina non esiste ancora.
        </h1>

        <p
          className="mx-auto mt-4 max-w-[380px] font-serif text-[14px] italic leading-[1.75] text-ink-secondary"
        >
          Come molti obiettivi finanziari — a volte ci si perde. Ma il percorso
          verso la dashboard è sempre chiaro.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-[14px] px-7 py-3.5 text-[13px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-8px_rgba(168,139,250,0.55)]"
          style={{
            background:
              "linear-gradient(135deg, #A88BFA 0%, #E879F9 55%, #60A5FA 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 4s ease infinite",
          }}
        >
          ← Torna alla dashboard
        </Link>
      </div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
