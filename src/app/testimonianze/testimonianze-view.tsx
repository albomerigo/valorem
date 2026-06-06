"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

type Review = {
  id: string;
  name: string;
  role?: string;
  text: string;
  stars: number;
  created_at: string;
};

export function TestimonianzeView() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#060508] text-[#e8e6f0] min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full bg-[#a88bfa]/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[-200px] w-[500px] h-[500px] rounded-full bg-[#e879f9]/5 blur-[120px]" />
      </div>

      {/* Simple Header Navbar */}
      <nav className="border-b border-white/[0.06] bg-[#0b0912]/80 backdrop-blur-md relative z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/landing" className="font-serif italic text-xl text-[#F0EEFF] tracking-tight hover:opacity-80 transition-opacity">
            valorem
          </Link>
          <Link
            href="/landing"
            className="text-xs font-semibold text-[#8b8899] hover:text-white transition-colors flex items-center gap-1"
          >
            ← Torna alla landing
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-16 relative z-10">
        {/* Title */}
        <h1 className="font-serif italic text-4xl md:text-5xl text-[#F0EEFF] leading-tight mb-4 text-center">
          Testimonianze
        </h1>
        <p className="text-sm text-[#8b8899] text-center max-w-lg mx-auto mb-12">
          Cosa pensano le persone che usano Valorem ogni giorno.
        </p>

        {loading ? (
          <div className="text-center py-12 text-[#8b8899] text-sm font-medium">
            Caricamento testimonianze...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 border border-white/[0.06] bg-[#0b0912]/50 backdrop-blur-sm rounded-3xl">
            <p className="text-sm text-[#8b8899] font-medium">
              Le prime testimonianze arriveranno presto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-[#0b0912] border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:border-white/10 transition-colors shadow-md relative overflow-hidden"
              >
                {/* Decorative Quotes */}
                <div className="absolute top-4 right-6 font-serif text-7xl text-[#a88bfa]/5 pointer-events-none select-none">
                  “
                </div>

                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(r.stars)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                    {[...Array(5 - r.stars)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-3.5 h-3.5 text-white/10" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-sm font-serif italic text-[#e8e6f0] leading-relaxed mb-6">
                    "{r.text}"
                  </p>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04]">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#F0EEFF]">{r.name}</span>
                    {r.role && (
                      <span className="text-[10px] text-[#8b8899] mt-0.5">{r.role}</span>
                    )}
                  </div>
                  <span className="text-[9px] text-[#6b6880] font-mono">
                    {new Date(r.created_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mini Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-[#6b6880] relative z-10">
        &copy; {new Date().getFullYear()} Valorem. Tutti i diritti riservati.
      </footer>
    </div>
  );
}
