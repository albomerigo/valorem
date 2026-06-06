"use client";

import { useState, useEffect } from "react";
import { useInView } from "../hooks/use-in-view";
import { Star, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { AnimatedSection } from "../landing-view";

type Review = {
  id: string;
  name: string;
  role?: string;
  text: string;
  stars: number;
  created_at: string;
};

export function Testimonials() {
  const { ref, inView } = useInView(0.1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const placeholderReviews = [
    {
      stars: 5,
      quote: "Finalmente capisco dove vanno i miei soldi. Il Safe-to-Spend mi ha cambiato le abitudini in due settimane.",
      author: "M.T.",
      role: "Freelance",
      location: "Milano",
      avatarGrad: "from-[#a88bfa] to-[#e879f9]",
      fullName: "Marco T.",
      age: "28"
    },
    {
      stars: 5,
      quote: "Il recap mensile è come uno specchio. Onesto, empatico, utile. Non pensavo che un'app potesse farmi riflettere così.",
      author: "S.B.",
      role: "Impiegata",
      location: "Roma",
      avatarGrad: "from-[#60a5fa] to-[#67e8f9]",
      fullName: "Sara B.",
      age: "31"
    },
    {
      stars: 5,
      quote: "Tradurre le spese in ore di lavoro è la cosa più intelligente che abbia visto in un'app di finanza.",
      author: "L.R.",
      role: "Sviluppatore",
      location: "Torino",
      avatarGrad: "from-[#e879f9] to-[#a88bfa]",
      fullName: "Luca R.",
      age: "26"
    }
  ];

  // Fetch approved reviews from Supabase
  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setSubmitStatus("error");
      setErrorMessage("Tutti i campi obbligatori devono essere compilati.");
      return;
    }

    setSubmitStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, text, stars })
      });

      if (res.ok) {
        setSubmitStatus("success");
        setName("");
        setRole("");
        setText("");
        setStars(5);
      } else {
        const data = await res.json();
        setSubmitStatus("error");
        setErrorMessage(data.error || "Qualcosa è andato storto. Riprova.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitStatus("error");
      setErrorMessage("Errore di rete. Riprova.");
    }
  };

  // Build the list of exactly 3 reviews to show (first 3 real ones if count >= 3, else fill with placeholders)
  const displayReviews = [...reviews];
  if (displayReviews.length < 3) {
    const placeholdersNeeded = 3 - displayReviews.length;
    for (let i = 0; i < placeholdersNeeded; i++) {
      const pIdx = displayReviews.length;
      const p = placeholderReviews[pIdx];
      displayReviews.push({
        id: `placeholder-${pIdx}`,
        name: p.fullName,
        role: `${p.role}, ${p.age} anni · ${p.location}`,
        text: p.quote,
        stars: p.stars,
        created_at: new Date().toISOString()
      });
    }
  }

  const finalReviews = displayReviews.slice(0, 3).map((r, idx) => {
    const initials = r.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    // Choose gradient
    const grads = [
      "from-[#a88bfa] to-[#60a5fa]",
      "from-[#60a5fa] to-[#e879f9]",
      "from-[#e879f9] to-[#a88bfa]"
    ];
    const avatarGrad = grads[idx % grads.length];

    return {
      stars: r.stars,
      quote: r.text,
      initials,
      fullName: r.name,
      subtitle: r.role || "Utente Valorem",
      avatarGrad
    };
  });

  return (
    <section id="testimonials" ref={ref} className="py-20 md:py-28 px-6 relative z-10 max-w-7xl mx-auto">
      <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#a88bfa] block mb-3">
            Testimonianze
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#F0EEFF] leading-tight">
            Cosa dicono di <span className="bg-gradient-to-r from-[#a88bfa] to-[#e879f9] bg-clip-text text-transparent font-medium">Valorem</span>
          </h2>
        </div>

        {/* Grid Cards with stagger scroll delay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {finalReviews.map((item, idx) => (
            <AnimatedSection
              key={idx}
              animation="animate-swing-in"
              delay={idx * 150}
            >
              <div
                className="bg-[#0b0912] border border-white/[0.06] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative overflow-hidden shadow-md group h-full"
              >
                {/* Top quotes decorative element */}
                <div className="absolute top-4 right-6 font-serif text-8xl text-[#a88bfa]/5 pointer-events-none select-none">
                  “
                </div>

                <div>
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(item.stars)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                    {[...Array(5 - item.stars)].map((_, sIdx) => (
                      <Star key={sIdx} className="w-4 h-4 text-white/10" />
                    ))}
                  </div>

                  {/* Quote Text */}
                  <p className="text-sm font-serif italic text-[#e8e6f0] leading-relaxed mb-8 relative z-10">
                    "{item.quote}"
                  </p>
                </div>

                {/* Author footer */}
                <div className="flex items-center gap-3.5 mt-auto">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.avatarGrad} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                  >
                    {item.initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#F0EEFF]">
                      {item.fullName}
                    </span>
                    <span className="text-[10px] text-[#8b8899]">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/testimonianze"
            className="px-6 py-3 rounded-full border border-[#a88bfa]/30 hover:border-[#a88bfa]/60 text-xs font-semibold text-[#a88bfa] hover:text-[#e879f9] bg-[#a88bfa]/[0.02] transition-all flex items-center gap-2"
          >
            Vedi tutte le testimonianze →
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-[#e8e6f0] hover:text-white transition-all flex items-center gap-2"
          >
            Lascia la tua testimonianza →
          </button>
        </div>
      </div>

      {/* Review submission modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#0b0914] border border-white/[0.08] rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSubmitStatus("idle");
              }}
              className="absolute top-4 right-4 text-[#8b8899] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="font-serif italic text-2xl text-[#F0EEFF] mb-6 text-left">
              Condividi la tua esperienza
            </h3>
            
            {submitStatus === "success" ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center mx-auto mb-4 text-[#10B981] text-lg font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-semibold text-[#F0EEFF] mb-2">Grazie per la tua testimonianza!</h4>
                <p className="text-xs text-[#8b8899] leading-relaxed">
                  La tua testimonianza è stata inviata e sarà visibile non appena approvata dal team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8b8899] mb-1.5 font-bold">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Il tuo nome..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] outline-none rounded-xl px-4 py-2.5 text-xs text-[#F0EEFF] transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8b8899] mb-1.5 font-bold">
                    Ruolo / Città (Opzionale)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Es. Sviluppatore, Milano..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] outline-none rounded-xl px-4 py-2.5 text-xs text-[#F0EEFF] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8b8899] mb-1.5 font-bold">
                    Valutazione *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStars(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-all ${
                            star <= stars ? "fill-[#FBBF24] text-[#FBBF24]" : "text-white/20 hover:text-white/40"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#8b8899] mb-1.5 font-bold">
                    La tua testimonianza *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Cosa ne pensi di Valorem?..."
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#a88bfa] outline-none rounded-xl px-4 py-2.5 text-xs text-[#F0EEFF] transition-all resize-none"
                  />
                </div>

                {submitStatus === "error" && (
                  <p className="text-[#F87171] text-xs font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "submitting"}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white text-xs font-bold hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                >
                  {submitStatus === "submitting" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Invia testimonianza"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
