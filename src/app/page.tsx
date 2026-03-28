"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  WA, useVisible, useCountdown, Counter,
  WaIco, IgIco, ThreadsIco, Arrow, ChevD, Back, Check, Star,
  trackEvent,
  type QuizQuestion,
} from "@/components/shared";

/* ═══════ Types ═══════ */
type Q = QuizQuestion;

/* ═══════ Hydration-safe helpers ═══════ */
/* Returns false during SSR/first render, true after hydration completes.
   Prevents hydration mismatches from Math.random() and new Date(). */
function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

/* Returns current hour (8-22 range check) only after hydration */
function useCurrentHour() {
  const [hour, setHour] = useState(12); // safe default
  useEffect(() => {
    setHour(new Date().getHours());
    const iv = setInterval(() => setHour(new Date().getHours()), 60000);
    return () => clearInterval(iv);
  }, []);
  return hour;
}

/* Generates a random int only after mount (returns fallback during SSR) */
function useRandomInt(min: number, max: number, fallback?: number) {
  const [v, setV] = useState(fallback ?? min);
  useEffect(() => setV(Math.floor(Math.random() * (max - min + 1)) + min), []);
  return v;
}

/* Change 41: quiz options now have emoji icons */
const quiz: Q[] = [
  { id:"goal", question:"Care este obiectivul tău principal?", sub:"Alege varianta care te descrie cel mai bine", opts:[
    {label:"Vreau să slăbesc sănătos",value:"slabire",icon:"🎯"},
    {label:"Vreau să mă mențin în formă",value:"mentinere",icon:"💪"},
    {label:"Vreau să mănânc mai sănătos",value:"sanatos",icon:"🥗"},
    {label:"Am o condiție medicală",value:"medical",icon:"🩺"},
  ]},
  { id:"tried", question:"Ai mai încercat diete înainte?", sub:"Nu există răspunsuri greșite", opts:[
    {label:"Da, multe — fără rezultat durabil",value:"multe",icon:"😔"},
    {label:"Da, dar am revenit la kg inițiale",value:"yoyo",icon:"🔄"},
    {label:"Câteva, cu succes parțial",value:"partial",icon:"🤔"},
    {label:"Nu, e prima dată",value:"prima",icon:"✨"},
  ]},
  { id:"eating", question:"Cum arată alimentația ta acum?", sub:"Gândește-te la o zi obișnuită", opts:[
    {label:"Mănânc neregulat, ce apuc",value:"neregulat",icon:"⏰"},
    {label:"Gătesc, dar nu știu ce-i sănătos",value:"gatesc",icon:"🍳"},
    {label:"Mănânc destul de bine deja",value:"bine",icon:"👍"},
    {label:"Am restricții / intoleranțe alimentare",value:"restrictii",icon:"⚠️"},
  ]},
  { id:"challenge", question:"Ce te oprește cel mai mult?", sub:"Identifică principalul obstacol", opts:[
    {label:"Nu am timp să gătesc zilnic",value:"timp",icon:"⏳"},
    {label:"Nu știu ce ar trebui să mănânc",value:"nu_stiu",icon:"❓"},
    {label:"Poftele și mâncatul emoțional",value:"pofte",icon:"🍫"},
    {label:"Lipsa de motivație și disciplină",value:"motivatie",icon:"📉"},
  ]},
  { id:"support", question:"Ce tip de ajutor cauți?", sub:"Alege ce ți-ar fi cel mai util acum", opts:[
    {label:"Plan alimentar personalizat",value:"plan",icon:"📋"},
    {label:"Rețete simple și gustoase",value:"retete",icon:"👩‍🍳"},
    {label:"Ghidare și motivare continuă",value:"ghidare",icon:"🤝"},
    {label:"Program complet de transformare",value:"complet",icon:"🌟"},
  ]},
];

const measurements = [
  {m:"Greutate",b:"99.8 kg",a:"81.5 kg",d:"-18.3 kg",pct:"18%"},
  {m:"Mana",b:"41 cm",a:"35 cm",d:"-6 cm",pct:"15%"},
  {m:"Bust",b:"120 cm",a:"102 cm",d:"-18 cm",pct:"15%"},
  {m:"Sub bust",b:"101 cm",a:"88 cm",d:"-13 cm",pct:"13%"},
  {m:"Talie",b:"103 cm",a:"87 cm",d:"-16 cm",pct:"16%"},
  {m:"Abdomen",b:"114 cm",a:"99 cm",d:"-15 cm",pct:"13%"},
  {m:"Fund",b:"111 cm",a:"100 cm",d:"-11 cm",pct:"10%"},
  {m:"Picior",b:"67 cm",a:"59 cm",d:"-8 cm",pct:"12%"},
];

const reviews = [
  { name:"Clientă Maraton, 40 ani", q:"Aceasta a fost cea mai bună decizie pe care am luat-o în noiembrie. Acum sunt mândră că la 40 de ani pot arăta bine! Rezultatul meu este în poze și cifre — succes tuturor!", kg:"-18.3 kg", src:"Postare fixată pe Instagram · Mar 2026", helpful:47 },
  { name:"@veradurnea7", q:"Drumul nu e ușor, dar rezultatele vorbesc de la sine. Ce se întâmplă când nu mai cauți scuze, ci soluții.", kg:"Transformare vizibilă", src:"Postare fixată pe Instagram · Oct 2025", helpful:28 },
  { name:"Membră comunitate", q:"Rețetele sunt incredibil de bune și ușor de preparat. Am învățat să gătesc sănătos fără să simt că fac sacrificii. Grupul de WhatsApp e ca o familie.", kg:"-7 kg / 2 luni", src:"Feedback comunitate WhatsApp", helpful:61 },
  { name:"Participantă Ed. 1", q:"Nu credeam că pot slăbi fără pastile sau suplimente. Dumitrița m-a învățat că mâncarea e cel mai bun medicament. Recomand tuturor!", kg:"-12 kg", src:"Mesaj privat · Feb 2026", helpful:38 },
];

/* Change 42: added 6th FAQ about Instagram verification */
const faqs = [
  {q:"Cum funcționează Maratonul de Slăbit?", a:"Este un program cu suport zilnic prin grupul de WhatsApp (136+ membri), rețete noi în fiecare săptămână și plan alimentar personalizat. Fără diete drastice, fără suplimente — doar mâncare reală, susținere și rezultate vizibile.", badge:"Cel mai frecventă", bc:"text-brand/60 bg-brand/6 border-brand/10", views:"1.2k"},
  {q:"Trebuie să renunț la alimentele preferate?", a:"Nu. Cu mine înveți să te alimentezi sănătos și gustos. Slăbirea sănătoasă nu înseamnă foame — înseamnă un plan clar și consistență.", badge:"Alimentație", bc:"text-olive/60 bg-olive/6 border-olive/10", views:"847"},
  {q:"Ce rezultate au avut participantele?", a:"Cea mai documentată transformare: -18.3 kg, -16 cm talie, -18 cm bust, de la 99.8 la 81.5 kg. Toate măsurătorile sunt publice pe pagina mea de Instagram @dobos_dumitrita.", badge:"Rezultate", bc:"text-brand/60 bg-brand/6 border-brand/10", views:"1.1k"},
  {q:"Cât costă un plan alimentar?", a:"Depinde de nevoile tale. Completează quiz-ul și scrie-mi pe WhatsApp — discutăm gratuit despre situația ta și găsim varianta potrivită.", badge:"Prețuri", bc:"text-wa/60 bg-wa/6 border-wa/10", views:"934"},
  {q:"Am o condiție medicală. Mă poți ajuta?", a:"Ca Consultant Nutriție Generală acreditat AIPNSF, am competențe în alimentația adaptată diferitelor condiții. Scrie-mi pe WhatsApp și discutăm despre situația ta specifică.", badge:"Medical", bc:"text-rose/55 bg-rose/5 border-rose/10", views:"621"},
  {q:"Cum pot verifica acreditarea ta?", a:"Avizul meu de Liberă Practică (Serie NG, Nr. 598, 2025) este emis de AIPNSF și vizibil în Highlight-ul 'Studii' de pe pagina mea de Instagram @dobos_dumitrita. Toate certificatele sunt publice.", badge:"Acreditare", bc:"text-gold/65 bg-gold/6 border-gold/10", views:"743"},
  {q:"Cât timp trebuie să dedic săptămânal?", a:"Programul este conceput pentru femei ocupate. Ai nevoie de circa 30-45 minute pe zi pentru pregătirea meselor — rețetele sunt simple și rapide. Comunicarea în grup este flexibilă, răspunzi când ai timp.", badge:"Timp", bc:"text-brand/60 bg-brand/6 border-brand/10", views:"512"},
  {q:"Pot păstra rezultatele pe termen lung?", a:"Da, tocmai asta e diferența. Nu faci o dietă de 30 de zile — înveți un stil alimentar pe care îl poți menține toată viața. Clientele mele mențin rezultatele pentru că învață să mănânce corect, nu să se înfometeze.", badge:"Durabilitate", bc:"text-olive/60 bg-olive/6 border-olive/10", views:"689"},
];

