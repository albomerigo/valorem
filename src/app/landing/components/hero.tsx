import { useEffect, useState, useRef } from "react";
import { Sparkles, Shield, UserCheck, ArrowRight, Play } from "lucide-react";

export function Hero() {
  // Typing state for heading "Sono un coach."
  const coachLineText = "Sono un coach.";
  const [typedCoachLine, setTypedCoachLine] = useState("");
  const [isTypingHeadingDone, setIsTypingHeadingDone] = useState(false);

  // Typing state for dashboard Coach comment
  const [coachText, setCoachText] = useState("");
  const coachTargetText = "Il tuo ritmo di spesa è sotto controllo. Stai gestendo bene — continua così.";

  // 3D Card Tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
    transition: "all 0.5s ease"
  });

  // Heading typing effect using the requested slice pattern
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < coachLineText.length) {
        setTypedCoachLine(coachLineText.slice(0, i + 1));
        i++;
      } else {
        setIsTypingHeadingDone(true);
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Dashboard coach typing effect
  useEffect(() => {
    let index = 0;
    // Delay coach comment typing slightly until heading and mockup load
    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < coachTargetText.length) {
          setCoachText((prev) => prev + coachTargetText.charAt(index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 25);
      return () => clearInterval(interval);
    }, 1000);

    return () => {
      clearTimeout(delayTimer);
    };
  }, []);

  // Mouse Move Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate inside the card
    const y = e.clientY - rect.top;  // y coordinate inside the card
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 8; 
    const rotateX = -((y - centerY) / centerY) * 8; 
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`,
      transition: "transform 0.1s ease"
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.5s ease"
    });
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if character is part of "coach" to wrap it in gradient shimmer
  const renderTypedHeading = () => {
    const parts = typedCoachLine.split("coach");
    const hasCoach = typedCoachLine.includes("coach");
    
    return (
      <>
        {parts[0]}
        {hasCoach && (
          <span className="bg-gradient-to-r from-[#A88BFA] via-[#E879F9] to-[#60A5FA] bg-clip-text text-transparent font-medium animate-text-shimmer">
            coach
          </span>
        )}
        {parts[1]}
      </>
    );
  };

  return (
    <section id="hero" className="relative min-h-screen pt-20 pb-12 px-6 overflow-hidden flex flex-col items-center justify-start text-center bg-[#060508]">
      {/* 1. BACKGROUND DYNAMIC — 4 Animated Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Orb 1: Viola 600px, top-left */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#a88bfa]/15 blur-[120px] animate-orb-pulse animate-float-slow" />
        {/* Orb 2: Magenta 400px, top-right */}
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#e879f9]/10 blur-[120px] animate-orb-pulse animate-float-medium" style={{ animationDelay: "-3s" }} />
        {/* Orb 3: Blu 500px, bottom-left */}
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full bg-[#60a5fa]/10 blur-[120px] animate-orb-pulse animate-float-slow" style={{ animationDelay: "-6s" }} />
        {/* Orb 4: Cyan 300px, center-right */}
        <div className="absolute top-1/3 -right-10 w-[300px] h-[300px] rounded-full bg-[#67e8f9]/8 blur-[120px] animate-orb-pulse animate-float-medium" style={{ animationDelay: "-2s" }} />
      </div>

      {/* Iridescent top LED strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] animate-border-flow opacity-70 blur-[0.5px]" />

      {/* Floating Cards (Desktop only) */}
      <div className="absolute left-4 top-1/3 hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-xs text-[#a88bfa] font-medium shadow-lg animate-float-card delay-200 z-20">
        <span>€ 2,50 = 10 min</span>
      </div>
      <div className="absolute right-4 top-1/2 hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-xs text-[#e879f9] font-medium shadow-lg animate-float-card delay-500 z-20">
        <span>💜 3 impulsi evitati</span>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        {/* BADGE animato */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-inner text-[11px] md:text-xs font-semibold uppercase tracking-wider text-[#a88bfa] mb-5 stagger-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>✦ Finance Coach Comportamentale</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5">
            <svg width="12" height="8" viewBox="0 0 14 10" fill="none" className="inline rounded-sm">
              <rect width="4.67" height="10" fill="#009246" />
              <rect x="4.67" width="4.67" height="10" fill="rgba(255,255,255,0.9)" />
              <rect x="9.33" width="4.67" height="10" fill="#CE2B37" />
            </svg>
            Made in Italy
          </span>
        </div>

        {/* TITOLO with typing effect */}
        <h1 className="font-serif italic text-[#F0EEFF] text-4xl sm:text-6xl md:text-8xl tracking-tight leading-[1.05] max-w-3xl mb-4 min-h-[96px] sm:min-h-[136px] md:min-h-[180px]">
          <span className="block stagger-2">Non sono una banca.</span>
          <span className="block stagger-3">
            {renderTypedHeading()}
            {!isTypingHeadingDone && (
              <span className="inline-block w-[3px] h-[0.9em] bg-[#a88bfa] ml-1 animate-typing-cursor" />
            )}
          </span>
        </h1>

        {/* SOTTOTITOLO (fadeIn with delay) */}
        <p className="text-base md:text-lg text-[#8b8899] max-w-xl mx-auto leading-relaxed mb-6 stagger-4">
          Ogni euro che spendi è tempo della tua vita. Valorem te lo mostra, osserva le tue abitudini, e a fine mese ti racconta chi sei diventato.
        </p>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 w-full sm:w-auto"
          style={{ animation: "stagger-in 600ms ease both", animationDelay: "600ms" }}
        >
          <a
            href="https://valorem-albomerigo-2081s-projects.vercel.app/pricing"
            className="w-full sm:w-auto text-center px-8 py-4 rounded-full bg-gradient-to-r from-[#a88bfa] to-[#e879f9] text-white font-medium text-base shadow-[0_0_20px_rgba(168,139,250,0.25)] hover:shadow-[0_0_40px_rgba(168,139,250,0.5)] hover:scale-[1.03] transition-all duration-300 transform active:scale-100"
          >
            Inizia gratis — è subito →
          </a>
          <a
            href="#demo"
            onClick={(e) => handleScrollToSection(e, "demo")}
            className="w-full sm:w-auto text-center px-8 py-4 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-[#e8e6f0] hover:text-white transition-all font-medium text-base"
          >
            Guarda come funziona ↓
          </a>
        </div>

        {/* SOCIAL PROOF pills */}
        <div
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
          style={{ animation: "stagger-in 600ms ease both", animationDelay: "800ms" }}
        >
          <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm flex items-center gap-1.5">
            <span className="text-[#a88bfa]">✓</span> 100% italiano
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm flex items-center gap-1.5">
            <span className="text-[#a88bfa]">✓</span> GDPR compliant
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-[#8b8899] font-medium backdrop-blur-sm shadow-sm flex items-center gap-1.5">
            <span className="text-[#a88bfa]">✓</span> Gratis per iniziare
          </div>
        </div>

        {/* Animated Wrapper for 3D Dashboard Mockup Card */}
        <div
          className="w-full max-w-2xl mx-auto"
          style={{ animation: "slideUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) both", animationDelay: "1000ms" }}
        >
          <div
            className="w-full max-w-2xl mx-auto rounded-3xl p-[1.5px] bg-gradient-to-r from-[#a88bfa] via-[#e879f9] to-[#60a5fa] animate-border-flow shadow-[0_50px_100px_rgba(0,0,0,0.6)] relative group cursor-grab active:cursor-grabbing"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
          >
            {/* Iridescent outer border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#a88bfa]/15 via-[#e879f9]/8 to-[#60a5fa]/15 blur-2xl opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Actual Card Body */}
            <div className="bg-[#0b0912]/98 backdrop-blur-2xl rounded-[22px] p-6 md:p-8 border border-white/[0.06] relative z-10 text-left overflow-hidden">
              {/* Header bar */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/[0.04]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                <div className="flex-1 bg-white/[0.04] rounded-lg py-1 px-4 text-center text-[10px] tracking-widest text-[#8b8899] font-mono">
                  VALOREM.APP/DASHBOARD
                </div>
              </div>

              {/* Dashboard metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Card 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between overflow-hidden">
                  <span className="text-[10px] uppercase tracking-wider text-[#8b8899]">Safe-to-Spend oggi</span>
                  <div className="mt-2 text-2xl font-serif text-[#a88bfa] font-medium animate-[number-roll_0.8s_cubic-bezier(0.16,1,0.3,1)_both]">
                    47,30<span className="text-xs text-[#8b8899]">€</span>
                  </div>
                  <div className="mt-1.5 text-[10px] text-[#8b8899] bg-[#a88bfa]/10 text-[#a88bfa] rounded-full px-2 py-0.5 w-fit">
                    ≡ 2h 22min del tuo lavoro
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#8b8899]">Spese oggi</span>
                  <div className="mt-2 text-2xl font-serif text-[#e879f9] font-medium animate-[number-roll_0.8s_cubic-bezier(0.16,1,0.3,1)_100ms_both]">
                    12,80<span className="text-xs text-[#8b8899]">€</span>
                  </div>
                  <span className="mt-1.5 text-[10px] text-[#8b8899]">= 38 min di lavoro</span>
                </div>

                {/* Card 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#8b8899]">Capitale investito</span>
                  <div className="mt-2 text-2xl font-serif text-[#60a5fa] font-medium animate-[number-roll_0.8s_cubic-bezier(0.16,1,0.3,1)_200ms_both]">
                    240,00<span className="text-xs text-[#8b8899]">€</span>
                  </div>
                  <span className="mt-1.5 text-[10px] text-[#8b8899]">3 operazioni · mese</span>
                </div>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] mb-6 flex flex-col h-32 relative overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-[#8b8899] z-10">
                  Il tuo ritmo di spesa · Ultime 4 settimane
                </span>
                <div className="absolute inset-0 top-6 left-0 right-0 bottom-0">
                  <svg className="w-full h-full" viewBox="0 0 800 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#a88bfa" />
                        <stop offset="33%" stopColor="#60a5fa" />
                        <stop offset="66%" stopColor="#67e8f9" />
                        <stop offset="100%" stopColor="#e879f9" />
                      </linearGradient>
                      <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a88bfa" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#a88bfa" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area */}
                    <path
                      d="M0,80 C40,75 80,40 120,45 C160,50 200,20 240,30 C280,40 320,70 360,65 C400,60 440,15 480,25 C520,35 560,60 600,55 C640,50 680,30 720,25 C750,20 775,30 800,25 L800,100 L0,100 Z"
                      fill="url(#gradient-area)"
                    />
                    {/* Line */}
                    <path
                      d="M0,80 C40,75 80,40 120,45 C160,50 200,20 240,30 C280,40 320,70 360,65 C400,60 440,15 480,25 C520,35 560,60 600,55 C640,50 680,30 720,25 C750,20 775,30 800,25"
                      fill="none"
                      stroke="url(#gradient-line)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Coach Section */}
              <div className="p-4 rounded-2xl bg-[#a88bfa]/[0.04] border border-[#a88bfa]/[0.1] flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#a88bfa] to-[#e879f9] flex items-center justify-center font-bold text-xs text-white shadow-md flex-shrink-0">
                  V
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-[#a88bfa] font-bold mb-1">
                    Coach · in ascolto
                  </span>
                  <p className="text-sm font-serif italic text-[#e8e6f0] leading-relaxed">
                    {coachText}
                    <span className="inline-block w-[2px] h-[1.1em] bg-[#a88bfa] ml-1 animate-pulse" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
