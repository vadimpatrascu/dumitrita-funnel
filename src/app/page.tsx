"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/* ══════════════════════ Types ══════════════════════ */

interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  options: { label: string; emoji: string; value: string }[];
}

/* ══════════════════════ Data — ALL from Instagram ══════════════════════ */

const WHATSAPP_PHONE = "393288461370";

const questions: QuizQuestion[] = [
  {
    id: "goal",
    question: "Care este obiectivul tău principal?",
    subtitle: "Alege varianta care te descrie cel mai bine",
    options: [
      { label: "Vreau să slăbesc sănătos", emoji: "🎯", value: "slabire" },
      { label: "Vreau să mă mențin în formă", emoji: "⚖️", value: "mentinere" },
      { label: "Vreau să mănânc mai sănătos", emoji: "🥗", value: "sanatos" },
      { label: "Am o condiție medicală", emoji: "🏥", value: "medical" },
    ],
  },
  {
    id: "tried",
    question: "Ai mai încercat diete înainte?",
    subtitle: "Fii sincer/ă — nu există răspunsuri greșite",
    options: [
      { label: "Da, multe, fără rezultat durabil", emoji: "😔", value: "multe_fara" },
      { label: "Da, dar am revenit la kilogramele inițiale", emoji: "🔄", value: "yoyo" },
      { label: "Câteva, cu succes parțial", emoji: "🤔", value: "partial" },
      { label: "Nu, este prima dată", emoji: "✨", value: "prima_data" },
    ],
  },
  {
    id: "eating",
    question: "Cum arată alimentația ta acum?",
    subtitle: "Gândește-te la o zi obișnuită",
    options: [
      { label: "Mănânc neregulat, ce apuc", emoji: "🍕", value: "neregulat" },
      { label: "Gătesc, dar nu știu ce-i sănătos", emoji: "🍳", value: "gatesc" },
      { label: "Mănânc destul de bine deja", emoji: "🥦", value: "bine" },
      { label: "Am restricții alimentare / intoleranțe", emoji: "⚠️", value: "restrictii" },
    ],
  },
  {
    id: "challenge",
    question: "Ce te oprește cel mai mult?",
    subtitle: "Identifică principalul obstacol",
    options: [
      { label: "Nu am timp să gătesc zilnic", emoji: "⏰", value: "timp" },
      { label: "Nu știu ce ar trebui să mănânc", emoji: "❓", value: "nu_stiu" },
      { label: "Poftele și mâncatul emoțional", emoji: "🍫", value: "pofte" },
      { label: "Lipsa de motivație și disciplină", emoji: "💪", value: "motivatie" },
    ],
  },
  {
    id: "support",
    question: "Ce tip de ajutor cauți?",
    subtitle: "Alege ce ți-ar fi cel mai util acum",
    options: [
      { label: "Plan alimentar personalizat", emoji: "📋", value: "plan" },
      { label: "Rețete simple și gustoase", emoji: "👩‍🍳", value: "retete" },
      { label: "Ghidare și motivare continuă", emoji: "🤝", value: "ghidare" },
      { label: "Program complet de transformare", emoji: "🌟", value: "complet" },
    ],
  },
];

/* Real testimonials from Instagram posts and highlights */
const realTestimonials = [
  {
    name: "Clientă din Maraton",
    text: "Rezultatul meu în poze și cifre. Aceasta a fost cea mai bună decizie pe care am luat-o în noiembrie, acum sunt mândra că la 40 ani pot arăta bine! Succes tuturor!",
    result: "-18.3 kg",
    detail: "De la 99.8 kg la 81.5 kg",
    metrics: "-16 cm talie · -18 cm bust",
    source: "Postare fixată pe Instagram",
  },
  {
    name: "Participantă Maraton Ediția 2",
    text: "Mă alătur la cele scrise și vreau să spun ca e unicul maraton unde am o plăcere enormă sa intru să citesc mesajele din grup. Mă simt aici liberă și chiar mulțumesc Dumitriței pentru receptivitate.",
    result: "-4.4 kg",
    detail: "Rezultat în doar 7 zile",
    metrics: "Fără înfometare",
    source: "Highlight Rezultate",
  },
  {
    name: "Clientă verificată",
    text: "Ce transformare frumoasă! Bravo! Fiecare transformare începe cu o decizie: 'Gata, de azi aleg altceva'. Drumul nu e ușor, dar rezultatele vorbesc de la sine.",
    result: "-26 kg",
    detail: "În doar 5 luni",
    metrics: "Fără diete extreme",
    source: "Bio Instagram",
  },
];