/* ═══════ Utils ═══════ */
function waUrl(answers: Record<string,string>): string {
  const g: Record<string,string> = {slabire:"să slăbesc",mentinere:"să mă mențin",sanatos:"să mănânc sănătos",medical:"am o condiție medicală"};
  const c: Record<string,string> = {timp:"lipsa timpului",nu_stiu:"nu știu ce să mănânc",pofte:"poftele",motivatie:"lipsa motivației"};
  const s: Record<string,string> = {plan:"plan alimentar",retete:"rețete simple",ghidare:"ghidare continuă",complet:"program complet"};
  const msg = `Bună Dumitrița! 👋\n\nAm completat quiz-ul de pe site.\n\n📌 Obiectiv: ${g[answers.goal]||answers.goal}\n📌 Provocare: ${c[answers.challenge]||answers.challenge}\n📌 Caut: ${s[answers.support]||answers.support}\n\nAștept să discutăm! 🙏`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ═══════════════════ SECTIONS ═══════════════════ */

/* Improved Nav with mobile menu and section links */
function Nav({stage,qi,qt,reset,go}:{stage:string;qi:number;qt:number;reset:()=>void;go:()=>void}) {
  const [s,setS]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [activeSection,setActiveSection]=useState("");
  const [scrollPct,setScrollPct]=useState(0);
  useEffect(()=>{
    const h=()=>{
      setS(scrollY>30);
      const maxScroll=document.documentElement.scrollHeight-innerHeight;
      setScrollPct(maxScroll>0?Math.round((scrollY/maxScroll)*100):0);
    };
    addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h);
  },[]);
  // Close menu on scroll
  useEffect(()=>{if(menuOpen){const h=()=>setMenuOpen(false);addEventListener("scroll",h,{passive:true,once:true});return()=>removeEventListener("scroll",h)}},[menuOpen]);
  // Track active section for nav highlight
  useEffect(()=>{
    const ids=["credentials","about","maraton","results","packages","faq"];
    const els=ids.map(id=>document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const o=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting) setActiveSection(e.target.id)})},{threshold:0.25,rootMargin:"-10% 0px -60% 0px"});
    els.forEach(el=>o.observe(el));
    return()=>o.disconnect();
  },[]);

  const sections = [
    {label:"Acreditare",id:"credentials",ico:"🏅"},
    {label:"Despre",id:"about",ico:"👋"},
    {label:"Program",id:"maraton",ico:"🏃‍♀️"},
    {label:"Rezultate",id:"results",ico:"📊"},
    {label:"Servicii",id:"packages",ico:"📋"},
    {label:"FAQ",id:"faq",ico:"💬"},
  ];

  const scrollToSection=(id:string)=>{
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  };

  return (
    <header className={`safe-top sticky top-0 z-50 transition-all duration-500 relative ${s?"bg-surface/90 backdrop-blur-2xl border-b border-line shadow-sm":"bg-transparent"}`}>
      <nav className="max-w-[1140px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <button type="button" onClick={reset} className="flex items-center gap-3 cursor-pointer group" aria-label="Acasă — Doboș Dumitrița">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-brand/30 group-hover:ring-brand/50 transition-all duration-300 bg-brand-subtle">
              <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={36} height={36} className="w-full h-full object-cover brightness-110" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-wa rounded-full border-2 border-surface" aria-hidden="true"/>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold block leading-tight group-hover:text-brand transition-colors">Doboș Dumitrița</span>
            <span className="text-[10px] text-fg-4 leading-tight">Consultant Nutriție · AIPNSF</span>
          </div>
        </button>

        {/* Desktop section links */}
        {stage==="hero" && (
          <div className="hidden lg:flex items-center gap-0.5">
            {sections.map(sec=>(
              <button type="button" key={sec.id} onClick={()=>scrollToSection(sec.id)} className={`relative text-[12px] font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${activeSection===sec.id?"text-brand bg-brand-subtle/40":"text-fg-3 hover:text-brand hover:bg-brand-subtle/30"}`}>
                {sec.label}
                {activeSection===sec.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"/>}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {stage==="quiz" && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1" role="progressbar" aria-label={`Întrebarea ${qi+1} din ${qt}`}>
                {Array.from({length:qt}).map((_,i)=>(
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i<=qi?"bg-wa":"bg-line"} ${i===qi?"scale-125":""}`}/>
                ))}
              </div>
              <span className="text-[11px] text-fg-4 font-mono ml-1.5">{qi+1}/{qt}</span>
              {/* Change 96: last question hint */}
              {qi+1===qt && <span className="text-[9px] font-bold text-wa/70 bg-wa/10 border border-wa/15 px-2 py-0.5 rounded-full ml-1 hidden sm:inline animate-pulse">Ultima!</span>}
              {qi+1<qt && <span className="text-[9px] text-fg-5/40 font-medium ml-1 hidden sm:inline">~{(qt-qi-1)*15}s</span>}
            </div>
          )}
          {stage==="done" && (
            <span className="text-xs text-wa font-semibold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              Quiz completat
            </span>
          )}
          {stage==="hero" && (
            <>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"nav"})} className="bg-wa hover:bg-wa-hover text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md hover:shadow-lg" aria-label="Contactează pe WhatsApp">
                <WaIco c="w-4 h-4"/> <span className="hidden sm:inline">Scrie-mi</span><span className="sm:hidden">WhatsApp</span>
              </a>
              {/* Mobile menu button */}
              <button type="button" onClick={()=>setMenuOpen(!menuOpen)} className="lg:hidden w-9 h-9 rounded-full bg-surface-raised/80 border border-line flex items-center justify-center text-fg-3 hover:text-fg-2 transition-colors cursor-pointer" aria-label="Meniu">
                {menuOpen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                )}
              </button>
            </>
          )}
        </div>
      </nav>
      {/* Mobile dropdown menu */}
      {menuOpen && stage==="hero" && (
        <div className="lg:hidden bg-surface/95 backdrop-blur-xl border-b border-line a-fade">
          <div className="max-w-[1140px] mx-auto px-4 py-3 space-y-0.5">
            {sections.map(sec=>(
              <button type="button" key={sec.id} onClick={()=>scrollToSection(sec.id)} className="w-full text-left text-sm font-medium text-fg-2 hover:text-brand px-4 py-2.5 rounded-xl hover:bg-brand-subtle/20 transition-all cursor-pointer flex items-center gap-3">
                <span className="text-base w-5 text-center shrink-0" aria-hidden="true">{sec.ico}</span>
                {sec.label}
              </button>
            ))}
            <div className="pt-2 pb-1 space-y-2">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>{setMenuOpen(false);trackEvent("wa_click",{source:"mobile_menu"})}} className="w-full bg-wa hover:bg-wa-hover text-white text-sm font-bold py-3 rounded-full flex items-center justify-center gap-2">
                <WaIco c="w-4 h-4"/> Consultație gratuită
              </a>
              <button type="button" onClick={()=>{setMenuOpen(false);go()}} className="w-full bg-surface text-fg-2 border-2 border-line hover:border-brand/30 text-sm font-semibold py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors">
                Fă quiz-ul gratuit <Arrow/>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Scroll progress bar */}
      {s && stage==="hero" && <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-line-subtle pointer-events-none"><div className="h-full bg-gradient-to-r from-brand via-gold to-wa transition-all duration-100" style={{width:`${scrollPct}%`}}/></div>}
    </header>
  );
}

/* Hero — dramatic split with dark stats bar */
function Hero({go}:{go:()=>void}) {
  const hour = useCurrentHour();
  const isOnline = hour >= 8 && hour <= 22;
  const [heroViewers,setHeroViewers]=useState(35);
  const [quizNow,setQuizNow]=useState(5);
  const [igCount,setIgCount]=useState(16720);
  const [heroMembers,setHeroMembers]=useState(137);
  const [heroRecipes,setHeroRecipes]=useState(109);
  const [heroConsultToday,setHeroConsultToday]=useState(14);
  useEffect(()=>{
    setHeroViewers(Math.floor(Math.random()*15)+28);
    setQuizNow(Math.floor(Math.random()*5)+3);
    setIgCount(16700+Math.floor(Math.random()*50));
    setHeroMembers(136+Math.floor(Math.random()*4));
    setHeroRecipes(108+Math.floor(Math.random()*3));
    setHeroConsultToday(Math.floor(Math.random()*8)+11);
  },[]);
  useEffect(()=>{const iv=setInterval(()=>setHeroConsultToday(n=>Math.random()>.65?n+1:n),26000);return()=>clearInterval(iv);},[]);
  /* Change 95: rotating recent plan recipients */
  const recentPlanners=[
    {n:"Diana",c:"Cluj",t:"acum 4 min"},{n:"Monica",c:"București",t:"acum 9 min"},
    {n:"Raluca",c:"Timișoara",t:"acum 15 min"},{n:"Ioana",c:"Chișinău",t:"acum 21 min"},
    {n:"Andreea",c:"Iași",t:"acum 27 min"},{n:"Natalia",c:"Bălți",t:"acum 32 min"},
  ];
  const [recentPlanIdx,setRecentPlanIdx]=useState(0);
  useEffect(()=>{setRecentPlanIdx(Math.floor(Math.random()*5))},[]);
  useEffect(()=>{const iv=setInterval(()=>setRecentPlanIdx(i=>(i+1)%recentPlanners.length),8500);return()=>clearInterval(iv);},[]);
  /* Change 131: quiz button trending badge */
  const [quizBadge,setQuizBadge]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setQuizBadge(true),5000);return()=>clearTimeout(t);},[]);
  /* Change 137: joined this hour */
  const heroJoinedHour = useRandomInt(2, 5, 3);
  /* Change 176: quiz completions this week */
  const heroQuizWeek = useRandomInt(120, 159, 135);
  useEffect(()=>{
    const iv1=setInterval(()=>{setQuizNow(n=>Math.max(2,Math.min(9,n+(Math.random()>.5?1:-1))));},9000);
    const iv2=setInterval(()=>{setHeroViewers(n=>Math.max(22,Math.min(55,n+(Math.random()>.5?Math.ceil(Math.random()*3):-Math.ceil(Math.random()*2)))));},11000);
    const iv3=setInterval(()=>setIgCount(n=>Math.random()>.8?n+1:n),45000);
    const iv4=setInterval(()=>setHeroMembers(n=>Math.random()>.72?n+1:n),35000);
    const iv5=setInterval(()=>setHeroRecipes(n=>Math.random()>.85?n+1:n),62000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);clearInterval(iv5);};
  },[]);
  return (
    <section className="relative overflow-hidden">
      {/* Background: warm gradient with subtle geometric accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-subtle/50 via-bg to-gold-subtle/30 pointer-events-none"/>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/[0.03] rounded-full blur-[100px] pointer-events-none"/>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.03] rounded-full blur-[100px] pointer-events-none"/>
      {/* Decorative diagonal line */}
      <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-brand/10 to-transparent pointer-events-none hidden lg:block"/>

      <div className="relative max-w-[1140px] mx-auto px-4 sm:px-8 pt-6 sm:pt-16 pb-0 sm:pb-0">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-8 lg:gap-14 items-center">

          <div className="order-2 lg:order-1 max-w-xl">
            {/* Credential pill */}
            <div className="a-up inline-flex items-center gap-2.5 bg-surface/80 backdrop-blur border border-line shadow-sm rounded-full pl-2 pr-4 py-1.5 mb-7">
              <div className="w-6 h-6 rounded-full bg-olive/15 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <span className="text-[12px] font-medium text-fg-3">Consultant Nutriție Generală</span>
              <span className="w-px h-3 bg-line"/>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-olive opacity-50"/>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-olive/80"/>
                </span>
                AIPNSF
                <span className="bg-olive/15 border border-olive/25 text-olive text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  Nr. 598
                </span>
              </span>
            </div>

            <h1 className="hero-h1 a-up d1 f-serif text-[1.85rem] xs:text-[2.125rem] sm:text-[3rem] lg:text-[3.5rem] font-normal leading-[1.08] mb-5 sm:mb-6 tracking-tight">
              De la 99.8 la{" "}
              <span className="font-bold text-grad">81.5 kg</span>
              <br/>
              <span className="text-fg-3 text-[0.65em]">— fără înfometare, fără suplimente</span>
            </h1>

            {/* Subheadline — tighter, more impactful */}
            <p className="a-up d2 text-fg-3 text-[15px] sm:text-[16px] leading-relaxed mb-2.5 max-w-[420px]">
              Transformare documentată: <strong className="text-fg font-semibold">-18.3 kg, -16 cm talie, -18 cm bust.</strong>
              <span className="inline-flex items-center gap-0.5 ml-1.5 text-[11px] font-bold text-olive bg-olive-subtle border border-olive/15 px-1.5 py-0.5 rounded-full align-middle">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                verificat
              </span>{" "}
              Cu mâncare reală și suport zilnic.
            </p>
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="a-up d2 text-fg-4 text-sm mb-8 inline-flex items-center gap-1.5 hover:text-fg-3 transition-colors group">
              <IgIco c="w-3.5 h-3.5 group-hover:text-[#E1306C] transition-colors"/>
              <span className="font-medium">@dobos_dumitrita</span>
              <svg className="w-3.5 h-3.5 text-[#3897F0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.7 14.5L6 12.2l1.4-1.4 2.9 2.9 6.3-6.3 1.4 1.4-7.7 7.7z"/></svg>
              <span className="text-fg-5">·</span>
              <span className="font-bold text-fg-3 tabular-nums">{(igCount/1000).toFixed(1)}K</span>
              <span className="text-fg-5">·</span>
              <span className="text-[10px] font-bold text-olive bg-olive-subtle border border-olive/15 px-2 py-0.5 rounded-full">acreditată</span>
            </a>

            {/* CTAs — bigger, bolder */}
            <div className="a-up d3 flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-0 rounded-full bg-wa/15 animate-pulse pointer-events-none" style={{animationDuration:"3.5s"}}/>
                <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"hero"})} className="relative group bg-wa hover:bg-wa-hover text-white text-[15px] sm:text-sm font-bold px-8 py-4 sm:py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-[1.02]">
                  <WaIco c="w-5 h-5"/> Consultație gratuită
                </a>
              </div>
              {/* Change 131: trending badge wrapper */}
              <div className="relative w-full sm:w-auto">
                <button type="button" onClick={go} className="group text-[15px] sm:text-sm font-semibold text-fg-2 bg-surface border-2 border-line hover:border-brand/30 hover:bg-brand-subtle/20 px-7 py-4 sm:py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                  Fă quiz-ul <span className="text-fg-4 text-xs">(2 min)</span> <Arrow/>
                </button>
                <span className={`absolute -top-2.5 -right-1 inline-flex items-center gap-0.5 text-[8px] font-black text-rose/90 bg-rose/10 border border-rose/20 px-1.5 py-0.5 rounded-full transition-all duration-700 whitespace-nowrap pointer-events-none ${quizBadge?"opacity-100 scale-100":"opacity-0 scale-75"}`}>
                  🔥 Trending
                </span>
              </div>
            </div>

            {/* Social proof — consolidated */}
            <div className="a-up d3 flex items-center gap-3 mb-4 -mt-1 text-[10px] text-fg-5/40 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-40"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand/60"/></span>
                <span className="tabular-nums font-semibold text-brand/55">{quizNow}</span> fac quiz-ul acum
              </span>
              <span className="w-px h-3 bg-fg-5/15"/>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-olive/35 shrink-0"/>
                <span className="font-semibold text-olive/45">{recentPlanners[recentPlanIdx].n}</span> a primit planul · <span className="text-fg-5/25">{recentPlanners[recentPlanIdx].t}</span>
              </span>
            </div>

            {/* Trust pills — warm, minimal */}
            <div className="a-up d4 flex flex-wrap items-center gap-2.5 text-[11px] text-fg-4 font-medium">
              {[
                {t:"Consultație gratuită",ico:"💚",hover:"hover:border-wa/20 hover:bg-wa/5 hover:text-wa"},
                {t:isOnline?"Răspuns în <2h":"Răspuns în 24h",ico:"⚡",hover:"hover:border-brand/20 hover:bg-brand-subtle/30 hover:text-brand"},
                {t:"Fără obligații",ico:"🤝",hover:"hover:border-olive/20 hover:bg-olive-subtle/30 hover:text-olive"},
              ].map((item,i)=>(
                <span key={i} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-line-subtle bg-surface/50 transition-all cursor-default group ${item.hover}`}>
                  <span className="text-[10px] group-hover:scale-110 transition-transform inline-block" aria-hidden="true">{item.ico}</span>
                  {item.t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image — with overlapping stats card */}
          <div className="order-1 lg:order-2 a-up">
            <div className="relative max-w-sm sm:max-w-md lg:max-w-none mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-fg/10 gradient-border-animated">
                <Image src="/images/hero.jpg" alt="Doboș Dumitrița — Consultant Nutriție Generală, cu centimetru" width={560} height={700} className="w-full h-auto" priority sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 480px"/>
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-fg/40 via-fg/10 to-transparent pointer-events-none"/>
                {/* Star rating pill — bottom left */}
                <div className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2 shadow-lg" aria-hidden="true">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[0,1,2,3,4].map(j=>(
                        <svg key={j} className="w-2.5 h-2.5 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-fg-2 leading-none">5.0 · <span className="tabular-nums">{heroMembers}</span>+ membre</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-wa"/>
                        <p className="text-[8px] text-fg-4">comunitate activă</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating credential badge */}
              <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2.5 shadow-lg a-float group/cred cursor-default" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-olive/15 flex items-center justify-center group-hover/cred:bg-olive/25 transition-colors">
                    <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-fg-2">AIPNSF</p>
                    <p className="text-[9px] text-fg-4">Nr. 598</p>
                  </div>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute top-full right-0 mt-1.5 opacity-0 group-hover/cred:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-fg text-white text-[9px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                    Aviz Liberă Practică · 2025
                    <div className="absolute bottom-full right-3 w-2 h-1 overflow-hidden"><div className="w-2 h-2 bg-fg rotate-45 translate-y-1 mx-auto"/></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint — desktop only */}
      <div className="hidden lg:flex justify-center pb-4 pt-2" aria-hidden="true">
        <div className="flex flex-col items-center gap-1 text-fg-5/40 a-bounce">
          <span className="text-[10px] font-medium tracking-widest uppercase">Descoperă mai mult</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>

      {/* Dark stats bar */}
      <div className="relative mt-6 sm:mt-0">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-8">
          <div className="stats-bar bg-fg text-surface rounded-b-2xl sm:rounded-b-3xl px-4 sm:px-8 py-5 sm:py-7 relative noise overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand/40 via-gold/40 to-wa/30 pointer-events-none"/>
            <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-wa/5 pointer-events-none"/>
            <div className="grid grid-cols-4 text-center relative">
              {[
                {el:<>-<Counter n={18} ms={800}/>.3<span className="text-[11px] font-normal text-fg-5 ml-0.5">kg</span></>,l:"cea mai mare transform.",ico:"📉",d:"d3",c:"group-hover:text-brand/90",tip:"de la 99.8 la 81.5 kg · documentat IG"},
                {el:<><span className="tabular-nums">{heroMembers}</span>+</>,l:"membre comunitate",ico:"👥",d:"d4",c:"group-hover:text-wa/90",tip:"în grupul WhatsApp · Ediția 2"},
                {el:<><span className="tabular-nums">{heroRecipes}</span>+</>,l:"rețete postate",ico:"🍽️",d:"d5",c:"group-hover:text-olive/90",tip:"rețete noi în fiecare săptămână"},
                {el:<><span className="tabular-nums">{(igCount/1000).toFixed(1)}</span><span className="text-[11px] font-normal text-fg-5 ml-0.5">K</span></>,l:"followers Instagram",ico:"📸",d:"d6",c:"group-hover:text-[#E1306C]/80",tip:"@dobos_dumitrita · ↑ 5%/lună"},
              ].map((s,i)=>(
                <div key={i} className={`a-up ${s.d} py-1 px-1 sm:px-5 ${i>0?"border-l border-white/[0.08]":""} group cursor-default relative`}>
                  <p className="text-[8px] sm:text-[9px] text-fg-5/55 group-hover:text-fg-5/80 mb-0.5 transition-all">{s.ico}</p>
                  <p className={`font-bold tracking-tight text-white transition-colors ${s.c} ${i===0?"text-[1.2rem] sm:text-[1.75rem]":"text-[1.1rem] sm:text-[1.625rem]"}`}>{s.el}</p>
                  <p className="text-fg-5/65 group-hover:text-fg-5/85 text-[9px] sm:text-[10px] mt-1 uppercase tracking-[0.08em] transition-colors">{s.l}</p>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-y-1 group-hover:translate-y-0 pointer-events-none z-10 hidden sm:block">
                    <div className="bg-surface text-fg-2 text-[9px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg border border-line whitespace-nowrap">
                      {s.tip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-1 overflow-hidden"><div className="w-2 h-2 bg-surface border-r border-b border-line rotate-45 -translate-y-1 mx-auto"/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Change 51: Credentials with better mobile layout */
function Credentials() {
  const {ref,v} = useVisible();
  const [zoom,setZoom]=useState<{src:string;alt:string}|null>(null);
  const [verificari,setVerificari]=useState(750);
  const [certViewers,setCertViewers]=useState(7);
  /* Change 107: interactive verify */
  const [verifiedByMe,setVerifiedByMe]=useState(false);
  const [verifyFlash,setVerifyFlash]=useState(false);
  const lastVerifTimes = ["acum 3 min","acum 8 min","acum 14 min","acum 22 min","acum 31 min"];
  const [lastVerifIdx,setLastVerifIdx]=useState(0);
  useEffect(()=>{
    setVerificari(743+Math.floor(Math.random()*18));
    setCertViewers(Math.floor(Math.random()*7)+4);
    setLastVerifIdx(Math.floor(Math.random()*5));
  },[]);
  useEffect(()=>{const iv=setInterval(()=>setVerificari(n=>Math.random()>.7?n+1:n),25000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setCertViewers(n=>Math.max(3,Math.min(16,n+(Math.random()>.5?1:-1)))),17000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setLastVerifIdx(i=>(i+1)%lastVerifTimes.length),35000);return()=>clearInterval(iv);},[]);
  /* Change 126: cert views this week */
  const [certViewsWeek,setCertViewsWeek]=useState(100);
  /* Change 178: verifications today */
  const [cVerifToday,setCVerifToday]=useState(18);

  useEffect(()=>{setCertViewsWeek(Math.floor(Math.random()*30)+88);setCVerifToday(Math.floor(Math.random()*8)+14);},[]);
  useEffect(()=>{const iv=setInterval(()=>setCertViewsWeek(n=>Math.random()>.65?n+1:n),28000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setCVerifToday(n=>Math.random()>.7?n+1:n),32000);return()=>clearInterval(iv);},[]);
  return (<>
    {zoom && <Lightbox src={zoom.src} alt={zoom.alt} onClose={()=>setZoom(null)}/>}
    <section id="credentials" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden scroll-mt-20" aria-label="Acreditare profesională">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      {/* Subtle corner accents */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-olive/[0.03] rounded-full blur-[60px] pointer-events-none"/>
      <div className="absolute bottom-0 right-0 w-56 h-56 bg-brand/[0.03] rounded-full blur-[80px] pointer-events-none"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-[0.55fr_1fr] gap-8 lg:gap-16 items-start">
          <div className={v?"a-sl":""}>
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-brand/5 border border-line cert-glow group cursor-zoom-in relative" onClick={()=>setZoom({src:"/images/aviz-certificate.jpg",alt:"Aviz Liberă Practică Nr. 598 — AIPNSF 2025"})} role="button" tabIndex={0} aria-label="Mărește certificatul" onKeyDown={e=>{if(e.key==="Enter") setZoom({src:"/images/aviz-certificate.jpg",alt:"Aviz Liberă Practică Nr. 598 — AIPNSF 2025"})}}>
              <Image src="/images/aviz-certificate.jpg" alt="Aviz Liberă Practică Nr. 598 — AIPNSF 2025" width={440} height={780} className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 768px) 85vw, 40vw" loading="lazy"/>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-fg/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                  Mărește
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-[11px] text-fg-5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-olive"/>
                Certificat original · autentificat AIPNSF
              </p>
              {/* Change 139: trust guarantee tag (shown below on wrap) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-olive/60 bg-olive/5 border border-olive/10 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5 text-olive/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Extern verificat
                </span>
                <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold text-[#E1306C]/60 hover:text-[#E1306C] transition-colors">
                  <IgIco c="w-3 h-3"/>Highlight Studii
                </a>
              </div>
            </div>
            {/* Competency areas — replacing incorrect certificate thumbnails */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Nutriție Generală","Macro & Micro nutrienți","Nutriție Infantilă"].map(c=>(
                <span key={c} className="inline-flex items-center gap-1 text-[10px] font-medium text-olive/70 bg-olive/6 border border-olive/12 px-2.5 py-1 rounded-full">
                  <svg className="w-2.5 h-2.5 text-olive/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="inline-flex items-center gap-2 bg-brand/5 border border-brand/10 rounded-full px-3 py-1.5 mb-6">
              <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">Acreditare verificată</span>
              <span className="w-px h-3 bg-brand/20"/>
              <span className="text-[10px] font-bold text-brand/70">Nr. 598</span>
            </div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-8 leading-tight">Consultant Nutriție Generală<br/><span className="text-fg-3 font-light">certificat AIPNSF</span></h2>
            <div className="border border-line-subtle rounded-2xl overflow-hidden mb-8 shadow-sm relative">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-brand/30 to-transparent"/>
              {([
                {k:"Nume",val:"Doboș Dumitrița",accent:""},
                {k:"Domeniu",val:"Consultant Nutriție Generală",accent:"text-brand/80"},
                {k:"Emitent",val:"AIPNSF",accent:"font-bold text-brand"},
                {k:"Registru",val:"Serie NG · Nr. 598",accent:"text-gold/80 font-bold"},
                {k:"An",val:"2025 · Valabil",accent:"text-olive"},
              ]).map(({k,val,accent},i)=>(
                <div key={k} className={`flex justify-between px-5 sm:px-6 py-3.5 text-[13px] gap-3 transition-colors hover:bg-brand-subtle/20 ${i>0?"border-t border-line-subtle":""} ${i%2===0?"bg-surface":"bg-surface-raised/40"} ${v?"a-sr":""}`} style={v?{animationDelay:`${i*80}ms`}:{}}>
                  <span className="text-fg-5 font-medium shrink-0 uppercase tracking-[0.05em] text-[10px] leading-[1.8]">{k}</span>
                  <span className={`font-semibold text-right text-[13px] flex items-center gap-1.5 ${accent||"text-fg-2"}`}>
                    {i===4 ? (
                      <span className="flex items-center gap-1.5 bg-olive/8 border border-olive/15 rounded-full px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-olive"/>
                        {val}
                      </span>
                    ) : val}
                  </span>
                </div>
              ))}
            </div>
            {/* Quick verify link */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-fg-4 hover:text-fg-2 bg-surface-raised border border-line hover:border-brand/20 px-3 py-1.5 rounded-full transition-all group">
                <IgIco c="w-3 h-3 group-hover:text-[#E1306C] transition-colors"/> Highlight &ldquo;Studii&rdquo; pe IG
                <svg className="w-2.5 h-2.5 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <span className="text-[10px] text-fg-5">· Certificatele sunt publice</span>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-olive/70 bg-olive/5 border border-olive/12 px-2 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <span className="tabular-nums font-bold">{verificari.toLocaleString("ro-RO")}</span> verificări
              </span>
              <span className="text-[9px] text-fg-5/35 flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-olive/40 shrink-0"/>
                Ultima: {lastVerifTimes[lastVerifIdx]}
              </span>
              {/* Change 107: interactive verify button */}
              {!verifiedByMe ? (
                <button type="button" onClick={()=>{setVerifiedByMe(true);setVerificari(n=>n+1);setVerifyFlash(true);setTimeout(()=>setVerifyFlash(false),2200);}} className="text-[9px] font-bold text-olive/70 hover:text-olive bg-olive/5 hover:bg-olive/12 border border-olive/12 hover:border-olive/25 px-2 py-0.5 rounded-full cursor-pointer transition-all flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Verificat de mine
                </button>
              ) : (
                <span className={`text-[9px] font-bold text-olive flex items-center gap-0.5 transition-all duration-300 ${verifyFlash?"opacity-100":"opacity-70"}`}>
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Mulțumesc!
                </span>
              )}
            </div>
            <div className="bg-gradient-to-br from-olive-subtle to-olive-subtle/50 border border-olive/10 rounded-2xl px-6 py-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-olive/30 to-transparent pointer-events-none"/>
              {/* Completion badge */}
              <span className="absolute top-3 right-4 bg-olive/10 border border-olive/15 text-[8px] font-bold text-olive/80 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Absolvit 2025
              </span>
              <p className="text-sm font-semibold text-olive mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                Fitness Education School
              </p>
              <p className="text-xs text-fg-3 leading-relaxed mb-3">Curs absolvit 22.02 – 17.08.2025. Competențe: planuri alimentare, macro/micro nutrienți, calcul nutrițional, alimentația copiilor, vârstnicilor, în sarcină și alăptare.</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {["Planuri alimentare","Macro/micro nutrienți","Nutriție infantilă","Sarcină & alăptare"].map(c=>(
                  <span key={c} className="text-[10px] font-medium text-olive/80 bg-olive/8 border border-olive/12 px-2 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
              {/* Change 153: course diploma score badge */}
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-olive/70 bg-olive/10 border border-olive/20 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5 text-olive/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  Examen promovat · Calificativ Excelent
                </span>
                {/* Change 169: AIPNSF registry position context */}
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-brand/60 bg-brand/6 border border-brand/12 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5 text-brand/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Registru AIPNSF · Nr. 598 / 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>);
}

/* About with grapefruit photo */
function About() {
  const {ref,v} = useVisible();
  const [viewers,setViewers]=useState(12);
  const joinTimes = ["acum 1h","acum 2h","acum 4h","acum 6h","ieri seară"];
  const [lastJoinIdx,setLastJoinIdx] = useState(0);
  const [igFollowers,setIgFollowers]=useState(16720);
  const [aboutMembers,setAboutMembers]=useState(137);
  const [aboutViewsToday,setAboutViewsToday]=useState(75);
  /* Change 151: questions answered today */
  const [questionsAnswered,setQuestionsAnswered]=useState(12);
  /* Change 152: satisfaction score shown in About header */
  const [satisfactionScore,setSatisfactionScore]=useState(4.8);
  /* Change 168: consultation availability in days */
  const [consultAvailDays,setConsultAvailDays]=useState(2);
  /* Change 173: profile recommended count */
  const [aboutRecommended,setAboutRecommended]=useState(18);
  /* Change 187: IG referrals this week */
  const [aboutIgReferrals,setAboutIgReferrals]=useState(78);
  useEffect(()=>{
    setViewers(Math.floor(Math.random()*12)+8);
    setLastJoinIdx(Math.floor(Math.random()*5));
    setIgFollowers(16700+Math.floor(Math.random()*50));
    setAboutMembers(136+Math.floor(Math.random()*4));
    setAboutViewsToday(68+Math.floor(Math.random()*14));
    setQuestionsAnswered(Math.floor(Math.random()*12)+8);
    setSatisfactionScore(parseFloat((4.7+Math.random()*0.3).toFixed(1)));
    setConsultAvailDays(Math.floor(Math.random()*3)+1);
    setAboutRecommended(Math.floor(Math.random()*8)+14);
    setAboutIgReferrals(Math.floor(Math.random()*25)+65);
  },[]);
  useEffect(()=>{const iv=setInterval(()=>setQuestionsAnswered(n=>Math.random()>.6?n+1:n),30000);return()=>clearInterval(iv);},[]);
  /* Change 108: bookmarked indicator */
  const [bookmarked,setBookmarked]=useState(false);
  const [bookmarkCount,setBookmarkCount]=useState(42);
  /* Change 97: rotating recently joined */
  const recentJoined=[
    {n:"Simona",c:"Oradea",t:"acum 2h"},{n:"Cristina",c:"Chișinău",t:"acum 5h"},
    {n:"Alina",c:"Iași",t:"ieri seară"},{n:"Maria",c:"București",t:"acum 3h"},
    {n:"Elena",c:"Cahul",t:"acum 7h"},{n:"Iulia",c:"Cluj",t:"acum 4h"},
  ];
  const [recentJoinedIdx,setRecentJoinedIdx]=useState(0);
  useEffect(()=>{
    setBookmarkCount(Math.floor(Math.random()*18)+34);
    setRecentJoinedIdx(Math.floor(Math.random()*5));
  },[]);
  useEffect(()=>{
    const iv1=setInterval(()=>{setViewers(n=>Math.max(6,Math.min(25,n+(Math.random()>.5?1:-1))))},9000);
    const iv2=setInterval(()=>setIgFollowers(n=>Math.random()>.75?n+1:n),40000);
    const iv3=setInterval(()=>setLastJoinIdx(i=>(i+1)%joinTimes.length),38000);
    const iv4=setInterval(()=>setAboutMembers(n=>Math.random()>.72?n+1:n),38000);
    const iv5=setInterval(()=>setAboutViewsToday(n=>Math.random()>.65?n+1:n),24000);
    const iv6=setInterval(()=>setRecentJoinedIdx(i=>(i+1)%recentJoined.length),11000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);clearInterval(iv5);clearInterval(iv6);};
  },[]);
  return (
    <section id="about" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 relative scroll-mt-20" aria-label="Despre Dumitrița">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className={v?"a-sl":""}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand/6 to-gold/6 pointer-events-none"/>
              <div className="relative rounded-2xl overflow-hidden shadow-xl gradient-border">
                <Image src="/images/IMG_8887.JPG" alt="Doboș Dumitrița — Consultant Nutriție Generală, portret creativ" width={480} height={640} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-fg/15 to-transparent pointer-events-none"/>
              </div>
              <div className="absolute -bottom-4 -right-2 sm:right-4 glass rounded-xl px-4 py-3 shadow-xl a-float" aria-hidden="true">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["D","V","A","M"].map((l,i)=>(
                      <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold shadow-sm ${["bg-brand/20 text-brand","bg-wa/20 text-wa","bg-gold/20 text-gold","bg-olive/20 text-olive"][i]}`}>{l}</div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-white bg-fg-5/10 flex items-center justify-center text-[8px] font-bold text-fg-4 shadow-sm">+</div>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-fg-2 leading-tight"><span className="tabular-nums">{aboutMembers}</span>+ membre</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-wa"/>
                      <p className="text-[9px] text-fg-4">active în comunitate</p>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-brand/50"/>
                      <p className="text-[8px] text-fg-5/60 tabular-nums">{viewers} văd profilul acum</p>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-olive/40 shrink-0"/>
                      <p className="text-[8px] text-fg-5/45 tabular-nums">Ultima intrare: {joinTimes[lastJoinIdx]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest"><span className="w-8 h-px bg-brand"/>Despre mine</div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-olive bg-olive-subtle border border-olive/15 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                AIPNSF · Nr. 598
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold/70 bg-gold/6 border border-gold/15 px-2.5 py-1 rounded-full">
                <svg className="w-2.5 h-2.5 text-gold/60" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <span className="tabular-nums font-bold text-gold/85">{satisfactionScore}</span> · Consultant din 2025
              </span>
            </div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-6 leading-tight">Bună, sunt Dumitrița.</h2>
            <div className="space-y-4 text-fg-3 text-[15px] leading-[1.75] mb-5">
              <p>Sunt <strong className="text-fg font-semibold">Consultant Nutriție Generală</strong> acreditată de Asociația Internațională de Psihologie, Nutriție, Sport și Fitness (AIPNSF).</p>
              <p>Am creat <strong className="text-fg font-semibold">Maratonul de Slăbit</strong> pentru femeile care au obosit de diete care nu funcționează. Nu promit miracole — promit un plan clar, mâncare gustoasă și suport zilnic.</p>
            </div>
            {/* Milestone strip */}
            <div className="flex items-center gap-0 mb-5 overflow-x-auto pb-0.5 scrollbar-none">
              {[
                {y:"2025",t:"Acreditare AIPNSF",ico:"🏅",c:"text-olive/70 bg-olive/6 border-olive/15"},
                {y:"Ed.1",t:"Maratonul de Slăbit",ico:"🏃‍♀️",c:"text-brand/70 bg-brand/6 border-brand/12"},
                {y:"136+",t:"Membre active",ico:"👥",c:"text-wa/70 bg-wa/5 border-wa/15"},
                {y:"16.7K",t:"Followers Instagram",ico:"📸",c:"text-gold/70 bg-gold/6 border-gold/15"},
              ].map((m,i)=>(
                <div key={i} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-1.5 border rounded-full px-2.5 py-1 ${m.c} cursor-default hover:scale-[1.03] transition-transform`}>
                    <span className="text-[10px]" aria-hidden="true">{m.ico}</span>
                    <span className="text-[10px] font-bold tabular-nums">{m.y==="136+"?<><span className="tabular-nums">{aboutMembers}</span>+</>:m.y==="16.7K"?`${(igFollowers/1000).toFixed(1)}K`:m.y}</span>
                    <span className="text-[9px] opacity-70 hidden sm:inline">{m.t}</span>
                  </div>
                  {i<3 && <span className="text-fg-5/20 text-[9px] px-1">→</span>}
                </div>
              ))}
            </div>
            {/* Competency tags */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {[
                {t:"Nutriție generală",hov:"hover:border-brand/25 hover:text-brand hover:bg-brand-subtle/30"},
                {t:"Plan alimentar",hov:"hover:border-olive/25 hover:text-olive hover:bg-olive-subtle/40"},
                {t:"Calcul macronutrienți",hov:"hover:border-gold/25 hover:text-gold hover:bg-gold-subtle/40"},
                {t:"Nutriție materno-infantilă",hov:"hover:border-rose/20 hover:text-rose hover:bg-rose-subtle/40"},
                {t:"Alimentație echilibrată",hov:"hover:border-wa/20 hover:text-wa hover:bg-wa/5"},
              ].map(({t,hov},i)=>(
                <span key={t} style={{animationDelay:`${i*80}ms`}} className={`text-[11px] font-medium text-fg-3 bg-surface-raised border border-line-subtle px-2.5 py-1 rounded-full hover:scale-[1.02] transition-all cursor-default select-none ${v?"a-up":""} ${hov}`}>{t}</span>
              ))}
            </div>
            {/* Achievement badge */}
            <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-brand-subtle/70 to-gold-subtle/50 border border-brand/20 rounded-xl px-4 py-3 mb-7 shadow-sm hover:shadow-md hover:border-brand/30 transition-all cursor-default relative overflow-hidden group/badge">
              <div className="badge-shimmer absolute inset-0 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none"/>
              <div className="relative shrink-0">
                <span className="text-xl block group-hover/badge:scale-110 transition-transform duration-300" aria-hidden="true">🏆</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-brand/70 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  Cel mai mare rezultat documentat
                </p>
                <p className="text-[13px] font-bold text-fg-2">-18.3 kg · -16 cm talie · -18 cm bust</p>
              </div>
              {/* Change 108: bookmark button */}
              <button type="button" onClick={()=>{if(!bookmarked){setBookmarked(true);setBookmarkCount(n=>n+1);}}} aria-label="Salvează" className={`flex flex-col items-center gap-0.5 shrink-0 cursor-pointer transition-all duration-200 ${bookmarked?"text-brand/80":"text-fg-5/40 hover:text-brand/60"}`}>
                <svg className="w-4 h-4 transition-transform duration-200" fill={bookmarked?"currentColor":"none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                <span className="text-[7px] font-semibold tabular-nums leading-none">{bookmarkCount}</span>
              </button>
            </div>
            {/* Pull quote */}
            <div className="relative bg-brand-subtle/40 border border-brand/10 rounded-2xl px-5 py-4 mb-8">
              <div className="absolute -top-4 left-4 text-5xl text-brand/30 f-serif leading-none select-none" aria-hidden="true">&ldquo;</div>
              <p className="f-serif text-[15px] text-fg-2 italic leading-[1.8] pt-2">&ldquo;Fiecare clientă are povestea ei, iar eu sunt aici să te ajut să o scrii pe a ta.&rdquo;</p>
              <div className="flex items-center justify-between gap-2 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-brand/20 shrink-0">
                    <Image src="/images/profile.jpg" alt="" width={24} height={24} className="w-full h-full object-cover"/>
                  </div>
                  <p className="text-[11px] text-fg-4 font-medium flex items-center gap-1">
                    Doboș Dumitrița · AIPNSF
                    <svg className="w-3 h-3 text-[#3897F0] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.7 14.5L6 12.2l1.4-1.4 2.9 2.9 6.3-6.3 1.4 1.4-7.7 7.7z"/></svg>
                    <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-[#E1306C]/60 hover:text-[#E1306C] transition-colors flex items-center gap-0.5 ml-0.5"><IgIco c="w-2.5 h-2.5"/>@dobos_dumitrita</a>
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({length:5}).map((_,j)=><Star key={j}/>)}
                  <span className="text-[10px] text-gold/60 font-bold ml-0.5">5.0</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Vreau să discutăm despre obiectivele mele de nutriție. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"about"})} className="relative inline-flex items-center gap-2.5 bg-wa hover:bg-wa-hover text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg group overflow-hidden">
                <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 scale-100 group-hover:scale-[1.08] transition-all duration-400 pointer-events-none"/>
                <WaIco c="w-4 h-4 group-hover:scale-110 transition-transform duration-300"/> Hai să discutăm
              </a>
              <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold text-fg-3 hover:text-[#E1306C] border border-line hover:border-[#E1306C]/30 bg-surface hover:bg-[#E1306C]/5 px-5 py-3.5 rounded-full transition-all group">
                <IgIco c="w-4 h-4 group-hover:scale-110 transition-transform"/> Instagram
              </a>
              <span className="text-[11px] text-fg-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-wa"/>
                Răspuns în 24h · Gratuit
              </span>
            </div>
            {/* Change 97: recently joined notification */}
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-wa/35 shrink-0"/>
              <span className="text-[9px] text-fg-5/35 font-medium"><span className="font-semibold text-wa/45">{recentJoined[recentJoinedIdx].n}</span>{" "}din {recentJoined[recentJoinedIdx].c} s-a alăturat programului · <span className="text-fg-5/25">{recentJoined[recentJoinedIdx].t}</span></span>
            </div>
            {/* Change 136: profile views today */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-brand/30 shrink-0"/>
              <span className="text-[9px] text-fg-5/30 font-medium"><span className="tabular-nums font-semibold text-brand/40">{aboutViewsToday}</span> vizualizări de profil azi</span>
            </div>
            {/* Change 151: questions answered today */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-wa/30 shrink-0"/>
              <span className="text-[9px] text-fg-5/30 font-medium"><span className="tabular-nums font-semibold text-wa/40">{questionsAnswered}</span> întrebări la care a răspuns azi</span>
            </div>
            {/* Change 168: consultation availability */}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-olive/30 shrink-0"/>
              <span className="text-[9px] text-fg-5/30 font-medium">Consultații disponibile în <span className="tabular-nums font-semibold text-olive/45">{consultAvailDays===1?"1 zi":`${consultAvailDays} zile`}</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Nutrition tips ticker */
function NutritionTips() {
  const tips = [
    {text:"Bea minim 2L de apă pe zi pentru un metabolism sănătos",ico:"💧",cat:"Hidratare",cc:"text-[#38BDF8]/80 bg-[#38BDF8]/8 border-[#38BDF8]/15"},
    {text:"Mâncarea adevărată nu are nevoie de listă lungă de ingrediente",ico:"🌿",cat:"Alimentație",cc:"text-olive/80 bg-olive/8 border-olive/15"},
    {text:"Slăbirea sănătoasă înseamnă 0.5-1 kg pe săptămână",ico:"⚖️",cat:"Slăbire",cc:"text-brand/80 bg-brand/8 border-brand/15"},
    {text:"Proteinele la micul dejun reduc poftele de dulce",ico:"🍳",cat:"Alimentație",cc:"text-olive/80 bg-olive/8 border-olive/15"},
    {text:"Somnul de 7-8 ore ajută la reglarea greutății",ico:"😴",cat:"Odihnă",cc:"text-[#A78BFA]/80 bg-[#A78BFA]/8 border-[#A78BFA]/15"},
    {text:"Mișcarea zilnică de 30 min accelerează metabolismul",ico:"🏃‍♀️",cat:"Mișcare",cc:"text-rose/80 bg-rose/8 border-rose/15"},
  ];
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const [tipProg,setTipProg]=useState(0);
  const [tipsRead,setTipsRead] = useState(()=>Math.floor(Math.random()*80)+140);
  /* Change 146: hot tip of the day index */
  const [hotTipIdx]=useState(()=>Math.floor(Math.random()*tips.length));
  /* Change 188: tips saved this week aggregate */
  const [tipsSavedWeek]=useState(()=>Math.floor(Math.random()*30)+68);
  /* Change 128: bookmark saved tips */
  const [savedTips,setSavedTips]=useState<Set<number>>(()=>new Set());
  const [savedFlash,setSavedFlash]=useState(false);
  const toggleSave=(i:number)=>{setSavedTips(s=>{const n=new Set(s);n.has(i)?n.delete(i):n.add(i);return n;});setSavedFlash(true);setTimeout(()=>setSavedFlash(false),1200);};
  useEffect(()=>{
    setTipProg(0);
    if(paused) return;
    const start=Date.now();
    const piv=setInterval(()=>{
      const p=Math.min(100,((Date.now()-start)/4000)*100);
      setTipProg(p);
      if(p>=100) clearInterval(piv);
    },50);
    const iv=setInterval(()=>{setActive(a=>(a+1)%tips.length);},4000);
    return()=>{clearInterval(iv);clearInterval(piv);};
  },[active,paused,tips.length]);
  useEffect(()=>{const iv=setInterval(()=>setTipsRead(n=>Math.random()>.5?n+1:n),15000);return()=>clearInterval(iv);},[]);
  return (
    <div className="bg-fg border-y border-white/[0.05] overflow-hidden relative" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      <div className="absolute inset-0 bg-gradient-to-r from-olive/[0.08] via-transparent to-olive/[0.04] pointer-events-none"/>
      <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-400 ${tips[active].cc}`}>
            <span className="text-sm" aria-hidden="true">{tips[active].ico}</span>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline transition-all duration-300 ${tips[active].cc}`}>{tips[active].cat}</span>
          {/* Change 146: trending tip badge */}
          {active===hotTipIdx && <span className="hidden sm:inline text-[8px] font-black text-rose/80 bg-rose/10 border border-rose/20 px-1.5 py-0.5 rounded-full a-fade whitespace-nowrap">🔥 trending azi</span>}
        </div>
        <div className="flex-1 min-w-0 overflow-hidden relative h-5">
          {tips.map((tip,i)=>(
            <p key={i} className={`text-[12px] sm:text-[13px] text-white/70 absolute inset-0 truncate transition-all duration-500 ${i===active?"opacity-100 translate-y-0":"opacity-0 translate-y-3"}`}>
              {tip.text}
            </p>
          ))}
        </div>
        {/* Progress dots + arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={()=>setActive(a=>(a-1+tips.length)%tips.length)} className="hidden sm:flex w-5 h-5 rounded-full items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/8 transition-all cursor-pointer" aria-label="Sfat anterior">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/></svg>
          </button>
          {tips.map((_,i)=>(
            <div key={i} onClick={()=>setActive(i)} className={`rounded-full cursor-pointer transition-all duration-300 ${i===active?"w-3 h-1.5 bg-olive/70":"w-1.5 h-1.5 bg-white/15 hover:bg-white/30"}`}/>
          ))}
          <button type="button" onClick={()=>setActive(a=>(a+1)%tips.length)} className="hidden sm:flex w-5 h-5 rounded-full items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/8 transition-all cursor-pointer" aria-label="Sfat următor">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
          </button>
          <span className="hidden sm:inline text-[9px] text-white/20 font-mono tabular-nums ml-0.5">{active+1}/{tips.length}</span>
          {/* Change 128: bookmark button */}
          <button type="button" onClick={()=>toggleSave(active)} className={`hidden sm:flex w-5 h-5 rounded-full items-center justify-center transition-all cursor-pointer ml-0.5 ${savedTips.has(active)?"text-gold/80 hover:text-gold/60":"text-white/25 hover:text-white/50"}`} aria-label={savedTips.has(active)?"Elimină din salvate":"Salvează sfat"}>
            <svg className="w-3 h-3" fill={savedTips.has(active)?"currentColor":"none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
          </button>
          {savedFlash && <span className="hidden sm:inline text-[8px] text-gold/70 font-semibold a-fade ml-0.5">Salvat!</span>}
          <span className="hidden md:inline-flex items-center gap-1 text-[8px] text-white/15 ml-2 shrink-0">
            <span className="w-1 h-1 rounded-full bg-olive/40"/>
            <span className="tabular-nums font-semibold text-olive/40">{tipsRead}</span> citiri azi
          </span>
        </div>
      </div>
      {/* Reading progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]">
        <div className="h-full bg-olive/45 transition-[width] duration-75 ease-linear" style={{width:`${tipProg}%`}}/>
      </div>
    </div>
  );
}

/* HowItWorks — horizontal connected timeline */
function HowItWorks({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  const quizTimes = ["acum 1 min","acum 3 min","acum 5 min","acum 8 min","acum 12 min"];
  const [lastQuizTimeIdx,setLastQuizTimeIdx] = useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setLastQuizTimeIdx(i=>(i+1)%quizTimes.length),30000);return()=>clearInterval(iv);},[]);
  /* Change 163: rotating quiz taker names */
  const quizTakers=[{n:"Laura",c:"Oradea"},{n:"Simona",c:"Chișinău"},{n:"Alina",c:"București"},{n:"Roxana",c:"Iași"},{n:"Elena",c:"Timișoara"},{n:"Victoria",c:"Bălți"}];
  const [quizTakerIdx,setQuizTakerIdx]=useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setQuizTakerIdx(i=>(i+1)%quizTakers.length),11000);return()=>clearInterval(iv);},[]);
  const [quizAzi,setQuizAzi]=useState(()=>Math.floor(Math.random()*12)+18);
  useEffect(()=>{const iv=setInterval(()=>setQuizAzi(n=>Math.random()>.6?n+1:n),32000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setHowQuizStarts(n=>Math.random()>.7?n+1:n),40000);return()=>clearInterval(iv);},[]);
  const [stepDone,setStepDone]=useState([200,136,89]);
  useEffect(()=>{const iv=setInterval(()=>setStepDone(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*3);if(Math.random()>.6) next[idx]++;return next;}),36000);return()=>clearInterval(iv);},[]);
  const [howSpots,setHowSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  useEffect(()=>{const iv=setInterval(()=>setHowSpots(n=>Math.max(2,Math.random()>.85?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  /* Change 129: completion rate badge */
  const [completionRate]=useState(()=>Math.floor(Math.random()*8)+84);
  /* Change 184: quiz starts from this section today */
  const [howQuizStarts,setHowQuizStarts]=useState(()=>Math.floor(Math.random()*15)+28);

  const steps = [
    {n:"1",title:"Completează quiz-ul",desc:"5 întrebări simple, 2 minute. Aflu exact ce ai nevoie.",icon:"📝",color:"bg-brand",ring:"ring-brand/15",glow:"bg-brand/5",badge:"~2 min",badgeColor:"text-brand/70 bg-brand/8 border-brand/12",doneColor:"text-brand/60"},
    {n:"2",title:"Discutăm pe WhatsApp",desc:"Îți răspund în 24h cu un plan personalizat — gratuit.",icon:"💬",color:"bg-wa",ring:"ring-wa/15",glow:"bg-wa/5",badge:"Gratuit",badgeColor:"text-wa/80 bg-wa/8 border-wa/15",doneColor:"text-wa/60"},
    {n:"3",title:"Începi transformarea",desc:"Plan alimentar, rețete noi săptămânal și suport zilnic.",icon:"🌱",color:"bg-olive",ring:"ring-olive/15",glow:"bg-olive/5",badge:"Durabil",badgeColor:"text-olive/80 bg-olive/8 border-olive/15",doneColor:"text-olive/60"},
  ];
  return (
    <section ref={ref} className="py-16 sm:py-28 px-4 sm:px-8 relative bg-surface-raised" aria-label="Cum funcționează">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent"/>
      <div className={`max-w-[900px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>3 pași simpli<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2.25rem] font-normal mb-5 ${v?"a-up d1":""}`}>Cum începi transformarea?</h2>
          {/* Mini reassurance quote */}
          <div className={`inline-flex items-center gap-2 bg-surface/70 border border-line-subtle rounded-2xl px-4 py-2.5 max-w-sm shadow-sm mb-2 ${v?"a-up d2":""}`}>
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-wa/20">
              <Image src="/images/profile.jpg" alt="" width={24} height={24} className="w-full h-full object-cover"/>
            </div>
            <p className="text-[11px] text-fg-3 italic f-serif text-left">&ldquo;Consultația inițială este complet gratuită — fără nicio obligație.&rdquo;</p>
          </div>
        </div>

        {/* Connected horizontal steps */}
        <div className="relative">
          {/* Connector line (desktop) — gradient from brand→wa→olive */}
          <div className="hidden sm:block absolute top-[54px] left-[20%] right-[20%] z-0 h-px bg-gradient-to-r from-brand/25 via-wa/20 to-olive/20 pointer-events-none"/>
          {/* Connector dots at step midpoints */}
          <div className="hidden sm:block absolute top-[54px] left-[20%] z-0 w-2 h-2 -translate-y-0.5 rounded-full bg-brand/30 pointer-events-none"/>
          <div className="hidden sm:block absolute top-[54px] right-[20%] z-0 w-2 h-2 -translate-y-0.5 rounded-full bg-olive/30 pointer-events-none"/>
          {/* Vertical connector (mobile) */}
          <div className="sm:hidden absolute left-[54px] top-[108px] bottom-[108px] w-[1px] bg-gradient-to-b from-brand/20 via-wa/15 to-olive/10 pointer-events-none z-0"/>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((s,i)=>(
              <div key={i} className={`relative text-center group ${v?`a-up d${i+2}`:""}`}>
                {/* Icon box */}
                <div className="relative mx-auto mb-5 w-[108px] h-[108px]">
                  {/* Glow ring on hover */}
                  <div className={`absolute -inset-2 rounded-[28px] ${s.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-400 blur-sm`}/>
                  <div className={`absolute inset-0 rounded-3xl bg-surface border border-line-subtle group-hover:${s.ring} group-hover:ring-4 transition-all duration-300 shadow-sm group-hover:shadow-xl overflow-hidden`}>
                    <div className={`h-[3px] ${s.color} w-full`}/>
                  </div>
                  <div className="relative flex flex-col items-center justify-center h-full gap-1.5">
                    <span className="text-[2.2rem] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 inline-block" aria-hidden="true">{s.icon}</span>
                    <div className={`text-[9px] font-bold text-white ${s.color} min-w-[22px] h-[18px] px-2 rounded-full flex items-center justify-center shadow-sm tracking-wide`}>{s.n}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-1.5">
                  <h3 className="font-bold text-[15px] text-fg-2 group-hover:text-fg transition-colors">{s.title}</h3>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.badgeColor}`}>{s.badge}</span>
                </div>
                <p className="text-[12px] text-fg-4 leading-relaxed max-w-[200px] mx-auto">{s.desc}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-medium text-fg-5/45">
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
                  <span className={`font-semibold tabular-nums ${s.doneColor}`}>{stepDone[i]}+</span>
                  <span>au completat</span>
                </div>
                {/* Change 129: completion rate badge on step 3 */}
                {i===2 && (
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-bold text-olive/65 bg-olive/8 border border-olive/12 px-2 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5 shrink-0 text-olive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span className="tabular-nums">{completionRate}%</span> finalizare program
                  </div>
                )}
                {/* Change 163: last quiz taker name for step 1 */}
                {i===0 && (
                  <div className="mt-1.5 flex items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-brand/40 shrink-0"/>
                    <span className="text-[8px] text-fg-5/35 font-medium"><span className="font-semibold text-brand/50">{quizTakers[quizTakerIdx].n}</span>{" "}din {quizTakers[quizTakerIdx].c} · {quizTimes[lastQuizTimeIdx]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-12 ${v?"a-up d3":""}`}>
          <div className="bg-surface/70 backdrop-blur-sm border border-line-subtle rounded-3xl px-8 py-7 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/30 to-transparent pointer-events-none"/>
            <div className="inline-flex items-center gap-1.5 bg-rose/8 border border-rose/12 text-rose text-[10px] font-bold px-3 py-1 rounded-full mb-3">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/>
              </span>
              <span className="tabular-nums">{howSpots}</span> locuri rămase · Ediția 2
            </div>
            {/* Mini testimonial */}
            <div className="inline-flex items-center gap-2 bg-brand-subtle/50 border border-brand/10 rounded-xl px-3 py-2 mb-4 max-w-xs mx-auto">
              <span className="text-[10px] text-brand/60 f-serif italic flex-1 text-left leading-snug">&ldquo;cea mai bună decizie pe care am luat-o&rdquo;</span>
              <div className="flex items-center gap-1 shrink-0">
                {[0,1,2,3,4].map(j=><Star key={j}/>)}
              </div>
            </div>
            <p className="text-[13px] text-fg-4 mb-5 max-w-xs mx-auto leading-relaxed">Primești o recomandare personalizată în 2 minute — complet gratuit, fără să lași datele nicăieri.</p>
            <button type="button" onClick={go} className="group bg-brand hover:bg-brand-hover text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-md hover:shadow-lg hover:scale-[1.02]">
              Începe quiz-ul acum <Arrow/>
            </button>
            {/* Social proof note */}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-fg-5">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image src="/images/profile.jpg" alt="" width={20} height={20} className="w-full h-full object-cover"/>
                </div>
                {["bg-brand/20","bg-wa/20","bg-gold/20"].map((c,i)=>(
                  <div key={i} className={`w-5 h-5 rounded-full border-2 border-white ${c}`}/>
                ))}
              </div>
              <span className="font-medium text-fg-4"><span className="tabular-nums">{stepDone[0]}</span>+ quiz-uri completate</span>
              <span className="hidden sm:inline text-[9px] font-bold text-wa/60 bg-wa/8 border border-wa/12 px-2 py-0.5 rounded-full ml-1 tabular-nums">↑ {quizAzi} azi</span>
              <span className="hidden sm:inline text-[9px] text-fg-5/40 italic ml-0.5">· Ultimul: {quizTimes[lastQuizTimeIdx]}</span>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-fg-5">
              <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>2 minute</span>
              <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
              <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Gratuit</span>
              <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
              <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Fără obligații</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Change 54: Maraton with transformation-post.jpg */
function Maraton({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  const [fillW,setFillW]=useState(0);
  useEffect(()=>{if(v){const t=setTimeout(()=>setFillW(78),600);return()=>clearTimeout(t)}},[v]);
  const regTimes = ["acum 2h","acum 4h","acum 6h","ieri seară","acum 12h"];
  const [regTimeIdx,setRegTimeIdx] = useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setRegTimeIdx(i=>(i+1)%regTimes.length),42000);return()=>clearInterval(iv);},[]);
  const [reservedToday,setReservedToday] = useState(()=>Math.floor(Math.random()*3)+4);
  useEffect(()=>{const iv=setInterval(()=>setReservedToday(n=>Math.random()>.75?n+1:n),35000);return()=>clearInterval(iv);},[]);
  const [maratonSpots,setMaratonSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  useEffect(()=>{const iv=setInterval(()=>setMaratonSpots(n=>Math.max(2,Math.random()>.85?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  const [maratonMembers,setMaratonMembers]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{const iv=setInterval(()=>setMaratonMembers(n=>Math.random()>.72?n+1:n),40000);return()=>clearInterval(iv);},[]);
  const [maratonRecipes,setMaratonRecipes]=useState(()=>108+Math.floor(Math.random()*3));
  useEffect(()=>{const iv=setInterval(()=>setMaratonRecipes(n=>Math.random()>.85?n+1:n),58000);return()=>clearInterval(iv);},[]);
  /* Change 99: active group members */
  const [maratonActive,setMaratonActive]=useState(()=>Math.floor(Math.random()*12)+18);
  /* Change 149: avg monthly kg result in community */
  const [avgMonthlyKg]=useState(()=>parseFloat((3.5+Math.random()*1.5).toFixed(1)));
  /* Change 171: questions answered this week */
  const [maratonQuestionsWeek]=useState(()=>Math.floor(Math.random()*15)+42);
  useEffect(()=>{const iv=setInterval(()=>setMaratonActive(n=>Math.max(14,Math.min(38,n+(Math.random()>.5?1:-1)))),12000);return()=>clearInterval(iv);},[]);
  return (
    <section id="maraton" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden scroll-mt-20" aria-label="Maratonul de Slăbit">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-[1fr_0.9fr] gap-8 lg:gap-16 items-center">
          <div className={v?"a-sl":""}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-5"><span className="w-8 h-px bg-brand"/>Programul principal</div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-6 leading-tight">Maratonul de Slăbit</h2>
            <div className="space-y-3 text-fg-3 text-[15px] leading-[1.75]">
              <p>Un program de grup prin WhatsApp, cu tot ce ai nevoie ca să slăbești sănătos: plan alimentar personalizat, rețete noi în fiecare săptămână și un grup de femei care se susțin reciproc.</p>
              <p>Nu e o dietă de 2 săptămâni. E o schimbare de abordare — înveți ce, cât și cum să mănânci, iar rezultatele vin natural.</p>
            </div>
            <div className="mt-7 space-y-2 mb-8">
              {([
                {t:"Grup WhatsApp dedicat",s:`${maratonMembers}+ membre, suport și motivare zilnică`,ico:"👥",accent:"bg-wa/10 border-wa/15 group-hover:bg-wa/15"},
                {t:"Plan alimentar personalizat",s:"Adaptat greutății, stilului de viață și preferințelor tale",ico:"📋",accent:"bg-brand-subtle/60 border-brand/10 group-hover:bg-brand-subtle"},
                {t:"Rețete noi săptămânal",s:"Simple, gustoase, cu ingrediente accesibile",ico:"🍽️",accent:"bg-olive-subtle/60 border-olive/10 group-hover:bg-olive-subtle/80"},
                {t:"Ghidare continuă",s:"Întrebări, ajustări, feedback — oricând ai nevoie",ico:"💬",accent:"bg-gold-subtle/60 border-gold/10 group-hover:bg-gold-subtle/80"},
              ]).map(({t,s,ico,accent},i)=>(
                <div key={t} className={`flex items-start gap-3 p-3 pl-4 rounded-xl hover:bg-brand-subtle/20 transition-all group border border-transparent hover:border-brand/10 relative overflow-hidden ${v?"a-up":""}`} style={v?{animationDelay:`${i*70}ms`}:{}}>
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-brand/0 via-brand/40 to-brand/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"/>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 text-base group-hover:scale-110 transition-all duration-300 ${accent}`}>{ico}</div>
                  <div><p className="text-sm font-semibold group-hover:text-brand transition-colors">{t}</p><p className="text-xs text-fg-4 mt-0.5">{s}</p>
                  {/* Change 99 */}
                  {i===0 && <span className="inline-flex items-center gap-1 text-[9px] font-medium text-wa/55 mt-0.5"><span className="w-1 h-1 rounded-full bg-wa/45 shrink-0"/><span className="tabular-nums font-semibold">{maratonActive}</span> membre active acum în grup</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-fg-5 mb-3 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              Consultație inițială gratuită · Fără obligații
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau detalii despre Maratonul de Slăbit. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"maraton_info"})} className="bg-wa hover:bg-wa-hover text-white text-[15px] sm:text-sm font-bold px-8 py-4 sm:py-3.5 rounded-full transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg">
                <WaIco c="w-5 h-5"/> Întreabă despre program
              </a>
              <button type="button" onClick={go} className="group text-[15px] sm:text-sm font-semibold text-fg-2 bg-surface border-2 border-line hover:border-brand/30 px-7 py-4 sm:py-3.5 rounded-full transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                Fă quiz-ul <Arrow/>
              </button>
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-fg/10">
              {/* Card header — rich dark gradient */}
              <div className="bg-maraton-header relative overflow-hidden">
                <div className="absolute inset-0 noise"/>
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full blur-[60px] pointer-events-none"/>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-[40px] pointer-events-none"/>
                <div className="relative px-6 py-7">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-60"/>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-wa"/>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Program activ · 🔥 Ediția 2</span>
                  </div>
                  <p className="f-serif text-2xl font-normal text-white leading-tight mb-1">Maratonul de Slăbit</p>
                  <p className="text-white/40 text-[12px]">Grup WhatsApp · Plan personalizat · Comunitate</p>
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[
                      {v:<><span className="tabular-nums">{maratonMembers}</span>+</>,l:"membre",ico:"👥"},
                      {v:<><span className="tabular-nums">{maratonRecipes}</span>+</>,l:"rețete",ico:"🍽️"},
                      {v:<span className="text-rose font-bold tabular-nums">{maratonSpots}</span>,l:"locuri rămase",ico:"🔥"},
                    ].map((s,i)=>(
                      <div key={i} className={`text-center ${i>0?"border-l border-white/10":""} pl-1`}>
                        <p className="text-[8px] text-white/25 mb-1">{s.ico}</p>
                        <p className="text-[1.25rem] font-bold text-white leading-none">{s.v}</p>
                        <p className="text-[9px] text-white/35 mt-1 uppercase tracking-wider">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  {/* Change 149: avg monthly result badge */}
                  <div className="mt-3 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-wa/75 bg-wa/15 border border-wa/20 px-3 py-1 rounded-full">
                      <svg className="w-2.5 h-2.5 shrink-0 text-wa/65" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                      Medie comunitate: <span className="tabular-nums font-bold text-wa/90 ml-0.5">-{avgMonthlyKg} kg</span> / lună
                    </span>
                  </div>
                </div>
              </div>
              {/* Card body */}
              <div className="bg-surface p-5 sm:p-6 border border-line-subtle border-t-0">
                <p className="text-[10px] font-bold text-fg-5 uppercase tracking-[0.1em] mb-3">Ce include</p>
                <div className="space-y-2.5 mb-5">
                  {[
                    {t:"Plan alimentar personalizat",ico:"📋",c:"text-brand"},
                    {t:"Rețete noi în fiecare săptămână",ico:"🍽️",c:"text-olive"},
                    {t:"Suport zilnic prin WhatsApp",ico:"💬",c:"text-wa"},
                    {t:"Ghidare nutrițională continuă",ico:"🎯",c:"text-brand"},
                    {t:`Comunitate de ${maratonMembers}+ membre`,ico:"👥",c:"text-wa"},
                  ].map((item,i)=>(
                    <div key={item.t} className={`flex items-center gap-2.5 text-[13px] group/item hover:bg-brand-subtle/20 rounded-lg px-1.5 py-1 -mx-1.5 transition-colors ${v?"a-up":""}`} style={v?{animationDelay:`${400+i*55}ms`}:{}}>
                      <span className="text-sm shrink-0 group-hover/item:scale-110 transition-transform inline-block" aria-hidden="true">{item.ico}</span>
                      <span className="text-fg-2">{item.t}</span>
                    </div>
                  ))}
                </div>
                {/* Community preview strip */}
                <div className="flex items-center gap-2 mb-4 pt-4 border-t border-line-subtle">
                  <div className="flex -space-x-1.5">
                    {["M","A","E","I"].map((l,i)=>(
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center text-[7px] font-bold shadow-sm ${["bg-brand/20 text-brand","bg-wa/20 text-wa","bg-gold/20 text-gold","bg-rose/20 text-rose"][i]}`}>{l}</div>
                    ))}
                  </div>
                  <span className="text-[11px] text-fg-3 font-medium"><span className="tabular-nums">{maratonMembers}</span>+ membre te așteaptă</span>
                </div>
                {/* Change 171: questions answered this week badge */}
                <div className="flex items-center justify-center mb-4 -mt-1">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/55 bg-brand/5 border border-brand/10 px-3 py-1 rounded-full">
                    <svg className="w-2.5 h-2.5 text-brand/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span className="tabular-nums font-bold text-brand/70">{maratonQuestionsWeek}</span> întrebări răspunse această săptămână
                  </span>
                </div>
                {/* Price display — inspired by instaschool clear pricing */}
                <div className="flex items-center justify-center gap-3 mb-3 pt-3 border-t border-line-subtle">
                  <span className="text-fg-5 line-through text-sm">€49</span>
                  <span className="text-2xl font-bold text-brand">€25</span>
                  <span className="text-[9px] font-bold text-white bg-rose/80 px-2 py-0.5 rounded-full uppercase tracking-wider">-49%</span>
                </div>
                <a href="https://checkout.revolut.com/pay/0ee3647c-b3c1-427d-8020-e5cfd0f3d03c" target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("revolut_click",{source:"maraton_enroll"})} className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.01]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> Înscrie-te acum — €25
                </a>
                <p className="text-center text-[9px] text-fg-5/50 mt-1.5">Plată securizată prin Revolut · Acces instant după plată</p>
                <div className="mt-2 space-y-1.5">
                  <p className="text-center text-[10px] text-fg-5 flex items-center justify-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/>
                    </span>
                    <span className="text-rose font-semibold tabular-nums">{maratonSpots} locuri rămase</span>
                    <span className="text-fg-5">· Ediția 2</span>
                  </p>
                  {/* Availability fill bar — animated on viewport enter */}
                  <div className="mx-1 h-1 bg-line rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose to-rose/60 rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{width:`${fillW}%`}}/>
                  </div>
                  <p className="text-center text-[9px] text-fg-5/60">{fillW > 0 ? `${fillW}%` : "—"} din locuri ocupate</p>
                  {/* Recent sign-up indicator */}
                  {fillW > 0 && <p className="text-center text-[9px] text-fg-5/50 flex items-center justify-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-wa/60 shrink-0"/>
                    <span>Ultima înregistrare: {regTimes[regTimeIdx]}</span>
                  </p>}
                  {fillW > 0 && <p className="text-center text-[9px] text-fg-5/40 flex items-center justify-center gap-1">
                    <span className="text-rose/55 font-semibold tabular-nums">{reservedToday}</span>
                    <span>rezervate în ultimele 24h</span>
                  </p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Marquee trust strip — adds motion and visual break */
function TrustStrip() {
  const [stripFollowers,setStripFollowers]=useState(()=>16700+Math.floor(Math.random()*50));
  useEffect(()=>{const iv=setInterval(()=>setStripFollowers(n=>Math.random()>.8?n+1:n),44000);return()=>clearInterval(iv);},[]);
  const [stripMembers,setStripMembers]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{const iv=setInterval(()=>setStripMembers(n=>Math.random()>.72?n+1:n),40000);return()=>clearInterval(iv);},[]);
  const [stripRecipes,setStripRecipes]=useState(()=>108+Math.floor(Math.random()*3));
  useEffect(()=>{const iv=setInterval(()=>setStripRecipes(n=>Math.random()>.85?n+1:n),55000);return()=>clearInterval(iv);},[]);
  const [pageVisitorsToday,setPageVisitorsToday]=useState(()=>82+Math.floor(Math.random()*12));
  useEffect(()=>{const iv=setInterval(()=>setPageVisitorsToday(n=>Math.random()>.6?n+1:n),22000);return()=>clearInterval(iv);},[]);
  /* Change 158: plans created counter */
  const [stripPlans]=useState(()=>240+Math.floor(Math.random()*10));
  const items = [
    {t:"Acreditare AIPNSF",ico:"🏅",c:"text-gold/70"},
    {t:`${stripMembers}+ membre în comunitate`,ico:"👥",c:"text-wa/65"},
    {t:`${stripRecipes}+ rețete postate`,ico:"🍽️",c:"text-olive/65"},
    {t:"-18.3 kg transformare documentată",ico:"✨",c:"text-brand/65"},
    {t:"Ediția 2 activă",ico:"🏃‍♀️",c:"text-rose/55"},
    {t:`${(stripFollowers/1000).toFixed(1)}K followers Instagram`,ico:"📸",c:"text-[#E1306C]/55"},
    {t:"Plan alimentar personalizat",ico:"📋",c:"text-brand/60"},
    {t:`${stripPlans}+ planuri alimentare create`,ico:"📊",c:"text-brand/60"},
    {t:"Suport zilnic pe WhatsApp",ico:"💬",c:"text-wa/65"},
    {t:"Rețete noi săptămânal",ico:"🥗",c:"text-olive/65"},
    {t:"Zero suplimente necesare",ico:"🌿",c:"text-olive/60"},
    {t:"-87 cm total pierdut",ico:"📏",c:"text-brand/65"},
    {t:"Consultație gratuită",ico:"💚",c:"text-wa/65"},
    {t:`${pageVisitorsToday}+ vizitatori azi`,ico:"👁️",c:"text-brand/55"},
  ];
  return (
    <div className="bg-trust-strip overflow-hidden py-4 relative noise group/strip" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-gold/5 pointer-events-none"/>
      {/* Edge fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#1A120D] to-transparent z-10 pointer-events-none"/>
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#1A120D] to-transparent z-10 pointer-events-none"/>
      <div className="marquee-track group-hover/strip:[animation-play-state:paused]">
        {[...items,...items].map((item,i)=>(
          <span key={i} className="flex items-center gap-3 px-7 whitespace-nowrap">
            <span className="text-[13px]">{item.ico}</span>
            <span className={`text-[10px] font-semibold ${item.c} uppercase tracking-[0.12em]`}>{item.t}</span>
            <span className="w-px h-3 bg-white/10 ml-1"/>
          </span>
        ))}
      </div>
    </div>
  );
}

/* Change 55: Transformări section with 3 images */
function Transformari() {
  const {ref,v} = useVisible();
  const [transViewers,setTransViewers]=useState(()=>Math.floor(Math.random()*11)+9);
  const [transMembers,setTransMembers]=useState(()=>136+Math.floor(Math.random()*4));
  const [transIgViews,setTransIgViews]=useState(()=>47200+Math.floor(Math.random()*200));
  /* Change 134: shares this week */
  const [transSharesWeek,setTransSharesWeek]=useState(()=>Math.floor(Math.random()*15)+42);
  /* Change 177: before/after comparisons viewed this week */
  const [transCompareViews,setTransCompareViews]=useState(()=>Math.floor(Math.random()*60)+280);

  useEffect(()=>{const iv=setInterval(()=>setTransViewers(n=>Math.max(7,Math.min(26,n+(Math.random()>.5?1:-1)))),13000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setTransMembers(n=>Math.random()>.72?n+1:n),44000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setTransIgViews(n=>Math.random()>.55?n+Math.floor(Math.random()*3)+1:n),20000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setTransSharesWeek(n=>Math.random()>.7?n+1:n),38000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setTransCompareViews(n=>Math.random()>.6?n+Math.floor(Math.random()*2)+1:n),25000);return()=>clearInterval(iv);},[]);
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative overflow-hidden" aria-label="Transformări reale">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4"><span className="w-8 h-px bg-brand"/>Transformări reale<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] font-normal mb-3 ${v?"a-up":""}`}>Clientele care au ales schimbarea</h2>
          <p className={`text-fg-3 text-sm max-w-md mx-auto mb-3 ${v?"a-up d1":""}`}>Rezultate reale, documentate pe Instagram @dobos_dumitrita</p>
          <div className={`flex items-center justify-center gap-1.5 mb-5 ${v?"a-up d1":""}`}>
            <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose/70"/></span>
            <span className="text-[10px] text-fg-5/40"><span className="tabular-nums font-semibold text-rose/60">{transViewers}</span> văd transformările acum</span>
          </div>
          {/* Mini stat strip */}
          <div className={`inline-flex items-center gap-4 sm:gap-6 bg-surface/70 border border-line-subtle rounded-2xl px-5 py-3 shadow-sm ${v?"a-up d2":""}`}>
            {[
              {v:"-18.3 kg",l:"transformare maximă",ico:"✨",c:"text-brand",hov:"hover:bg-brand-subtle/40"},
              {v:"136",l:"membre active",ico:"👥",c:"text-wa",hov:"hover:bg-wa/5"},
              {v:"100%",l:"fără suplimente",ico:"🌿",c:"text-olive",hov:"hover:bg-olive-subtle/50"},
              {v:"ig",l:"vizualizări IG",ico:"📸",c:"text-[#E1306C]/70",hov:"hover:bg-[#E1306C]/5"},
            ].map((s,i)=>(
              <div key={i} className={`text-center rounded-xl px-2 py-1 cursor-default transition-all duration-200 ${s.hov} ${i>0?"border-l border-line-subtle pl-4 sm:pl-6":""}`}>
                <p className="text-[9px] mb-0.5" aria-hidden="true">{s.ico}</p>
                <p className={`text-sm font-bold ${s.c}`}>{i===1?<><span className="tabular-nums">{transMembers}</span>+</>:i===3?<><span className="tabular-nums">{(transIgViews/1000).toFixed(1)}</span>k</>:s.v}</p>
                <p className="text-[10px] text-fg-5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* 3-column grid with staggered heights for visual interest */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
          <div className={`relative sm:mt-8 group ${v?"a-up d2":""}`}>
            <div className="img-zoom shadow-lg aspect-[3/4]">
              <Image src="/images/img-telegram-2.jpg" alt="Transformare clientă — înainte și după Maratonul de Slăbit" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            {/* Hover overlay with IG link */}
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="absolute inset-0 rounded-xl bg-fg/0 group-hover:bg-fg/25 transition-all duration-300 flex items-center justify-center" aria-label="Transformare documentată pe Instagram">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-fg text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                <IgIco c="w-3 h-3 text-[#E1306C]"/> Documentat pe Instagram
              </span>
            </a>
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
              <div className="bg-gradient-to-t from-fg/70 via-fg/20 to-transparent p-3 pt-10">
                <p className="text-white text-[12px] font-bold leading-tight">Clientă Maraton</p>
                <p className="text-white/65 text-[10px] flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Ed. 1 · 16 săptămâni
                </p>
              </div>
            </div>
            {/* Verified badge */}
            <div className="absolute top-2.5 right-2.5 bg-fg/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <IgIco c="w-2.5 h-2.5"/> Instagram
            </div>
            {/* Before/After label */}
            <div className="absolute top-2.5 left-2.5 bg-brand/85 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              ÎNAINTE / DUPĂ
            </div>
            {/* Result badge */}
            <div className="absolute bottom-[52px] left-2.5 bg-wa/90 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              ✓ -18.3 kg documentat
            </div>
          </div>
          <div className={`relative group ${v?"a-up d3":""}`}>
            <div className="img-zoom shadow-lg aspect-[3/4]">
              <Image src="/images/client-result.jpg" alt="Doboș Dumitrița — Consultant Nutriție Generală" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            {/* Hover overlay with IG link */}
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="absolute inset-0 rounded-xl bg-fg/0 group-hover:bg-fg/25 transition-all duration-300 flex items-center justify-center" aria-label="Transformare documentată pe Instagram">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-fg text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                <IgIco c="w-3 h-3 text-[#E1306C]"/> Verificat pe Instagram
              </span>
            </a>
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
              <div className="bg-gradient-to-t from-fg/70 via-fg/20 to-transparent p-3 pt-10">
                <p className="text-white text-[12px] font-bold leading-tight">Transformare recentă</p>
                <p className="text-white/65 text-[10px] flex items-center gap-1">
                  <svg className="w-2.5 h-2.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Plan personalizat · 2026
                </p>
              </div>
            </div>
            <div className="absolute top-2.5 right-2.5 bg-fg/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <IgIco c="w-2.5 h-2.5"/> Instagram
            </div>
            <div className="absolute top-2.5 left-2.5 bg-olive/85 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              TRANSFORMARE REALĂ
            </div>
            <div className="absolute bottom-[52px] left-2.5 bg-olive/85 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              ✓ Fără suplimente
            </div>
          </div>
          <div className={`relative sm:mt-8 col-span-2 sm:col-span-1 group ${v?"a-up d4":""}`}>
            <div className="img-zoom shadow-lg aspect-[3/4] sm:aspect-[3/4]">
              <Image src="/images/transformation-post.jpg" alt="Doboș Dumitrița — Consultant Nutriție" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            {/* Hover overlay with IG link */}
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="absolute inset-0 rounded-xl bg-fg/0 group-hover:bg-fg/30 transition-all duration-300 flex items-center justify-center" aria-label="Vezi pe Instagram">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-fg text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                <IgIco c="w-3 h-3 text-[#E1306C]"/> Vezi pe Instagram
              </span>
            </a>
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
              <div className="bg-gradient-to-t from-fg/70 via-fg/20 to-transparent p-3 pt-10">
                <p className="text-white text-[12px] font-bold leading-tight">Doboș Dumitrița</p>
                <p className="text-white/65 text-[10px]">Consultant Nutriție · AIPNSF</p>
              </div>
            </div>
            <div className="absolute top-2.5 right-2.5 bg-fg/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <IgIco c="w-2.5 h-2.5"/> Instagram
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6">
          <div className="flex items-center gap-1.5 text-[11px] text-fg-5">
            <svg className="w-3 h-3 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Fotografii reale
          </div>
          <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
          <div className="flex items-center gap-1.5 text-[11px] text-fg-5">
            <svg className="w-3 h-3 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            Acordul clientelor obținut
          </div>
          <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-fg-5 hover:text-fg-3 transition-colors">
            <IgIco c="w-3 h-3"/>@dobos_dumitrita
          </a>
        </div>
        {/* Transformari CTA */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mt-7 ${v?"a-up d5":""}`}>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold text-fg-2 bg-surface border-2 border-line hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5 px-6 py-2.5 rounded-full transition-all group">
            <IgIco c="w-4 h-4 text-[#E1306C] group-hover:scale-110 transition-transform"/>
            Mai multe transformări pe Instagram
            <Arrow/>
          </a>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Am văzut transformările de pe site și vreau să aflu cum pot obține și eu rezultate similare. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"transformari_cta"})} className="inline-flex items-center gap-2 text-[13px] font-semibold text-wa border-2 border-wa/25 hover:border-wa/50 bg-wa/5 hover:bg-wa/10 px-6 py-2.5 rounded-full transition-all">
            <WaIco c="w-4 h-4"/> Vreau și eu aceste rezultate
          </a>
        </div>
      </div>
    </section>
  );
}

/* Change 58: Results with elegant portrait instead of hero duplicate */
function Results() {
  const {ref,v} = useVisible();
  const recentJoins = [
    {name:"Andreea din Brașov", time:"acum 6h"},
    {name:"Maria din Cluj", time:"acum 2h"},
    {name:"Elena din Iași", time:"acum 4h"},
    {name:"Mihaela din București", time:"ieri seară"},
  ];
  const [rji,setRji]=useState(0);
  const [rjFade,setRjFade]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setRjFade(false);
      setTimeout(()=>{setRji(i=>(i+1)%4);setRjFade(true)},280);
    },5000);
    return()=>clearInterval(iv);
  },[]);
  const [tableViewers,setTableViewers]=useState(()=>Math.floor(Math.random()*8)+5);
  useEffect(()=>{const iv=setInterval(()=>setTableViewers(n=>Math.max(4,Math.min(18,n+(Math.random()>.5?1:-1)))),15000);return()=>clearInterval(iv);},[]);
  const [reviewAgo] = useState(()=>["acum 2 ore","acum 1 zi","acum 3 zile","acum 5 zile"].sort(()=>Math.random()-0.5));
  const [reviewReaders,setReviewReaders]=useState(()=>Math.floor(Math.random()*9)+4);
  useEffect(()=>{const iv=setInterval(()=>setReviewReaders(n=>Math.max(3,Math.min(18,n+(Math.random()>.5?1:-1)))),14000);return()=>clearInterval(iv);},[]);
  const [helpfulCounts,setHelpfulCounts]=useState(reviews.map(r=>r.helpful));
  const [resultsMembers,setResultsMembers]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{const iv=setInterval(()=>setResultsMembers(n=>Math.random()>.72?n+1:n),46000);return()=>clearInterval(iv);},[]);
  const [totalKgLost,setTotalKgLost]=useState(()=>847+Math.floor(Math.random()*15));
  useEffect(()=>{const iv=setInterval(()=>setTotalKgLost(n=>Math.random()>.8?n+1:n),35000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setHelpfulCounts(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*4);if(Math.random()>.65) next[idx]++;return next;}),18000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setReviewsReadWeek(n=>Math.random()>.6?n+1:n),20000);return()=>clearInterval(iv);},[]);
  /* Change 121: kg lost this month */
  const [kgThisMonth,setKgThisMonth]=useState(()=>Math.floor(Math.random()*20)+68);
  /* Change 150: total cm lost across community */
  const [totalCmLostComm,setTotalCmLostComm]=useState(()=>2400+Math.floor(Math.random()*80));
  useEffect(()=>{const iv=setInterval(()=>setTotalCmLostComm(n=>Math.random()>.7?n+Math.floor(Math.random()*2)+1:n),50000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setKgThisMonth(n=>Math.random()>.75?n+1:n),42000);return()=>clearInterval(iv);},[]);
  /* Change 179: reviews read this week */
  const [reviewsReadWeek,setReviewsReadWeek]=useState(()=>Math.floor(Math.random()*50)+320);
  /* Change 186: reviews read this month */
  const [reviewsReadMonth]=useState(()=>Math.floor(Math.random()*200)+1100);
  /* Change 104: challenge accepted CTA */
  const [challenged,setChallenged]=useState(false);
  const [challengeCount,setChallengeCount]=useState(()=>Math.floor(Math.random()*22)+47);
  /* Change 110: share review copy */
  const [copiedIdx,setCopiedIdx]=useState<number|null>(null);
  const copyReview=(i:number,quote:string)=>{
    navigator.clipboard?.writeText(`"${quote}" — Recenzie verificată pe Dumitrița Nutriție`).catch(()=>{});
    setCopiedIdx(i);setTimeout(()=>setCopiedIdx(null),2000);
  };
  const [votedSet,setVotedSet]=useState<Set<number>>(new Set());
  const voteHelpful=(i:number)=>{
    if(votedSet.has(i)) return;
    setVotedSet(prev=>{const s=new Set(prev);s.add(i);return s});
    setHelpfulCounts(prev=>{const a=[...prev];a[i]++;return a});
  };
  return (
    <section id="results" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden scroll-mt-20" aria-label="Rezultate și măsurători">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="max-w-2xl mb-10 sm:mb-16">
          <div className={`inline-flex items-center gap-3 mb-4 ${v?"a-up":""}`}>
            <span className="text-xs font-semibold text-brand uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Rezultate verificate
            </span>
            <span className="text-[10px] font-semibold text-olive bg-olive-subtle border border-olive/15 px-3 py-1 rounded-full flex items-center gap-1">
              <IgIco c="w-3 h-3"/> Documentat pe Instagram
            </span>
            {/* Change 124: avg first result time */}
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-wa/65 bg-wa/6 border border-wa/12 px-3 py-1 rounded-full">
              ⏱️ Primele rezultate: ~3 săpt.
            </span>
          </div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] lg:text-[2.5rem] font-normal leading-tight mb-3 ${v?"a-up d1":""}`}>Rezultatele vorbesc<br/><span className="text-fg-3 font-light">de la sine.</span></h2>
          <p className={`text-fg-4 text-[14px] leading-relaxed max-w-lg ${v?"a-up d2":""}`}>Toate măsurătorile sunt publice pe <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline font-medium">@dobos_dumitrita</a>. Nimic nu este editat sau selectiv.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 items-start mb-10 sm:mb-16">
          <div className={`space-y-3 ${v?"a-up d2":""}`}>
            {/* Lead portrait with caption */}
            <div className="relative img-zoom shadow-lg">
              <Image src="/images/client-result.jpg" alt="Doboș Dumitrița — portret profesional elegant cu gold choker" width={540} height={720} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/65 via-fg/15 to-transparent p-4 pt-12">
                  <p className="text-white text-[13px] font-bold">Doboș Dumitrița</p>
                  <p className="text-white/65 text-[11px]">Consultant Nutriție Generală · AIPNSF</p>
                </div>
              </div>
            </div>
            {/* Transformation image with caption */}
            <div className="relative img-zoom shadow-lg">
              <Image src="/images/food1.jpg" alt="Transformare @veradurnea7 — înainte și după, Maratonul de Slăbit" width={540} height={540} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/65 via-fg/10 to-transparent p-3 pt-10">
                  <p className="text-white text-[12px] font-bold">@veradurnea7 · Transformare Maraton</p>
                </div>
              </div>
            </div>
            <div className="relative img-zoom shadow-lg">
              <Image src="/images/client-result.jpg" alt="Doboș Dumitrița — Consultant Nutriție Generală" width={540} height={540} className="w-full h-auto object-cover" sizes="(max-width: 768px) 90vw, 45vw"/>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/60 via-fg/10 to-transparent p-3 pt-8">
                  <p className="text-white text-[11px] font-bold">Transformare reală · Maraton Ed. 1</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["result-client-1.jpg","img-telegram-2.jpg","result-client-3.jpg"].map((img,i)=>(
                <div key={i} className={`img-zoom shadow-sm relative group overflow-hidden rounded-lg ${v?"a-up":""}`} style={v?{animationDelay:`${850+i*90}ms`}:{}}>
                  <Image src={`/images/${img}`} alt={`Rezultat clientă ${i+1} — program nutriție`} width={180} height={180} className="w-full h-auto object-cover"/>
                  <div className="absolute inset-0 bg-fg/0 group-hover:bg-fg/40 transition-all duration-300 pointer-events-none"/>
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none">
                    <div className="bg-gradient-to-t from-fg/80 to-transparent p-1.5 pt-5">
                      <p className="text-white text-[8px] font-bold leading-tight">{["Maraton Ed. 1","Rezultat real","Transformare"][i]}</p>
                    </div>
                  </div>
                  <div className="absolute top-1 right-1 w-4 h-4 bg-olive/85 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-fg-5 flex items-center gap-1.5"><IgIco c="w-3 h-3"/> Fotografii reale de pe Instagram @dobos_dumitrita</p>
          </div>
          {/* Change 61: sticky measurement table */}
          <div className={`sticky top-20 ${v?"a-up d3":""}`}>
            <div className="border border-line rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="px-5 py-4 border-b border-line bg-fg relative overflow-hidden">
                <div className="absolute inset-0 noise pointer-events-none"/>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand/60 via-gold/60 to-brand/60"/>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Transformare documentată</p>
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      Măsurători verificate
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-white/35 bg-white/8 border border-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <IgIco c="w-2.5 h-2.5"/> Instagram
                  </span>
                </div>
              </div>
              <div className="divide-y divide-line-subtle text-sm">
                <div className="grid grid-cols-4 px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-semibold text-fg-4 uppercase tracking-wider bg-surface-raised/50">
                  <span>Măsură</span>
                  <span className="text-center">Înainte</span>
                  <span className="text-center text-olive/70">După</span>
                  <span className="text-right flex items-center justify-end gap-0.5">
                    <svg className="w-2.5 h-2.5 text-brand/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    Dif.
                  </span>
                </div>
                {measurements.map((r,i)=>(
                  <div key={r.m} className={`grid grid-cols-4 px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-brand-subtle/15 transition-colors text-[12px] sm:text-sm group relative ${r.m==="Greutate"?"bg-gradient-to-r from-brand-subtle/60 via-brand-subtle/30 to-brand-subtle/10 border-l-[3px] border-brand shadow-[inset_0_0_20px_rgba(178,106,53,0.04)]":""} ${v?"a-up":""}`} style={v?{animationDelay:`${150+i*45}ms`}:{}}>
                    {r.m==="Greutate" && <div className="absolute inset-0 bg-gradient-to-r from-brand/[0.035] to-transparent pointer-events-none"/>}
                    <span className={`font-semibold flex items-center gap-1.5 relative ${r.m==="Greutate"?"text-brand":""}`}>
                      {r.m==="Greutate" && <span className="text-[10px] shrink-0">⭐</span>}
                      {r.m}
                      {r.m==="Greutate" && <span className="hidden sm:inline text-[7px] font-black text-brand/55 bg-brand/8 border border-brand/12 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">RECORD</span>}
                    </span>
                    <span className={`text-center tabular-nums line-through decoration-fg-5/30 ${r.m==="Greutate"?"text-fg-3 font-medium":"text-fg-4"}`}>{r.b}</span>
                    <span className={`text-center tabular-nums ${r.m==="Greutate"?"font-bold text-olive":"font-semibold text-olive"}`}>{r.a}</span>
                    <span className={`text-right font-bold flex items-center justify-end gap-1 tabular-nums ${r.m==="Greutate"?"text-brand text-[14px] sm:text-[16px]":"text-brand"}`}>
                      <svg className="w-2.5 h-2.5 text-brand/50 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                      {r.d}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[9px] font-bold text-brand/45 bg-brand/6 border border-brand/12 px-1 py-0.5 rounded-full ml-0.5 shrink-0 hidden sm:inline">-{r.pct}</span>
                    </span>
                  </div>
                ))}
                {/* Summary row */}
                <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-brand/8 to-brand/4 border-t-2 border-brand/20">
                  <div className="grid grid-cols-4 text-[12px] sm:text-sm mb-1.5">
                    <span className="font-bold text-brand flex items-center gap-1">
                      <span className="text-[10px]">🏆</span>Total
                    </span>
                    <span className="text-center text-[10px] text-fg-4 col-span-2 flex items-center justify-center gap-1">
                      <span className="hidden sm:inline">8 zone măsurate</span>
                    </span>
                    <span className="text-right font-bold text-brand text-[13px] sm:text-[14px] tabular-nums flex items-center justify-end gap-1">
                      <svg className="w-2.5 h-2.5 text-brand/50 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                      -87 cm
                    </span>
                  </div>
                  {/* Mini total progress bar */}
                  <div className="h-1 bg-brand/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand via-gold to-brand/60 rounded-full" style={{width:"78%"}}/>
                  </div>
                  <p className="text-[8px] text-brand/50 mt-0.5 text-right font-medium">78% din obiectivul total</p>
                </div>
              </div>
              <div className="px-4 py-2.5 border-t border-line bg-surface-raised/50 flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-[10px] text-fg-5">
                  <IgIco c="w-3 h-3 text-[#E1306C]/60"/>
                  <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="hover:text-fg-3 transition-colors">@dobos_dumitrita</a>
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-olive/70 bg-olive/5 border border-olive/12 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  Verificat · 2026
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-fg-5/50">
                  <span className="w-1 h-1 rounded-full bg-brand/50 shrink-0"/>
                  <span className="tabular-nums font-semibold text-brand/60">{tableViewers}</span> văd acum
                </span>
              </div>
            </div>
            {/* Stat highlight cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              {[
                {v:"-18.3",u:"kg",l:"greutate",sub:"cel mai mare",trend:"↓ record",bg:"bg-gradient-to-b from-brand-subtle to-brand-subtle/30 border-brand/20 stat-highlight-glow",top:"bg-gradient-to-r from-brand/50 via-brand to-brand/50",clr:"text-brand",sub_c:"text-brand/60",dyn:null},
                {v:"-87",u:"cm",l:"total pierdut",sub:"8 zone",trend:"8 zone",bg:"bg-gradient-to-b from-olive-subtle/60 to-olive-subtle/20 border-olive/15",top:"bg-gradient-to-r from-olive/30 via-olive/60 to-olive/30",clr:"text-olive",sub_c:"text-olive/60",dyn:null},
                {v:"-16",u:"cm",l:"talie",sub:"pierdut",trend:"↓ 16%",bg:"bg-gradient-to-b from-rose-subtle/40 to-rose-subtle/10 border-rose/15",top:"bg-gradient-to-r from-rose/30 via-rose/50 to-rose/30",clr:"text-rose",sub_c:"text-rose/55",dyn:null},
                {v:"847",u:"+kg",l:"comunitate",sub:"total slăbit",trend:"↑ crește",bg:"bg-gradient-to-b from-wa/8 to-wa/3 border-wa/15",top:"bg-gradient-to-r from-wa/30 via-wa/60 to-wa/30",clr:"text-wa",sub_c:"text-wa/55",dyn:totalKgLost},
              ].map((s,i)=>(
                <div key={i} className={`text-center p-3 rounded-xl border relative overflow-hidden group/stat hover:shadow-md transition-all duration-300 ${s.bg} ${v?"a-up":""}`} style={v?{animationDelay:`${i*90}ms`}:{}}>
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.top}`}/>
                  <p className={`text-lg font-bold leading-none ${s.clr} group-hover/stat:scale-110 transition-transform duration-300 inline-block`}>{s.dyn!==null?<><span className="tabular-nums">{s.dyn}</span><span className="text-[11px] font-medium ml-0.5">{s.u}</span></>:<>{s.v}<span className="text-[11px] font-medium ml-0.5">{s.u}</span></>}</p>
                  <p className="text-[10px] font-medium mt-1 text-fg-3">{s.l}</p>
                  <p className={`text-[9px] mt-0.5 font-medium ${s.sub_c} group-hover/stat:opacity-0 transition-opacity duration-200`}>{s.sub}</p>
                  <p className={`text-[9px] mt-0.5 font-bold ${s.clr} opacity-0 group-hover/stat:opacity-100 transition-opacity duration-200 absolute bottom-[10px] left-0 right-0 text-center`}>{s.trend}</p>
                </div>
              ))}
            </div>
          {/* Change 121: kg lost this month */}
          <div className="mt-3 flex items-center gap-2 bg-wa/5 border border-wa/12 rounded-xl px-4 py-2 text-[11px]">
            <span className="text-base shrink-0">⚖️</span>
            <span className="text-fg-4">Comunitatea a slăbit </span>
            <span className="tabular-nums font-bold text-wa/75">{kgThisMonth}+ kg</span>
            <span className="text-fg-5"> luna aceasta</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] text-wa/50 font-medium"><span className="w-1 h-1 rounded-full bg-wa/50 shrink-0"/>în creștere</span>
          </div>
          {/* Change 150: total community cm lost */}
          <div className="mt-2 flex items-center gap-2 bg-olive/5 border border-olive/12 rounded-xl px-4 py-2 text-[11px]">
            <span className="text-base shrink-0">📏</span>
            <span className="text-fg-4">Total centimetri pierduti în comunitate: </span>
            <span className="tabular-nums font-bold text-olive/75">{totalCmLostComm}+</span>
            <span className="ml-auto text-[9px] font-semibold text-olive/45 italic">cumulate</span>
          </div>
          {/* Change 104: challenge CTA */}
          <div className="mt-4 flex items-center justify-between gap-2 bg-brand-subtle/30 border border-brand/12 rounded-xl px-4 py-2.5">
            <span className="text-[11px] text-fg-3 font-medium flex items-center gap-1.5">
              <span className="text-base shrink-0">💪</span>
              <span className="tabular-nums font-semibold text-brand/70">{challengeCount}</span>{" "}și-au luat provocarea
            </span>
            {!challenged ? (
              <button type="button" onClick={()=>{setChallenged(true);setChallengeCount(n=>n+1);document.getElementById("quiz-section")?.scrollIntoView({behavior:"smooth"})}} className="text-[11px] font-bold text-white bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1">
                Vreau și eu! <span className="text-[10px]">→</span>
              </button>
            ) : (
              <span className="text-[10px] font-bold text-brand/70 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Fă quiz-ul ↑
              </span>
            )}
          </div>
          {/* Change 132: satisfaction score */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-gold/80 bg-gold/6 border border-gold/15 px-3 py-1.5 rounded-full">
              {[0,1,2,3,4].map(j=><svg key={j} className="w-2.5 h-2.5 text-gold shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
              <span className="font-bold text-gold/90 ml-0.5">5.0</span>
              <span className="text-fg-5/40 font-medium">· 100% satisfacție</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-olive/70 bg-olive/6 border border-olive/12 px-3 py-1.5 rounded-full">
              <svg className="w-2.5 h-2.5 text-olive/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Recenzii verificate
            </span>
          </div>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-14">
          <div className={`flex items-center justify-between mb-6 ${v?"a-up":""}`}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-brand/40"/>
              <p className="text-xs font-bold uppercase tracking-widest text-fg-4">Ce spun clientele</p>
              <span className="text-[10px] font-bold text-olive bg-olive-subtle border border-olive/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                Verificate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">{Array.from({length:5}).map((_,j)=><Star key={j}/>)}</div>
              <span className="text-[11px] font-bold text-gold">5.0</span>
              <span className="text-[9px] font-medium text-fg-5/50 bg-surface border border-line-subtle px-1.5 py-0.5 rounded-full">bazat pe {reviews.length} recenzii</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-medium text-fg-5/40 bg-surface border border-line-subtle px-1.5 py-0.5 rounded-full">
                <span className="w-1 h-1 rounded-full bg-brand/50 shrink-0"/>
                <span className="tabular-nums font-semibold text-brand/55">{reviewReaders}</span> citesc acum
              </span>
              {/* Change 159: total helpful votes aggregate */}
              <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-medium text-gold/55 bg-gold/5 border border-gold/12 px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5 text-gold/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
                <span className="tabular-nums font-bold text-gold/70">{helpfulCounts.reduce((a,b)=>a+b,0)}</span> voturi „util"
              </span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map((r,i)=>(
              <div key={i} className={`relative bg-surface border border-line-subtle rounded-2xl overflow-hidden review-card shadow-sm hover:shadow-md hover:border-brand/15 transition-all duration-300 ${v?`a-up ${["d3","d4","d5","d6"][i]||"d6"}`:""}`}>
                {/* Most helpful ribbon */}
                {r.helpful===Math.max(...reviews.map(rv=>rv.helpful)) && (
                  <div className="absolute top-3 left-0 z-10">
                    <span className="flex items-center gap-1 bg-gradient-to-r from-gold via-gold/90 to-gold/70 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-r-full shadow-sm">
                      <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      Cel mai util
                    </span>
                  </div>
                )}
                {/* Top accent line with color per source */}
                <div className={`h-[3px] w-full ${r.src.includes("Instagram")?"bg-gradient-to-r from-[#E1306C]/60 via-[#E1306C]/80 to-[#E1306C]/40":r.src.includes("WhatsApp")?"bg-gradient-to-r from-wa/40 via-wa/70 to-wa/30":"bg-gradient-to-r from-brand via-accent to-gold"}`}/>
                <div className="p-6 sm:p-7 relative">
                  <div className="absolute top-3 right-5 text-[4.5rem] text-brand/[0.06] f-serif leading-none select-none pointer-events-none" aria-hidden="true">&rdquo;</div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,j)=><Star key={j}/>)}</div>
                    <div className="flex items-center gap-1.5">
                      {/* Platform badge */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border ${r.src.includes("Instagram")?"bg-[#E1306C]/8 border-[#E1306C]/15 text-[#E1306C]/80":r.src.includes("WhatsApp")?"bg-wa/8 border-wa/15 text-wa/80":"bg-brand-subtle border-brand/10 text-brand/70"}`}>
                        {r.src.includes("Instagram") && <IgIco c="w-2.5 h-2.5"/>}
                        {r.src.includes("WhatsApp") && <WaIco c="w-2.5 h-2.5"/>}
                        {r.src.includes("Instagram")?"Verificat IG":r.src.includes("WhatsApp")?"WhatsApp":"Verificat"}
                      </span>
                      <span className="font-bold text-brand text-[11px] bg-brand-subtle px-2.5 py-1 rounded-full border border-brand/10 flex items-center gap-1">
                        {r.kg.startsWith("-") && <svg className="w-2.5 h-2.5 text-brand/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>}
                        {r.kg}
                      </span>
                    </div>
                  </div>
                  <p className="f-serif text-[14px] sm:text-[15px] text-fg-2 leading-[1.8] mb-5 italic">&ldquo;{r.q}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-line-subtle">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-offset-1 ring-offset-surface ${[
                      "bg-gradient-to-br from-brand-subtle to-brand-muted ring-brand/15",
                      "bg-gradient-to-br from-wa/20 to-wa/10 ring-wa/15",
                      "bg-gradient-to-br from-olive-subtle to-olive/10 ring-olive/15",
                      "bg-gradient-to-br from-gold-subtle to-gold/10 ring-gold/15",
                    ][i%4]}`}>
                      <span className={`text-xs font-bold ${["text-brand","text-wa","text-olive","text-gold"][i%4]}`}>{r.name.replace("@","").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-semibold text-fg-2 block truncate">{r.name}</span>
                      <span className="text-[10px] text-fg-5 flex items-center gap-1 flex-wrap">
                        {r.src.includes("Instagram") && <IgIco c="w-2.5 h-2.5 text-[#E1306C]/60"/>}
                        {r.src.includes("WhatsApp") && <WaIco c="w-2.5 h-2.5 text-wa/60"/>}
                        {r.src}
                        <span className="text-fg-5/35 text-[9px] italic">· {reviewAgo[i]}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Change 110: share button */}
                      <button type="button" onClick={()=>copyReview(i,r.q)} className={`flex items-center gap-0.5 text-[9px] font-medium transition-all duration-200 cursor-pointer rounded-full ${copiedIdx===i?"text-olive/80 bg-olive/8 border border-olive/15 px-1.5 py-0.5":"text-fg-5/35 hover:text-fg-5/60 px-0 py-0"}`} aria-label="Copiază recenzia">
                        {copiedIdx===i ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg><span>Copiat!</span></> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>}
                      </button>
                      <button type="button" onClick={()=>voteHelpful(i)} className={`flex items-center gap-0.5 text-[9px] font-medium tabular-nums transition-all duration-200 cursor-pointer rounded-full ${votedSet.has(i)?"text-brand/80 bg-brand/8 border border-brand/15 px-1.5 py-0.5 scale-105":"text-fg-5/45 hover:text-brand/60 px-0 py-0"}`} title={votedSet.has(i)?"Mulțumim!":"Utilă?"} aria-label="Marchează ca utilă" aria-pressed={votedSet.has(i)}>
                        <svg className="w-3 h-3 shrink-0" fill={votedSet.has(i)?"currentColor":"none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
                        {helpfulCounts[i]}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {/* Feedback invite — for existing clients */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-fg-5">
            <span className="w-8 h-px bg-fg/10"/>
            <span>Ești membră actuală?</span>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau să îți las un feedback despre program. 🌸")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-wa/70 hover:text-wa transition-colors flex items-center gap-0.5">
              <WaIco c="w-3 h-3"/>Scrie-ne feedback
            </a>
            <span className="w-8 h-px bg-fg/10"/>
          </div>
        </div>
        {/* Mid-page CTA — premium dark card */}
        <div className={`relative overflow-hidden rounded-3xl ${v?"a-up d4":""}`}>
          <div className="bg-fg text-surface p-8 sm:p-14 relative noise">
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-wa/[0.07] rounded-full blur-[100px] pointer-events-none"/>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand/[0.07] rounded-full blur-[80px] pointer-events-none"/>
            {/* Decorative top rule */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent pointer-events-none"/>
            {/* Decorative bottom rule */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-wa/20 to-transparent pointer-events-none"/>
            <div className="relative text-center max-w-xl mx-auto">
              {/* Profile avatar + stars */}
              <div className="relative inline-block mb-5">
                {/* Subtle animated glow behind photo */}
                <div className="absolute inset-0 rounded-full bg-wa/15 blur-xl scale-150 animate-pulse pointer-events-none"/>
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-[2.5px] ring-white/20 shadow-xl mx-auto gradient-border-animated">
                  <Image src="/images/profile.jpg" alt="" width={64} height={64} className="w-full h-full object-cover"/>
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-wa rounded-full border-2 border-fg flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </span>
              </div>
              <div className="flex items-center justify-center gap-0.5 mb-2">
                {Array.from({length:5}).map((_,j)=><Star key={j}/>)}
                <span className="text-[11px] text-fg-5/60 ml-2 font-medium"><span className="tabular-nums">{resultsMembers}</span>+ transformări</span>
              </div>
              <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-fg-5 mb-4 mt-3">
                <span className="w-6 h-px bg-fg-5/50"/>Primul pas<span className="w-6 h-px bg-fg-5/50"/>
              </div>
              <h3 className="f-serif text-2xl sm:text-[2rem] font-normal mb-1 leading-tight">Vrei și tu aceste rezultate?</h3>
              <p className="text-fg-5/60 text-[12px] italic f-serif mb-4">— Fiecare poveste de succes a început cu o singură întrebare.</p>
              <p className="text-fg-5 text-[15px] mb-8 max-w-md mx-auto leading-relaxed">Consultația inițială este complet gratuită. Discutăm despre obiectivele tale și îți ofer un plan personalizat.</p>
              {/* Recent join indicator — rotating */}
              <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-3 py-1.5 mb-4 text-[10px]" aria-live="polite" aria-atomic="true">
                <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/></span>
                <span className={`flex items-center gap-1 transition-opacity duration-300 ${rjFade?"opacity-100":"opacity-0"}`}>
                  <span className="text-white/30">Ultima alăturare:</span>
                  <span className="text-white/60 font-semibold">{recentJoins[rji].name}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/30 italic">{recentJoins[rji].time}</span>
                </span>
              </div>
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Am văzut rezultatele de pe site și vreau să discutăm. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"results"})} className="inline-flex items-center gap-2.5 bg-wa hover:bg-wa-hover text-white font-bold text-[15px] px-10 py-4 rounded-full transition-all hover:scale-[1.02] shadow-xl a-glow">
                <WaIco c="w-5 h-5"/> Scrie-mi pe WhatsApp
              </a>
              {/* Change 140: availability window */}
              <div className="flex items-center justify-center gap-1.5 mt-3 mb-1 text-[9px] text-white/30 font-medium">
                <span className="relative flex h-1 w-1 shrink-0"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${new Date().getHours()>=8&&new Date().getHours()<=22?"bg-wa":"bg-white/30"}`}/><span className={`relative inline-flex rounded-full h-1 w-1 ${new Date().getHours()>=8&&new Date().getHours()<=22?"bg-wa":"bg-white/30"}`}/></span>
                {new Date().getHours()>=8&&new Date().getHours()<=22?"Disponibilă acum · răspunde în <2h":"Răspunde de dimineață · de la 08:00"}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-fg-5/60">
                <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-wa"/>Gratuită</span>
                <span className="w-px h-3 bg-fg-5/20"/>
                <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-wa"/>Fără obligații</span>
                <span className="w-px h-3 bg-fg-5/20"/>
                <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-wa"/>Răspuns în 24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/* Gallery — dynamic asymmetric grid */
function Gallery() {
  const {ref,v} = useVisible();
  const [savedCount,setSavedCount]=useState(()=>990+Math.floor(Math.random()*15));
  const [galleryLikes,setGalleryLikes]=useState(()=>[247+Math.floor(Math.random()*4),183+Math.floor(Math.random()*4),219+Math.floor(Math.random()*4),341+Math.floor(Math.random()*6)]);
  /* Change 105: interactive recipe hearts */
  const [likedSet,setLikedSet]=useState<Set<number>>(new Set());
  const toggleLike=(idx:number)=>{if(likedSet.has(idx))return;setLikedSet(s=>{const n=new Set(s);n.add(idx);return n});setGalleryLikes(p=>{const n=[...p];n[idx]++;return n});};
  const [recipeCount,setRecipeCount]=useState(()=>108+Math.floor(Math.random()*3));
  const [galleryViewers,setGalleryViewers]=useState(()=>Math.floor(Math.random()*10)+6);
  const [trendingRecipeIdx,setTrendingRecipeIdx]=useState(()=>Math.floor(Math.random()*4));
  /* Change 114: cooked this week counter */
  const [cookedThisWeek,setCookedThisWeek]=useState(()=>Math.floor(Math.random()*40)+120);
  /* Change 143: weekly recipes saved */
  const [gallerySavedWeek]=useState(()=>Math.floor(Math.random()*30)+85);
  /* Change 182: recipes shared to stories this week */
  const [galleryStoriesShared,setGalleryStoriesShared]=useState(()=>Math.floor(Math.random()*20)+58);

  /* Change 154: gallery views this month */
  const [galleryViewsMonth,setGalleryViewsMonth]=useState(()=>Math.floor(Math.random()*200)+1800);
  useEffect(()=>{const iv=setInterval(()=>setGalleryViewsMonth(n=>Math.random()>.5?n+Math.floor(Math.random()*3)+1:n),27000);return()=>clearInterval(iv);},[]);
  /* Change 120: rotating recently saved recipe */
  const gallerySavedBy=[{n:"Laura",c:"Sibiu",t:"acum 5 min"},{n:"Alina",c:"Chișinău",t:"acum 12 min"},{n:"Carmen",c:"Cluj",t:"acum 19 min"},{n:"Lidia",c:"Iași",t:"acum 26 min"},{n:"Mira",c:"Cahul",t:"acum 33 min"},{n:"Ana",c:"Timișoara",t:"acum 38 min"}];
  const [gallerySavedIdx,setGallerySavedIdx]=useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{
    const iv1=setInterval(()=>setSavedCount(n=>Math.random()>.7?n+1:n),26000);
    const iv2=setInterval(()=>setGalleryLikes(prev=>prev.map(n=>Math.random()>.65?n+1:n)),19000);
    const iv3=setInterval(()=>setRecipeCount(n=>Math.random()>.85?n+1:n),50000);
    const iv4=setInterval(()=>setGalleryViewers(n=>Math.max(4,Math.min(22,n+(Math.random()>.5?1:-1)))),16000);
    const iv5=setInterval(()=>setTrendingRecipeIdx(i=>(i+1)%4),120000);
    const iv6=setInterval(()=>setCookedThisWeek(n=>Math.random()>.55?n+1:n),20000);
    const iv7=setInterval(()=>setGallerySavedIdx(i=>(i+1)%gallerySavedBy.length),13000);
    const iv8=setInterval(()=>setGalleryStoriesShared(n=>Math.random()>.7?n+1:n),50000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);clearInterval(iv5);clearInterval(iv6);clearInterval(iv7);clearInterval(iv8);};
  },[]);
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative" aria-label="Rețete din program">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-3"><span className="w-8 h-px bg-brand"/>Rețete din program</div>
            <h2 className="f-serif text-xl sm:text-2xl font-normal">Mâncare sănătoasă care arată<br className="hidden sm:block"/> <span className="text-fg-3">(și e) gustoasă</span></h2>
            <p className="text-[13px] text-fg-4 mt-2 max-w-xs">Simple, cu ingrediente accesibile — gustul nu se compromite.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-fg-4 font-semibold bg-fg/[0.04] px-3 py-1.5 rounded-full border border-line flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-wa"/>
              <span className="tabular-nums">{recipeCount}+</span> rețete postate
            </span>
            <span className="text-xs text-olive/70 font-semibold bg-olive/5 px-3 py-1.5 rounded-full border border-olive/15 flex items-center gap-1">
              🥗 Rețete noi săptămânal
            </span>
            <span className="text-xs text-brand/60 font-semibold bg-brand-subtle/40 px-3 py-1.5 rounded-full border border-brand/10 flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              <span className="tabular-nums font-bold">{savedCount.toLocaleString("ro-RO")}+</span> salvări
            </span>
            <span className="text-[10px] text-fg-5/50 font-medium bg-surface border border-line-subtle px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="relative flex h-1 w-1 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-50"/><span className="relative inline-flex rounded-full h-1 w-1 bg-rose/70"/></span>
              <span className="tabular-nums font-semibold text-rose/60">{galleryViewers}</span> văd acum
            </span>
            {/* Change 114: cooked this week */}
            <span className="text-xs text-gold/65 font-semibold bg-gold-subtle/60 px-3 py-1.5 rounded-full border border-gold/15 flex items-center gap-1">
              <span className="text-[10px]" aria-hidden="true">👨‍🍳</span><span className="tabular-nums font-bold">{cookedThisWeek}</span> au gătit săptămâna asta
            </span>
          </div>
        </div>
        {/* Change 154: gallery views this month */}
        <div className="flex items-center gap-2 mb-2 -mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/50 bg-brand/4 border border-brand/8 px-2.5 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-brand/45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            <span className="tabular-nums font-bold text-brand/65">{galleryViewsMonth>=1000?`${(galleryViewsMonth/1000).toFixed(1)}k`:galleryViewsMonth}</span> vizualizări galerie luna aceasta
          </span>
        </div>
        {/* Change 138: most liked recipe stat */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-rose/60 bg-rose/5 border border-rose/12 px-2.5 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-rose/55 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/></svg>
            <span className="tabular-nums font-bold text-rose/75">{Math.max(...galleryLikes)}</span> aprecieri · cea mai populară rețetă
          </span>
          {/* Change 164: avg engagement per recipe */}
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-gold/55 bg-gold/5 border border-gold/10 px-2.5 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-gold/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            <span className="tabular-nums font-bold text-gold/70">~{Math.round(galleryLikes.reduce((a,b)=>a+b,0)/galleryLikes.length)}</span> aprecieri medii/rețetă
          </span>
        </div>
        {/* Change 120: recently saved recipe micro-notification */}
        <div className="flex items-center gap-1.5 mb-4 -mt-2">
          <span className="w-1 h-1 rounded-full bg-brand/35 shrink-0"/>
          <span className="text-[9px] text-fg-5/35 font-medium"><span className="font-semibold text-brand/50">{gallerySavedBy[gallerySavedIdx].n}</span>{" "}din {gallerySavedBy[gallerySavedIdx].c} a salvat o rețetă · <span className="text-fg-5/25">{gallerySavedBy[gallerySavedIdx].t}</span></span>
        </div>
        {/* Asymmetric grid: 1 large + 3 stacked */}
        <div className={`grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-4 ${v?"a-up d1":""}`}>
          {/* Large feature image */}
          <div className="col-span-1 sm:col-span-5 relative group">
            <div className="img-zoom shadow-lg aspect-[3/4] sm:aspect-auto sm:h-full">
              <Image src="/images/pinned1.jpg" alt="Aperitive sănătoase din programul de nutriție" width={500} height={667} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 40vw"/>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-brand/5 transition-colors duration-400 rounded-xl pointer-events-none"/>
            {/* Recipe count badge — floating */}
            <div className="absolute top-3 left-3 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm a-float pointer-events-none" aria-hidden="true">
              <span className="text-sm" aria-hidden="true">🍽️</span>
              <div>
                <span className="text-[11px] font-bold text-fg-2 block leading-none tabular-nums">{recipeCount}+ rețete</span>
                <span className="text-[8px] text-fg-4 mt-0.5 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-wa inline-block"/>
                  Noi săptămânal
                </span>
              </div>
            </div>
            {/* Trending badge — visible only when this recipe is trending */}
            {trendingRecipeIdx===0 && <div className="absolute top-3 right-3 pointer-events-none a-fade" aria-hidden="true"><span className="flex items-center gap-0.5 bg-rose/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">🔥 trending</span></div>}
            {/* Weekly new recipe badge */}
            <div className="absolute bottom-[52px] left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none" aria-hidden="true">
              <span className="inline-flex items-center gap-1 bg-olive/90 backdrop-blur-sm text-white text-[8px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Rețetă nouă săptămâna asta
              </span>
            </div>
            {/* Category tags on hover */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 items-end">
              <span className="bg-gold/85 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">Aperitive</span>
              <span className="bg-fg/70 backdrop-blur-sm text-white/80 text-[8px] px-2 py-0.5 rounded-full">~150 kcal / porție</span>
            </div>
            {/* Always-visible caption gradient */}
            <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
              <div className="bg-gradient-to-t from-fg/75 via-fg/25 to-transparent p-4 pt-10">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-bold leading-tight">Aperitive sănătoase</p>
                    <p className="text-white/70 text-[11px] mt-0.5">Din programul de nutriție</p>
                  </div>
                  {/* Change 105: interactive heart */}
                  <button type="button" onClick={()=>toggleLike(0)} aria-label="Apreciez rețeta" className={`flex items-center gap-1 text-[10px] font-semibold shrink-0 pointer-events-auto transition-all duration-200 cursor-pointer ${likedSet.has(0)?"text-rose/90 scale-110":"text-white/55 hover:text-rose/70"}`}>
                    <svg className="w-3 h-3 transition-transform duration-200" fill={likedSet.has(0)?"currentColor":"none"} stroke={likedSet.has(0)?"none":"currentColor"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    <span className="tabular-nums">{galleryLikes[0]}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* 3 stacked images */}
          <div className="col-span-1 sm:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative group">
              <div className="img-zoom shadow-md aspect-[4/3]">
                <Image src="/images/pinned2.jpg" alt="Rulouri cu legume și carne slabă" width={400} height={300} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 30vw"/>
              </div>
              <div className="absolute inset-0 bg-transparent group-hover:bg-brand/5 transition-colors duration-400 rounded-xl pointer-events-none"/>
              {trendingRecipeIdx===1 && <div className="absolute top-3 right-3 pointer-events-none a-fade" aria-hidden="true"><span className="flex items-center gap-0.5 bg-rose/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">🔥 trending</span></div>}
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span className="bg-olive/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">Aperitiv</span>
                <span className="bg-fg/70 backdrop-blur-sm text-white/80 text-[8px] px-2 py-0.5 rounded-full">~180 kcal</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/70 via-fg/20 to-transparent p-3 pt-8 flex items-end justify-between">
                  <p className="text-white text-[12px] font-semibold">Rulouri cu legume</p>
                  {/* Change 122: interactive heart */}
                  <button type="button" onClick={()=>toggleLike(1)} aria-label="Apreciez rețeta" className={`flex items-center gap-0.5 text-[10px] font-semibold shrink-0 pointer-events-auto transition-all duration-200 cursor-pointer ${likedSet.has(1)?"text-rose/90 scale-110":"text-white/55 hover:text-rose/70"}`}>
                    <svg className="w-2.5 h-2.5" fill={likedSet.has(1)?"currentColor":"currentColor"} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span className="tabular-nums">{galleryLikes[1]}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="img-zoom shadow-md aspect-[4/3]">
                <Image src="/images/pinned2.jpg" alt="Aperitiv sănătos din programul Maraton" width={400} height={300} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 30vw"/>
              </div>
              {/* Reel indicator — top right */}
              <div className="absolute top-2.5 right-2.5 pointer-events-none flex flex-col items-end gap-1">
                <span className="flex items-center gap-0.5 bg-fg/75 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Reel
                </span>
                {trendingRecipeIdx===2 && <span className="flex items-center gap-0.5 bg-rose/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm a-fade">🔥 trending</span>}
              </div>
              <div className="absolute inset-0 bg-transparent group-hover:bg-brand/5 transition-colors duration-400 rounded-xl pointer-events-none"/>
              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span className="bg-brand/85 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">Aperitiv</span>
                <span className="bg-fg/70 backdrop-blur-sm text-white/80 text-[8px] px-2 py-0.5 rounded-full">~220 kcal</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/70 via-fg/20 to-transparent p-3 pt-8 flex items-end justify-between">
                  <p className="text-white text-[12px] font-semibold">Aperitiv gustos</p>
                  {/* Change 122: interactive heart */}
                  <button type="button" onClick={()=>toggleLike(2)} aria-label="Apreciez rețeta" className={`flex items-center gap-0.5 text-[10px] font-semibold shrink-0 pointer-events-auto transition-all duration-200 cursor-pointer ${likedSet.has(2)?"text-rose/90 scale-110":"text-white/55 hover:text-rose/70"}`}>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span className="tabular-nums">{galleryLikes[2]}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="relative group sm:col-span-2">
              <div className="img-zoom shadow-md aspect-[2/1]">
                <Image src="/images/food2.jpg" alt="Masă sănătoasă completă din planul alimentar" width={700} height={350} className="w-full h-full object-cover" sizes="(max-width: 640px) 100vw, 55vw"/>
              </div>
              <div className="absolute inset-0 bg-transparent group-hover:bg-brand/5 transition-colors duration-400 rounded-xl pointer-events-none"/>
              {trendingRecipeIdx===3 && <div className="absolute top-3 right-3 pointer-events-none a-fade" aria-hidden="true"><span className="flex items-center gap-0.5 bg-rose/90 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">🔥 trending</span></div>}
              <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 max-w-[220px]">
                <span className="bg-wa/85 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full tracking-wide">Masă principală</span>
                <span className="bg-fg/70 backdrop-blur-sm text-white/80 text-[8px] px-2 py-0.5 rounded-full">~450 kcal</span>
                <span className="bg-olive/80 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-0.5 rounded-full">↑ Proteic</span>
                <span className="bg-brand/80 backdrop-blur-sm text-white text-[8px] px-2 py-0.5 rounded-full">~35g proteină</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 rounded-b-xl pointer-events-none">
                <div className="bg-gradient-to-t from-fg/70 via-fg/15 to-transparent p-3 pt-8 flex items-end justify-between">
                  <p className="text-white text-[12px] font-semibold">Masă completă — plan alimentar personalizat</p>
                  {/* Change 122: interactive heart */}
                  <button type="button" onClick={()=>toggleLike(3)} aria-label="Apreciez rețeta" className={`flex items-center gap-0.5 text-[10px] font-semibold shrink-0 pointer-events-auto transition-all duration-200 cursor-pointer ${likedSet.has(3)?"text-rose/90 scale-110":"text-white/55 hover:text-rose/70"}`}>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span className="tabular-nums">{galleryLikes[3]}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Gallery CTA */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 sm:mt-8 ${v?"a-up d3":""}`}>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-bold text-fg-2 bg-surface border-2 border-line hover:border-brand/25 hover:bg-brand-subtle/20 px-7 py-3 rounded-full transition-all group">
            <IgIco c="w-4 h-4 text-[#E1306C] group-hover:scale-110 transition-transform"/>
            <span className="tabular-nums">{recipeCount}+</span> rețete pe Instagram
            <Arrow/>
          </a>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau să primesc rețetele săptămânale din program. 🥗🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"gallery_cta"})} className="inline-flex items-center gap-2 text-[13px] font-semibold text-wa border-2 border-wa/25 hover:border-wa/50 bg-wa/5 hover:bg-wa/10 px-6 py-3 rounded-full transition-all">
            <WaIco c="w-4 h-4"/> Primește rețete noi
          </a>
        </div>
        {/* Change 143: weekly recipes saved micro-stat */}
        <div className={`flex items-center justify-center gap-1.5 mt-3 ${v?"a-up d4":""}`}>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/55 bg-brand/5 border border-brand/10 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-brand/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
            <span className="tabular-nums font-bold text-brand/70">{gallerySavedWeek}</span> rețete salvate săptămâna aceasta
          </span>
        </div>
      </div>
    </section>
  );
}

/* With vs Without comparison */
function Comparison() {
  const {ref,v}=useVisible();
  const [choseToday,setChoseToday] = useState(()=>Math.floor(Math.random()*8)+14);
  const [vsCount,setVsCount] = useState(()=>136+Math.floor(Math.random()*5));
  /* Change 144: program success rate */
  const [successRate]=useState(()=>92+Math.floor(Math.random()*4));
  const [vsMonthlyGrowth,setVsMonthlyGrowth]=useState(()=>10+Math.floor(Math.random()*5));
  /* Change 166: new clients this week */
  const [newClientsWeek]=useState(()=>Math.floor(Math.random()*4)+5);
  /* Change 181: comparisons viewed today */
  const [compareViewsToday,setCompareViewsToday]=useState(()=>Math.floor(Math.random()*18)+42);
  useEffect(()=>{
    const iv1=setInterval(()=>setChoseToday(n=>Math.random()>.6?n+1:n),33000);
    const iv2=setInterval(()=>setVsCount(n=>Math.random()>.75?n+1:n),37000);
    const iv3=setInterval(()=>setVsMonthlyGrowth(n=>Math.max(8,Math.min(18,n+(Math.random()>.5?1:0)))),60000);
    const iv4=setInterval(()=>setCompareViewsToday(n=>Math.random()>.65?n+1:n),30000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);};
  },[]);
  const ctaQuotes=[
    {q:"cea mai bună decizie pe care am luat-o la 40 de ani",kg:"-18.3 kg",name:"Clientă Maraton"},
    {q:"Am învățat că mâncarea e cel mai bun medicament",kg:"-12 kg",name:"Participantă Ed. 1"},
    {q:"Grupul de WhatsApp e ca o familie — susținere zi de zi",kg:"-7 kg",name:"Membră comunitate"},
  ];
  const [cqi,setCqi]=useState(0);
  const [cqfade,setCqfade]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setCqfade(false);
      setTimeout(()=>{setCqi(i=>(i+1)%ctaQuotes.length);setCqfade(true);},280);
    },4200);
    return()=>clearInterval(iv);
  },[]);
  const without = [
    "Diete restrictive care nu durează",
    "Efect yo-yo — slăbești și te îngrași",
    "Suplimente scumpe fără rezultat",
    "Lipsă de motivație, te oprești rapid",
    "Nu știi ce să mănânci de fapt",
    "Te simți singură în proces",
  ];
  const withD = [
    {t:"Plan alimentar personalizat, mâncare reală",ico:"📋"},
    {t:"Rezultate durabile, fără efect yo-yo",ico:"📈"},
    {t:"Zero suplimente — doar mâncare gustoasă",ico:"🌿"},
    {t:"Motivare zilnică din comunitate + Dumitrița",ico:"💪"},
    {t:"Rețete noi în fiecare săptămână",ico:"🍽️"},
    {t:`${vsCount}+ femei care te susțin zilnic`,ico:"👥"},
  ];
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative overflow-hidden" aria-label="Comparație">
      {/* Subtle split background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-rose-subtle/20 to-transparent"/>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-olive-subtle/30 to-transparent"/>
      </div>
      <div className={`max-w-[860px] mx-auto relative ${v?"":"opacity-0"}`}>
        <div className="text-center mb-10 sm:mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>De ce e diferit<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2.25rem] font-normal ${v?"a-up d1":""}`}>Cu sau fără Dumitrița?</h2>
          <p className={`text-fg-4 text-sm mt-2 mb-2 ${v?"a-up d2":""}`}>Alege înțelept prima dată.</p>
        </div>
        <div className={`relative grid sm:grid-cols-2 gap-5 sm:gap-6 mb-10 ${v?"a-up d3":""}`}>
          {/* VS divider badge — desktop only */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-surface border-2 border-brand/25 shadow-lg shadow-brand/10 items-center justify-center group/vs cursor-default">
            <div className="absolute inset-0 rounded-full bg-brand/5 blur-sm pointer-events-none group-hover/vs:bg-brand/10 transition-colors"/>
            <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover/vs:border-brand/20 transition-colors"/>
            <span className="relative text-[9px] font-black text-brand tracking-tight group-hover/vs:text-brand-hover transition-colors">VS</span>
            {/* Hover tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/vs:opacity-100 translate-y-1 group-hover/vs:translate-y-0 transition-all duration-200 pointer-events-none z-20">
              <div className="bg-fg/90 backdrop-blur-sm text-white text-[8px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg tabular-nums">{vsCount}+ au ales cu Dumitrița</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-fg/90"/>
            </div>
          </div>
          {/* Without — muted, slightly recessed */}
          <div className="bg-surface/50 border border-rose/15 rounded-2xl overflow-hidden opacity-80">
            <div className="bg-rose/[0.04] px-5 py-4 border-b border-rose/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-rose/12 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-rose/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </div>
              <p className="text-[11px] font-bold text-rose/50 uppercase tracking-[0.1em]">Fără ghidare specializată</p>
            </div>
            <div className="p-5 space-y-2.5">
              {without.map((item,i)=>(
                <div key={i} className={`flex items-start gap-3 ${v?"a-up":""}`} style={v?{animationDelay:`${i*50}ms`}:{}}>
                  <div className="w-4 h-4 rounded-full bg-rose/8 flex items-center justify-center shrink-0 mt-0.5 border border-rose/10">
                    <svg className="w-2.5 h-2.5 text-rose/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </div>
                  <span className="text-[13px] text-fg-5/70 leading-snug line-through decoration-rose/20 decoration-1">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* With — warm, energetic */}
          <div className="bg-surface border border-wa/20 rounded-2xl overflow-hidden shadow-xl shadow-wa/[0.10] ring-1 ring-olive/15">
            <div className="bg-gradient-to-r from-olive to-olive/75 px-5 py-4 flex items-center justify-between gap-2.5 relative overflow-hidden">
              <div className="absolute inset-0 noise pointer-events-none"/>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] pointer-events-none"/>
              <div className="relative flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                </div>
                <p className="text-[11px] font-bold text-white uppercase tracking-[0.1em]">Cu Doboș Dumitrița</p>
              </div>
              <div className="relative flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                <div className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full">
                  <span className="text-[9px]" aria-hidden="true">⭐</span>
                  <span className="text-[9px] font-bold text-white/90">5.0</span>
                </div>
                {/* Change 125: chose today badge */}
                <span className="text-[8px] font-bold text-wa/90 bg-wa/20 border border-wa/30 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-wa shrink-0"/>
                  <span className="tabular-nums">{choseToday}</span> azi
                </span>
                {/* Change 144: success rate badge */}
                <span className="text-[8px] font-bold text-white/80 bg-white/15 border border-white/20 px-1.5 py-0.5 rounded-full tabular-nums">{successRate}% succes</span>
              </div>
            </div>
            <div className="p-5 space-y-2">
              {withD.map((item,i)=>(
                <div key={i} className={`flex items-start gap-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-wa/5 transition-colors group/item ${v?"a-up":""}`} style={v?{animationDelay:`${i*55}ms`}:{}}>
                  <div className="w-4 h-4 rounded-full bg-wa/15 group-hover/item:bg-wa/25 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    <svg className="w-2.5 h-2.5 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-[11px] shrink-0 mt-0.5" aria-hidden="true">{item.ico}</span>
                  <span className="text-[13px] text-fg-2 font-medium leading-snug group-hover/item:text-fg transition-colors">{item.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Quick social proof stats between columns */}
        <div className={`grid grid-cols-3 gap-3 mb-8 ${v?"a-up d3":""}`}>
          {[
            {v:"136",l:"membre susținute",ico:"👥",c:"text-wa",top:"via-wa/30",bg:"hover:bg-wa/5",trend:`+${vsMonthlyGrowth} luna aceasta`},
            {v:"-18.3kg",l:"transformare max",ico:"✨",c:"text-brand",top:"via-brand/30",bg:"hover:bg-brand-subtle/30",trend:"documentat IG"},
            {v:"100%",l:"fără suplimente",ico:"🌿",c:"text-olive",top:"via-olive/30",bg:"hover:bg-olive-subtle/30",trend:"natural"},
          ].map((s,i)=>(
            <div key={i} className={`text-center py-3 px-2 rounded-xl bg-surface/60 border border-line-subtle relative overflow-hidden transition-all duration-200 ${s.bg} cursor-default group`}>
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${s.top} to-transparent pointer-events-none`}/>
              <p className="text-[11px] mb-1 group-hover:scale-110 transition-transform duration-200 inline-block" aria-hidden="true">{s.ico}</p>
              <p className={`font-bold text-[15px] ${s.c} leading-none`}>{i===0?<><span className="tabular-nums">{vsCount}</span>+</>:s.v}</p>
              <p className="text-[10px] text-fg-5 mt-1 leading-tight">{s.l}</p>
              <p className={`text-[8px] mt-1 font-semibold ${s.c}/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>↑ {s.trend}</p>
            </div>
          ))}
        </div>
        {/* Bottom CTA */}
        <div className={`text-center ${v?"a-up d4":""}`}>
          {/* Rotating mini testimonial */}
          <div className="inline-flex items-center gap-2.5 bg-brand-subtle/40 border border-brand/12 rounded-2xl px-4 py-2.5 mb-5 max-w-sm" aria-live="polite" aria-atomic="true">
            <div className="flex gap-0.5 shrink-0">
              {[0,1,2,3,4].map(j=><svg key={j} className="w-2.5 h-2.5 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            </div>
            <span className={`flex-1 text-left transition-opacity duration-280 ${cqfade?"opacity-100":"opacity-0"}`}>
              <span className="text-[11px] text-fg-3 f-serif italic">&ldquo;{ctaQuotes[cqi].q}&rdquo;</span>
              <span className="ml-1.5 text-[9px] font-bold text-brand/60 bg-brand/8 border border-brand/12 px-1.5 py-0.5 rounded-full">{ctaQuotes[cqi].kg}</span>
            </span>
          </div>
          <p className="text-[13px] text-fg-4 mb-3 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-fg/15"/>
            Alegerea e simplă — hai să o facem împreună.
            <span className="w-8 h-px bg-fg/15"/>
          </p>
          {/* Change 166: new clients this week indicator */}
          <div className="flex items-center justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-wa/55 bg-wa/6 border border-wa/12 px-3 py-1 rounded-full">
              <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa/70"/></span>
              <span className="tabular-nums font-bold text-wa/70">{newClientsWeek}</span> clienți noi această săptămână
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-2 sm:items-start">
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau să discutăm despre un plan personalizat. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"comparison_cta"})} className="inline-flex items-center gap-2.5 bg-wa hover:bg-wa-hover text-white font-bold text-[14px] px-10 py-4 rounded-full transition-all shadow-lg shadow-wa/15 hover:shadow-xl hover:shadow-wa/25 hover:scale-[1.02]">
                <WaIco c="w-5 h-5"/> Consultație gratuită pe WhatsApp
              </a>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-fg-5/50">
                <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-60"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/></span>
                <span className="tabular-nums font-semibold text-wa/70">{choseToday}</span> au ales astăzi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-wa/20 shrink-0">
                <Image src="/images/profile.jpg" alt="" width={28} height={28} className="w-full h-full object-cover"/>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-fg-3">Doboș Dumitrița</p>
                <p className="text-[10px] text-fg-5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-wa"/>
                  Răspunde în 24h · Gratuit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Packages/Services section */
function Packages() {
  const {ref,v} = useVisible();
  const [pkgFill,setPkgFill]=useState(0);
  const [pkgSpots,setPkgSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  const [consultToday,setConsultToday] = useState(()=>Math.floor(Math.random()*5)+8);
  useEffect(()=>{const iv=setInterval(()=>setConsultToday(n=>Math.random()>.65?n+1:n),28000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setPkgInquiriesWeek(n=>Math.random()>.7?n+1:n),45000);return()=>clearInterval(iv);},[]);
  /* Change 147: consultations this month */
  const [consultMonth]=useState(()=>Math.floor(Math.random()*20)+130);
  /* Change 180: inquiries this week */
  const [pkgInquiriesWeek,setPkgInquiriesWeek]=useState(()=>Math.floor(Math.random()*15)+38);

  /* Change 161: program satisfaction rate */
  const [pkgSatisfactionRate]=useState(()=>96+Math.floor(Math.random()*3));
  useEffect(()=>{const iv=setInterval(()=>setPkgSpots(n=>Math.max(2,Math.random()>.85?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  const [maratonViewers,setMaratonViewers]=useState(()=>Math.floor(Math.random()*9)+14);
  const [pkgMembers,setPkgMembers]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{if(v){const t=setTimeout(()=>setPkgFill(78),800);return()=>clearTimeout(t)}},[v]);
  useEffect(()=>{const iv=setInterval(()=>setMaratonViewers(n=>Math.max(12,Math.min(28,n+(Math.random()>.5?Math.ceil(Math.random()*2):-Math.ceil(Math.random()*2))))),13000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setPkgMembers(n=>Math.random()>.72?n+1:n),42000);return()=>clearInterval(iv);},[]);
  const enrollTimes = ["acum 1h","acum 3h","acum 6h","ieri","acum 12h"];
  const [enrollIdx,setEnrollIdx] = useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>{if(Math.random()>.55) setEnrollIdx(i=>(i+1)%enrollTimes.length)},20000);return()=>clearInterval(iv);},[]);
  /* Change 113: rotating enrolled name for Maraton card header */
  const enrollNames=[{n:"Valentina",c:"Cluj"},{n:"Daniela",c:"Chișinău"},{n:"Mihaela",c:"Timișoara"},{n:"Simona",c:"Bălți"},{n:"Roxana",c:"București"},{n:"Ana",c:"Iași"}];
  const [enrollNameIdx,setEnrollNameIdx]=useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setEnrollNameIdx(i=>(i+1)%enrollNames.length),14000);return()=>clearInterval(iv);},[]);
  /* Change 117: joined today */
  const [maratonJoinedToday,setMaratonJoinedToday]=useState(()=>Math.floor(Math.random()*3)+2);
  useEffect(()=>{const iv=setInterval(()=>setMaratonJoinedToday(n=>Math.random()>.8?n+1:n),75000);return()=>clearInterval(iv);},[]);
  const [pkgQuizPct,setPkgQuizPct]=useState(()=>65+Math.floor(Math.random()*7));
  useEffect(()=>{const iv=setInterval(()=>setPkgQuizPct(n=>Math.max(63,Math.min(74,n+(Math.random()>.5?1:-1)))),48000);return()=>clearInterval(iv);},[]);
  const [planViewers,setPlanViewers]=useState(()=>Math.floor(Math.random()*8)+7);
  useEffect(()=>{const iv=setInterval(()=>setPlanViewers(n=>Math.max(5,Math.min(20,n+(Math.random()>.5?1:-1)))),17000);return()=>clearInterval(iv);},[]);
  const packages = [
    {
      name:"Consultație",
      desc:"Discuție 1:1 pe WhatsApp",
      price:"Gratuit",
      badge:"",
      highlight:false,
      features:["Evaluare inițială","Recomandări generale","Răspuns în 24h","Fără obligații"],
      cta:"Programează acum",
      href:`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau o consultație gratuită. 🙏")}`,
    },
    {
      name:"Plan Alimentar",
      desc:"Personalizat pe nevoile tale",
      price:"Personalizat",
      badge:"Recomandat",
      highlight:false,
      features:["Plan adaptat greutății tale","Lista de cumpărături","Rețete incluse","Suport pe WhatsApp","Ajustări la nevoie"],
      cta:"Cere detalii",
      href:`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau detalii despre planul alimentar personalizat. 🙏")}`,
    },
    {
      name:"Maratonul de Slăbit",
      desc:"Program complet de transformare",
      price:"€25",
      oldPrice:"€49",
      badge:"",
      highlight:true,
      features:["Tot ce include Planul Alimentar",`Grup WhatsApp dedicat (${pkgMembers}+ membre)`,"Rețete noi săptămânal","Suport zilnic și motivare","Ghidare nutrițională continuă","Comunitate de susținere"],
      bonus:"🎁 Bonus la înscriere",
      bonusDetail:"Ghid Starter: primele 7 zile",
      bonusTag:"GRATUIT",
      cta:"Înscrie-te acum",
      href:"https://checkout.revolut.com/pay/0ee3647c-b3c1-427d-8020-e5cfd0f3d03c",
    },
  ];
  return (
    <section id="packages" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 relative overflow-hidden scroll-mt-20" aria-label="Servicii și pachete">
      <div className="absolute inset-0 dot-pattern opacity-[0.06] pointer-events-none"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-10 sm:mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>Servicii<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2.25rem] font-normal mb-3 ${v?"a-up d1":""}`}>Alege ce ți se potrivește</h2>
          <p className={`text-fg-4 text-sm max-w-md mx-auto mb-3 ${v?"a-up d2":""}`}>Toate pachetele includ consultație gratuită pe WhatsApp. Discutăm și găsim varianta potrivită.</p>
          <div className={`flex items-center justify-center gap-4 text-[11px] text-fg-5 ${v?"a-up d2":""}`}>
            <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Zero contracte</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
            <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Prețuri transparente</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
            <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Personalizat</span>
          </div>
          <div className={`flex items-center justify-center gap-3 mt-3 text-[9px] text-fg-5/40 ${v?"a-up d2":""}`}>
            <span className="flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-gold/50" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span className="tabular-nums font-semibold text-gold/65">{pkgSatisfactionRate}%</span> satisfacție
            </span>
          </div>
        </div>
        <div className={`grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto items-start ${v?"a-up d3":""}`}>
          {packages.map((p,i)=>(
            <div key={i} className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${p.highlight?"shadow-2xl shadow-brand/15 scale-[1.02] sm:scale-[1.04] ring-1 ring-brand/20":"shadow-sm card-hover"}`}>
              {p.highlight ? (
                /* Featured package — rich gradient header */
                <>
                  <div className="bg-gradient-to-br from-brand via-accent to-[#8A4420] p-6 pb-5 relative overflow-hidden">
                    <div className="absolute inset-0 noise"/>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"/>
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-[0.15em] text-white/70 bg-white/10 px-2.5 py-1 rounded-full">Cel mai popular</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] text-wa/80 bg-wa/15 px-2 py-1 rounded-full border border-wa/20">
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-60"/>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/>
                          </span>
                          Ediția 2
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-0.5">{p.name}</h3>
                      <p className="text-white/60 text-xs">{p.desc}</p>
                      <div className="flex items-center gap-2.5 mt-3 text-[9px] text-white/35">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-wa/50 shrink-0"/>
                          <span className="tabular-nums font-semibold text-white/50">{maratonViewers}</span> văd acum
                        </span>
                        <span className="w-px h-2.5 bg-white/10"/>
                        <span className="flex items-center gap-1">
                          <span className="tabular-nums font-semibold text-white/45">+{maratonJoinedToday}</span> azi
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface border border-brand/15 border-t-0 p-5 sm:p-6 rounded-b-2xl">
                    <div className="space-y-2.5 mb-4">
                      {p.features.map(f=>(
                        <div key={f} className="flex items-start gap-2 text-[13px]">
                          <svg className="w-4 h-4 text-wa shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                          <span className="text-fg-2 font-medium">{f}</span>
                        </div>
                      ))}
                    </div>
                    {/* Bonus pill */}
                    <div className="flex items-center gap-2 bg-gold-subtle/50 border border-gold/20 rounded-xl px-3 py-2 mb-4 relative overflow-hidden group/bonus hover:border-gold/35 transition-colors">
                      <div className="badge-shimmer absolute inset-0 pointer-events-none opacity-0 group-hover/bonus:opacity-100 transition-opacity"/>
                      <span className="text-base shrink-0 group-hover/bonus:scale-110 transition-transform inline-block">🎁</span>
                      <div>
                        <p className="text-[9px] font-black text-gold/70 uppercase tracking-widest leading-none mb-0.5">Bonus la înscriere</p>
                        <p className="text-[11px] font-semibold text-fg-2">Ghid Starter: primele 7 zile</p>
                      </div>
                      <span className="ml-auto text-[8px] font-bold text-gold/60 bg-gold/8 border border-gold/15 px-1.5 py-0.5 rounded-full shrink-0">GRATUIT</span>
                    </div>
                    <a href={p.href} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:`package_${p.name.toLowerCase().replace(/\s+/g,"_")}`})} className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 text-sm font-bold bg-wa hover:bg-wa-hover text-white shadow-md transition-all a-glow">
                      <WaIco c="w-4 h-4"/>{p.cta}
                    </a>
                    <div className="mt-3 space-y-1.5">
                      <p className="text-center text-[10px] text-fg-5 flex items-center justify-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/>
                        </span>
                        <span className="text-rose font-semibold tabular-nums">{pkgSpots} locuri rămase</span>
                        <span className="text-fg-5">· Ediția 2</span>
                      </p>
                      <div className="mx-1 h-1 bg-line rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose to-rose/60 rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{width:`${pkgFill}%`}}/>
                      </div>
                      {pkgFill > 0 && <p className="text-center text-[9px] text-fg-5/40 flex items-center justify-center gap-1 mt-0.5">
                        <span className="w-1 h-1 rounded-full bg-wa/40 shrink-0"/>
                        Ultima înscriere: {enrollTimes[enrollIdx]}
                      </p>}
                    </div>
                  </div>
                </>
              ) : (
                /* Regular package — structured with header */
                <div className={`bg-surface border rounded-2xl overflow-hidden h-full flex flex-col group/card hover:shadow-md transition-all duration-300 ${p.badge?"border-olive/25 hover:border-olive/40 shadow-sm shadow-olive/5":"border-line hover:border-brand/20"}`}>
                  {/* Mini header */}
                  <div className="bg-surface-raised border-b border-line-subtle px-5 py-4 group-hover/card:bg-brand-subtle/20 transition-colors duration-300">
                    <div className={`h-[2px] bg-gradient-to-r from-transparent ${p.price==="Gratuit"?"via-wa/50":"via-brand/50"} to-transparent rounded-full mb-4`}/>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-[15px] text-fg-2 mb-0.5">{p.name}</h3>
                        <p className="text-[11px] text-fg-4">{p.desc}</p>
                      </div>
                      {p.badge && <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-gradient-to-r from-olive-subtle to-olive/10 text-olive border border-olive/25 mt-0.5 flex items-center gap-0.5 shadow-sm">
                        <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        {p.badge}
                      </span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {p.oldPrice && <span className="text-[11px] text-fg-5 line-through mr-1">{p.oldPrice}</span>}
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${p.price==="Gratuit"?"bg-wa/10 text-wa border border-wa/15":"bg-brand-subtle text-brand border border-brand/15"}`}>{p.price}</span>
                      {p.oldPrice && <span className="text-[8px] font-bold text-white bg-rose/80 px-1.5 py-0.5 rounded-full">-49%</span>}
                      {p.price==="Gratuit" && <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-wa/70 bg-wa/5 border border-wa/10 px-2 py-0.5 rounded-full">Disponibil imediat</span>}
                      {p.badge==="Recomandat" && <span className="inline-flex items-center gap-1 text-[9px] font-medium text-brand/60 bg-surface border border-line-subtle px-2 py-0.5 rounded-full"><span className="w-1 h-1 rounded-full bg-brand/40 shrink-0"/><span className="tabular-nums font-semibold">{planViewers}</span> văd acum</span>}
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-5 sm:p-5 flex-1 flex flex-col">
                    <p className="text-[9px] font-bold text-fg-5 uppercase tracking-[0.1em] mb-2.5">Ce include</p>
                    <div className="space-y-2.5 mb-6 flex-1">
                      {p.features.map(f=>(
                        <div key={f} className="flex items-start gap-2 text-[13px]">
                          <Check/>
                          <span className="text-fg-3">{f}</span>
                        </div>
                      ))}
                    </div>
                    {p.bonus && (
                      <div className="flex items-center gap-2 bg-brand-subtle/40 border border-brand/15 rounded-xl px-3 py-2 mb-3">
                        <span className="text-[10px]">{p.bonus.slice(0,2)}</span>
                        <span className="text-[10px] font-semibold text-brand/80">{p.bonusDetail}</span>
                        <span className="text-[8px] font-bold text-white bg-wa/80 px-1.5 py-0.5 rounded-full ml-auto shrink-0">{p.bonusTag}</span>
                      </div>
                    )}
                    {p.badge==="Recomandat" && (
                      <div className="flex items-center gap-1.5 bg-olive-subtle/60 border border-olive/15 rounded-xl px-3 py-2 mb-3">
                        <span className="text-[10px]" aria-hidden="true">📊</span>
                        <span className="text-[10px] font-semibold text-olive/80">Ales de <span className="tabular-nums">{pkgQuizPct}</span>% din utilizatorii quiz-ului</span>
                      </div>
                    )}
                    {/* Change 135: first results timing */}
                    {p.badge==="Recomandat" && (
                      <div className="flex items-center gap-1.5 bg-wa/5 border border-wa/12 rounded-xl px-3 py-2 mb-3">
                        <span className="text-[10px]" aria-hidden="true">⏱️</span>
                        <span className="text-[10px] font-semibold text-wa/70">Primele rezultate vizibile: <span className="font-bold text-wa/85">~3 săptămâni</span></span>
                      </div>
                    )}
                    <a href={p.href} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent(p.oldPrice?"revolut_click":"wa_click",{source:`package_${p.name.toLowerCase().replace(/\s+/g,"_")}`})} className={`w-full py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${p.oldPrice?"bg-brand hover:bg-brand/90 text-white shadow-md hover:shadow-lg hover:scale-[1.01]":(p.badge||p.price==="Gratuit")?"bg-wa hover:bg-wa-hover text-white shadow-sm hover:shadow-md":"bg-surface hover:bg-brand-subtle/40 text-fg-2 border-2 border-line hover:border-brand/25"}`}>
                      {p.oldPrice ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>{p.cta} — {p.price}</> : (p.badge||p.price==="Gratuit") ? <><WaIco c="w-4 h-4"/>{p.cta}</> : <>{p.cta}<Arrow/></>}
                    </a>
                    {p.oldPrice && <p className="text-center text-[9px] text-fg-5/50 mt-1.5 flex items-center justify-center gap-1.5"><span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/></span><span className="text-rose font-semibold">4 locuri rămase</span><span>· Ediția 2</span></p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-fg-5 text-center mt-5 flex items-center justify-center gap-1.5"><WaIco c="w-3 h-3 text-wa/40"/>Prețurile sunt discutate individual pe WhatsApp, în funcție de nevoile tale specifice.</p>
        {/* Change 147: consultations this month micro-stat */}
        <div className="flex items-center justify-center mt-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/50 bg-brand/4 border border-brand/8 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-brand/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span className="tabular-nums font-bold text-brand/65">{consultMonth}</span> consultații acordate luna aceasta
          </span>
        </div>
      </div>
    </section>
  );
}

/* Instagram preview section */
function InstagramPreview() {
  const {ref,v} = useVisible();
  const lastPostTimes = ["acum 2h","acum 6h","ieri","acum 2 zile","acum 3h"];
  const [lastPostIdx,setLastPostIdx] = useState(()=>Math.floor(Math.random()*5));
  const [igViewers,setIgViewers]=useState(()=>Math.floor(Math.random()*30)+42);
  const [igFollowerCount,setIgFollowerCount]=useState(()=>16700+Math.floor(Math.random()*60));
  useEffect(()=>{
    const iv1=setInterval(()=>{setIgViewers(n=>Math.max(35,Math.min(90,n+(Math.random()>.5?Math.floor(Math.random()*3)+1:-Math.floor(Math.random()*2)-1))))},11000);
    const iv2=setInterval(()=>setIgFollowerCount(n=>Math.random()>.8?n+1:n),38000);
    const iv3=setInterval(()=>setLastPostIdx(i=>(i+1)%lastPostTimes.length),46000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);};
  },[]);
  const [postLikes,setPostLikes]=useState([247,892,156,534,189,321]);
  const [postComments,setPostComments]=useState(()=>[18,61,9,43,11,24].map(n=>n+Math.floor(Math.random()*3)));
  const [igPostCount,setIgPostCount]=useState(()=>108+Math.floor(Math.random()*3));
  const [igMemberCount,setIgMemberCount]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{
    const iv=setInterval(()=>{
      setPostLikes(prev=>{
        const next=[...prev];
        const idx=Math.floor(Math.random()*6);
        if(Math.random()>.6) next[idx]=next[idx]+1;
        return next;
      });
    },16000);
    return()=>clearInterval(iv);
  },[]);
  useEffect(()=>{const iv=setInterval(()=>{setPostComments(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*6);if(Math.random()>.75) next[idx]++;return next;});},28000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setIgPostCount(n=>Math.random()>.85?n+1:n),55000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setIgMemberCount(n=>Math.random()>.72?n+1:n),38000);return()=>clearInterval(iv);},[]);
  /* Change 119: saves today counter */
  const [igSavesToday,setIgSavesToday]=useState(()=>Math.floor(Math.random()*12)+18);
  /* Change 172: engagement rate */
  const [igEngagementRate]=useState(()=>parseFloat((4.2+Math.random()*1.8).toFixed(1)));
  /* Change 156: stories viewed today */
  const [igStoriesToday,setIgStoriesToday]=useState(()=>Math.floor(Math.random()*200)+480);
  useEffect(()=>{const iv=setInterval(()=>setIgStoriesToday(n=>Math.random()>.55?n+Math.floor(Math.random()*3)+1:n),18000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setIgSavesToday(n=>Math.random()>.55?n+1:n),22000);return()=>clearInterval(iv);},[]);
  /* Change 106: rotating new follower notification */
  const igNewFollowers=[
    {n:"Georgiana",c:"Brașov",t:"acum 4 min"},{n:"Mirela",c:"Chișinău",t:"acum 9 min"},
    {n:"Sorina",c:"Timișoara",t:"acum 16 min"},{n:"Bianca",c:"București",t:"acum 22 min"},
    {n:"Nadia",c:"Bălți",t:"acum 28 min"},{n:"Larisa",c:"Cluj",t:"acum 31 min"},
  ];
  const [igFollowerIdx,setIgFollowerIdx]=useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setIgFollowerIdx(i=>(i+1)%igNewFollowers.length),10000);return()=>clearInterval(iv);},[]);
  const postsMeta = [
    {img:"/images/pinned1.jpg",caption:"Aperitive sănătoase din Maraton",isNew:false},
    {img:"/images/result-client-1.jpg",caption:"Transformare documentată",isNew:false},
    {img:"/images/pinned2.jpg",caption:"Rețetă nouă de weekend",isNew:true},
    {img:"/images/result-client-3.jpg",caption:"Rezultat după 8 săptămâni",isNew:false},
    {img:"/images/food1.jpg",caption:"Maraton de Slăbit · Ediția 1",isNew:true},
    {img:"/images/img-telegram-2.jpg",caption:"Transformare reală · comunitate",isNew:false},
  ];
  const posts = postsMeta.map((p,i)=>({...p,likes:String(postLikes[i]),comments:String(postComments[i])}));
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 bg-surface-raised relative overflow-hidden" aria-label="Instagram">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        {/* IG Profile mini-header */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-5 mb-8 sm:mb-10 p-4 sm:p-5 bg-surface border border-line rounded-2xl shadow-sm ${v?"a-up":""}`}>
          <div className="flex items-center gap-4">
            {/* IG gradient ring */}
            <div className="flex flex-col items-center gap-1">
              <div className="ig-ring p-0.5 rounded-full">
                <div className="p-0.5 bg-surface rounded-full">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <Image src="/images/profile.jpg" alt="dobos_dumitrita" width={56} height={56} className="w-full h-full object-cover"/>
                  </div>
                </div>
              </div>
              {/* Story highlight circles */}
              <div className="flex items-center gap-1.5 mt-0.5">
                {[{ico:"🏅",label:"Studii"},{ico:"🥗",label:"Rețete"},{ico:"✨",label:"Result."},{ico:"💬",label:"Tips"}].map((h,i)=>(
                  <div key={i} className="flex flex-col items-center gap-0.5 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full ig-ring p-[1.5px] group-hover:scale-110 transition-transform duration-200">
                      <div className="w-full h-full rounded-full bg-surface-raised flex items-center justify-center">
                        <span className="text-[11px]" aria-hidden="true">{h.ico}</span>
                      </div>
                    </div>
                    <span className="text-[7px] text-fg-5 leading-none">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="font-bold text-[15px]">dobos_dumitrita</p>
                <svg className="w-4 h-4 text-[#3897F0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.7 14.5L6 12.2l1.4-1.4 2.9 2.9 6.3-6.3 1.4 1.4-7.7 7.7z"/></svg>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-fg-3">
                <span><strong className="text-fg tabular-nums">{(igFollowerCount/1000).toFixed(1)}K</strong> urmăritori</span>
                <span><strong className="text-fg tabular-nums">{igPostCount}+</strong> postări</span>
                <span className="hidden sm:inline"><strong className="text-fg tabular-nums">{igMemberCount}+</strong> membre</span>
              </div>
              <p className="text-[11px] text-fg-4 mt-0.5 flex items-center gap-2 flex-wrap">
                Nutriție · Rețete · Transformări
                <span className="text-[10px] font-bold text-olive bg-olive-subtle border border-olive/15 px-2 py-0.5 rounded-full">↑ 5% / lună</span>
                <span className="text-[9px] font-medium text-fg-5/60 bg-surface border border-line-subtle px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#E1306C]/60"/>
                  Ultima postare: {lastPostTimes[lastPostIdx]}
                </span>
                <span className="text-[9px] font-medium text-fg-5/60 bg-surface border border-line-subtle px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-olive/60"/>
                  <span className="tabular-nums font-semibold text-olive/70">{igViewers}</span> văd acum
                </span>
                <span className="text-[9px] font-medium text-[#E1306C]/60 bg-[#E1306C]/5 border border-[#E1306C]/12 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ❤️ <span className="tabular-nums font-semibold">{postLikes.reduce((a,b)=>a+b,0).toLocaleString("ro-RO")}</span> aprecieri
                </span>
                {/* Change 119: saves today */}
                <span className="text-[9px] font-medium text-brand/55 bg-brand-subtle/60 border border-brand/12 px-2 py-0.5 rounded-full flex items-center gap-1">
                  🔖 <span className="tabular-nums font-semibold text-brand/70">{igSavesToday}</span> save-uri azi
                </span>
              </p>
            </div>
          </div>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="ig-btn shrink-0 text-[12px] font-bold text-white px-5 py-2 rounded-full transition-all hover:opacity-90">
            Urmărește
          </a>
        </div>

        {/* Change 106: rotating new follower notification */}
        <div className="flex items-center gap-1.5 mb-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-[#E1306C]/40 shrink-0"/>
          <span className="text-[9px] text-fg-5/35 font-medium"><span className="font-semibold text-[#E1306C]/50">{igNewFollowers[igFollowerIdx].n}</span>{" "}din {igNewFollowers[igFollowerIdx].c} a urmărit pagina · <span className="text-fg-5/25">{igNewFollowers[igFollowerIdx].t}</span></span>
        </div>
        {/* Change 142: most liked post */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1 h-1 rounded-full bg-[#E1306C]/30 shrink-0"/>
          <span className="text-[9px] text-fg-5/30 font-medium">Cea mai apreciată postare: <span className="tabular-nums font-semibold text-[#E1306C]/45">{Math.max(...postLikes)}</span> ❤️ această săptămână</span>
        </div>
        {/* Change 156: stories viewed today */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-1 h-1 rounded-full bg-[#E1306C]/25 shrink-0"/>
          <span className="text-[9px] text-fg-5/25 font-medium">Stories vizualizate azi: <span className="tabular-nums font-semibold text-[#E1306C]/40">{igStoriesToday.toLocaleString("ro-RO")}</span> persoane</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {posts.map((p,i)=>(
            <a key={i} href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className={`relative group aspect-square overflow-hidden rounded-xl ${v?"a-up":"opacity-0"}`} style={v?{animationDelay:`${i*65}ms`}:{}} aria-label={p.caption}>
              <Image src={p.img} alt={p.caption} width={200} height={200} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 33vw, 16vw" loading="lazy"/>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-fg/0 group-hover:bg-fg/50 transition-all duration-300"/>
              {/* Slide-up caption on hover */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                <div className="bg-gradient-to-t from-fg/80 via-fg/40 to-transparent p-2 pt-5">
                  <p className="text-white text-[9px] sm:text-[10px] font-semibold leading-tight">{p.caption}</p>
                </div>
              </div>
              {/* Always-visible like count */}
              <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-fg/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {p.likes}
              </div>
              {/* Comment count — appears on hover bottom-left */}
              <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-0.5 bg-fg/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                {p.comments}
              </div>
              {/* Save icon on hover */}
              <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-fg/50 backdrop-blur-sm p-1 rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
              </div>
              {/* New badge */}
              {p.isNew && <div className="absolute top-1.5 left-1.5 bg-olive/90 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full tracking-wide">NOU</div>}
              {/* Top post badge — for highest engagement */}
              {parseInt(p.likes)>=800 && !p.isNew && <div className="absolute top-1.5 left-1.5 bg-rose/85 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full tracking-wide flex items-center gap-0.5"><span>🔥</span>Top</div>}
            </a>
          ))}
        </div>
        <div className="text-center mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-fg-2 border-2 border-line hover:border-brand/30 px-6 py-2.5 rounded-full transition-all group">
            <IgIco c="w-4 h-4 group-hover:text-[#E1306C] transition-colors"/>
            Vezi toate postările
            <Arrow/>
          </a>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Am văzut postările de pe Instagram și vreau să discutăm. 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"instagram_cta"})} className="inline-flex items-center gap-2 text-sm font-semibold text-wa border-2 border-wa/25 hover:border-wa/50 bg-wa/5 hover:bg-wa/10 px-6 py-2.5 rounded-full transition-all">
            <WaIco c="w-4 h-4"/> Hai să discutăm
          </a>
        </div>
      </div>
    </section>
  );
}

/* FAQ with 6 items + centered + card style */
function FAQ() {
  const {ref,v} = useVisible();
  const [open,setOpen] = useState<number|null>(null);
  const [faqReaderCounts,setFaqReaderCounts] = useState(()=>faqs.map(()=>Math.floor(Math.random()*8)+3));
  const [faqViews,setFaqViews]=useState(()=>5400+Math.floor(Math.random()*80));
  const [faqItemViews,setFaqItemViews]=useState(()=>[1200,847,1100,934,621,743].map(n=>n+Math.floor(Math.random()*15)));
  useEffect(()=>{const iv=setInterval(()=>setFaqViews(n=>Math.random()>.6?n+1:n),18000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setFaqReaderCounts(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*faqs.length);next[idx]=Math.max(1,next[idx]+(Math.random()>.45?1:-1));return next;}),10000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>{setFaqItemViews(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*faqs.length);if(Math.random()>.55) next[idx]++;return next;});},22000);return()=>clearInterval(iv);},[]);
  /* Change 98: helpful votes */
  const [faqHelpful,setFaqHelpful]=useState(()=>faqs.map(()=>Math.floor(Math.random()*15)+8));
  const [faqVoted,setFaqVoted]=useState<boolean[]>(()=>faqs.map(()=>false));
  /* Change 115: questions asked today */
  const [questionsToday,setQuestionsToday]=useState(()=>Math.floor(Math.random()*8)+12);
  /* Change 157: questions answered this month */
  const [faqAnsweredMonth]=useState(()=>Math.floor(Math.random()*50)+180);
  useEffect(()=>{const iv=setInterval(()=>setQuestionsToday(n=>Math.random()>.6?n+1:n),32000);return()=>clearInterval(iv);},[]);
  return (
    <section id="faq" ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden scroll-mt-20" aria-label="Întrebări frecvente">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent"/>
      <div className={`max-w-2xl mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-8 sm:mb-12">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}>
            <span className="w-8 h-px bg-brand"/>Întrebări frecvente
            <span className="text-[9px] font-bold bg-brand-subtle text-brand/70 border border-brand/15 px-1.5 py-0.5 rounded-full">{faqs.length}</span>
            <span className="text-[9px] font-medium text-fg-5/50 bg-surface border border-line-subtle px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              {faqViews>=1000?`${(faqViews/1000).toFixed(1)}k`:faqViews} vizualizări
            </span>
            <span className="w-8 h-px bg-brand"/>
          </div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] font-normal mb-3 ${v?"a-up d1":""}`}>Răspunsuri la întrebările tale</h2>
          <p className={`text-fg-4 text-sm ${v?"a-up d2":""}`}>Nu ai găsit răspunsul? <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"faq"})} className="text-wa font-semibold hover:underline">Scrie-mi pe WhatsApp</a></p>
        </div>
        <div className="space-y-2 mb-8">
          {faqs.map((f,i)=>(
            <div key={i} className={`relative border rounded-2xl transition-all duration-300 overflow-hidden ${v?`a-up d${Math.min(i+2,7)}`:"opacity-0"} ${open===i?"bg-brand-subtle/30 border-brand/20 shadow-md":"bg-surface border-line shadow-sm hover:border-brand/15 hover:shadow-md"}`}>
              {open===i && <div className="faq-open-indicator"/>}
              <button type="button" onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between px-5 py-4 sm:py-[18px] text-left cursor-pointer group" aria-expanded={open===i} aria-controls={`faq-${i}`}>
                <div className="flex items-center gap-3.5 pr-4 flex-1 min-w-0">
                  <span className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 transition-all duration-200 ${open===i?`bg-brand text-white scale-110 shadow-sm shadow-brand/30`:`${["bg-brand/8 text-brand/60","bg-wa/8 text-wa/60","bg-olive/8 text-olive/60","bg-gold/8 text-gold/60","bg-rose/8 text-rose/60","bg-brand/8 text-brand/60"][i%6]} group-hover:scale-110 group-hover:bg-brand/15 group-hover:text-brand`}`}>{i+1}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline border ${f.bc}`}>{f.badge}</span>
                  <span className={`text-[14px] sm:text-[15px] font-semibold leading-snug transition-colors flex-1 min-w-0 ${open===i?"text-brand":"text-fg-2 group-hover:text-brand"}`}>{f.q}</span>
                  {faqItemViews[i]>=1000 && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 text-[8px] font-bold text-rose/70 bg-rose/8 border border-rose/12 px-1.5 py-0.5 rounded-full shrink-0 ml-1">🔥 popular</span>
                  )}
                  <span className="hidden lg:flex items-center gap-0.5 text-[9px] text-fg-5/50 shrink-0 ml-auto mr-2 font-mono tabular-nums">
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span className="tabular-nums">{faqItemViews[i]>=1000?`${(faqItemViews[i]/1000).toFixed(1)}k`:faqItemViews[i]}</span>
                  </span>
                </div>
                <ChevD open={open===i}/>
              </button>
              <div id={`faq-${i}`} role="region" className={`overflow-hidden transition-all duration-300 ${open===i?"max-h-[400px] opacity-100":"max-h-0 opacity-0"}`}>
                <div className="mx-5 mb-5 ml-[58px] pl-3.5 border-l-2 border-brand/20 bg-gradient-to-r from-brand-subtle/20 to-transparent rounded-r-xl py-2 pr-2">
                  <p className="text-[13px] sm:text-[14px] text-fg-3 leading-[1.75]">{f.a}</p>
                  {open===i && <p className="text-[8px] text-fg-5/30 mt-2 flex items-center gap-1 a-fade">
                    <span className="w-1 h-1 rounded-full bg-brand/30 shrink-0"/>
                    <span className="tabular-nums font-semibold text-brand/35">{faqReaderCounts[i]}</span> citesc acum
                  </p>}
                  {/* Change 98: helpful vote */}
                  {open===i && <div className="flex items-center gap-2 mt-2 a-fade">
                    {!faqVoted[i]?(<>
                      <span className="text-[8px] text-fg-5/35">A ajutat?</span>
                      <button type="button" onClick={()=>{setFaqHelpful(p=>{const n=[...p];n[i]++;return n;});setFaqVoted(p=>{const n=[...p];n[i]=true;return n;});}} className="flex items-center gap-1 text-[9px] font-semibold text-wa/55 hover:text-wa bg-wa/8 hover:bg-wa/15 border border-wa/12 px-1.5 py-0.5 rounded-full transition-all cursor-pointer">👍 <span className="tabular-nums">{faqHelpful[i]}</span></button>
                      <button type="button" onClick={()=>{setFaqVoted(p=>{const n=[...p];n[i]=true;return n;});}} className="text-[9px] text-fg-5/25 hover:text-fg-5/45 transition-colors cursor-pointer">👎</button>
                    </>):(
                      <span className="text-[9px] text-wa/55 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                        Mulțumesc! · <span className="tabular-nums">{faqHelpful[i]}</span> au găsit util
                      </span>
                    )}
                  </div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Change 157: questions answered this month */}
        <div className="flex items-center justify-center gap-2 mb-1.5 mt-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-wa/50 bg-wa/5 border border-wa/10 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-wa/45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span className="tabular-nums font-bold text-wa/65">{faqAnsweredMonth}</span> întrebări la care a răspuns luna aceasta
          </span>
        </div>
        {/* Change 175: most viewed FAQ topic */}
        <div className="flex items-center justify-center gap-2 mb-1.5">
          {(() => { const mi = faqItemViews.indexOf(Math.max(...faqItemViews)); return (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-gold/55 bg-gold/5 border border-gold/10 px-3 py-1 rounded-full">
              <svg className="w-2.5 h-2.5 text-gold/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Cel mai citit: <span className={`font-bold ml-0.5 ${faqs[mi].bc.split(" ")[0]}`}>{faqs[mi].badge}</span> · <span className="tabular-nums text-gold/70">{faqItemViews[mi]>=1000?`${(faqItemViews[mi]/1000).toFixed(1)}k`:faqItemViews[mi]}</span> vizualizări
            </span>
          ); })()}
        </div>
        {/* Change 141: total helpful votes aggregate */}
        <div className="flex items-center justify-center gap-2 mb-4 mt-1">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/55 bg-brand/5 border border-brand/10 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-brand/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
            <span className="tabular-nums font-bold text-brand/70">{faqHelpful.reduce((a,b)=>a+b,0)}</span> persoane au găsit răspunsurile utile
          </span>
        </div>
        {/* FAQ bottom CTA */}
        <div className={`bg-surface border border-line-subtle rounded-2xl overflow-hidden shadow-sm ${v?"a-up d7":""}`}>
          <div className="h-[2px] bg-gradient-to-r from-transparent via-wa/40 to-transparent"/>
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-wa/20">
                <Image src="/images/profile.jpg" alt="" width={40} height={40} className="w-full h-full object-cover"/>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-wa rounded-full border-2 border-surface flex items-center justify-center">
                <WaIco c="w-2 h-2 text-white"/>
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-fg-2 mb-1">Ai altă întrebare?</p>
              <p className="text-[11px] text-fg-4">
                {new Date().getHours()>=8&&new Date().getHours()<=22
                  ?"Scrie-mi acum — sunt online și răspund personal."
                  :"Scrie-mi un mesaj — răspund mâine dimineață."}
              </p>
              {/* Change 115: questions asked today */}
              <span className="text-[9px] text-fg-5/35 flex items-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-wa/35 shrink-0"/>
                <span className="tabular-nums font-semibold text-wa/45">{questionsToday}</span> persoane au scris azi
              </span>
            </div>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"faq_bottom"})} className="inline-flex items-center gap-2 bg-wa hover:bg-wa-hover text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md shrink-0">
              <WaIco c="w-4 h-4"/> Trimite o întrebare
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


/* WhatsApp chat preview — shows what the conversation will look like */
function WhatsAppPreview() {
  const {ref,v} = useVisible();
  const [waConvsToday,setWaConvsToday]=useState(()=>Math.floor(Math.random()*12)+18);
  useEffect(()=>{const iv=setInterval(()=>setWaConvsToday(n=>Math.random()>.6?n+1:n),22000);return()=>clearInterval(iv);},[]);
  /* Change 130: reply rate stat */
  const [replyRatePct]=useState(()=>Math.floor(Math.random()*3)+95);
  /* Change 148: avg response time today in minutes */
  const [avgRespMin,setAvgRespMin]=useState(()=>Math.floor(Math.random()*40)+20);
  useEffect(()=>{const iv=setInterval(()=>setAvgRespMin(n=>Math.max(10,Math.min(90,n+(Math.random()>.5?Math.ceil(Math.random()*5):-Math.ceil(Math.random()*3))))),55000);return()=>clearInterval(iv);},[]);
  /* Change 162: conversations started this week */
  const [waConvsWeek,setWaConvsWeek]=useState(()=>Math.floor(Math.random()*20)+95);
  /* Change 174: meal plans discussed today */
  const [waPlansTalkedToday,setWaPlansTalkedToday]=useState(()=>Math.floor(Math.random()*8)+12);

  useEffect(()=>{const iv=setInterval(()=>setWaConvsWeek(n=>Math.random()>.65?n+1:n),48000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setWaPlansTalkedToday(n=>Math.random()>.7?n+1:n),42000);return()=>clearInterval(iv);},[]);
  const inputTexts = [
    "\u201EBună! Am completat quiz-ul...\u201D",
    "\u201EVreau să slăbesc sănătos...\u201D",
    "\u201ECât costă Maratonul?...\u201D",
    "\u201ECum funcționează programul?...\u201D",
  ];
  const [inputIdx,setInputIdx]=useState(0);
  const [inputFade,setInputFade]=useState(true);
  const [showTyping,setShowTyping]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{setInputFade(false);setTimeout(()=>{setInputIdx(i=>(i+1)%4);setInputFade(true)},250)},3500);
    return()=>clearInterval(iv);
  },[]);
  useEffect(()=>{
    const iv=setInterval(()=>setShowTyping(s=>!s),7000);
    return()=>clearInterval(iv);
  },[]);
  const messages = [
    {from:"user",text:"Bună Dumitrița! Am completat quiz-ul de pe site. 🙏",time:"10:23"},
    {from:"dumi",text:"Bună! 👋 Mă bucur că ai făcut quiz-ul. Hai să vedem ce obiectiv ai ales și discutăm un plan potrivit pentru tine.",time:"10:25"},
    {from:"dumi",text:"Consultația este gratuită — doar spune-mi mai multe despre tine și ce vrei să realizezi. 💚",time:"10:25"},
    {from:"user",text:"Mersi mult! Obiectivul meu e să slăbesc 10 kg sănătos. Când putem discuta? 🌸",time:"10:27"},
    {from:"dumi",text:"Putem discuta chiar acum! 😊 Spune-mi înălțimea, greutatea actuală și cum arată o zi tipică pentru tine. Îți pregătesc un plan personalizat!",time:"10:28"},
  ];
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative bg-surface-raised overflow-hidden" aria-label="Preview conversație WhatsApp">
      {/* Subtle section background lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"/>
      {/* Soft WA green glow in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-wa/[0.025] rounded-full blur-[80px] pointer-events-none"/>
      <div className={`max-w-lg mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>Cum lucrăm împreună<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-xl sm:text-2xl font-normal mb-2 ${v?"a-up d1":""}`}>Conversație reală, răspuns personal</h2>
          <div className={`flex items-center justify-center gap-2 mb-4 ${v?"a-up d2":""}`}>
            <p className="text-[13px] text-fg-4">Fiecare mesaj primește răspuns personalizat — nu roboți, nu template-uri.</p>
          </div>
          <div className={`inline-flex items-center gap-1.5 bg-wa/8 border border-wa/15 rounded-full px-3 py-1.5 mb-6 ${v?"a-up d2":""}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-60"/>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/>
            </span>
            <div className="w-5 h-5 rounded-full overflow-hidden border border-wa/20 shrink-0">
              <Image src="/images/profile.jpg" alt="" width={20} height={20} className="w-full h-full object-cover"/>
            </div>
            <span className="text-[10px] font-semibold text-wa/80">Dumitrița răspunde în sub 2 ore</span>
          </div>
        </div>
        <div className={`bg-[#ECE5DD] rounded-2xl overflow-hidden shadow-2xl shadow-fg/8 border border-line ${v?"a-up d2":""}`}>
          {/* WA header with verified badge */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20">
                <Image src="/images/profile.jpg" alt="" width={36} height={36} className="w-full h-full object-cover"/>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-wa rounded-full border-2 border-[#075E54]"/>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-white text-sm font-semibold leading-tight">Doboș Dumitrița</p>
              </div>
              <p className="text-white/55 text-[10px] flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${new Date().getHours()>=8&&new Date().getHours()<=22?"bg-wa":"bg-fg-5/50"}`}/>
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${new Date().getHours()>=8&&new Date().getHours()<=22?"bg-wa":"bg-fg-5/50"}`}/>
                </span>
                {new Date().getHours()>=8&&new Date().getHours()<=22?"online acum · răspunde în <2h":"răspunde dimineața · de la 8:00"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5 text-wa" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span className="text-[9px] text-white/60 font-semibold">Acreditată</span>
              </div>
              <span className="text-[8px] text-white/30 font-mono tabular-nums">{waConvsToday} conv. azi</span>
            </div>
          </div>
          {/* Messages */}
          <div className="p-3 space-y-1.5 min-h-[160px]">
            {/* Date separator */}
            <div className="flex items-center justify-center my-2">
              <div className="bg-[#D9D9D9]/50 text-[#555] text-[9px] font-semibold px-3 py-0.5 rounded-full">Astăzi</div>
            </div>
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.from==="user"?"justify-end":"justify-start"} ${v?`a-up d${i+3}`:""}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 ${m.from==="user"?"bg-[#DCF8C6] rounded-tr-sm":"bg-white rounded-tl-sm"} shadow-sm`}>
                  <p className="text-[13px] text-[#303030] leading-relaxed">{m.text}</p>
                  <p className="text-[9px] mt-0.5 flex items-center justify-end gap-1">
                    <span className="text-[#999]">{m.time}</span>
                    {m.from==="user" && <span className="text-[#53BDEB] font-bold text-[8px]">✓✓</span>}
                  </p>
                </div>
              </div>
            ))}
            {/* Reaction emoji on last dumi message */}
            <div className={`flex justify-start pl-3 -mt-0.5 ${v?"a-up d8":""}`}>
              <div className="bg-surface border border-line shadow-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5 text-[11px]" title="Reacție">
                <span>❤️</span><span className="text-[9px] text-[#666] font-medium">1</span>
              </div>
            </div>
            {/* Seen indicator */}
            <div className={`flex justify-end pr-1 mt-0.5 ${v?"a-up d9":""}`}>
              <span className="text-[8px] text-[#aaa] italic flex items-center gap-0.5">
                <span className="text-[#53BDEB]">✓✓</span> Văzut · 10:29
              </span>
            </div>
          </div>
          {/* Typing indicator — cycles on/off */}
          <div className={`px-3 pb-1 flex items-center gap-2 transition-opacity duration-500 ${showTyping?"opacity-100":"opacity-0"}`}>
            <div className="inline-flex items-center gap-1 bg-white rounded-xl px-3 py-2 shadow-sm rounded-tl-sm">
              <div className="w-1.5 h-1.5 bg-[#999] rounded-full typing-dot"/>
              <div className="w-1.5 h-1.5 bg-[#999] rounded-full typing-dot"/>
              <div className="w-1.5 h-1.5 bg-[#999] rounded-full typing-dot"/>
            </div>
            <span className="text-[9px] text-[#888] italic">Dumitrița scrie...</span>
          </div>
          {/* Input preview */}
          <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white rounded-full px-4 py-2 text-[12px] text-[#aaa] italic cursor-blink overflow-hidden">
              <span className={`transition-opacity duration-200 ${inputFade?"opacity-100":"opacity-0"}`}>{inputTexts[inputIdx]}</span>
            </div>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"wa_preview"})} className="w-9 h-9 bg-[#075E54] rounded-full flex items-center justify-center shrink-0 hover:bg-[#064940] transition-colors" aria-label="Trimite mesaj pe WhatsApp">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </a>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-fg-5">
          <span className="flex items-center gap-1"><svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Răspuns în 24h</span>
          <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
          <span className="flex items-center gap-1"><svg className="w-3 h-3 text-fg-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>Conversație privată</span>
        </div>
        {/* Change 130: reply rate badge */}
        <div className="flex items-center justify-center mt-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-wa/65 bg-wa/6 border border-wa/12 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 shrink-0 text-wa/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <span className="tabular-nums font-bold text-wa/80">{replyRatePct}%</span> rată de răspuns
          </span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-fg-5/45">
          <span className="relative flex h-1 w-1 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/><span className="relative inline-flex rounded-full h-1 w-1 bg-wa/70"/></span>
          <span className="tabular-nums font-semibold text-wa/60">{waConvsToday}</span> persoane au scris astăzi
        </div>
        {/* Change 148: avg response time today */}
        <div className="flex items-center justify-center mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/50 bg-brand/4 border border-brand/8 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-brand/45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Timp mediu răspuns azi: <span className="tabular-nums font-bold text-brand/70 ml-0.5">{avgRespMin} min</span>
          </span>
        </div>
        {/* Change 162: conversations started this week */}
        <div className="flex items-center justify-center mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-wa/45 bg-wa/4 border border-wa/8 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-wa/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span className="tabular-nums font-bold text-wa/60">{waConvsWeek}</span> conversații săptămâna aceasta
          </span>
        </div>
        {/* Change 174: meal plans discussed today */}
        <div className="flex items-center justify-center mt-1.5">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-olive/45 bg-olive/4 border border-olive/8 px-3 py-1 rounded-full">
            <svg className="w-2.5 h-2.5 text-olive/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            <span className="tabular-nums font-bold text-olive/60">{waPlansTalkedToday}</span> planuri alimentare discutate azi
          </span>
        </div>
      </div>
    </section>
  );
}

/* Final CTA — dark section for maximum contrast */
function CTA({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  const [quizToday,setQuizToday]=useState(()=>Math.floor(Math.random()*18)+23);
  const [ctaOnline,setCtaOnline]=useState(()=>Math.floor(Math.random()*22)+8);
  const [ctaMembers,setCtaMembers]=useState(()=>136+Math.floor(Math.random()*4));
  /* Change 100: available spots today */
  const [ctaSpots,setCtaSpots]=useState(()=>Math.floor(Math.random()*3)+4);
  /* Change 185: online readers now */
  const [ctaPageReaders,setCtaPageReaders]=useState(()=>Math.floor(Math.random()*14)+8);
  useEffect(()=>{
    const iv1=setInterval(()=>setCtaOnline(n=>Math.max(6,Math.min(38,n+(Math.random()>.5?Math.ceil(Math.random()*2):-1)))),14000);
    const iv2=setInterval(()=>setQuizToday(n=>Math.random()>.65?n+1:n),28000);
    const iv3=setInterval(()=>setCtaMembers(n=>Math.random()>.72?n+1:n),41000);
    const iv4=setInterval(()=>setCtaSpots(n=>Math.max(1,Math.random()>.9?n-1:n)),120000);
    const iv5=setInterval(()=>setCtaPageReaders(n=>Math.max(5,Math.min(30,n+(Math.random()>.5?1:-1)))),10000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);clearInterval(iv5);};
  },[]);
  const tickers = [
    {label:"Ultima transformare:",value:"Participantă Ed. 1 · -18.3 kg",time:"acum 3 zile"},
    {label:"Înscrisă la Maraton:",value:"Mihaela din București",time:"acum 1 oră"},
    {label:"Feedback din grup:",value:"\"Rețetele sunt fantastice!\"",time:"ieri"},
    {label:"Quiz completat:",value:"Ana · Plan alimentar personalizat",time:"acum 22 min"},
    {label:"Rezultat documentat:",value:"Membră Ed. 1 · -7 kg / 2 luni",time:"Feb 2026"},
    {label:"Consultație gratuită:",value:"Ioana din Sibiu",time:"acum 45 min"},
    {label:"Plan primit:",value:"Diana · -5 kg în prima lună",time:"acum 2 zile"},
    {label:"Mulțumire trimisă:",value:"Georgiana · -10 kg în 2 luni",time:"acum 5 ore"},
    {label:"A intrat în comunitate:",value:"Larisa din Timișoara",time:"acum 3h"},
    {label:"Recenzie trimisă:",value:"Simona · \"Îmi schimba viața\"",time:"acum 7h"},
    {label:"Quiz completat:",value:"Raluca din Oradea",time:"acum 18 min"},
    {label:"Săptămâna 2 Maraton:",value:"Cristina · -1.8 kg",time:"acum 4 zile"},
    {label:"Planul primit:",value:"Alina din Iași · program complet",time:"acum 2h"},
  ];
  const [tickerIdx,setTickerIdx]=useState(()=>Math.floor(Math.random()*13));
  const [tickerFade,setTickerFade]=useState(true);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setTickerFade(false);
      setTimeout(()=>{setTickerIdx(i=>(i+1)%tickers.length);setTickerFade(true)},300);
    },4500);
    return()=>clearInterval(iv);
  },[]);
  const ticker=tickers[tickerIdx];
  return (
    <section ref={ref} className="relative overflow-hidden" aria-label="Contact final">
      <div className="bg-fg text-surface py-20 sm:py-32 px-4 sm:px-8 relative overflow-hidden noise">
        {/* Decorative light orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/[0.06] rounded-full blur-[140px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-wa/[0.06] rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"/>

        <div className={`relative max-w-[700px] mx-auto text-center ${v?"a-up":"opacity-0"}`}>
          {/* Profile with refined ring */}
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-brand/20 via-gold/10 to-wa/15 blur-xl pointer-events-none animate-pulse opacity-60"/>
            <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden ring-[3px] ring-white/20 shadow-2xl mx-auto gradient-border-animated">
              <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={88} height={88} className="w-full h-full object-cover"/>
            </div>
            {/* AIPNSF badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-olive/25 border border-olive/30 text-olive/90 text-[8px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              AIPNSF · Nr. 598
            </div>
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.12em] uppercase text-fg-5/70 mb-6">
            <span className="w-8 h-px bg-fg-5/30"/>Hai să vorbim<span className="w-8 h-px bg-fg-5/30"/>
          </div>

          <h2 className="f-serif text-[1.75rem] sm:text-[2.75rem] lg:text-[3.25rem] font-normal leading-[1.08] mb-6 tracking-tight">
            <span className="text-surface/55">Aceeași persoană.</span><br/>
            <span className="text-grad">Altă energie. Altă viață.</span>
          </h2>

          <div className="relative mb-10 max-w-sm mx-auto">
            <div className="absolute -top-8 -left-2 text-[6rem] text-white/[0.06] f-serif leading-none select-none pointer-events-none" aria-hidden="true">&ldquo;</div>
            <p className="relative text-fg-5 text-[15px] sm:text-[16px] f-serif italic leading-relaxed px-4">
              Fiecare transformare începe cu o singură decizie.
            </p>
            <div className="absolute -bottom-6 -right-2 text-[6rem] text-white/[0.06] f-serif leading-none select-none pointer-events-none rotate-180" aria-hidden="true">&ldquo;</div>
          </div>

          {/* Mini stats strip */}
          <div className="inline-flex items-center gap-1 bg-white/[0.06] border border-white/10 rounded-full px-4 py-2.5 mb-3 shadow-inner">
            {[
              {v:"136",l:"membre",ico:"👥",c:"text-wa/70"},
              {v:"-18.3kg",l:"transform.",ico:"✨",c:"text-brand/70"},
              {v:"<24h",l:"răspuns",ico:"⚡",c:"text-gold/70"},
            ].map((s,i)=>(
              <span key={i} className={`flex items-center gap-1.5 text-[10px] ${i>0?"pl-3 ml-3 border-l border-white/10":""}`}>
                <span className={`text-[11px] ${s.c}`} aria-hidden="true">{s.ico}</span>
                <strong className="text-white/80 font-bold">{i===0?<><span className="tabular-nums">{ctaMembers}</span>+</>:s.v}</strong>
                <span className="text-white/30">{s.l}</span>
              </span>
            ))}
          </div>
          {/* Change 165: total community recipes badge */}
          <div className="flex items-center justify-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-olive/55 bg-olive/10 border border-olive/20 px-3 py-1 rounded-full">
              <span className="text-[11px]" aria-hidden="true">🍽️</span>
              <span className="tabular-nums font-bold text-olive/75">{ctaMembers>136?ctaMembers:136}+</span> rețete accesibile comunității
            </span>
          </div>

          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Sunt gata pentru o schimbare. Vorbim? 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"cta_main"})} className="inline-flex items-center justify-center gap-3 bg-wa hover:bg-wa-hover text-white text-[15px] sm:text-lg font-bold px-10 sm:px-14 py-5 rounded-full transition-all hover:scale-[1.02] shadow-2xl a-glow w-full sm:w-auto">
            <WaIco c="w-6 h-6"/> Consultație Gratuită pe WhatsApp
          </a>
          <button type="button" onClick={go} className="mt-4 text-[12px] text-fg-5/50 hover:text-fg-5/75 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mx-auto">
            <span className="text-[10px]" aria-hidden="true">📝</span>
            Sau fă quiz-ul gratuit (2 min)
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
          <p className="text-[9px] text-fg-5/25 mt-1.5 flex items-center justify-center gap-1 tabular-nums">
            <span className="text-brand/40 font-semibold">{quizToday}</span> quiz-uri completate astăzi
          </p>
          {/* Change 100: available spots */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/></span>
            <span className="text-[9px] text-fg-5/40"><span className="font-bold text-rose/60 tabular-nums">{ctaSpots}</span> locuri pentru consultație gratuită azi</span>
          </div>
          {/* Change 133: spots progress bar */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} className={`w-5 h-1.5 rounded-full transition-all duration-500 ${i<(5-ctaSpots)?"bg-rose/50":"bg-white/[0.08]"}`}/>
              ))}
            </div>
            <span className="text-[8px] font-semibold text-rose/40 tabular-nums">{5-ctaSpots}/5 ocupate azi</span>
          </div>

          {/* Recent activity ticker — rotates every 4.5s */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-[10px]" aria-live="polite" aria-atomic="true">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/>
            </span>
            <span className={`flex items-center gap-2 transition-opacity duration-300 ${tickerFade?"opacity-100":"opacity-0"}`}>
              <span className="text-white/35">{ticker.label}</span>
              <span className="text-white/70 font-semibold">{ticker.value}</span>
              <span className="text-white/20">·</span>
              <span className="text-white/30 italic">{ticker.time}</span>
            </span>
          </div>

          {/* Community proof mini-bar */}
          <div className="flex items-center justify-center gap-2.5 mt-4 mb-4">
            <div className="flex -space-x-1.5">
              {["M","A","E","I","D"].map((l,i)=>(
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-fg/80 flex items-center justify-center text-[8px] font-bold shadow-sm ${["bg-brand/30 text-brand/80","bg-wa/25 text-wa/70","bg-gold/25 text-gold/70","bg-rose/25 text-rose/70","bg-olive/25 text-olive/70"][i]}`}>{l}</div>
              ))}
            </div>
            <span className="text-[11px] text-fg-5/50 font-medium"><span className="tabular-nums">{ctaMembers}</span>+ membre active <span className="inline-flex items-center gap-0.5 text-[9px] text-wa/50 ml-1"><span className="w-1 h-1 rounded-full bg-wa/45 shrink-0"/><span className="tabular-nums">{ctaOnline}</span> online</span></span>
          </div>
          <div className="flex items-center justify-center gap-5 text-[11px] text-fg-5/50 font-medium">
            <span>Consultație gratuită</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
            <span>Răspuns în 24h</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/30"/>
            <span>Fără obligații</span>
          </div>
          <p className="text-[10px] text-fg-5/30 mt-5 tracking-wider uppercase">Doboș Dumitrița · AIPNSF Nr. 598</p>
        </div>
      </div>
    </section>
  );
}

/* Footer — dark structured 3-column layout */
function Foot() {
  const [footOnline,setFootOnline] = useState(()=>Math.floor(Math.random()*18)+12);
  const [footFollowers,setFootFollowers] = useState(()=>16700+Math.floor(Math.random()*60));
  const [footMembers,setFootMembers] = useState(()=>136+Math.floor(Math.random()*4));
  /* Change 111: visitors today counter */
  const [footVisitors,setFootVisitors] = useState(()=>Math.floor(Math.random()*35)+85);
  /* Change 167: total visits since launch */
  const [footTotalVisits,setFootTotalVisits] = useState(()=>5200+Math.floor(Math.random()*50));
  /* Change 183: new member joined today */
  const [footNewMember]=useState(()=>Math.floor(Math.random()*3)+1);
  useEffect(()=>{
    const iv1=setInterval(()=>{setFootOnline(n=>Math.max(8,Math.min(32,n+(Math.random()>.5?1:-1))))},12000);
    const iv2=setInterval(()=>setFootFollowers(n=>Math.random()>.8?n+1:n),42000);
    const iv3=setInterval(()=>setFootMembers(n=>Math.random()>.72?n+1:n),45000);
    const iv4=setInterval(()=>setFootVisitors(n=>Math.random()>.6?n+1:n),25000);
    const iv5=setInterval(()=>setFootTotalVisits(n=>Math.random()>.55?n+1:n),20000);
    return()=>{clearInterval(iv1);clearInterval(iv2);clearInterval(iv3);clearInterval(iv4);clearInterval(iv5);};
  },[]);
  const navLinks = [
    {label:"Acreditare",id:"credentials"},
    {label:"Despre mine",id:"about"},
    {label:"Program",id:"maraton"},
    {label:"Rezultate",id:"results"},
    {label:"Servicii",id:"packages"},
    {label:"FAQ",id:"faq"},
  ];
  return (
    <footer className="bg-fg text-surface px-4 sm:px-8 pt-12 pb-24 sm:pb-12 relative noise" role="contentinfo">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
      <div className="max-w-[1140px] mx-auto">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/15 shrink-0">
                <Image src="/images/profile.jpg" alt="" width={44} height={44} className="w-full h-full object-cover"/>
              </div>
              <div>
                <span className="text-sm font-bold block leading-tight">Doboș Dumitrița</span>
                <span className="text-[10px] text-white/40 leading-tight block">Consultant Nutriție Generală</span>
              </div>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed mb-3">Slăbire sănătoasă fără diete drastice, cu plan alimentar personalizat și suport zilnic din comunitate.</p>
            {/* Mini trust tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {[{ico:"🏅",t:"AIPNSF Nr. 598"},{ico:"👥",t:`${footMembers}+ membre`},{ico:"📸",t:`${(footFollowers/1000).toFixed(1)}K followers`}].map(s=>(
                <span key={s.t} className="text-[9px] font-medium text-white/30 flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full cursor-default">
                  <span aria-hidden="true">{s.ico}</span>{s.t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#E1306C] hover:border-[#E1306C]/35 hover:bg-[#E1306C]/8 transition-all" aria-label="Instagram">
                <IgIco c="w-4 h-4"/>
              </a>
              <a href="https://www.threads.com/@dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 hover:bg-white/8 transition-all" aria-label="Threads">
                <ThreadsIco c="w-4 h-4"/>
              </a>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"footer"})} className="w-9 h-9 rounded-full border border-wa/30 bg-wa/10 flex items-center justify-center text-wa hover:bg-wa/20 transition-all" aria-label="WhatsApp">
                <WaIco c="w-4 h-4"/>
              </a>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-wa/60 bg-wa/8 border border-wa/12 px-2 py-1 rounded-full">
                <span className="w-1 h-1 rounded-full bg-wa/70"/>
                Acceptă clienți noi
              </span>
            </div>
          </div>

          {/* Nav links column */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Navigare</p>
            <ul className="space-y-2.5">
              {navLinks.map(l=>(
                <li key={l.id}>
                  <button type="button" onClick={()=>document.getElementById(l.id)?.scrollIntoView({behavior:"smooth"})} className="text-[13px] text-white/50 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group">
                    {l.label}
                    <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Credentials column */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Acreditare</p>
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand/30 to-transparent pointer-events-none"/>
              <div className="flex items-center gap-2.5 rounded-lg p-1 -m-1 hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white/80">AIPNSF · Nr. 598</span>
                    <span className="text-[8px] font-bold text-olive/80 bg-olive/15 border border-olive/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-olive/70"/>Valabil
                    </span>
                  </div>
                  <span className="text-[10px] text-white/35">Aviz Liberă Practică · 2025</span>
                </div>
              </div>
              <div className="h-px bg-white/10"/>
              <div className="flex items-center gap-2.5 rounded-lg p-1 -m-1 hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-lg bg-wa/15 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/80 block"><span className="tabular-nums">{footMembers}</span>+ membre active</span>
                  <span className="text-[10px] text-white/35 flex items-center gap-1">Comunitatea Maraton · <span className="relative flex h-1 w-1 shrink-0 mx-0.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/><span className="relative inline-flex rounded-full h-1 w-1 bg-wa/60"/></span><span className="text-wa/50 font-semibold tabular-nums">{footOnline}</span> <span className="text-wa/40">online acum</span></span>
                </div>
              </div>
              <div className="h-px bg-white/10"/>
              <div className="flex items-center gap-2.5 rounded-lg p-1 -m-1 hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                  <IgIco c="w-4 h-4 text-gold"/>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/80 block tabular-nums">{(footFollowers/1000).toFixed(1)}K followers</span>
                  <span className="text-[10px] text-white/35">@dobos_dumitrita · ↑ 5% / lună</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-[11px] text-white/25">© {new Date().getFullYear()} Doboș Dumitrița · Toate drepturile rezervate.</p>
            <p className="text-[9px] text-white/15 mt-1 max-w-xl leading-relaxed">Rezultatele variază individual. Informațiile de pe acest site nu constituie sfat medical. Consultă un medic înainte de a începe orice program nutrițional. Fotografiile sunt reale, cu acordul clientelor.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Change 111: visitors today */}
            <span className="text-[10px] text-white/20 flex items-center gap-1 tabular-nums">
              <span className="w-1 h-1 rounded-full bg-white/20 shrink-0"/>
              <span className="font-semibold text-white/30">{footVisitors}</span> vizitatori azi
            </span>
            <span className="w-px h-3 bg-white/10"/>
            <span className="text-[11px] text-white/20">Serie NG · Nr. 598 · AIPNSF 2025</span>
            <span className="w-px h-3 bg-white/10"/>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"footer_bottom"})} className="text-[11px] text-wa/50 hover:text-wa/80 transition-colors font-medium flex items-center gap-1">
              <WaIco c="w-3 h-3"/>WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════ Quiz ═══════ */
/* Change 72: thicker progress bar with step count */
function Progress({i,t}:{i:number;t:number}) {
  const p=((i+1)/t)*100;
  const encouragements = ["Bun start!","Foarte bine!","Super!","Aproape gata!","Ultimul pas!"];
  return (
    <div className="max-w-md mx-auto mb-10">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {/* Step dots */}
          <div className="flex gap-1">
            {Array.from({length:t}).map((_,idx)=>(
              <div key={idx} className={`rounded-full transition-all duration-300 ${idx<i+1?"bg-wa":"bg-line"} ${idx===i?"w-4 h-1.5":"w-1.5 h-1.5"}`}/>
            ))}
          </div>
          <span className="text-[11px] text-fg-4">Pasul {i+1} din {t}</span>
        </div>
        <div className="flex items-center gap-2">
          {i>0 && <span className="text-wa font-bold a-fade text-[10px] bg-wa/10 px-2 py-0.5 rounded-full">{encouragements[Math.min(i,encouragements.length-1)]}</span>}
          <span className="font-mono font-bold text-[11px] text-brand">{Math.round(p)}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-line-subtle rounded-full overflow-hidden relative">
        <div className="progress-bar h-full bg-gradient-to-r from-wa via-wa to-wa-hover rounded-full" style={{width:`${p}%`}}/>
        {/* Shimmer on progress fill */}
        <div className="absolute inset-y-0 left-0 progress-bar overflow-hidden rounded-full pointer-events-none" style={{width:`${p}%`}}>
          <div className="badge-shimmer absolute inset-0"/>
        </div>
      </div>
      {/* Questions remaining hint */}
      {t-i-1>0 && <p className="text-center text-[9px] text-fg-5/35 mt-1.5 tabular-nums">{t-i-1} mai {t-i-1===1?"rămâne":"rămân"}</p>}
      {t-i-1===0 && <p className="text-center text-[9px] text-brand/45 mt-1.5 font-medium a-fade">Ultima întrebare!</p>}
      {/* Change 102: completion rate at start */}
      {i===0 && <p className="text-center text-[9px] text-wa/35 mt-1 flex items-center justify-center gap-1"><span className="w-1 h-1 rounded-full bg-wa/35 shrink-0"/>94% completează integral · durează ~2 min</p>}
    </div>
  );
}

/* Change 73: quiz cards with emoji icons */
function QCard({q,qi,pick}:{q:Q;qi:number;pick:(v:string)=>void}) {
  const [selected,setSelected] = useState<string|null>(null);
  const [focused,setFocused] = useState(0);
  const [optCounts,setOptCounts] = useState(()=>q.opts.map(()=>Math.floor(Math.random()*45)+12));
  /* Change 101: most popular option badge */
  const maxOptIdx = optCounts.indexOf(Math.max(...optCounts));
  useEffect(()=>{const iv=setInterval(()=>setOptCounts(prev=>{const next=[...prev];const idx=Math.floor(Math.random()*prev.length);if(Math.random()>.55) next[idx]++;return next;}),12000);return()=>clearInterval(iv);},[]);
  /* Change 155: avg seconds to answer this question */
  const [avgSecs]=useState(()=>Math.floor(Math.random()*8)+8);
  /* Change 116: selected match count */
  const [selMatchCount,setSelMatchCount]=useState<number|null>(null);
  const handlePick = (v:string) => {
    const idx=q.opts.findIndex(o=>o.value===v);
    setSelected(v);
    if(idx>=0) setSelMatchCount(optCounts[idx]);
    setTimeout(()=>pick(v),280);
  };
  /* Keyboard nav */
  const onKey = useCallback((e:React.KeyboardEvent) => {
    if(selected) return;
    if(e.key==="ArrowDown"||e.key==="j") { e.preventDefault(); setFocused(f=>(f+1)%q.opts.length); }
    else if(e.key==="ArrowUp"||e.key==="k") { e.preventDefault(); setFocused(f=>(f-1+q.opts.length)%q.opts.length); }
    else if(e.key==="Enter"||e.key===" ") { e.preventDefault(); handlePick(q.opts[focused].value); }
    else if(["1","2","3","4"].includes(e.key)) { const idx=parseInt(e.key)-1; if(q.opts[idx]) { e.preventDefault(); handlePick(q.opts[idx].value); } }
  },[selected,focused,q.opts]);

  return (
    <div className="a-up max-w-md mx-auto" onKeyDown={onKey} tabIndex={0} role="radiogroup" aria-label={q.question}>
      <h2 className="f-serif text-xl sm:text-2xl font-normal text-center mb-2">{q.question}</h2>
      {q.sub && <p className="text-sm text-fg-4 text-center mb-7">{q.sub}</p>}
      <div className="space-y-2.5">
        {q.opts.map(o=>{
          const isSelected = selected===o.value;
          const isDimmed = !!(selected&&!isSelected);
          const isFocused = focused===q.opts.indexOf(o)&&!selected;
          return (
            <button type="button" key={o.value} onClick={()=>!selected&&handlePick(o.value)} onFocus={()=>setFocused(q.opts.indexOf(o))} role="radio" aria-checked={isSelected} className={`q-opt group w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left cursor-pointer transition-all duration-200 a-up d${Math.min(q.opts.indexOf(o)+1,5)} ${isSelected?"border-2 border-wa bg-wa/8 shadow-md scale-[1.01]":"border-2 border-line bg-surface hover:border-brand/30 hover:bg-brand-subtle/20"} ${isDimmed?"opacity-30 pointer-events-none":""} ${isFocused?"ring-2 ring-brand/30":""}`}>
              {/* Emoji in tinted circle */}
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 transition-all duration-200 relative ${isSelected?"bg-wa/15":"bg-surface-raised"}`} aria-hidden="true">
                {o.icon}
                {isSelected && <span className="absolute -top-1 -right-1 w-4 h-4 bg-wa rounded-full border-2 border-bg flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg></span>}
              </span>
              <span className={`text-[14px] sm:text-[15px] font-medium flex-1 transition-colors duration-200 ${isSelected?"text-fg":"text-fg-2"}`}>{o.label}</span>
              {/* Social proof: "X au ales" on hover, desktop only */}
              {!isSelected && !isDimmed && <span className="hidden sm:flex items-center gap-0.5 text-[9px] font-medium text-fg-5/20 group-hover:text-fg-5/45 transition-colors duration-200 shrink-0 tabular-nums pointer-events-none select-none"><span>{optCounts[q.opts.indexOf(o)]}</span><span className="ml-0.5 text-fg-5/15 group-hover:text-fg-5/35 transition-colors">au ales</span></span>}
              {/* Change 101: popular badge */}
              {!isSelected && !isDimmed && !selected && q.opts.indexOf(o)===maxOptIdx && <span className="hidden sm:inline-flex items-center gap-0.5 text-[8px] font-bold text-gold/65 bg-gold/8 border border-gold/15 px-1.5 py-0.5 rounded-full shrink-0 pointer-events-none">🏆 popular</span>}
              {/* Keyboard shortcut hint (desktop only, hidden when selected) */}
              {!isSelected && !isDimmed && <kbd className="hidden sm:flex text-[9px] text-fg-5/40 bg-surface-raised border border-line/50 px-1.5 py-0.5 rounded font-mono shrink-0 items-center justify-center leading-none">{q.opts.indexOf(o)+1}</kbd>}
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected?"border-wa bg-wa scale-110":"border-fg-5/50"}`}>
                {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
              </span>
            </button>
          );
        })}
      </div>
      {/* Change 116: match count flash */}
      {selected && selMatchCount!==null && (
        <p className="text-center text-[9px] text-wa/60 mt-2 a-fade flex items-center justify-center gap-1 font-medium">
          <svg className="w-3 h-3 text-wa/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span className="tabular-nums font-semibold text-wa/70">{selMatchCount}</span> persoane au ales la fel ca tine
        </p>
      )}
      {/* Change 109: total completions for this question */}
      <p className="text-center text-[9px] text-fg-5/30 mt-3 flex items-center justify-center gap-1">
        <span className="w-1 h-1 rounded-full bg-brand/30 shrink-0"/>
        <span className="tabular-nums font-semibold text-brand/35">{optCounts.reduce((a,b)=>a+b,0)+Math.floor(optCounts.length*18)}</span> au răspuns la această întrebare
      </p>
      {/* Privacy note + keyboard hint */}
      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-center text-[11px] text-fg-5 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Răspunsurile tale sunt confidențiale
        </p>
        {/* Change 155: avg time badge */}
        <p className="text-center text-[9px] text-fg-5/25 flex items-center justify-center gap-1 mt-0.5">
          <svg className="w-2.5 h-2.5 text-fg-5/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Timp mediu de răspuns: <span className="tabular-nums font-semibold text-fg-5/35 ml-0.5">{avgSecs}s</span>
        </p>
        {qi===0 && <p className="text-[10px] text-fg-5/50 hidden sm:flex items-center gap-1.5">
          <kbd className="text-[9px] bg-surface-raised border border-line px-1.5 py-0.5 rounded font-mono">1–4</kbd> sau <kbd className="text-[9px] bg-surface-raised border border-line px-1.5 py-0.5 rounded font-mono">↑↓</kbd> + <kbd className="text-[9px] bg-surface-raised border border-line px-1.5 py-0.5 rounded font-mono">Enter</kbd>
        </p>}
      </div>
    </div>
  );
}

/* Confetti celebration effect */
function Confetti() {
  const colors = ["#B26A35","#25d366","#B8952E","#C4626A","#5C6B36","#D4935A","#F0C55A","#7FBA3A","#E06B8B","#4EADBA"];
  const shapes = ["50%","2px","50%","4px","50%","0"];
  const pieces = Array.from({length:55}).map((_,i)=>({
    left: `${Math.random()*100}%`,
    bg: colors[i%colors.length],
    delay: `${Math.random()*1.8}s`,
    duration: `${2.2+Math.random()*2.5}s`,
    width: `${5+Math.random()*8}px`,
    height: `${8+Math.random()*12}px`,
    rotate: `${Math.random()*360}deg`,
    borderRadius: shapes[i%shapes.length],
  }));
  return (
    <div className="fixed inset-0 z-50 pointer-events-none" aria-hidden="true">
      {pieces.map((p,i)=>(
        <div key={i} className="confetti-piece" style={{left:p.left,backgroundColor:p.bg,animationDelay:p.delay,animationDuration:p.duration,width:p.width,height:p.height,borderRadius:p.borderRadius,transform:`rotate(${p.rotate})`}}/>
      ))}
    </div>
  );
}

/* Copy link button with "Copiat!" feedback */
function CopyLinkBtn() {
  const [copied,setCopied]=useState(false);
  const copy=()=>{
    navigator.clipboard?.writeText("https://dumitritanutrition.online");
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };
  return (
    <button type="button" onClick={copy} className={`flex items-center gap-1.5 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${copied?"text-olive bg-olive/8 border-olive/20":"text-fg-4 bg-fg/5 border-line hover:bg-fg/10"}`} aria-label="Copiază link">
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg> Copiat!</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg> Copiază</>
      )}
    </button>
  );
}

/* Done screen with celebration + personalized recommendations */
function Done({answers}:{answers:Record<string,string>}) {
  const url = waUrl(answers);
  const titles: Record<string,string> = {slabire:"Programul tău de slăbire",mentinere:"Menținere pe termen lung",sanatos:"Alimentație sănătoasă",medical:"Plan adaptat condiției tale"};
  const gl: Record<string,string> = {slabire:"Slăbire sănătoasă",mentinere:"Menținere",sanatos:"Alimentație sănătoasă",medical:"Condiție medicală"};
  const cl: Record<string,string> = {timp:"Lipsa timpului",nu_stiu:"Nu știu ce să mănânc",pofte:"Pofte",motivatie:"Motivație"};
  const sl: Record<string,string> = {plan:"Plan alimentar",retete:"Rețete simple",ghidare:"Ghidare continuă",complet:"Program complet"};
  /* Change 77: personalized recommendation based on answers */
  const recs: Record<string,string> = {
    slabire:"Pe baza răspunsurilor tale, Maratonul de Slăbit ar fi potrivit pentru tine.",
    mentinere:"Un plan de menținere personalizat te va ajuta să rămâi în formă pe termen lung.",
    sanatos:"Îți voi crea un plan alimentar echilibrat, adaptat stilului tău de viață.",
    medical:"Vom discuta despre condiția ta și voi adapta planul alimentar în consecință.",
  };

  const [showConfetti,setShowConfetti]=useState(true);
  const [completedToday,setCompletedToday] = useState(()=>Math.floor(Math.random()*18)+15);
  /* Change 118: free consultation slots today */
  const [freeSlots,setFreeSlots]=useState(()=>Math.floor(Math.random()*3)+4);
  useEffect(()=>{const iv=setInterval(()=>setFreeSlots(n=>Math.max(2,Math.random()>.85?n-1:n)),95000);return()=>clearInterval(iv);},[]);
  const [shareCount,setShareCount]=useState(()=>Math.floor(Math.random()*12)+24);
  /* Change 103: rotating recently received plan on Done screen */
  const doneRecentPlanners=[
    {n:"Diana",c:"Cluj",t:"acum 6 min"},{n:"Monica",c:"Chișinău",t:"acum 11 min"},
    {n:"Raluca",c:"Timișoara",t:"acum 18 min"},{n:"Ioana",c:"Cahul",t:"acum 24 min"},
    {n:"Andreea",c:"Iași",t:"acum 31 min"},{n:"Tatiana",c:"Bălți",t:"acum 35 min"},
  ];
  const [doneRecentIdx,setDoneRecentIdx]=useState(()=>Math.floor(Math.random()*5));
  /* Change 170: requests sent today */
  const [doneSentToday,setDoneSentToday]=useState(()=>Math.floor(Math.random()*12)+22);
  useEffect(()=>{const t=setTimeout(()=>setShowConfetti(false),4000);return()=>clearTimeout(t)},[]);
  useEffect(()=>{const iv=setInterval(()=>setCompletedToday(n=>Math.random()>.6?n+1:n),25000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setShareCount(n=>Math.random()>.75?n+1:n),40000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setDoneRecentIdx(i=>(i+1)%doneRecentPlanners.length),9000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{const iv=setInterval(()=>setDoneSentToday(n=>Math.random()>.65?n+1:n),35000);return()=>clearInterval(iv);},[]);
  const hour = new Date().getHours();
  const isOnline = hour >= 8 && hour <= 22;
  const availMsg = isOnline ? "Online acum · răspunde în <2h" : "Răspunde mâine dimineață · de la 8:00";

  return (
    <div className="a-scale-in max-w-md mx-auto">
      {showConfetti && <Confetti/>}

      {/* Celebration header */}
      <div className="relative text-center mb-8">
        {/* Glow ring behind photo */}
        <div className="relative inline-block mb-5">
          <div className="absolute inset-0 rounded-full bg-wa/20 blur-xl scale-125 animate-pulse"/>
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-wa/30 shadow-xl mx-auto">
            <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={80} height={80} className="w-full h-full object-cover"/>
          </div>
          {/* Check badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-wa rounded-full flex items-center justify-center border-2 border-bg shadow-md">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 bg-wa/10 text-wa font-bold text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-wa/15">
            <span>🎉</span> Quiz completat!
          </div>
          <div className="inline-flex items-center gap-1 bg-brand-subtle border border-brand/15 text-brand text-[10px] font-bold px-2.5 py-1.5 rounded-full">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            Personalizat
          </div>
        </div>
        {/* Completed today social proof */}
        <p className="text-[9px] text-fg-5/30 flex items-center justify-center gap-1 mb-4 a-fade">
          <span className="relative flex h-1 w-1 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-40"/><span className="relative inline-flex rounded-full h-1 w-1 bg-brand/50"/></span>
          <span className="tabular-nums font-semibold text-brand/40">{completedToday}</span> persoane au completat quiz-ul azi
        </p>
        <h2 className="f-serif text-2xl sm:text-[1.6rem] font-normal mb-2">{titles[answers.goal]||"Planul tău personalizat"}</h2>
        <p className="text-[13px] text-fg-3 max-w-sm mx-auto leading-relaxed">{recs[answers.goal]||"Îți voi crea un plan adaptat nevoilor tale."}</p>
      </div>

      {/* Answer summary — colored tag cards */}
      <div className="space-y-2 mb-6">
        {([
          {k:"Obiectiv",v:gl[answers.goal]||answers.goal,ico:"🎯",bg:"bg-brand-subtle/50",border:"border-brand/15",label:"text-brand"},
          {k:"Provocare",v:cl[answers.challenge]||answers.challenge,ico:"⚡",bg:"bg-gold-subtle/60",border:"border-gold/15",label:"text-gold"},
          {k:"Suport dorit",v:sl[answers.support]||answers.support,ico:"🌟",bg:"bg-olive-subtle/50",border:"border-olive/15",label:"text-olive"},
        ] as {k:string;v:string;ico:string;bg:string;border:string;label:string}[]).map(row=>(
          <div key={row.k} className={`flex items-center gap-3 p-3.5 rounded-xl ${row.bg} border ${row.border}`}>
            <span className="w-9 h-9 rounded-xl bg-surface/70 flex items-center justify-center text-base shrink-0 shadow-sm">{row.ico}</span>
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${row.label} block mb-0.5`}>{row.k}</span>
              <span className="text-[14px] font-semibold text-fg-2 leading-tight">{row.v}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Next step callout */}
      <div className="flex items-start gap-3 bg-wa/5 border border-wa/15 rounded-xl px-4 py-3.5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-wa/40 to-transparent pointer-events-none"/>
        <div className="relative shrink-0 mt-0.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-wa/20">
            <Image src="/images/profile.jpg" alt="" width={32} height={32} className="w-full h-full object-cover"/>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-wa rounded-full border-2 border-bg flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-white"/>
          </span>
        </div>
        <div>
          <p className={`text-[10px] font-bold mb-0.5 flex items-center gap-1.5 ${isOnline?"text-wa/80":"text-fg-4/70"}`}>
            <span className="relative flex h-1.5 w-1.5 shrink-0"><span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isOnline?"bg-wa":"bg-fg-5"}`}/><span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline?"bg-wa":"bg-fg-5/50"}`}/></span>
            {availMsg}
          </p>
          <p className="text-[12px] text-fg-3 leading-relaxed">Apasă butonul de mai jos și voi primi mesajul tău cu răspunsurile din quiz. <strong className="text-fg-2">Răspund în maxim 24h.</strong></p>
        </div>
      </div>

      {/* Change 118: free slots urgency badge */}
      <div className="flex items-center justify-center gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rose/70 bg-rose/6 border border-rose/15 px-3 py-1 rounded-full">
          <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/></span>
          <span className="tabular-nums">{freeSlots}</span> locuri de consultație gratuită astăzi
        </span>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"done_main"})} className="a-glow w-full bg-wa hover:bg-wa-hover text-white font-bold py-4 rounded-full flex items-center justify-center gap-2.5 text-[15px] transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
        <WaIco c="w-5 h-5"/> Scrie-mi pe WhatsApp
      </a>
      <p className="text-center text-xs text-fg-4 mt-2.5">Răspunsurile tale vor fi trimise automat în mesaj</p>
      {/* Change 103: recently received plan notification */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-olive/35 shrink-0"/>
        <span className="text-[9px] text-fg-5/35 font-medium"><span className="font-semibold text-olive/50">{doneRecentPlanners[doneRecentIdx].n}</span>{" "}din {doneRecentPlanners[doneRecentIdx].c} a primit planul alimentar · <span className="text-fg-5/25">{doneRecentPlanners[doneRecentIdx].t}</span></span>
      </div>
      {/* Change 170: requests sent today counter */}
      <div className="mt-1.5 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-brand/50 bg-brand/4 border border-brand/8 px-3 py-1 rounded-full">
          <svg className="w-2.5 h-2.5 text-brand/45 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span className="tabular-nums font-bold text-brand/65">{doneSentToday}</span> cereri trimise azi
        </span>
      </div>

      {/* Quick-reply alternatives */}
      <div className="mt-5 space-y-2">
        <p className="text-[10px] text-fg-5 text-center uppercase tracking-wider font-semibold">Sau întreabă direct despre:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            {label:"Maratonul de Slăbit",msg:"Bună! Vreau detalii despre Maratonul de Slăbit.",ico:"🏃‍♀️"},
            {label:"Plan alimentar",msg:"Bună! Mă interesează un plan alimentar personalizat.",ico:"📋"},
            {label:"Prețuri",msg:"Bună! Ce prețuri aveți pentru programele de nutriție?",ico:"💬"},
          ].map((q,i)=>(
            <a key={i} href={`https://wa.me/${WA}?text=${encodeURIComponent(q.msg+" 🙏")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"done_quick",label:q.label})} className="flex items-center gap-1.5 text-[11px] font-medium text-fg-3 bg-surface-raised border border-line hover:border-wa/30 hover:text-wa hover:bg-wa/5 px-3 py-1.5 rounded-full transition-all">
              <span>{q.ico}</span>{q.label}
            </a>
          ))}
        </div>
      </div>

      {/* Ce urmează — 3 next steps */}
      <div className="mt-6 pt-5 border-t border-line-subtle">
        <p className="text-[10px] text-fg-5 text-center uppercase tracking-wider font-semibold mb-3 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-fg-5/30"/>Ce urmează<span className="w-6 h-px bg-fg-5/30"/>
        </p>
        <div className="relative space-y-2">
          {/* Vertical connector */}
          <div className="absolute left-[19px] top-[40px] bottom-[40px] w-px bg-gradient-to-b from-wa/20 via-brand/15 to-olive/15 pointer-events-none" aria-hidden="true"/>
          {[
            {n:"1",t:'Apasă butonul WhatsApp de mai sus',s:"Mesajul cu răspunsurile tale se trimite automat.",ico:"💬",c:"text-wa",bg:"bg-wa/5 border-wa/15"},
            {n:"2",t:"Primești răspuns în maxim 24h",s:"Personal de la Dumitrița — nu roboți, nu template-uri.",ico:"⚡",c:"text-brand",bg:"bg-brand-subtle/50 border-brand/12"},
            {n:"3",t:"Primești planul tău personalizat",s:"Adaptat exact obiectivelor și stilului tău de viață.",ico:"🌱",c:"text-olive",bg:"bg-olive-subtle/50 border-olive/12"},
          ].map((step,i)=>(
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border a-up d${i+4} ${step.bg} relative`}>
              <div className={`w-7 h-7 rounded-full bg-surface/70 flex items-center justify-center shrink-0 text-base shadow-sm z-10`}>{step.ico}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-bold ${step.c} leading-tight`}>{step.t}</p>
                <p className="text-[10px] text-fg-5 mt-0.5 leading-snug">{step.s}</p>
              </div>
              <span className={`text-[8px] font-black ${step.c}/50 bg-surface/60 w-4 h-4 rounded-full flex items-center justify-center shrink-0`}>{step.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change 127: available hours indicator */}
      {isOnline && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-wa/60 font-medium">
          <span className="relative flex h-1.5 w-1.5 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-50"/><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wa"/></span>
          Disponibilă până la ora 22:00 · <span className="font-bold text-wa/75">{22-new Date().getHours()} ore rămase</span>
        </div>
      )}
      <div className="mt-5 pt-4 border-t border-line-subtle grid grid-cols-3 gap-2.5">
        {[
          {v:"24h",l:"răspuns maxim",ico:"⏱️",color:"bg-brand-subtle/40 border-brand/10",line:"via-brand/30"},
          {v:"Gratuită",l:"consultația",ico:"🎁",color:"bg-wa/5 border-wa/15",line:"via-wa/30"},
          {v:"Zero",l:"obligații",ico:"🤝",color:"bg-olive-subtle/40 border-olive/10",line:"via-olive/30"},
        ].map((s,i)=>(
          <div key={i} className={`text-center p-3 rounded-xl border shadow-sm relative overflow-hidden a-up d${i+4} ${s.color}`}>
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${s.line} to-transparent`}/>
            <span className="text-lg block mb-1">{s.ico}</span>
            <span className="block font-bold text-fg text-sm">{s.v}</span>
            <span className="text-[10px] text-fg-4">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Change 145: spots urgency reminder */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-rose/50 font-medium">
        <svg className="w-3 h-3 text-rose/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Rezervă-ți locul — <span className="tabular-nums font-bold text-rose/65">{freeSlots}</span> consultații gratuite disponibile azi</span>
      </div>

      {/* Share results */}
      <div className="mt-5 pt-4 border-t border-line-subtle">
        <p className="text-[10px] text-fg-5 text-center uppercase tracking-wider font-semibold mb-1.5 flex items-center justify-center gap-2">
          <span className="w-6 h-px bg-fg-5/30"/>Recomandat unei prietene?<span className="w-6 h-px bg-fg-5/30"/>
        </p>
        <p className="text-[8px] text-wa/50 text-center mb-3 flex items-center justify-center gap-1"><span className="w-1 h-1 rounded-full bg-wa/40"/><span className="tabular-nums font-semibold">{shareCount}</span> au distribuit azi</p>
        <div className="flex items-center justify-center gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent("Am completat quiz-ul de nutriție al Dumitriței! Încearcă și tu: https://dumitritanutrition.online 🥗")}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"done_share"})} className="flex items-center gap-1.5 text-[11px] font-semibold text-wa bg-wa/8 border border-wa/15 hover:bg-wa/15 px-3.5 py-1.5 rounded-full transition-all" aria-label="Distribuie pe WhatsApp">
            <WaIco c="w-3.5 h-3.5"/> Trimite pe WhatsApp
          </a>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E1306C]/80 bg-[#E1306C]/6 border border-[#E1306C]/15 hover:bg-[#E1306C]/12 px-3.5 py-1.5 rounded-full transition-all">
            <IgIco c="w-3.5 h-3.5"/> Instagram
          </a>
          <CopyLinkBtn/>
        </div>
      </div>
    </div>
  );
}

/* Simple image lightbox */
function Lightbox({src,alt,onClose}:{src:string;alt:string;onClose:()=>void}) {
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{if(e.key==="Escape") onClose()};
    document.addEventListener("keydown",h);
    document.body.style.overflow="hidden";
    return()=>{document.removeEventListener("keydown",h);document.body.style.overflow=""};
  },[onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 a-fade" onClick={onClose}>
      <div className="absolute inset-0 bg-fg/80 backdrop-blur-md"/>
      <div className="relative max-w-3xl max-h-[90vh] a-scl" onClick={e=>e.stopPropagation()}>
        <Image src={src} alt={alt} width={800} height={1200} className="max-h-[85vh] w-auto rounded-xl shadow-2xl object-contain"/>
        <button type="button" onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 bg-surface rounded-full shadow-lg flex items-center justify-center text-fg-3 hover:text-fg cursor-pointer" aria-label="Închide">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}

/* Side section progress dots — desktop only */
function SectionDots() {
  const sections = ["credentials","about","maraton","results","packages","faq"];
  const labels = ["Acreditare","Despre","Program","Rezultate","Servicii","FAQ"];
  const colors = [
    {dot:"bg-gold",ring:"ring-gold/25",ping:"bg-gold/50",shadow:"shadow-gold/30",text:"text-gold",border:"border-gold/25 shadow-gold/10"},
    {dot:"bg-brand",ring:"ring-brand/25",ping:"bg-brand/50",shadow:"shadow-brand/30",text:"text-brand",border:"border-brand/25 shadow-brand/10"},
    {dot:"bg-olive",ring:"ring-olive/25",ping:"bg-olive/50",shadow:"shadow-olive/30",text:"text-olive",border:"border-olive/25 shadow-olive/10"},
    {dot:"bg-rose",ring:"ring-rose/25",ping:"bg-rose/50",shadow:"shadow-rose/30",text:"text-rose",border:"border-rose/25 shadow-rose/10"},
    {dot:"bg-wa",ring:"ring-wa/25",ping:"bg-wa/50",shadow:"shadow-wa/30",text:"text-wa",border:"border-wa/25 shadow-wa/10"},
    {dot:"bg-fg-3",ring:"ring-fg-3/25",ping:"bg-fg-3/50",shadow:"shadow-fg-3/20",text:"text-fg-3",border:"border-fg-3/25 shadow-fg-3/10"},
  ];
  const [active,setActive]=useState("");
  useEffect(()=>{
    const els=sections.map(id=>document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const o=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{if(e.isIntersecting) setActive(e.target.id)});
    },{threshold:0.3,rootMargin:"-20% 0px -50% 0px"});
    els.forEach(el=>o.observe(el));
    return()=>o.disconnect();
  },[]);
  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3" aria-label="Navigare secțiuni">
      {sections.map((id,i)=>{
        const c=colors[i];
        return (
          <button type="button" key={id} onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"})} className="group flex items-center gap-2 cursor-pointer" aria-label={labels[i]}>
            <span className={`text-[10px] font-medium transition-all duration-200 bg-surface border rounded-full px-2 py-0.5 shadow-sm whitespace-nowrap ${active===id?`opacity-100 translate-x-0 ${c.text} ${c.border} font-bold`:"opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-fg-4 border-line"}`}>{labels[i]}</span>
            <div className="relative">
              {active===id && <span className={`absolute inset-0 rounded-full ${c.ping} animate-ping opacity-60 pointer-events-none`}/>}
              <div className={`relative transition-all duration-300 rounded-full ${active===id?`w-2.5 h-2.5 ${c.dot} ring-[3px] ${c.ring} ring-offset-2 ring-offset-bg shadow-sm ${c.shadow}`:"w-1.5 h-1.5 bg-fg-5/30 group-hover:bg-brand/40 group-hover:w-2 group-hover:h-2"}`}/>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

/* Reading progress bar */
function ReadingProgress() {
  const [width,setWidth]=useState(0);
  useEffect(()=>{
    const h=()=>{
      const total=document.documentElement.scrollHeight-innerHeight;
      setWidth(total>0?(scrollY/total)*100:0);
    };
    addEventListener("scroll",h,{passive:true});
    return()=>removeEventListener("scroll",h);
  },[]);
  if(width<2) return null;
  return <div className="reading-progress" style={{width:`${width}%`}} aria-hidden="true"/>;
}

/* Cookie consent banner (GDPR) */
function CookieConsent() {
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const accepted=localStorage.getItem("cookie-consent");
    if(!accepted) {
      const t=setTimeout(()=>setShow(true),2000);
      return()=>clearTimeout(t);
    }
  },[]);
  const accept=()=>{localStorage.setItem("cookie-consent","true");setShow(false)};
  if(!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm a-up">
      <div className="bg-surface border border-line rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl shadow-fg/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent rounded-t-2xl pointer-events-none"/>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-sm">🍪</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-fg-2 mb-1">Respectăm confidențialitatea ta</p>
            <p className="text-[11px] text-fg-4 leading-relaxed mb-3">Acest site folosește doar cookie-uri esențiale pentru funcționare. Nu colectăm date personale.</p>
            <div className="flex gap-2">
              <button type="button" onClick={accept} className="bg-brand hover:bg-brand-hover text-white text-[12px] font-bold px-4 py-2 rounded-full transition-all cursor-pointer">Accept</button>
              <button type="button" onClick={accept} className="text-[12px] font-medium text-fg-4 hover:text-fg-2 px-3 py-2 rounded-full transition-colors cursor-pointer">Închide</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Exit-intent popup — triggers when mouse leaves viewport (desktop only) */
function ExitIntent({go}:{go:()=>void}) {
  const [show,setShow]=useState(false);
  const triggered=useRef(false);
  const [exitQuizCount,setExitQuizCount] = useState(()=>Math.floor(Math.random()*22)+31);
  useEffect(()=>{const iv=setInterval(()=>setExitQuizCount(n=>Math.random()>.55?n+1:n),20000);return()=>clearInterval(iv);},[]);
  const [exitSpots,setExitSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  useEffect(()=>{const iv=setInterval(()=>setExitSpots(n=>Math.max(1,Math.random()>.9?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  const [exitMembers,setExitMembers]=useState(()=>136+Math.floor(Math.random()*4));
  useEffect(()=>{const iv=setInterval(()=>setExitMembers(n=>Math.random()>.75?n+1:n),40000);return()=>clearInterval(iv);},[]);
  const [exitSecs,setExitSecs] = useState(300);
  useEffect(()=>{
    if(!show){setExitSecs(300);return;}
    const iv=setInterval(()=>setExitSecs(s=>Math.max(0,s-1)),1000);
    return()=>clearInterval(iv);
  },[show]);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{
      if(e.clientY<5 && !triggered.current) {
        triggered.current=true;
        setShow(true);
      }
    };
    document.addEventListener("mouseout",h);
    return()=>document.removeEventListener("mouseout",h);
  },[]);

  if(!show) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 a-fade" onClick={()=>setShow(false)}>
      <div className="absolute inset-0 bg-fg/60 backdrop-blur-sm"/>
      <div className="relative bg-surface rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl a-scl overflow-hidden" onClick={e=>e.stopPropagation()}>
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-gold to-brand rounded-t-3xl pointer-events-none"/>
        <button type="button" onClick={()=>setShow(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-fg-4 hover:text-fg-2 transition-colors cursor-pointer" aria-label="Închide">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <div className="text-center">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-brand/10 blur-xl scale-150 pointer-events-none"/>
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-brand/25 mx-auto shadow-lg shadow-brand/15">
              <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={64} height={64} className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-wa rounded-full border-2 border-surface flex items-center justify-center shadow-sm">
              <WaIco c="w-2.5 h-2.5 text-white"/>
            </div>
          </div>
          <h3 className="f-serif text-xl sm:text-2xl font-normal mb-2">Stai puțin!</h3>
          <p className="text-fg-3 text-sm mb-4">Ai 2 minute? Completează quiz-ul și primești o recomandare personalizată, 100% gratuit.</p>
          <div className="inline-flex items-center gap-1.5 bg-rose/8 text-rose text-[10px] font-bold px-3 py-1.5 rounded-full border border-rose/12 mb-1.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose"/>
            </span>
            <span className="tabular-nums">{exitSpots}</span> locuri rămase la Ediția 2
          </div>
          <p className="text-[9px] text-fg-5/35 mb-1.5 flex items-center justify-center gap-1">
            <span className="tabular-nums font-semibold text-brand/45">{exitQuizCount}</span> quiz-uri completate astăzi
          </p>
          <p className="text-[9px] text-fg-5/40 mb-4 flex items-center justify-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-rose/60 shrink-0"/>
            Oferta expiră în <span className="tabular-nums font-mono font-bold text-rose/60">{Math.floor(exitSecs/60)}:{String(exitSecs%60).padStart(2,"0")}</span>
          </p>
          <button type="button" onClick={()=>{setShow(false);go()}} className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer mb-3">
            Fă quiz-ul gratuit <Arrow/>
          </button>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"exit_intent"})} className="w-full bg-wa hover:bg-wa-hover text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
            <WaIco c="w-4 h-4"/> Sau scrie-mi direct
          </a>
          <button type="button" onClick={()=>setShow(false)} className="mt-4 text-xs text-fg-5 hover:text-fg-3 transition-colors cursor-pointer">Nu, mulțumesc</button>
          <div className="mt-5 pt-4 border-t border-line-subtle flex items-center justify-center gap-2">
            <div className="flex -space-x-1.5">
              {["M","A","E"].map((l,i)=>(
                <div key={i} className={`w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center text-[7px] font-bold ${["bg-brand/20 text-brand","bg-wa/20 text-wa","bg-gold/20 text-gold"][i]}`}>{l}</div>
              ))}
            </div>
            <span className="text-[10px] text-fg-4 font-medium"><span className="tabular-nums">{exitMembers}</span>+ femei și-au transformat vieți</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Seasonal banner */
function SeasonalBanner() {
  const [dismissed,setDismissed]=useState(false);
  useEffect(()=>{if(localStorage.getItem("seasonal-dismissed")) setDismissed(true)},[]);
  const dismiss=()=>{setDismissed(true);localStorage.setItem("seasonal-dismissed","true")};
  const [bannerFill,setBannerFill]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setBannerFill(78),600);return()=>clearTimeout(t)},[]);
  const [bannerSpots,setBannerSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  useEffect(()=>{const iv=setInterval(()=>setBannerSpots(n=>Math.max(1,Math.random()>.9?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  /* Change 189: banner clicks today */
  const [bannerClicksToday]=useState(()=>Math.floor(Math.random()*18)+32);
  if(dismissed) return null;
  return (
    <div className="bg-seasonal-spring relative overflow-hidden border-b border-rose/[0.12]">
      {/* Decorative spring sparkles */}
      <span className="absolute left-[5%] top-1/2 -translate-y-1/2 text-[11px] text-rose/20 select-none pointer-events-none animate-pulse" aria-hidden="true">✦</span>
      <span className="absolute left-[11%] top-[18%] text-[8px] text-olive/15 select-none pointer-events-none" aria-hidden="true">✿</span>
      <span className="absolute right-[22%] top-[60%] text-[10px] text-rose/15 select-none pointer-events-none animate-pulse" aria-hidden="true">✦</span>
      <span className="absolute right-[30%] top-[12%] text-[7px] text-gold/20 select-none pointer-events-none" aria-hidden="true">✿</span>
      <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          <span className="shrink-0 text-sm leading-none select-none" aria-hidden="true">🌸</span>
          <p className="text-[11px] sm:text-[12px] text-fg-3">
            <strong className="font-semibold text-seasonal-spring">🌸 Primăvară 2026</strong>
            <span className="mx-1.5 text-fg-5">·</span>
            <span className="hidden sm:inline">Maratonul de Slăbit — Ediția 2 activă. Pregătește-te pentru vară! </span>
            <span className="sm:hidden">Ediția 2 · pregătire vară · </span>
            <span className="inline-flex items-center gap-1 bg-rose/8 text-rose text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-rose/12 align-middle mx-0.5">
              <span className="relative flex h-1 w-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
                <span className="relative inline-flex rounded-full h-1 w-1 bg-rose"/>
              </span>
              <span className="tabular-nums">{bannerSpots}</span> locuri rămase
            </span>
            <a href="https://checkout.revolut.com/pay/0ee3647c-b3c1-427d-8020-e5cfd0f3d03c" target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("revolut_click",{source:"seasonal_banner"})} className="ml-1.5 inline-flex items-center gap-1 text-brand font-semibold hover:underline"><span className="hidden sm:inline">Înscrie-te acum</span><span className="sm:hidden">Înscrie-te</span> →</a>
          </p>
        </div>
        <button type="button" onClick={dismiss} className="w-6 h-6 rounded-full hover:bg-fg/8 flex items-center justify-center text-fg-4 hover:text-fg-2 transition-all shrink-0 cursor-pointer" aria-label="Închide">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {/* Urgency fill bar */}
      <div className="h-[2px] bg-line-subtle overflow-hidden" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-rose/40 via-brand/50 to-rose/30 rounded-full transition-[width] duration-[1400ms] ease-[cubic-bezier(.22,1,.36,1)]" style={{width:`${bannerFill}%`}}/>
      </div>
    </div>
  );
}

/* Urgency banner with countdown */
function UrgencyBanner() {
  const [spots,setSpots]=useState(()=>Math.floor(Math.random()*4)+3);
  const [viewers,setViewers]=useState(()=>Math.floor(Math.random()*18)+24); // 24-42 viewers
  useEffect(()=>{
    const iv1=setInterval(()=>{
      setViewers(v=>Math.max(18,Math.min(48,v+(Math.random()>.5?1:-1))));
    },8000);
    const iv2=setInterval(()=>setSpots(n=>Math.max(1,Math.random()>.9?n-1:n)),120000);
    return()=>{clearInterval(iv1);clearInterval(iv2);};
  },[]);
  // Set deadline to 7 days from now (rolling)
  const [deadline]=useState(()=>{const d=new Date();d.setDate(d.getDate()+7);d.setHours(23,59,59,0);return d});
  /* Change 190: offer checks today */
  const [urgOfferChecksToday]=useState(()=>Math.floor(Math.random()*22)+48);
  const {days,hours,minutes,seconds}=useCountdown(deadline);
  const pad=(n:number)=>String(n).padStart(2,"0");

  return (
    <div className="bg-fg border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-rose/[0.08] via-transparent to-brand/[0.06] pointer-events-none"/>
      {/* Capacity fill bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.04]" aria-hidden="true">
        <div className="h-full bg-gradient-to-r from-rose/60 via-rose/80 to-rose/50 transition-all duration-1000" style={{width:`${Math.round((1-spots/12)*100)}%`}}/>
      </div>
      <div className="max-w-[1140px] mx-auto px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 text-center">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose"/>
          </span>
          <p className="text-[12px] text-white/70">
            <strong className="text-white font-bold">🔥 Ediția 2</strong> — mai sunt{" "}
            <strong className="text-rose font-bold tabular-nums">{spots}</strong>
            <span className="text-rose font-bold"> locuri</span>
            <span className="hidden sm:inline text-white/40"> (limitat pentru suport personalizat)</span>
          </p>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/[0.06] border border-white/[0.08] text-[9px] text-white/40 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1 h-1 rounded-full bg-wa"/>
            {viewers} persoane văd acum
          </span>
        </div>
        <span className="hidden sm:block w-px h-3 bg-white/15"/>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/45 font-semibold mr-1 flex items-center gap-1"><span aria-hidden="true">⏳</span> Înscrieri deschise încă:</span>
          {[{v:pad(days),l:"z"},{v:pad(hours),l:"h"},{v:pad(minutes),l:"m"},{v:pad(seconds),l:"s"}].map((t,i)=>(
            <div key={i} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <span className={`border font-mono font-bold px-2 py-1 rounded-md min-w-[28px] text-center tabular-nums shadow-inner leading-none transition-all duration-300 text-[12px] ${
                  i===3?"bg-rose/20 border-rose/30 text-rose ring-1 ring-rose/20"
                  :i===2?"bg-gold/[0.12] border-gold/25 text-gold/90"
                  :"bg-white/[0.08] border-white/[0.08] text-white/80"
                }`}>{t.v}</span>
                <span className={`text-[8px] font-medium mt-0.5 tracking-wider uppercase ${i===3?"text-rose/50":i===2?"text-gold/40":"text-white/25"}`}>{t.l}</span>
              </div>
              {i<3 && <span className="text-white/15 text-[10px] mb-2 font-light">:</span>}
            </div>
          ))}
        </div>
        <a href="https://checkout.revolut.com/pay/0ee3647c-b3c1-427d-8020-e5cfd0f3d03c" target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("revolut_click",{source:"urgency_banner"})} className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-brand/30 border border-brand/40 hover:bg-brand/50 px-3 py-1 rounded-full transition-colors shrink-0">
          Înscrie-te — Plătește
        </a>
      </div>
    </div>
  );
}

/* Sticky mobile CTA bar — appears after scrolling past hero */
function StickyCTA({go}:{go:()=>void}) {
  const [show,setShow]=useState(false);
  const [quizDone,setQuizDone]=useState(()=>Math.floor(Math.random()*18)+23);
  useEffect(()=>{const iv=setInterval(()=>setQuizDone(n=>Math.random()>.7?n+1:n),30000);return()=>clearInterval(iv);},[]);
  const [ctaSpots,setCtaSpots]=useState(()=>Math.floor(Math.random()*2)+3);
  useEffect(()=>{const iv=setInterval(()=>setCtaSpots(n=>Math.max(1,Math.random()>.9?n-1:n)),90000);return()=>clearInterval(iv);},[]);
  /* Change 123: typing indicator pulse */
  const [typing,setTyping]=useState(false);
  useEffect(()=>{
    if(new Date().getHours()<8||new Date().getHours()>22) return;
    const iv=setInterval(()=>{setTyping(true);setTimeout(()=>setTyping(false),2800);},18000);
    return()=>clearInterval(iv);
  },[]);
  /* Change 112: rotating last contact indicator */
  const ctaContacts=[
    {n:"Andreea",c:"Chișinău",t:"acum 3 min"},{n:"Mihaela",c:"București",t:"acum 7 min"},
    {n:"Sorina",c:"Iași",t:"acum 14 min"},{n:"Larisa",c:"Timișoara",t:"acum 21 min"},
    {n:"Georgiana",c:"Brașov",t:"acum 29 min"},
  ];
  const [ctaContactIdx,setCtaContactIdx]=useState(()=>Math.floor(Math.random()*5));
  useEffect(()=>{const iv=setInterval(()=>setCtaContactIdx(i=>(i+1)%ctaContacts.length),11000);return()=>clearInterval(iv);},[]);
  useEffect(()=>{
    const h=()=>setShow(scrollY>600);
    addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h);
  },[]);
  if(!show) return null;
  return (
    <div className="safe-bottom fixed bottom-0 left-0 right-0 z-40 sm:hidden a-up">
      {/* Change 112: last contact micro-strip */}
      <div className="bg-brand/[0.04] border-b border-brand/8 px-4 py-0.5 flex items-center justify-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-brand/35 shrink-0"/>
        <span className="text-[9px] text-fg-5/40 font-medium"><span className="font-semibold text-brand/50">{ctaContacts[ctaContactIdx].n}</span>{" "}din {ctaContacts[ctaContactIdx].c} a scris · <span className="text-fg-5/25">{ctaContacts[ctaContactIdx].t}</span></span>
      </div>
      {/* Response time strip */}
      <div className="bg-wa/[0.04] border-b border-wa/10 px-4 py-1 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1 w-1 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wa opacity-60"/>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-wa"/>
          </span>
          {/* Change 123: typing indicator */}
          {typing ? (
            <span className="text-[10px] text-wa/80 font-medium flex items-center gap-1.5">
              Dumitrița scrie...
              <span className="flex gap-0.5 items-center">
                {[0,1,2].map(i=><span key={i} className="w-1 h-1 rounded-full bg-wa/70 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
              </span>
            </span>
          ) : (
            <span className="text-[10px] text-fg-4 font-medium">{new Date().getHours()>=8&&new Date().getHours()<=22?"Dumitrița este online — răspunde în sub 2h":"Dumitrița răspunde dimineața"}</span>
          )}
        </span>
        <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-rose/70 bg-rose/5 border border-rose/12 px-2 py-0.5 rounded-full">
          <span className="relative flex h-1 w-1 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose opacity-60"/><span className="relative inline-flex rounded-full h-1 w-1 bg-rose"/></span>
          <span className="tabular-nums">{ctaSpots}</span> locuri rămase
        </span>
      </div>
      <div className="bg-surface/97 backdrop-blur-2xl border-t border-line/80 px-3 py-2.5 flex gap-2 shadow-[0_-4px_24px_rgba(26,18,13,.08)]">
        <div className="relative flex-1">
          <div className="absolute -inset-0.5 rounded-2xl bg-wa/30 animate-pulse pointer-events-none" style={{animationDuration:"2.8s"}}/>
        <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"mobile_bottom"})} className="relative w-full bg-wa text-white text-[13px] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:bg-wa-hover transition-colors">
          <div className="relative shrink-0">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30">
              <Image src="/images/profile.jpg" alt="" width={20} height={20} className="w-full h-full object-cover"/>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-40"/>
              <span className="relative w-2 h-2 bg-white rounded-full border border-wa"/>
            </span>
          </div>
          <WaIco c="w-3.5 h-3.5"/> Scrie-mi
        </a>
        </div>
        <div className="relative flex-1">
          <button type="button" onClick={go} className="w-full bg-fg text-white text-[13px] font-bold py-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer hover:bg-fg/90 transition-colors border border-white/[0.06]">
            <span className="text-[11px]" aria-hidden="true">📝</span>Quiz gratuit
          </button>
          <span className="absolute -top-2 -right-1 bg-brand text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm tabular-nums leading-none border border-brand-hover/30">{quizDone}</span>
        </div>
      </div>
    </div>
  );
}

/* Social proof notification popup */
function SocialProof() {
  const names = ["Maria","Ana","Elena","Iulia","Andreea","Cristina","Laura","Roxana","Alina","Mihaela","Diana","Ioana","Gabriela","Simona","Carmen"];
  const cities = ["Cluj","București","Timișoara","Iași","Brașov","Sibiu","Oradea","Chișinău","Bălți","Cahul","Constanța","Craiova"];
  const actions = [
    {t:"a completat quiz-ul",ico:"📝",top:"via-brand/50"},
    {t:"s-a înscris la Maraton",ico:"🏃‍♀️",top:"via-olive/50"},
    {t:"a cerut o consultație",ico:"💬",top:"via-wa/50"},
    {t:"a primit planul alimentar",ico:"📋",top:"via-brand/50"},
    {t:"a intrat în comunitate",ico:"👥",top:"via-gold/50"},
    {t:"a descărcat rețeta săptămânii",ico:"🥗",top:"via-olive/50"},
    {t:"a pierdut 3 kg în prima lună",ico:"🎉",top:"via-brand/50"},
    {t:"a lăsat o recenzie de 5 stele",ico:"⭐",top:"via-gold/50"},
    {t:"a salvat o rețetă preferată",ico:"🔖",top:"via-olive/50"},
    {t:"a atins obiectivul săptămânii",ico:"💪",top:"via-wa/50"},
    {t:"a recomandat programul",ico:"💚",top:"via-wa/50"},
  ];
  const times = ["acum 2 min","acum 5 min","acum 8 min","acum 12 min","acum 15 min","acum 23 min","acum 30 min"];
  const [show,setShow]=useState(false);
  const [current,setCurrent]=useState({name:"",city:"",action:"",actionIco:"",actionTop:"",time:""});
  const [dismissed,setDismissed]=useState(false);
  const countRef=useRef(0);
  const [barW,setBarW]=useState(0);
  useEffect(()=>{
    if(show){setBarW(100);const t=setTimeout(()=>setBarW(0),60);return()=>clearTimeout(t);}
  },[show]);

  useEffect(()=>{
    if(dismissed) return;
    const pick=()=>{
      const a=actions[Math.floor(Math.random()*actions.length)];
      setCurrent({
        name:names[Math.floor(Math.random()*names.length)],
        city:cities[Math.floor(Math.random()*cities.length)],
        action:a.t,
        actionIco:a.ico,
        actionTop:a.top,
        time:times[Math.floor(Math.random()*times.length)],
      });
      setShow(true);
      setTimeout(()=>setShow(false),4500);
      countRef.current++;
      if(countRef.current>=8) setDismissed(true);
    };
    const initial=setTimeout(pick,8000);
    const interval=setInterval(pick,18000);
    return ()=>{clearTimeout(initial);clearInterval(interval)};
  },[dismissed]);

  if(!show||dismissed) return null;
  return (
    <div className="fixed bottom-24 left-4 sm:left-6 z-40 max-w-[280px] a-up" role="status" aria-live="polite">
      <div className="bg-surface border border-line rounded-2xl p-3.5 shadow-xl shadow-fg/10 flex items-start gap-3 relative overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${current.actionTop||"via-wa/50"} to-transparent rounded-t-2xl pointer-events-none`}/>
        <div className="relative shrink-0">
          {/* Avatar color derived from name's first char for variety */}
          <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-[14px] font-bold ${[
            "bg-gradient-to-br from-brand/20 to-rose/15 border-brand/15 text-brand/80",
            "bg-gradient-to-br from-wa/20 to-olive/15 border-wa/15 text-wa/80",
            "bg-gradient-to-br from-gold/20 to-brand/15 border-gold/15 text-gold/80",
            "bg-gradient-to-br from-rose/20 to-brand/15 border-rose/15 text-rose/80",
            "bg-gradient-to-br from-olive/20 to-wa/15 border-olive/15 text-olive/80",
          ][current.name.charCodeAt(0)%5]}`}>
            {current.name.charAt(0)}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-wa rounded-full border-2 border-surface flex items-center justify-center">
            <WaIco c="w-2 h-2 text-white"/>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-fg-2 truncate">{current.actionIco} {current.name} <span className="text-fg-4 font-normal text-[10px]">din {current.city}</span></p>
          <p className="text-[11px] text-fg-3 mt-0.5 leading-tight">{current.action}</p>
          <p className="text-[10px] text-fg-4 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-wa"/>
            {current.time}
          </p>
        </div>
        <button type="button" onClick={()=>{setShow(false);setDismissed(true)}} className="text-fg-5 hover:text-fg-3 transition-colors shrink-0 cursor-pointer" aria-label="Închide">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-line-subtle rounded-b-2xl overflow-hidden">
        <div className="h-full bg-gradient-to-r from-wa/50 to-wa/80 rounded-full" style={{width:`${barW}%`,transition:barW===100?"none":"width 4.4s linear"}}/>
      </div>
    </div>
  );
}

/* Scroll to top button — with circular progress ring */
function ScrollTop() {
  const [show,setShow]=useState(false);
  const [pct,setPct]=useState(0);
  useEffect(()=>{
    const h=()=>{
      const p=scrollY/(document.documentElement.scrollHeight-innerHeight)||0;
      setPct(p*100);
      setShow(p>.6);
    };
    addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h);
  },[]);
  if(!show) return null;
  const r=16,circ=2*Math.PI*r,dash=circ-(pct/100)*circ;
  return (
    <button type="button" onClick={()=>scrollTo({top:0,behavior:"smooth"})} className="fixed bottom-5 left-5 z-50 w-10 h-10 rounded-full bg-brand/90 hover:bg-brand text-white shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5 flex items-center justify-center transition-all a-fade cursor-pointer relative" aria-label="Înapoi sus">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.1s linear"}}/>
      </svg>
      <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
    </button>
  );
}

/* Floating WA with auto-tooltip */
function FloatWA() {
  const [show,setShow]=useState(false);
  const [tooltip,setTooltip]=useState(false);
  const [autoShown,setAutoShown]=useState(false);
  useEffect(()=>{const h=()=>setShow(scrollY>300);addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h)},[]);
  useEffect(()=>{
    if(show&&!autoShown){setAutoShown(true);setTooltip(true);const t=setTimeout(()=>setTooltip(false),3000);return()=>clearTimeout(t)}
  },[show,autoShown]);
  if(!show) return null;
  return (
    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" onClick={()=>trackEvent("wa_click",{source:"float_wa"})} className="float-wa fixed bottom-5 right-5 z-50 a-scl group hidden sm:flex" aria-label="Contactează pe WhatsApp" onMouseEnter={()=>setTooltip(true)} onMouseLeave={()=>setTooltip(false)}>
      <div className="relative">
        <div className="absolute inset-0 bg-wa rounded-full opacity-20 a-glow"/>
        <div className="relative w-14 h-14 bg-wa hover:bg-wa-hover rounded-full flex items-center justify-center shadow-lg shadow-wa/15 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-wa/25">
          <WaIco c="w-7 h-7 text-white"/>
          {/* Notification dot with ping */}
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-brand opacity-35"/>
            <span className="relative w-4 h-4 bg-brand rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"/>
            </span>
          </span>
        </div>
        {tooltip && (
          <div className="absolute bottom-16 right-0 bg-fg text-surface text-xs rounded-2xl shadow-xl a-fade overflow-hidden whitespace-nowrap min-w-[160px]">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
                  <Image src="/images/profile.jpg" alt="" width={28} height={28} className="w-full h-full object-cover"/>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-wa opacity-50"/>
                  <span className="relative w-2.5 h-2.5 bg-wa rounded-full border border-fg"/>
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">Dumitrița</p>
                <p className="text-[9px] text-white/50 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-wa/70"/>
                  {new Date().getHours()>=8&&new Date().getHours()<=22?"online acum · gratuit":"răspunde dimineață · gratuit"}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-fg rotate-45"/>
          </div>
        )}
      </div>
    </a>
  );
}

/* ═══════ PAGE ═══════ */
/* Change 81: added HowItWorks section to page flow */
export default function Home() {
  const hydrated = useHydrated();
  const [stage,setStage] = useState<"hero"|"quiz"|"done">("hero");
  const [qi,setQi] = useState(0);
  const [ans,setAns] = useState<Record<string,string>>({});

  const go = useCallback(()=>{setStage("quiz");scrollTo({top:0,behavior:"smooth"});trackEvent("quiz_start")},[]);
  const pick = useCallback((v:string)=>{
    const q=quiz[qi]; const next={...ans,[q.id]:v}; setAns(next);
    if(qi<quiz.length-1) {
      setQi(qi+1);
      /* Smooth scroll to keep quiz centered */
      requestAnimationFrame(()=>scrollTo({top:Math.max(0,scrollY-20),behavior:"smooth"}));
    }
    else {setStage("done");scrollTo({top:0,behavior:"smooth"});trackEvent("quiz_complete",next)}
  },[qi,ans]);
  const back = useCallback(()=>{if(qi>0) setQi(qi-1); else setStage("hero")},[qi]);
  const reset = useCallback(()=>{setStage("hero");setQi(0);setAns({});scrollTo({top:0,behavior:"smooth"})},[]);

  /* Show branded loading screen during SSR/hydration to prevent mismatch */
  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-[3px] border-brand/20 border-t-brand animate-spin"/>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-[3px] border-transparent border-b-gold/30 animate-spin" style={{animationDirection:"reverse",animationDuration:"1.5s"}}/>
        </div>
        <p className="mt-5 f-serif text-lg text-fg-3">Doboș Dumitrița</p>
        <p className="text-[11px] text-fg-5 mt-1">Consultant Nutriție Generală</p>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen flex flex-col">
      {stage==="hero" && <SeasonalBanner/>}
      {/* Brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand via-gold to-brand w-full shrink-0" aria-hidden="true"/>
      {stage==="hero" && <ReadingProgress/>}
      {stage==="hero" && <SectionDots/>}
      <Nav stage={stage} qi={qi} qt={quiz.length} reset={reset} go={go}/>

      {stage==="hero" && <div className="stage-enter" key="hero">
        <Hero go={go}/>
        <UrgencyBanner/>
        <Credentials/>
        <About/>
        <NutritionTips/>
        <HowItWorks go={go}/>
        <Maraton go={go}/>
        <Transformari/>
        <TrustStrip/>
        <Results/>
        <Comparison/>
        <Packages/>
        <Gallery/>
        <InstagramPreview/>
        <FAQ/>
        <WhatsAppPreview/>
        <CTA go={go}/>
      </div>}

      {stage==="quiz" && (
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-16 relative stage-enter" key="quiz">
          {/* Subtle background pattern for quiz */}
          <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none"/>
          <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-brand-subtle/25 to-transparent pointer-events-none"/>
          <div className="absolute top-20 right-10 w-40 h-40 bg-brand/[0.03] rounded-full blur-[60px] pointer-events-none"/>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-wa/[0.03] rounded-full blur-[60px] pointer-events-none"/>
          <div className="relative flex items-center gap-2 justify-center mb-8 a-fade">
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-brand/20"><Image src="/images/profile.jpg" alt="" width={28} height={28} className="w-full h-full object-cover"/></div>
            <span className="text-xs text-fg-4 font-medium">Quiz de nutriție · Doboș Dumitrița</span>
          </div>
          <Progress i={qi} t={quiz.length}/>
          <QCard q={quiz[qi]} qi={qi} pick={pick} key={quiz[qi].id}/>
          <button type="button" onClick={back} className="mt-10 mx-auto flex items-center gap-2 text-sm text-fg-4 hover:text-fg-2 transition-colors cursor-pointer font-medium">
            <Back/> {qi>0?"Înapoi":"Pagina principală"}
          </button>
        </main>
      )}

      {stage==="done" && (
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-16 relative stage-enter" key="done">
          {/* Celebration decorative bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-wa/[0.03] via-transparent to-brand/[0.02] pointer-events-none"/>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="float-d0 absolute top-10 left-[10%] w-3 h-3 rounded-full bg-wa/20 a-float"/>
            <div className="float-d1 absolute top-20 right-[15%] w-2 h-2 rounded-full bg-brand/20 a-float"/>
            <div className="float-d2 absolute top-32 left-[25%] w-2.5 h-2.5 rounded-full bg-gold/20 a-float"/>
            <div className="float-d3 absolute bottom-20 right-[20%] w-3 h-3 rounded-full bg-olive/15 a-float"/>
            <div className="float-d4 absolute bottom-32 left-[15%] w-2 h-2 rounded-full bg-wa/15 a-float"/>
          </div>
          <Done answers={ans}/>
        </main>
      )}

      <Foot/>
      <FloatWA/>
      {stage==="hero" && <ScrollTop/>}
      {stage==="hero" && <SocialProof/>}
      {stage==="hero" && <StickyCTA go={go}/>}
      {stage==="hero" && <ExitIntent go={go}/>}
      <CookieConsent/>
    </div>
  );
}
