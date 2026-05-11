import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "#0D0A1E" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(168,139,250,0.15)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        <p
          className="mb-2 font-mono text-[72px] font-bold leading-none"
          style={{ color: "#A88BFA" }}
        >
          404
        </p>
        <h1 className="mb-2 font-serif text-[24px] font-normal italic text-white">
          Pagina non trovata
        </h1>
        <p className="mb-8 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
          La pagina che cerchi non esiste o è stata spostata.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[13px] font-medium text-white transition-all duration-300 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #A88BFA, #E879F9, #60A5FA)",
            boxShadow: "0 8px 24px -4px rgba(168,139,250,0.5)",
          }}
        >
          Torna alla dashboard
        </Link>
      </div>
    </div>
  );
}