/* Real measurements from verified Instagram post */
const realMeasurements = [
  { label: "Greutate", before: "99.8 kg", after: "81.5 kg", diff: "-18.3 kg" },
  { label: "Bust", before: "120 cm", after: "102 cm", diff: "-18 cm" },
  { label: "Talie", before: "103 cm", after: "87 cm", diff: "-16 cm" },
  { label: "Abdomen", before: "114 cm", after: "99 cm", diff: "-15 cm" },
  { label: "Fund", before: "111 cm", after: "100 cm", diff: "-11 cm" },
];

/* ══════════════════════ WhatsApp Builder ══════════════════ */

function buildWhatsAppURL(answers: Record<string, string>): string {
  const goalMap: Record<string, string> = {
    slabire: "să slăbesc sănătos",
    mentinere: "să mă mențin în formă",
    sanatos: "să mănânc mai sănătos",
    medical: "am o condiție medicală",
  };
  const challengeMap: Record<string, string> = {
    timp: "nu am timp să gătesc",
    nu_stiu: "nu știu ce să mănânc",
    pofte: "poftele și mâncatul emoțional",
    motivatie: "lipsa de motivație",
  };
  const supportMap: Record<string, string> = {
    plan: "plan alimentar personalizat",
    retete: "rețete simple și sănătoase",
    ghidare: "ghidare și motivare continuă",
    complet: "program complet de transformare",
  };

  const message =
    `Bună Dumitrița! 👋\n\n` +
    `Am completat quiz-ul de pe site și aș dori să aflu mai multe.\n\n` +
    `📌 Obiectivul meu: ${goalMap[answers.goal] || answers.goal}\n` +
    `📌 Provocarea mea: ${challengeMap[answers.challenge] || answers.challenge}\n` +
    `📌 Caut: ${supportMap[answers.support] || answers.support}\n\n` +
    `Aștept cu nerăbdare să discutăm! 🙏`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/* ══════════════════════ Hooks ══════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ══════════════════════ Icons ══════════════════════════════ */

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function ThreadsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 192 192">
      <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C82.2364 44.745 70.1369 51.5765 63.2175 63.6309L76.5756 72.2232C81.7752 63.5585 90.1631 61.0674 97.2724 61.0674C97.3472 61.0674 97.4226 61.0674 97.4974 61.0681C105.044 61.1172 110.752 63.5285 114.526 68.2395C117.257 71.6156 119.044 76.2216 119.843 81.9977C113.145 80.8762 105.855 80.4472 98.0355 80.7272C75.1978 81.5513 60.4932 95.2946 61.6556 114.479C62.2451 124.229 67.2387 132.563 75.7299 137.901C83.0295 142.499 92.2837 144.825 101.934 144.348C114.304 143.723 123.934 138.748 130.469 129.577C135.377 122.683 138.475 113.888 139.879 103.016C145.333 106.278 149.417 110.569 151.737 115.835C155.749 124.703 156.009 139.437 146.106 149.338C137.328 158.114 126.696 162.078 108.22 162.234C87.7056 162.064 72.5801 155.542 62.8757 142.735C53.9272 130.926 49.2669 114.106 49.0647 92.7403C49.2668 71.3744 53.9272 54.5543 62.8757 42.7451C72.5801 29.9381 87.7056 23.4163 108.22 23.2461C128.874 23.4176 144.247 30.0091 154.063 42.8976C158.839 49.1496 162.472 56.8671 164.865 65.9048L180.305 61.6488C177.349 50.5284 172.709 41.037 166.474 33.2737C153.538 16.8794 134.724 8.27985 108.329 8.07867C108.293 8.07867 108.257 8.07867 108.22 8.07867C81.9244 8.27935 63.2028 16.8282 50.286 33.0743C39.4048 47.3698 33.8929 66.6814 33.6729 92.6899L33.6729 93.0102C33.8929 118.939 39.4048 138.151 50.286 152.347C63.2028 168.493 81.9244 177.042 108.22 177.243C108.257 177.243 108.293 177.243 108.329 177.243C130.449 177.061 144.804 171.581 156.416 159.97C172.421 143.967 171.649 123.741 165.85 110.658C161.803 101.515 153.592 93.8647 141.537 88.9883ZM99.2162 129.135C87.0124 129.771 76.3659 123.012 75.8024 113.382C75.3752 106.379 80.411 98.339 98.6499 97.6277C101.061 97.5325 103.432 97.4871 105.762 97.4871C111.983 97.4871 117.868 98.0471 123.312 99.1216C121.382 122.671 109.903 128.578 99.2162 129.135Z" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 bg-[#3897f0] rounded-full ml-1.5">
      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

/* ══════════════════════ Sections ══════════════════════════ */

function Navbar({ stage, currentQ, totalQ, onLogoClick }: { stage: string; currentQ: number; totalQ: number; onLogoClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-surface/90 backdrop-blur-xl shadow-sm border-b border-border-light" : "bg-transparent"}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors">
            <Image src="/images/profile.jpg" alt="Dumitrița Doboș" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm block leading-tight">Dumitrița Doboș</span>
            <span className="text-[11px] text-muted leading-tight">Nutriție · Slăbire · Rețete</span>
          </div>
        </button>
        <div className="flex items-center gap-3">
          {stage === "quiz" && <span className="text-xs text-muted bg-surface-alt px-3 py-1 rounded-full">{currentQ + 1} / {totalQ}</span>}
          {stage === "hero" && (
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors">
              <InstagramIcon className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 leaf-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

      <div className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center py-16">
        {/* Hero image */}
        <div className="animate-fade-in-up mb-8">
          <div className="profile-ring w-[130px] h-[130px] sm:w-[150px] sm:h-[150px] mx-auto mb-5">
            <div className="w-full h-full rounded-full overflow-hidden bg-surface">
              <Image src="/images/client-result.jpg" alt="Dumitrița Doboș - Consultant Nutriție Generală" width={150} height={150} className="w-full h-full object-cover object-top" priority unoptimized />
            </div>
          </div>
          <div className="flex items-center justify-center mb-2">
            <p className="text-sm text-muted font-medium uppercase tracking-[0.2em]">Doboș Dumitrița</p>
            <VerifiedBadge />
          </div>
          <p className="text-xs text-muted-light mb-1">Consultant Nutriție Generală — AIPNSF</p>
          <p className="text-xs text-muted-light mb-6">Aviz Liberă Practică · Serie NG Nr. 598</p>
        </div>

        {/* Real bio from Instagram */}
        <div className="animate-fade-in-up delay-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] mb-5 max-w-2xl mx-auto">
            Clienta mea a slăbit
            <br />
            <span className="gradient-text">26 kg în doar 5 luni</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-4xl font-semibold text-muted">fără înfometare!</span>
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Cu mine înveți să te alimentezi sănătos și gustos.
            Completează quiz-ul și descoperă ce plan ți se potrivește.
          </p>
        </div>

        <div className="animate-scale-in delay-200">
          <button onClick={onStart} className="group bg-primary hover:bg-primary-dark text-white font-semibold text-base sm:text-lg px-10 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            Începe quiz-ul gratuit
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Real stats from Instagram — animated */}
        <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary"><AnimatedCounter end={16700} suffix="+" /></p>
            <p className="text-xs text-muted mt-0.5">Urmăritori Instagram</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary"><AnimatedCounter end={136} suffix="+" duration={1500} /></p>
            <p className="text-xs text-muted mt-0.5">Membri în comunitate</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-primary"><AnimatedCounter end={108} duration={1500} /></p>
            <p className="text-xs text-muted mt-0.5">Postări cu rețete</p>
          </div>
        </div>

        <div className="animate-fade-in-up delay-400 mt-8 flex flex-wrap justify-center gap-2.5">
          {["Acreditare AIPNSF 2025", "Consultant Nutriție Generală", "Aviz Liberă Practică"].map((badge) => (
            <span key={badge} className="glass-card px-4 py-2 rounded-full text-xs text-muted">✓ {badge}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccreditationSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-16 sm:py-24 px-4 sm:px-6 bg-surface relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className={`max-w-5xl mx-auto ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">Acreditare oficială</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Consultant Nutriție Generală certificat</h2>
          <p className="text-muted max-w-md mx-auto text-sm">Acreditare eliberată de AIPNSF — Asociația Internațională de Psihologie, Nutriție, Sport și Fitness.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
          {/* Real certificate image */}
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-[2rem] blur-sm" />
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-amber-200/30">
              <Image src="/images/aviz-certificate.jpg" alt="Aviz Liberă Practică — Doboș Dumitrița — Consultant Nutriție Generală — AIPNSF 2025" width={540} height={960} className="w-full h-auto" unoptimized />
            </div>
          </div>

          {/* Certificate details */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/40 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏅</span>
                <div>
                  <h3 className="font-bold text-amber-900">Aviz Liberă Practică</h3>
                  <p className="text-xs text-amber-700/70">Reg. Unic · Serie NG · Nr. 598</p>
                </div>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between py-2 border-b border-amber-200/30">
                  <span className="text-amber-700/80">Nume</span>
                  <span className="font-semibold text-amber-900">Doboș Dumitrița</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/30">
                  <span className="text-amber-700/80">Domeniu</span>
                  <span className="font-semibold text-amber-900">Consultant Nutriție Generală</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/30">
                  <span className="text-amber-700/80">Emis de</span>
                  <span className="font-semibold text-amber-900">AIPNSF</span>
                </div>
                <div className="flex justify-between py-2 border-b border-amber-200/30">
                  <span className="text-amber-700/80">Președinte</span>
                  <span className="font-semibold text-amber-900">Iulian Dinu</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-amber-700/80">An</span>
                  <span className="font-semibold text-amber-900">2025</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-50 border border-primary/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🎓</span>
                <h3 className="font-bold text-sm">Certificat de Absolvire</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Fitness Education School · Curs desfășurat în perioada 22.02.2025 - 17.08.2025 · Competențe: planuri alimentare, principii nutritive, calcul nutrițional, alimentația copiilor, vârstnicilor, în sarcină și alăptare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden leaf-pattern">
      <div className={`max-w-5xl mx-auto ${visible ? "" : "opacity-0"}`}>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className={`relative ${visible ? "animate-slide-left" : ""}`}>
            <div className="relative max-w-sm mx-auto md:mx-0">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/10 rounded-full blur-xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-[3/4] bg-primary-50">
                <Image src="/images/transformation.jpg" alt="Dumitrița Doboș - Nutriționist" width={400} height={533} className="w-full h-full object-cover object-center" unoptimized />
              </div>
              <div className="absolute -bottom-3 -right-3 sm:bottom-4 sm:right-[-1rem] glass-card rounded-2xl px-4 py-3 shadow-lg animate-float">
                <p className="text-sm font-semibold text-primary">🎓 AIPNSF</p>
                <p className="text-xs text-muted">Certificat 2025</p>
              </div>
            </div>
          </div>

          <div className={visible ? "animate-slide-right" : ""}>
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">Despre mine</span>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5 leading-tight">Bună, sunt Dumitrița! 👋</h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>Sunt <strong className="text-foreground">Consultant Nutriție Generală</strong>, acreditată de Asociația Internațională de Psihologie, Nutriție, Sport și Fitness (AIPNSF).</p>
              <p>Cu mine înveți să te alimentezi <strong className="text-foreground">sănătos și gustos</strong> — fără înfometare, fără diete extreme. Doar un plan clar, suport și consistență.</p>
              <p>Clienta mea a slăbit <strong className="text-foreground">26 kg în doar 5 luni</strong> — iar rezultatele fetelor din Maratonul de Slăbit sunt absolut incredibile!</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: "🔥", label: "Maratonul de Slăbit", sub: "Ediția 2 — sold out" },
                { icon: "📋", label: "Planuri personalizate", sub: "Adaptate fiecărei cliente" },
                { icon: "🍽️", label: "Rețete sănătoase", sub: "Gustoase și ușor de făcut" },
                { icon: "💬", label: "Comunitate activă", sub: "136+ membri WhatsApp" },
              ].map((item) => (
                <div key={item.label} className="bg-surface rounded-xl p-3.5 border border-border-light">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-sm font-medium mt-1.5">{item.label}</p>
                  <p className="text-xs text-muted">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RealResultsSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-4 sm:px-6 bg-surface relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">Rezultate verificate</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Transformări reale, măsurate în cifre</h2>
          <p className="text-muted max-w-lg mx-auto">Rezultate documentate de la cliente reale din programul de nutriție.</p>
        </div>

        {/* Measurements table — real data from Instagram post */}
        <div className={`max-w-lg mx-auto mb-14 ${visible ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
          <div className="bg-background rounded-2xl border border-border-light overflow-hidden">
            <div className="bg-primary-50 px-6 py-4 border-b border-border-light">
              <h3 className="font-semibold text-sm text-primary">Transformare clientă — 5 luni de program</h3>
            </div>
            <div className="divide-y divide-border-light">
              {realMeasurements.map((m) => (
                <div key={m.label} className="flex items-center px-6 py-3.5">
                  <span className="text-sm font-medium w-24 flex-shrink-0">{m.label}</span>
                  <span className="text-sm text-muted flex-1 text-center">{m.before}</span>
                  <span className="text-muted mx-2">→</span>
                  <span className="text-sm font-medium flex-1 text-center">{m.after}</span>
                  <span className="text-sm font-bold text-primary w-20 text-right">{m.diff}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted text-center mt-3">Sursă: postare verificată pe Instagram @dobos_dumitrita</p>
        </div>

        {/* Real testimonials from Instagram */}
        <div className="grid sm:grid-cols-3 gap-5">
          {realTestimonials.map((t, i) => (
            <div key={t.name} className={`testimonial-card bg-background rounded-2xl p-6 sm:p-7 border border-border-light ${visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="pt-4 border-t border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <span className="bg-primary-50 text-primary font-bold text-sm px-3 py-1 rounded-full">{t.result}</span>
                </div>
                <p className="text-xs text-muted">{t.detail} · {t.metrics}</p>
                <p className="text-[10px] text-muted-light mt-1">📌 {t.source}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TransformationGallery() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-4 sm:px-6 relative leaf-pattern">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">Dovezi reale</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Transformări din Maratonul de Slăbit</h2>
          <p className="text-muted max-w-lg mx-auto">Rezultate reale, documentate pe Instagram — de la clientele care au urmat programul.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Before/After transformation image */}
          <div className={`rounded-2xl overflow-hidden shadow-lg border border-border-light ${visible ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
            <Image src="/images/food1.jpg" alt="Transformare Reală - Maraton de Slăbit @veradurnea7" width={540} height={540} className="w-full h-auto object-cover" unoptimized />
          </div>

          {/* Healthy recipes showcase */}
          <div className={`grid grid-rows-2 gap-4 ${visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border-light">
              <Image src="/images/pinned1.jpg" alt="Rețete sănătoase - Dumitrița Doboș" width={540} height={300} className="w-full h-full object-cover" unoptimized />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border-light">
              <Image src="/images/pinned2.jpg" alt="Aperitive sănătoase" width={540} height={300} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">📸 Imagini reale de pe Instagram <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@dobos_dumitrita</a></p>
      </div>
    </section>
  );
}

function ServicesSection({ onStart }: { onStart: () => void }) {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-4 sm:px-6 relative leaf-pattern">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-14 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">Programele mele</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Schimbarea este posibilă când ai:</h2>
          <p className="text-muted max-w-lg mx-auto">Ghidare, un plan clar și susținere — exact ce primești în programele mele.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: "🔥", title: "Maratonul de Slăbit", desc: "Program intensiv cu suport zilnic, rețete noi în fiecare săptămână și comunitate de susținere. Transformări reale, fără înfometare, fără diete extreme.", tag: "Cel mai popular" },
            { icon: "📋", title: "Plan Alimentar Personal", desc: "Plan adaptat obiectivelor tale, preferințelor alimentare și stilului de viață. Include rețete și lista de cumpărături.", tag: null },
            { icon: "🤝", title: "Consultație 1-la-1", desc: "Sesiune individuală unde analizăm împreună stilul tău de viață și creăm un plan de acțiune personalizat.", tag: null },
          ].map((s, i) => (
            <div key={s.title} className={`relative bg-surface rounded-2xl p-6 sm:p-8 border border-border-light hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${visible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${i * 0.1}s` }}>
              {s.tag && <span className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">{s.tag}</span>}
              <span className="text-3xl block mb-4">{s.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className={`text-center mt-12 ${visible ? "animate-fade-in-up delay-400" : "opacity-0"}`}>
          <button onClick={onStart} className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
            Descoperă ce ți se potrivește →
          </button>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onStart }: { onStart: () => void }) {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-background to-accent-light" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className={`relative max-w-2xl mx-auto text-center ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
        <span className="text-4xl mb-5 block">🌿</span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight">
          Aceeași persoană.
          <br />Altă energie. Altă viață.
        </h2>
        <p className="text-sm text-muted italic mb-6">&ldquo;Fiecare transformare începe cu o decizie: Gata, de azi aleg altceva.&rdquo;</p>
        <p className="text-muted text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          Completează quiz-ul gratuit și vorbește direct cu mine pe WhatsApp. Schimbarea începe cu un singur pas. ❤️
        </p>
        <button onClick={onStart} className="group bg-primary hover:bg-primary-dark text-white font-semibold text-base sm:text-lg px-10 sm:px-14 py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          Începe quiz-ul acum <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <p className="text-xs text-muted mt-5">⏱ Durează doar 1 minut · 🔒 Fără date personale · ✓ 100% gratuit</p>
      </div>
    </section>
  );
}

/* ══════════════════════ Quiz Components ═══════════════════ */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="flex justify-between text-sm text-muted mb-2.5">
        <span className="font-medium">Întrebarea {current + 1} din {total}</span>
        <span className="text-primary font-semibold">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 bg-border-light rounded-full overflow-hidden">
        <div className="progress-bar h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)` }} />
      </div>
    </div>
  );
}

function QuestionCard({ question, onSelect }: { question: QuizQuestion; onSelect: (v: string) => void }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{question.question}</h2>
      {question.subtitle && <p className="text-muted text-center mb-8">{question.subtitle}</p>}
      <div className="grid gap-3 max-w-md mx-auto">
        {question.options.map((opt) => (
          <button key={opt.value} onClick={() => onSelect(opt.value)} className="quiz-option group flex items-center gap-4 bg-surface border-2 border-border-light hover:border-primary rounded-2xl px-6 py-5 text-left transition-all duration-200 hover:shadow-md cursor-pointer">
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform flex-shrink-0">{opt.emoji}</span>
            <span className="font-medium text-foreground text-[15px]">{opt.label}</span>
            <svg className="w-5 h-5 text-muted-light group-hover:text-primary ml-auto flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultsSection({ answers }: { answers: Record<string, string> }) {
  const waURL = buildWhatsAppURL(answers);
  const goalMessages: Record<string, { title: string; text: string }> = {
    slabire: { title: "Programul tău de slăbire sănătoasă", text: "Pe baza răspunsurilor tale, Dumitrița îți va crea un plan personalizat de slăbire — fără foame, fără restricții extreme. Exact cum clientele ei au slăbit până la 26 kg!" },
    mentinere: { title: "Menținere pe termen lung", text: "Vei primi strategii dovedite pentru a-ți păstra greutatea ideală și obiceiuri sănătoase." },
    sanatos: { title: "Alimentație sănătoasă pas cu pas", text: "Cu rețetele gustoase ale Dumitriței, tranziția spre o alimentație sănătoasă devine ușoară și plăcută." },
    medical: { title: "Plan adaptat condiției tale", text: "Cu acreditare în nutriție generală, Dumitrița te va ghida cu un plan adaptat nevoilor tale specifice." },
  };
  const result = goalMessages[answers.goal] || { title: "Planul tău personalizat", text: "Vorbește cu Dumitrița pentru un plan complet." };
  const goalLabel: Record<string, string> = { slabire: "Slăbire sănătoasă", mentinere: "Menținere", sanatos: "Alimentație sănătoasă", medical: "Condiție medicală" };
  const challengeLabel: Record<string, string> = { timp: "Lipsa timpului", nu_stiu: "Nu știu ce să mănânc", pofte: "Pofte & mâncat emoțional", motivatie: "Motivație & disciplină" };
  const supportLabel: Record<string, string> = { plan: "Plan alimentar personalizat", retete: "Rețete simple", ghidare: "Ghidare continuă", complet: "Program complet" };

  return (
    <div className="animate-fade-in-up max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl mx-auto mb-5">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{result.title}</h2>
        <p className="text-muted leading-relaxed">{result.text}</p>
      </div>

      <div className="bg-surface border border-border-light rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted mb-5">Profilul tău nutrițional</h3>
        <div className="space-y-4">
          {[
            { icon: "🎯", label: "Obiectiv", value: goalLabel[answers.goal] || answers.goal },
            { icon: "⚡", label: "Provocare", value: challengeLabel[answers.challenge] || answers.challenge },
            { icon: "🌟", label: "Tip suport", value: supportLabel[answers.support] || answers.support },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4 bg-surface-alt rounded-xl p-3.5">
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="font-medium text-sm truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <a href={waURL} target="_blank" rel="noopener noreferrer" className="animate-pulse-glow inline-flex items-center gap-3 bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold text-base sm:text-lg px-10 py-4 sm:py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <WhatsAppIcon className="w-6 h-6" />
          Scrie-mi pe WhatsApp
        </a>
        <p className="text-sm text-muted mt-4">Răspunsurile tale vor fi trimise automat în mesaj</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-success rounded-full" />Răspuns în max 24h</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-primary rounded-full" />Consultație gratuită</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-accent rounded-full" />Fără obligații</span>
        </div>
      </div>
    </div>
  );
}

function InstagramFeedSection() {
  const { ref, visible } = useInView();
  const foods = [
    { src: "/images/food1.jpg", alt: "Rețetă sănătoasă - Dumitrița Doboș" },
    { src: "/images/food2.jpg", alt: "Mâncare sănătoasă" },
    { src: "/images/pinned1.jpg", alt: "Rețetă de pe Instagram" },
    { src: "/images/pinned2.jpg", alt: "Aperitive sănătoase" },
  ];

  return (
    <section ref={ref} className="py-16 sm:py-24 px-4 sm:px-6 bg-surface relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-10 ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3 block">De pe Instagram</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Rețete sănătoase și gustoase</h2>
          <p className="text-muted max-w-md mx-auto text-sm">Alimentația sănătoasă nu înseamnă mâncare fără gust. Iată doar câteva exemple! 🍽️</p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 ${visible ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
          {foods.map((food, i) => (
            <a key={i} href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
              <Image src={food.src} alt={food.alt} width={400} height={400} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1.5 text-white text-xs">
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span className="font-medium">@dobos_dumitrita</span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className={`text-center mt-8 ${visible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-sm">
            <InstagramIcon className="w-4 h-4" />
            Vezi toate rețetele pe Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

function FloatingWhatsApp() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!show) return null;

  return (
    <a
      href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Bună Dumitrița! Aș dori să aflu mai multe despre programele tale de nutriție. 🙏")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-scale-in"
      aria-label="Scrie pe WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-whatsapp rounded-full animate-ping opacity-20" />
        <div className="relative w-14 h-14 bg-whatsapp hover:bg-whatsapp-dark rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <WhatsAppIcon className="w-7 h-7 text-white" />
        </div>
      </div>
    </a>
  );
}

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = end / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref} className="stat-number">{started ? count.toLocaleString("ro-RO") : "0"}{suffix}</span>;
}

function Footer() {
  return (
    <footer className="bg-surface border-t border-border-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border-light">
              <Image src="/images/profile.jpg" alt="Dumitrița Doboș" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center"><p className="font-semibold text-sm">Dumitrița Doboș</p><VerifiedBadge /></div>
              <p className="text-xs text-muted">Consultant Nutriție Generală · AIPNSF</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface-alt border border-border-light flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all"><InstagramIcon className="w-4 h-4" /></a>
            <a href="https://www.threads.com/@dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface-alt border border-border-light flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/30 transition-all"><ThreadsIcon className="w-4 h-4" /></a>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-surface-alt border border-border-light flex items-center justify-center text-muted hover:text-whatsapp hover:border-whatsapp/30 transition-all"><WhatsAppIcon className="w-4 h-4" /></a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border-light text-center">
          <p className="text-xs text-muted-light">© {new Date().getFullYear()} Doboș Dumitrița · Consultant Nutriție Generală · Toate drepturile rezervate</p>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════ Main Page ══════════════════════════ */

export default function Home() {
  const [stage, setStage] = useState<"hero" | "quiz" | "results">("hero");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleStart = () => { setStage("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleSelect = (value: string) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else { setStage("results"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handleBack = () => { if (currentQ > 0) setCurrentQ(currentQ - 1); else setStage("hero"); };
  const handleLogoClick = () => { setStage("hero"); setCurrentQ(0); setAnswers({}); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar stage={stage} currentQ={currentQ} totalQ={questions.length} onLogoClick={handleLogoClick} />

      {stage === "hero" && (
        <>
          <HeroSection onStart={handleStart} />
          <AccreditationSection />
          <AboutSection />
          <RealResultsSection />
          <TransformationGallery />
          <InstagramFeedSection />
          <ServicesSection onStart={handleStart} />
          <CTASection onStart={handleStart} />
        </>
      )}

      {stage === "quiz" && (
        <main className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
          <ProgressBar current={currentQ} total={questions.length} />
          <QuestionCard key={questions[currentQ].id} question={questions[currentQ]} onSelect={handleSelect} />
          <button onClick={handleBack} className="mt-8 mx-auto flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            {currentQ > 0 ? "Întrebarea anterioară" : "Înapoi la pagina principală"}
          </button>
        </main>
      )}

      {stage === "results" && (
        <main className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
          <ResultsSection answers={answers} />
        </main>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
