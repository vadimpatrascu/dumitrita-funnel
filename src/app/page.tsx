"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ═══════ Types ═══════ */
interface Q { id:string; question:string; sub?:string; opts:{label:string; value:string; icon:string}[] }

/* ═══════ Data ═══════ */
const WA = "393288461370";

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
  {m:"Greutate",b:"99.8 kg",a:"81.5 kg",d:"-18.3 kg"},
  {m:"Mana",b:"41 cm",a:"35 cm",d:"-6 cm"},
  {m:"Bust",b:"120 cm",a:"102 cm",d:"-18 cm"},
  {m:"Sub bust",b:"101 cm",a:"88 cm",d:"-13 cm"},
  {m:"Talie",b:"103 cm",a:"87 cm",d:"-16 cm"},
  {m:"Abdomen",b:"114 cm",a:"99 cm",d:"-15 cm"},
  {m:"Fund",b:"111 cm",a:"100 cm",d:"-11 cm"},
  {m:"Picior",b:"67 cm",a:"59 cm",d:"-8 cm"},
];

const reviews = [
  { name:"Clientă Maraton, 40 ani", q:"Aceasta a fost cea mai bună decizie pe care am luat-o în noiembrie. Acum sunt mândră că la 40 de ani pot arăta bine! Rezultatul meu este în poze și cifre — succes tuturor!", kg:"-18.3 kg", src:"Postare fixată pe Instagram · Mar 2026" },
  { name:"@veradurnea7", q:"Drumul nu e ușor, dar rezultatele vorbesc de la sine. Ce se întâmplă când nu mai cauți scuze, ci soluții.", kg:"Transformare vizibilă", src:"Postare fixată pe Instagram · Oct 2025" },
];

/* Change 42: added 6th FAQ about Instagram verification */
const faqs = [
  {q:"Cum funcționează Maratonul de Slăbit?", a:"Este un program cu suport zilnic prin grupul de WhatsApp (136+ membri), rețete noi în fiecare săptămână și plan alimentar personalizat. Fără diete drastice, fără suplimente — doar mâncare reală, susținere și rezultate vizibile."},
  {q:"Trebuie să renunț la alimentele preferate?", a:"Nu. Cu mine înveți să te alimentezi sănătos și gustos. Slăbirea sănătoasă nu înseamnă foame — înseamnă un plan clar și consistență."},
  {q:"Ce rezultate au avut participantele?", a:"Cea mai documentată transformare: -18.3 kg, -16 cm talie, -18 cm bust, de la 99.8 la 81.5 kg. Toate măsurătorile sunt publice pe pagina mea de Instagram @dobos_dumitrita."},
  {q:"Cât costă un plan alimentar?", a:"Depinde de nevoile tale. Completează quiz-ul și scrie-mi pe WhatsApp — discutăm gratuit despre situația ta și găsim varianta potrivită."},
  {q:"Am o condiție medicală. Mă poți ajuta?", a:"Ca Consultant Nutriție Generală acreditat AIPNSF, am competențe în alimentația adaptată diferitelor condiții. Scrie-mi pe WhatsApp și discutăm despre situația ta specifică."},
  {q:"Cum pot verifica acreditarea ta?", a:"Avizul meu de Liberă Practică (Serie NG, Nr. 598, 2025) este emis de AIPNSF și vizibil în Highlight-ul 'Studii' de pe pagina mea de Instagram @dobos_dumitrita. Toate certificatele sunt publice."},
];

/* ═══════ Utils ═══════ */
function waUrl(answers: Record<string,string>): string {
  const g: Record<string,string> = {slabire:"să slăbesc",mentinere:"să mă mențin",sanatos:"să mănânc sănătos",medical:"am o condiție medicală"};
  const c: Record<string,string> = {timp:"lipsa timpului",nu_stiu:"nu știu ce să mănânc",pofte:"poftele",motivatie:"lipsa motivației"};
  const s: Record<string,string> = {plan:"plan alimentar",retete:"rețete simple",ghidare:"ghidare continuă",complet:"program complet"};
  const msg = `Bună Dumitrița! 👋\n\nAm completat quiz-ul de pe site.\n\n📌 Obiectiv: ${g[answers.goal]||answers.goal}\n📌 Provocare: ${c[answers.challenge]||answers.challenge}\n📌 Caut: ${s[answers.support]||answers.support}\n\nAștept să discutăm! 🙏`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
}

/* ═══════ Hooks ═══════ */
function useVisible(t=0.1) {
  const ref = useRef<HTMLElement>(null);
  const [v,setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if(!el) return;
    const o = new IntersectionObserver(([e])=>{ if(e.isIntersecting){setV(true);o.disconnect()} },{threshold:t});
    o.observe(el); return ()=>o.disconnect();
  },[t]);
  return {ref,v};
}

function Counter({n,s="",ms=1800}:{n:number;s?:string;ms?:number}) {
  const [c,setC]=useState(0); const ref=useRef<HTMLSpanElement>(null); const [go,setGo]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!go){setGo(true);o.disconnect()}},{threshold:.3});
    o.observe(el); return ()=>o.disconnect();
  },[go]);
  useEffect(()=>{
    if(!go) return; let cur=0; const step=n/50; const iv=ms/50;
    const t=setInterval(()=>{cur+=step;if(cur>=n){setC(n);clearInterval(t)}else setC(Math.floor(cur))},iv);
    return ()=>clearInterval(t);
  },[go,n,ms]);
  return <span ref={ref} className="stat">{go?c.toLocaleString("ro-RO"):"0"}{s}</span>;
}

/* ═══════ Icons ═══════ */
const WaIco=({c="w-5 h-5"}:{c?:string})=><svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const IgIco=({c="w-5 h-5"}:{c?:string})=><svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const ThreadsIco=({c="w-5 h-5"}:{c?:string})=><svg className={c} fill="currentColor" viewBox="0 0 192 192"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C82.2364 44.745 70.1369 51.5765 63.2175 63.6309L76.5756 72.2232C81.7752 63.5585 90.1631 61.0674 97.2724 61.0674C97.3472 61.0674 97.4226 61.0674 97.4974 61.0681C105.044 61.1172 110.752 63.5285 114.526 68.2395C117.257 71.6156 119.044 76.2216 119.843 81.9977C113.145 80.8762 105.855 80.4472 98.0355 80.7272C75.1978 81.5513 60.4932 95.2946 61.6556 114.479C62.2451 124.229 67.2387 132.563 75.7299 137.901C83.0295 142.499 92.2837 144.825 101.934 144.348C114.304 143.723 123.934 138.748 130.469 129.577C135.377 122.683 138.475 113.888 139.879 103.016C145.333 106.278 149.417 110.569 151.737 115.835C155.749 124.703 156.009 139.437 146.106 149.338C137.328 158.114 126.696 162.078 108.22 162.234C87.7056 162.064 72.5801 155.542 62.8757 142.735C53.9272 130.926 49.2669 114.106 49.0647 92.7403C49.2668 71.3744 53.9272 54.5543 62.8757 42.7451C72.5801 29.9381 87.7056 23.4163 108.22 23.2461C128.874 23.4176 144.247 30.0091 154.063 42.8976C158.839 49.1496 162.472 56.8671 164.865 65.9048L180.305 61.6488C177.349 50.5284 172.709 41.037 166.474 33.2737C153.538 16.8794 134.724 8.27985 108.329 8.07867C108.293 8.07867 108.257 8.07867 108.22 8.07867C81.9244 8.27935 63.2028 16.8282 50.286 33.0743C39.4048 47.3698 33.8929 66.6814 33.6729 92.6899L33.6729 93.0102C33.8929 118.939 39.4048 138.151 50.286 152.347C63.2028 168.493 81.9244 177.042 108.22 177.243C108.257 177.243 108.293 177.243 108.329 177.243C130.449 177.061 144.804 171.581 156.416 159.97C172.421 143.967 171.649 123.741 165.85 110.658C161.803 101.515 153.592 93.8647 141.537 88.9883ZM99.2162 129.135C87.0124 129.771 76.3659 123.012 75.8024 113.382C75.3752 106.379 80.411 98.339 98.6499 97.6277C101.061 97.5325 103.432 97.4871 105.762 97.4871C111.983 97.4871 117.868 98.0471 123.312 99.1216C121.382 122.671 109.903 128.578 99.2162 129.135Z"/></svg>;
const Arrow=()=><svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>;
const ChevD=({open}:{open:boolean})=><svg className={`w-4 h-4 text-fg-4 transition-transform duration-300 ${open?"rotate-180":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
const Back=()=><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7"/></svg>;
const Check=()=><svg className="w-4 h-4 text-olive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>;
const Star=()=><svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>;

/* ═══════════════════ SECTIONS ═══════════════════ */

/* Change 43: improved Nav with done stage support */
function Nav({stage,qi,qt,reset}:{stage:string;qi:number;qt:number;reset:()=>void}) {
  const [s,setS]=useState(false);
  useEffect(()=>{const h=()=>setS(scrollY>30);addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h)},[]);
  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${s?"bg-surface/90 backdrop-blur-2xl border-b border-line shadow-sm":"bg-transparent"}`} style={{paddingTop:"env(safe-area-inset-top)"}}>
      <nav className="max-w-[1140px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <button onClick={reset} className="flex items-center gap-3 cursor-pointer group" aria-label="Acasă — Doboș Dumitrița">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-brand/20 group-hover:ring-brand/40 transition-all duration-300">
            <Image src="/images/profile.jpg" alt="" width={36} height={36} className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold block leading-tight group-hover:text-brand transition-colors">Doboș Dumitrița</span>
            <span className="text-[10px] text-fg-4 leading-tight">Consultant Nutriție · AIPNSF</span>
          </div>
        </button>
        {stage==="quiz" && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({length:qt}).map((_,i)=>(
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i<=qi?"bg-wa":"bg-line"}`}/>
              ))}
            </div>
            <span className="text-[11px] text-fg-4 font-mono ml-1.5">{qi+1}/{qt}</span>
          </div>
        )}
        {stage==="done" && (
          <span className="text-xs text-wa font-semibold flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Quiz completat
          </span>
        )}
        {stage==="hero" && (
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bg-wa hover:bg-wa-hover text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md hover:shadow-lg" aria-label="Contactează pe WhatsApp">
            <WaIco c="w-4 h-4"/> <span className="hidden sm:inline">Scrie-mi</span><span className="sm:hidden">WhatsApp</span>
          </a>
        )}
      </nav>
    </header>
  );
}

/* Hero — dramatic split with dark stats bar */
function Hero({go}:{go:()=>void}) {
  return (
    <section className="relative overflow-hidden">
      {/* Background: warm gradient with subtle geometric accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-subtle/50 via-bg to-gold-subtle/30 pointer-events-none"/>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/[0.03] rounded-full blur-[100px] pointer-events-none"/>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.03] rounded-full blur-[100px] pointer-events-none"/>
      {/* Decorative diagonal line */}
      <div className="absolute top-0 right-[30%] w-px h-full bg-gradient-to-b from-transparent via-brand/10 to-transparent pointer-events-none hidden lg:block"/>

      <div className="relative max-w-[1140px] mx-auto px-4 sm:px-8 pt-6 sm:pt-16 pb-0 sm:pb-0">
        <div className="grid lg:grid-cols-[1fr,0.85fr] gap-8 lg:gap-14 items-center">

          <div className="order-2 lg:order-1 max-w-xl">
            {/* Credential pill */}
            <div className="a-up inline-flex items-center gap-2 bg-fg/[0.04] backdrop-blur border border-fg/[0.06] rounded-full px-4 py-2 mb-7">
              <span className="w-2 h-2 rounded-full bg-olive animate-pulse"/>
              <span className="text-xs font-medium text-fg-3">Consultant Nutriție Generală</span>
              <span className="text-[10px] text-fg-5">·</span>
              <span className="text-xs font-semibold text-brand">AIPNSF</span>
            </div>

            <h1 className="a-up d1 f-serif text-[1.85rem] xs:text-[2.125rem] sm:text-[3rem] lg:text-[3.5rem] font-normal leading-[1.08] mb-5 sm:mb-6 tracking-tight" style={{textShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
              De la 99.8 la{" "}
              <span className="font-bold text-grad">81.5 kg</span>
              <br/>
              <span className="text-fg-3 text-[0.65em]">— fără înfometare, fără suplimente</span>
            </h1>

            {/* Subheadline — tighter, more impactful */}
            <p className="a-up d2 text-fg-3 text-[15px] sm:text-[16px] leading-relaxed mb-2.5 max-w-[420px]">
              Transformare documentată: <strong className="text-fg font-semibold">-18.3 kg, -16 cm talie, -18 cm bust.</strong>{" "}
              Cu mâncare reală și suport zilnic.
            </p>
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="a-up d2 text-fg-4 text-sm mb-8 inline-flex items-center gap-1.5 hover:text-fg-3 transition-colors group">
              <IgIco c="w-3.5 h-3.5 group-hover:text-[#E1306C] transition-colors"/>
              <span className="font-medium">@dobos_dumitrita</span>
              <svg className="w-3.5 h-3.5 text-[#3897F0]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.7 14.5L6 12.2l1.4-1.4 2.9 2.9 6.3-6.3 1.4 1.4-7.7 7.7z"/></svg>
              <span className="text-fg-5">·</span>
              <span className="font-bold text-fg-3">16.7K</span>
            </a>

            {/* CTAs — bigger, bolder */}
            <div className="a-up d3 flex flex-col sm:flex-row gap-3 mb-6">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="group bg-wa hover:bg-wa-hover text-white text-[15px] sm:text-sm font-bold px-8 py-4 sm:py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-[1.02]">
                <WaIco c="w-5 h-5"/> Consultație gratuită
              </a>
              <button onClick={go} className="group text-[15px] sm:text-sm font-semibold text-fg-2 bg-surface border-2 border-line hover:border-brand/30 hover:bg-brand-subtle/20 px-7 py-4 sm:py-3.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                Fă quiz-ul <span className="text-fg-4 text-xs">(2 min)</span> <Arrow/>
              </button>
            </div>

            {/* Trust pills */}
            <div className="a-up d4 flex flex-wrap items-center gap-2 text-[11px] text-fg-4 font-medium">
              {["Consultație gratuită","Răspuns în 24h","Fără obligații"].map((t,i)=>(
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-line-subtle bg-surface/40">
                  <svg className="w-3 h-3 text-wa" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image — with overlapping stats card */}
          <div className="order-1 lg:order-2 a-up">
            <div className="relative max-w-sm sm:max-w-md lg:max-w-none mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-fg/10 gradient-border">
                <Image src="/images/hero.jpg" alt="Doboș Dumitrița — Consultant Nutriție Generală, cu centimetru" width={560} height={700} className="w-full h-auto" priority sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 480px"/>
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-fg/40 via-fg/10 to-transparent pointer-events-none"/>
              </div>
              {/* Floating credential badge */}
              <div className="absolute top-4 right-4 glass rounded-xl px-3 py-2.5 shadow-lg" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-olive/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-fg-2">AIPNSF</p>
                    <p className="text-[9px] text-fg-4">Nr. 598</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark stats bar — full width, creates visual drama */}
      <div className="relative mt-6 sm:mt-0">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-8">
          <div className="bg-fg text-surface shadow-xl shadow-fg/20 rounded-b-2xl sm:rounded-b-3xl px-4 sm:px-8 py-5 sm:py-6 relative noise">
            <div className="a-up d5 grid grid-cols-4 text-center">
              {[
                {el:<>-<Counter n={18} ms={800}/>.3<span className="text-xs font-normal text-fg-5 ml-0.5">kg</span></>,l:"greutate"},
                {el:<Counter n={136} s="+"/>,l:"comunitate"},
                {el:<Counter n={108} ms={1200}/>,l:"rețete"},
                {el:<>16.7<span className="text-xs font-normal text-fg-5 ml-0.5">K</span></>,l:"followers"},
              ].map((s,i)=>(
                <div key={i} className={`py-1 px-2 sm:px-4 ${i>0?"border-l border-white/10":""}`}>
                  <p className="text-lg sm:text-2xl font-bold">{s.el}</p>
                  <p className="text-fg-5 text-[10px] sm:text-xs mt-0.5 uppercase tracking-wider">{s.l}</p>
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
  return (
    <section ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden" aria-label="Acreditare profesională">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-[0.55fr,1fr] gap-8 lg:gap-16 items-start">
          <div className={v?"a-sl":""}>
            <div className="rounded-2xl overflow-hidden shadow-lg shadow-brand/5 border border-line cert-glow group cursor-zoom-in">
              <Image src="/images/aviz-certificate.jpg" alt="Aviz Liberă Practică Nr. 598 — AIPNSF 2025" width={440} height={780} className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 768px) 85vw, 40vw" loading="lazy"/>
            </div>
            <p className="text-[11px] text-fg-5 mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-olive"/>
              Certificat original · Vizibil pe Instagram → Highlight Studii
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {["certificate-0.jpg","certificate-1.jpg","certificate-2.jpg"].map((img,i)=>(
                <div key={i} className="img-zoom border border-line shadow-sm cert-glow">
                  <Image src={`/images/${img}`} alt={`Certificat absolvire ${i+1}`} width={140} height={200} className="w-full h-auto"/>
                </div>
              ))}
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="inline-flex items-center gap-2 bg-brand/5 border border-brand/10 rounded-full px-4 py-1.5 mb-6">
              <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">Acreditare verificată</span>
            </div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-8 leading-tight">Consultant Nutriție Generală<br/><span className="text-fg-3 font-light">certificat AIPNSF</span></h2>
            <div className="border border-line rounded-2xl overflow-hidden divide-y divide-line mb-8 shadow-sm">
              {([["Nume","Doboș Dumitrița"],["Domeniu","Consultant Nutriție Generală"],["Emitent","AIPNSF"],["Registru","Serie NG · Nr. 598"],["An","2025"]] as [string,string][]).map(([k,val],i)=>(
                <div key={k} className={`flex justify-between px-5 sm:px-6 py-3.5 text-[13px] sm:text-sm row-hover gap-2 ${i%2===0?"bg-surface-raised/50":""}`}>
                  <span className="text-fg-4 shrink-0">{k}</span><span className="font-semibold text-right">{val}</span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-olive-subtle to-olive-subtle/50 border border-olive/10 rounded-2xl px-6 py-5 relative overflow-hidden">
              <p className="text-sm font-semibold text-olive mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                Fitness Education School
              </p>
              <p className="text-xs text-fg-3 leading-relaxed">Curs absolvit 22.02 – 17.08.2025. Competențe: planuri alimentare, macro/micro nutrienți, calcul nutrițional, alimentația copiilor, vârstnicilor, în sarcină și alăptare.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Change 52: About with grapefruit photo */
function About() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 relative" aria-label="Despre Dumitrița">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className={v?"a-sl":""}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand/6 to-gold/6 pointer-events-none"/>
              <div className="relative rounded-2xl overflow-hidden shadow-xl gradient-border">
                <Image src="/images/IMG_8887.JPG" alt="Doboș Dumitrița — Consultant Nutriție Generală, portret creativ" width={480} height={640} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/>
              </div>
              <div className="absolute -bottom-4 -right-2 sm:right-4 glass rounded-xl px-4 py-3 shadow-lg" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-brand/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-brand">D</div>
                    <div className="w-6 h-6 rounded-full bg-wa/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-wa">V</div>
                    <div className="w-6 h-6 rounded-full bg-gold/20 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gold">+</div>
                  </div>
                  <div><p className="text-[11px] font-semibold">136+ membre</p><p className="text-[9px] text-fg-4">în comunitate</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-5"><span className="w-8 h-px bg-brand"/>Despre mine</div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-6 leading-tight">Bună, sunt Dumitrița.</h2>
            <div className="space-y-4 text-fg-3 text-[15px] leading-[1.75] mb-6">
              <p>Sunt <strong className="text-fg font-semibold">Consultant Nutriție Generală</strong> acreditată de Asociația Internațională de Psihologie, Nutriție, Sport și Fitness (AIPNSF).</p>
              <p>Am creat <strong className="text-fg font-semibold">Maratonul de Slăbit</strong> pentru femeile care au obosit de diete care nu funcționează. Nu promit miracole — promit un plan clar, mâncare gustoasă și suport zilnic.</p>
            </div>
            {/* Pull quote for emotional impact */}
            <div className="border-l-2 border-brand pl-5 mb-8">
              <p className="f-serif text-[15px] text-fg-2 italic leading-relaxed">&ldquo;Fiecare clientă are povestea ei, iar eu sunt aici să te ajut să o scrii pe a ta.&rdquo;</p>
            </div>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Vreau să discutăm despre obiectivele mele de nutriție. 🙏")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-wa hover:bg-wa-hover text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg">
              <WaIco c="w-4 h-4"/> Hai să discutăm
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* HowItWorks — horizontal connected timeline */
function HowItWorks({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  const steps = [
    {n:"1",title:"Completează quiz-ul",desc:"5 întrebări simple, 2 minute. Aflu exact ce ai nevoie.",icon:"📝",color:"bg-brand"},
    {n:"2",title:"Discutăm pe WhatsApp",desc:"Îți răspund în 24h cu un plan personalizat — gratuit.",icon:"💬",color:"bg-wa"},
    {n:"3",title:"Începi transformarea",desc:"Plan alimentar, rețete noi săptămânal și suport zilnic.",icon:"🌱",color:"bg-olive"},
  ];
  return (
    <section ref={ref} className="py-16 sm:py-28 px-4 sm:px-8 relative bg-surface-raised" aria-label="Cum funcționează">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent"/>
      <div className={`max-w-[900px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>3 pași simpli<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2.25rem] font-normal ${v?"a-up d1":""}`}>Cum începi transformarea?</h2>
        </div>

        {/* Connected horizontal steps */}
        <div className={`relative ${v?"a-up d2":""}`}>
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-[52px] left-[16%] right-[16%] h-px bg-gradient-to-r from-brand via-wa to-olive opacity-20"/>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map((s,i)=>(
              <div key={i} className="relative text-center group">
                {/* Step number + icon combo */}
                <div className="relative mx-auto mb-5 w-[104px] h-[104px]">
                  <div className="absolute inset-0 rounded-3xl bg-surface border-2 border-line group-hover:border-brand/30 transition-all shadow-sm group-hover:shadow-lg overflow-hidden">
                    {/* Colored top accent */}
                    <div className={`h-1 ${s.color} w-full`}/>
                  </div>
                  <div className="relative flex flex-col items-center justify-center h-full">
                    <span className="text-3xl mb-1" aria-hidden="true">{s.icon}</span>
                    <span className={`text-[10px] font-bold text-white ${s.color} w-5 h-5 rounded-full flex items-center justify-center`}>{s.n}</span>
                  </div>
                </div>
                <h3 className="font-bold text-[15px] mb-2">{s.title}</h3>
                <p className="text-xs text-fg-4 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
                {/* Arrow between steps (desktop) */}
                {i < 2 && <div className="hidden sm:block absolute top-[52px] -right-3 text-fg-5"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/></svg></div>}
              </div>
            ))}
          </div>
        </div>

        <div className={`text-center mt-12 ${v?"a-up d3":""}`}>
          <button onClick={go} className="group bg-brand hover:bg-brand-hover text-white text-sm font-bold px-8 py-3.5 rounded-full transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-md hover:shadow-lg">
            Începe quiz-ul acum <Arrow/>
          </button>
          <p className="text-[11px] text-fg-5 mt-3">Durează doar 2 minute · Fără obligații</p>
        </div>
      </div>
    </section>
  );
}

/* Change 54: Maraton with transformation-post.jpg */
function Maraton({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden" aria-label="Maratonul de Slăbit">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-[1fr,0.9fr] gap-8 lg:gap-16 items-center">
          <div className={v?"a-sl":""}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-5"><span className="w-8 h-px bg-brand"/>Programul principal</div>
            <h2 className="f-serif text-2xl sm:text-[2rem] font-normal mb-6 leading-tight">Maratonul de Slăbit</h2>
            <div className="space-y-3 text-fg-3 text-[15px] leading-[1.75]">
              <p>Un program de grup prin WhatsApp, cu tot ce ai nevoie ca să slăbești sănătos: plan alimentar personalizat, rețete noi în fiecare săptămână și un grup de femei care se susțin reciproc.</p>
              <p>Nu e o dietă de 2 săptămâni. E o schimbare de abordare — înveți ce, cât și cum să mănânci, iar rezultatele vin natural.</p>
            </div>
            <div className="mt-7 space-y-2 mb-8">
              {([
                {t:"Grup WhatsApp dedicat",s:"136+ membre, suport și motivare zilnică",ico:"👥"},
                {t:"Plan alimentar personalizat",s:"Adaptat greutății, stilului de viață și preferințelor tale",ico:"📋"},
                {t:"Rețete noi săptămânal",s:"Simple, gustoase, cu ingrediente accesibile",ico:"🍽️"},
                {t:"Ghidare continuă",s:"Întrebări, ajustări, feedback — oricând ai nevoie",ico:"💬"},
              ]).map(({t,s,ico})=>(
                <div key={t} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface/50 transition-all group border border-transparent hover:border-brand/10">
                  <div className="w-9 h-9 rounded-xl bg-brand-subtle/60 border border-brand/8 flex items-center justify-center shrink-0 mt-0.5 text-base group-hover:scale-110 transition-transform duration-300">{ico}</div>
                  <div><p className="text-sm font-semibold group-hover:text-brand transition-colors">{t}</p><p className="text-xs text-fg-4 mt-0.5">{s}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau detalii despre Maratonul de Slăbit. 🙏")}`} target="_blank" rel="noopener noreferrer" className="bg-wa hover:bg-wa-hover text-white text-[15px] sm:text-sm font-bold px-8 py-4 sm:py-3.5 rounded-full transition-all flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-lg">
                <WaIco c="w-5 h-5"/> Întreabă despre program
              </a>
              <button onClick={go} className="group text-[15px] sm:text-sm font-semibold text-fg-2 bg-surface border-2 border-line hover:border-brand/30 px-7 py-4 sm:py-3.5 rounded-full transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer">
                Fă quiz-ul <Arrow/>
              </button>
            </div>
          </div>
          <div className={v?"a-sr":""}>
            <div className="border border-line rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="bg-gradient-to-br from-fg via-fg-2 to-fg text-surface px-6 py-6 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-[0.03]"/>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl"/>
                <p className="f-serif text-xl font-normal tracking-wide relative">Maratonul de Slăbit</p>
                <p className="text-fg-5 text-xs mt-2 flex items-center gap-2 relative"><span className="w-2 h-2 rounded-full bg-wa animate-pulse"/>Rezultate verificate pe Instagram</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[{v:<Counter n={136} s="+"/>,l:"membre"},{v:<Counter n={108} ms={1200}/>,l:"rețete"},{v:<span className="f-serif">Ed. 2</span>,l:"curentă"}].map((s,i)=>(
                    <div key={i} className="p-3 rounded-xl bg-surface-raised"><p className="text-xl font-bold text-fg">{s.v}</p><p className="text-[10px] text-fg-4 mt-1 font-medium">{s.l}</p></div>
                  ))}
                </div>
                <div className="sep"/>
                <div className="space-y-2.5">
                  <p className="text-[10px] font-semibold text-fg-4 uppercase tracking-wider">Ce include</p>
                  {["Plan alimentar personalizat","Rețete noi în fiecare săptămână","Suport zilnic prin WhatsApp","Ghidare nutrițională continuă","Comunitate de susținere"].map(item=>(
                    <div key={item} className="flex items-center gap-2.5 text-sm py-0.5"><Check/><span>{item}</span></div>
                  ))}
                </div>
                <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună! Vreau să mă înscriu la Maratonul de Slăbit. 🙏")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-wa hover:bg-wa-hover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md hover:shadow-lg mt-1">
                  <WaIco c="w-4 h-4"/> Înscrie-te acum
                </a>
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
  const items = ["Acreditare AIPNSF","136+ membri în comunitate","108 rețete postate","-18.3 kg cea mai mare transformare","16.7K followers pe Instagram","Plan alimentar personalizat","Suport zilnic prin WhatsApp","Rețete noi săptămânal"];
  return (
    <div className="bg-fg text-surface overflow-hidden py-3.5" aria-hidden="true">
      <div className="marquee-track">
        {[...items,...items].map((t,i)=>(
          <span key={i} className="flex items-center gap-4 px-6 text-[11px] font-medium text-fg-5 whitespace-nowrap uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-brand to-gold shrink-0"/>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Change 55: Transformări section with 3 images */
function Transformari() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative overflow-hidden" aria-label="Transformări reale">
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4"><span className="w-8 h-px bg-brand"/>Transformări reale<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] font-normal mb-3 ${v?"a-up":""}`}>Clientele care au ales schimbarea</h2>
          <p className={`text-fg-3 text-sm max-w-md mx-auto ${v?"a-up d1":""}`}>Rezultate reale, documentate pe Instagram @dobos_dumitrita</p>
        </div>
        {/* 3-column grid with staggered heights for visual interest */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto ${v?"a-up d2":""}`}>
          <div className="relative group sm:mt-8">
            <div className="img-zoom shadow-lg aspect-[3/4]">
              <Image src="/images/img-telegram-2.jpg" alt="Transformare clientă — înainte și după Maratonul de Slăbit" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div><p className="text-white text-xs font-bold">Clientă Maraton</p><p className="text-white/70 text-[10px]">Transformare verificată</p></div>
            </div>
          </div>
          <div className="relative group">
            <div className="img-zoom shadow-lg aspect-[3/4]">
              <Image src="/images/photo-recent.jpg" alt="Rezultat clientă — program nutriție personalizat" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div><p className="text-white text-xs font-bold">Rezultat vizibil</p><p className="text-white/70 text-[10px]">Program personalizat</p></div>
            </div>
          </div>
          <div className="relative group sm:mt-8 col-span-2 sm:col-span-1">
            <div className="img-zoom shadow-lg aspect-[3/4] sm:aspect-[3/4]">
              <Image src="/images/transformation-post.jpg" alt="Doboș Dumitrița — Consultant Nutriție" width={400} height={533} className="w-full h-full object-cover"/>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div><p className="text-white text-xs font-bold">Dumitrița</p><p className="text-white/70 text-[10px]">Consultant Nutriție</p></div>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-fg-5 mt-4 text-center">Fotografii reale · Partajate cu permisiunea clientelor</p>
      </div>
    </section>
  );
}

/* Change 58: Results with elegant portrait instead of hero duplicate */
function Results() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden" aria-label="Rezultate și măsurători">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="max-w-2xl mb-10 sm:mb-16">
          <div className={`inline-flex items-center gap-3 mb-4 ${v?"a-up":""}`}>
            <span className="text-xs font-semibold text-brand uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Rezultate verificate
            </span>
            <span className="text-[10px] font-semibold text-olive bg-olive-subtle px-3 py-1 rounded-full flex items-center gap-1">
              <IgIco c="w-3 h-3"/> Documentat pe Instagram
            </span>
          </div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] lg:text-[2.5rem] font-normal leading-tight ${v?"a-up d1":""}`}>Rezultatele vorbesc<br/><span className="text-fg-3 font-light">de la sine.</span></h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 items-start mb-10 sm:mb-16">
          <div className={`space-y-3 ${v?"a-up d2":""}`}>
            {/* Change 59: using client-result.jpg (elegant portrait) */}
            <div className="img-zoom shadow-lg"><Image src="/images/client-result.jpg" alt="Doboș Dumitrița — portret profesional elegant cu gold choker" width={540} height={720} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/></div>
            {/* Change 60: fixed food1.jpg alt text */}
            <div className="img-zoom shadow-lg"><Image src="/images/food1.jpg" alt="Transformare @veradurnea7 — înainte și după, Maratonul de Slăbit" width={540} height={540} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/></div>
            <div className="img-zoom shadow-lg"><Image src="/images/client-result-2.jpg" alt="Clientă Maraton de Slăbit — transformare vizibilă" width={540} height={540} className="w-full h-auto" sizes="(max-width: 768px) 90vw, 45vw"/></div>
            <div className="grid grid-cols-3 gap-2">
              {["result-client-1.jpg","result-client-2.jpg","result-client-3.jpg"].map((img,i)=>(
                <div key={i} className="img-zoom shadow-sm"><Image src={`/images/${img}`} alt={`Rezultat clientă ${i+1} — program nutriție`} width={180} height={180} className="w-full h-auto object-cover"/></div>
              ))}
            </div>
            <p className="text-[11px] text-fg-5 flex items-center gap-1.5"><IgIco c="w-3 h-3"/> Fotografii reale de pe Instagram @dobos_dumitrita</p>
          </div>
          {/* Change 61: sticky measurement table */}
          <div className={`sticky top-20 ${v?"a-up d3":""}`}>
            <div className="border border-line rounded-2xl overflow-hidden shadow-lg shadow-brand/5">
              <div className="px-5 py-3.5 border-b border-line bg-gradient-to-r from-bg to-surface-raised">
                <p className="text-xs font-semibold text-fg-3 uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  Măsurători verificate
                </p>
              </div>
              <div className="divide-y divide-line-subtle text-sm">
                <div className="grid grid-cols-4 px-4 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-semibold text-fg-4 uppercase tracking-wider bg-surface-raised/50"><span>Măsură</span><span className="text-center">Înainte</span><span className="text-center">După</span><span className="text-right">Dif.</span></div>
                {/* Change 62: highlight weight row */}
                {measurements.map(r=>(
                  <div key={r.m} className={`grid grid-cols-4 px-4 sm:px-5 py-2.5 sm:py-3 hover:bg-brand-subtle/20 transition-colors text-[12px] sm:text-sm group ${r.m==="Greutate"?"bg-gradient-to-r from-brand-subtle/30 to-brand-subtle/10 border-l-2 border-brand":""}`}>
                    <span className="font-semibold">{r.m}</span><span className="text-center text-fg-4">{r.b}</span><span className="text-center font-medium">{r.a}</span><span className="text-right font-bold text-brand">{r.d}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-2.5 border-t border-line text-[11px] text-fg-4 bg-surface-raised/50 flex items-center gap-1.5"><IgIco c="w-3 h-3"/> Sursă: @dobos_dumitrita</div>
            </div>
            {/* Change 63: stat highlight cards */}
            <div className="grid grid-cols-3 gap-2.5 mt-3">
              {[{v:"-18.3",u:"kg",l:"greutate"},{v:"-16",u:"cm",l:"talie"},{v:"-18",u:"cm",l:"bust"}].map((s,i)=>(
                <div key={i} className="text-center p-2.5 rounded-xl bg-surface border border-line"><p className="text-lg font-bold text-brand">{s.v}<span className="text-xs font-normal ml-0.5">{s.u}</span></p><p className="text-[10px] text-fg-4">{s.l}</p></div>
              ))}
            </div>
          </div>
        </div>
        {/* Change 64: testimonials with better cards */}
        <div className="mb-14">
          <p className={`text-xs font-semibold uppercase tracking-widest text-fg-4 mb-5 flex items-center gap-2 ${v?"a-up":""}`}><span className="w-6 h-px bg-fg-5"/>Ce spun clientele</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map((r,i)=>(
              <div key={i} className={`relative bg-surface border border-line rounded-2xl p-6 sm:p-7 card-hover shadow-sm ${v?"a-up":""}`} style={{animationDelay:`${.3+i*.1}s`}}>
                <div className="quote-mark">&ldquo;</div>
                <div className="flex gap-0.5 mb-3 mt-2">{Array.from({length:5}).map((_,j)=><Star key={j}/>)}</div>
                <p className="f-serif text-[14px] sm:text-[15px] text-fg-2 leading-relaxed mb-5">{r.q}</p>
                <div className="flex items-center gap-3 pt-3 border-t border-line-subtle">
                  {/* Avatar initial */}
                  <div className="w-9 h-9 rounded-full bg-brand-subtle flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand">{r.name.replace("@","").charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-fg-2 block truncate">{r.name}</span>
                    <span className="text-[10px] text-fg-5">{r.src}</span>
                  </div>
                  <span className="font-bold text-brand text-xs bg-brand-subtle/50 px-2.5 py-1 rounded-full shrink-0">{r.kg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mid-page CTA — dark card for contrast */}
        <div className={`relative overflow-hidden rounded-3xl text-center ${v?"a-up d4":""}`}>
          <div className="bg-fg text-surface p-8 sm:p-12 relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-wa/10 rounded-full blur-[80px] pointer-events-none"/>
            <h3 className="f-serif text-2xl sm:text-3xl font-normal mb-3">Vrei rezultate similare?</h3>
            <p className="text-fg-5 text-[15px] mb-8 max-w-lg mx-auto">Primul pas e o discuție gratuită pe WhatsApp. Îți voi crea un plan personalizat pentru obiectivele tale.</p>
            <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Am văzut rezultatele de pe site și vreau să discutăm. 🙏")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 bg-wa hover:bg-wa-hover text-white font-bold text-lg px-10 py-4 rounded-full transition-all hover:scale-[1.02] shadow-xl a-glow">
              <WaIco c="w-5 h-5"/> Scrie-mi pe WhatsApp
            </a>
            <p className="text-xs text-fg-5/60 mt-5">Consultație gratuită · Fără obligații · Răspuns în 24h</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Gallery — dynamic asymmetric grid */
function Gallery() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-14 sm:py-24 px-4 sm:px-8 relative" aria-label="Rețete din program">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-3"><span className="w-8 h-px bg-brand"/>Rețete din program</div>
            <h2 className="f-serif text-xl sm:text-2xl font-normal">Mâncare sănătoasă care arată<br className="hidden sm:block"/> <span className="text-fg-3">(și e) gustoasă</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-4 font-semibold bg-fg/[0.04] px-3 py-1.5 rounded-full border border-line">108+ rețete postate</span>
          </div>
        </div>
        {/* Asymmetric grid: 1 large + 3 stacked */}
        <div className={`grid grid-cols-2 sm:grid-cols-12 gap-3 sm:gap-4 ${v?"a-up d1":""}`}>
          {/* Large feature image */}
          <div className="col-span-1 sm:col-span-5 relative group">
            <div className="img-zoom shadow-lg aspect-[3/4] sm:aspect-auto sm:h-full">
              <Image src="/images/pinned1.jpg" alt="Aperitive sănătoase din programul de nutriție" width={500} height={667} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 40vw"/>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div><p className="text-white text-sm font-bold">Aperitive sănătoase</p><p className="text-white/70 text-xs">Din programul de nutriție</p></div>
            </div>
          </div>
          {/* 3 stacked images */}
          <div className="col-span-1 sm:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative group">
              <div className="img-zoom shadow-md aspect-[4/3]">
                <Image src="/images/pinned2.jpg" alt="Rulouri cu legume și carne slabă" width={400} height={300} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 30vw"/>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-white text-xs font-semibold">Rulouri cu legume</p>
              </div>
            </div>
            <div className="relative group">
              <div className="img-zoom shadow-md aspect-[4/3]">
                <Image src="/images/food-aperitiv.jpg" alt="Aperitiv sănătos din programul Maraton" width={400} height={300} className="w-full h-full object-cover" sizes="(max-width: 640px) 50vw, 30vw"/>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-white text-xs font-semibold">Aperitiv gustos</p>
              </div>
            </div>
            <div className="relative group sm:col-span-2">
              <div className="img-zoom shadow-md aspect-[2/1]">
                <Image src="/images/food2.jpg" alt="Masă sănătoasă completă din planul alimentar" width={700} height={350} className="w-full h-full object-cover" sizes="(max-width: 640px) 100vw, 55vw"/>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-fg/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <p className="text-white text-xs font-semibold">Masă completă — plan alimentar personalizat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Change 68: FAQ with 6 items + centered + card style */
function FAQ() {
  const {ref,v} = useVisible();
  const [open,setOpen] = useState<number|null>(null);
  return (
    <section ref={ref} className="py-14 sm:py-28 px-4 sm:px-8 bg-surface-raised relative overflow-hidden" aria-label="Întrebări frecvente">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent"/>
      <div className={`max-w-2xl mx-auto ${v?"":"opacity-0"}`}>
        <div className="text-center mb-8 sm:mb-12">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-widest mb-4 ${v?"a-up":""}`}><span className="w-8 h-px bg-brand"/>Întrebări frecvente<span className="w-8 h-px bg-brand"/></div>
          <h2 className={`f-serif text-2xl sm:text-[2rem] font-normal mb-3 ${v?"a-up d1":""}`}>Răspunsuri la întrebările tale</h2>
          <p className={`text-fg-4 text-sm ${v?"a-up d2":""}`}>Nu ai găsit răspunsul? <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-wa font-semibold hover:underline">Scrie-mi pe WhatsApp</a></p>
        </div>
        <div className={`space-y-2.5 ${v?"a-up d2":""}`}>
          {faqs.map((f,i)=>(
            <div key={i} className={`bg-surface border rounded-2xl transition-all duration-300 overflow-hidden ${open===i?"border-brand/20 shadow-md":"border-line shadow-sm"}`}>
              <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer group" aria-expanded={open===i} aria-controls={`faq-${i}`}>
                <div className="flex items-center gap-3 pr-4 sm:pr-6">
                  <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors ${open===i?"bg-brand text-white":"bg-surface-raised text-fg-4"}`}>{i+1}</span>
                  <span className={`text-[14px] sm:text-[15px] font-semibold transition-colors ${open===i?"text-brand":"group-hover:text-brand"}`}>{f.q}</span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${open===i?"bg-brand/10":"bg-surface-raised"}`}><ChevD open={open===i}/></div>
              </button>
              <div id={`faq-${i}`} role="region" className={`overflow-hidden transition-all duration-300 ${open===i?"max-h-60 opacity-100":"max-h-0 opacity-0"}`}>
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0"><p className="text-[13px] sm:text-sm text-fg-3 leading-relaxed">{f.a}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Final CTA — dark section for maximum contrast */
function CTA() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="relative overflow-hidden" aria-label="Contact final">
      <div className="bg-fg text-surface py-16 sm:py-28 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-[0.02] pointer-events-none"/>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-wa/5 rounded-full blur-[100px] pointer-events-none"/>

        <div className={`relative max-w-[800px] mx-auto text-center ${v?"a-up":"opacity-0"}`}>
          {/* Profile */}
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-wa/30 mx-auto mb-8 shadow-2xl">
            <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={80} height={80} className="w-full h-full object-cover"/>
          </div>

          <h2 className="f-serif text-[1.625rem] sm:text-[2.5rem] lg:text-[3rem] font-normal leading-[1.1] mb-5 tracking-tight">
            Aceeași persoană.<br/>
            <span className="text-grad">Altă energie. Altă viață.</span>
          </h2>

          <div className="relative max-w-md mx-auto mb-3">
            <span className="absolute -top-4 -left-2 text-4xl text-brand/20 f-serif select-none" aria-hidden="true">&ldquo;</span>
            <p className="text-fg-5 text-[15px] sm:text-base italic f-serif px-6">
              Fiecare transformare începe cu o singură decizie.
            </p>
            <span className="absolute -bottom-6 -right-2 text-4xl text-brand/20 f-serif select-none" aria-hidden="true">&rdquo;</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-fg-5 font-medium mb-10">
            <span>Consultație gratuită</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/50"/>
            <span>Răspuns în 24h</span>
            <span className="w-1 h-1 rounded-full bg-fg-5/50"/>
            <span>Fără obligații</span>
          </div>

          <a href={`https://wa.me/${WA}?text=${encodeURIComponent("Bună Dumitrița! Sunt gata pentru o schimbare. Vorbim? 🙏")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2.5 bg-wa hover:bg-wa-hover text-white text-lg font-bold px-12 py-5 rounded-full transition-all hover:scale-[1.02] shadow-2xl a-glow w-full sm:w-auto">
            <WaIco c="w-6 h-6"/> Consultație Gratuită pe WhatsApp
          </a>

          <p className="text-[11px] text-fg-5/60 mt-6">Doboș Dumitrița · Consultant Nutriție Generală · AIPNSF Nr. 598</p>
        </div>
      </div>
    </section>
  );
}

/* Footer — dark to match CTA flow */
function Foot() {
  return (
    <footer className="bg-fg text-surface px-4 sm:px-8 py-10 relative" role="contentinfo">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>
      <div className="max-w-[1140px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/15 shrink-0"><Image src="/images/profile.jpg" alt="" width={40} height={40} className="w-full h-full object-cover"/></div>
            <div><span className="text-sm font-semibold block">Doboș Dumitrița</span><span className="text-[11px] text-fg-5">Consultant Nutriție Generală · AIPNSF</span></div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-fg-5 hover:text-white border border-white/15 hover:border-white/30 px-4 py-2 rounded-full transition-all flex items-center gap-1.5">
              <IgIco c="w-3.5 h-3.5"/> @dobos_dumitrita
            </a>
            {[
              {href:"https://www.threads.com/@dobos_dumitrita",icon:<ThreadsIco c="w-4 h-4"/>,label:"Threads"},
              {href:`https://wa.me/${WA}`,icon:<WaIco c="w-4 h-4"/>,label:"WhatsApp"},
            ].map((s,i)=>(
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-fg-5 hover:text-white hover:border-white/30 transition-all" aria-label={s.label}>{s.icon}</a>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-[11px] text-fg-5/60">© {new Date().getFullYear()} Doboș Dumitrița. Toate drepturile rezervate.</p>
          <p className="text-[11px] text-fg-5/60">Aviz Liberă Practică · Serie NG Nr. 598 · AIPNSF 2025</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════ Quiz ═══════ */
/* Change 72: thicker progress bar with step count */
function Progress({i,t}:{i:number;t:number}) {
  const p=((i+1)/t)*100;
  return (
    <div className="max-w-md mx-auto mb-10">
      <div className="flex justify-between text-xs text-fg-4 mb-2.5">
        <span className="font-medium">Întrebarea {i+1} din {t}</span>
        <span className="font-mono font-semibold text-brand">{Math.round(p)}%</span>
      </div>
      <div className="h-2 bg-line-subtle rounded-full overflow-hidden">
        <div className="progress-bar h-full bg-gradient-to-r from-wa to-wa-hover rounded-full" style={{width:`${p}%`}}/>
      </div>
    </div>
  );
}

/* Change 73: quiz cards with emoji icons */
function QCard({q,qi,pick}:{q:Q;qi:number;pick:(v:string)=>void}) {
  const [selected,setSelected] = useState<string|null>(null);
  const handlePick = (v:string) => { setSelected(v); setTimeout(() => pick(v), 280); };

  return (
    <div className="a-up max-w-md mx-auto">
      <h2 className="f-serif text-xl sm:text-2xl font-normal text-center mb-2">{q.question}</h2>
      {q.sub && <p className="text-sm text-fg-4 text-center mb-7">{q.sub}</p>}
      <div className="space-y-2.5">
        {q.opts.map(o=>(
          <button key={o.value} onClick={()=>!selected&&handlePick(o.value)} className={`q-opt w-full flex items-center gap-3 bg-surface border-2 rounded-2xl px-5 py-4 text-left cursor-pointer ${selected===o.value?"border-wa bg-wa/5 shadow-md":"border-line"} ${selected&&selected!==o.value?"opacity-35":""}`}>
            {/* Change 74: emoji icon on quiz options */}
            <span className="text-lg shrink-0" aria-hidden="true">{o.icon}</span>
            <span className="text-[14px] sm:text-[15px] text-fg-2 font-medium flex-1">{o.label}</span>
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selected===o.value?"border-wa bg-wa":"border-fg-5"}`}>
              {selected===o.value && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
            </span>
          </button>
        ))}
      </div>
      {/* Change 75: privacy note with lock icon */}
      {qi===0 && <p className="text-center text-[11px] text-fg-5 mt-6 flex items-center justify-center gap-1.5">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        Răspunsurile tale sunt confidențiale · Quiz 2 min
      </p>}
    </div>
  );
}

/* Change 76: Done screen with celebration + personalized recommendations */
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

  return (
    <div className="a-scale-in max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-wa/20 mx-auto mb-5 shadow-lg">
          <Image src="/images/profile.jpg" alt="Doboș Dumitrița" width={80} height={80} className="w-full h-full object-cover"/>
        </div>
        <div className="inline-flex items-center gap-2 bg-wa/10 text-wa font-semibold text-xs px-4 py-1.5 rounded-full mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          Quiz completat!
        </div>
        <h2 className="f-serif text-2xl font-normal mb-2">{titles[answers.goal]||"Planul tău personalizat"}</h2>
        {/* Change 78: personalized message */}
        <p className="text-sm text-fg-3">{recs[answers.goal]||"Îți voi crea un plan adaptat nevoilor tale."}</p>
      </div>

      <div className="border-2 border-line rounded-2xl divide-y divide-line mb-6 overflow-hidden shadow-sm">
        {([["Obiectiv",gl[answers.goal]||answers.goal],["Provocare",cl[answers.challenge]||answers.challenge],["Suport dorit",sl[answers.support]||answers.support]] as [string,string][]).map(([k,val])=>(
          <div key={k} className="flex justify-between px-5 py-3.5 text-[13px] sm:text-sm row-hover gap-2">
            <span className="text-fg-4 shrink-0">{k}</span><span className="font-semibold text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* Change 79: next step explanation */}
      <div className="bg-brand-subtle/30 border border-brand/10 rounded-xl px-4 py-3 mb-6 text-center">
        <p className="text-xs text-fg-3">Apasă butonul de mai jos și voi primi mesajul tău cu răspunsurile din quiz. Răspund în maxim 24h.</p>
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer" className="a-glow w-full bg-wa hover:bg-wa-hover text-white font-bold py-4 rounded-full flex items-center justify-center gap-2.5 text-[15px] transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl">
        <WaIco c="w-5 h-5"/> Scrie-mi pe WhatsApp
      </a>
      <p className="text-center text-xs text-fg-4 mt-2.5">Răspunsurile tale vor fi trimise automat în mesaj</p>

      <div className="mt-8 pt-5 border-t border-line-subtle grid grid-cols-3 gap-3">
        {[{v:"24h",l:"răspuns maxim"},{v:"Gratuită",l:"consultația"},{v:"Zero",l:"obligații"}].map((s,i)=>(
          <div key={i} className="text-center p-2.5 rounded-xl bg-surface-raised"><span className="block font-bold text-wa text-sm">{s.v}</span><span className="text-[10px] text-fg-4">{s.l}</span></div>
        ))}
      </div>
    </div>
  );
}

/* Scroll to top button */
function ScrollTop() {
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const h=()=>{const pct=scrollY/(document.documentElement.scrollHeight-innerHeight);setShow(pct>.6)};
    addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h);
  },[]);
  if(!show) return null;
  return (
    <button onClick={()=>scrollTo({top:0,behavior:"smooth"})} className="fixed bottom-5 left-5 z-50 w-10 h-10 rounded-full bg-surface border border-line shadow-md flex items-center justify-center text-fg-4 hover:text-fg-2 hover:shadow-lg transition-all a-fade cursor-pointer" aria-label="Înapoi sus">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
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
    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="float-wa fixed bottom-5 right-5 z-50 a-scl group" aria-label="Contactează pe WhatsApp" onMouseEnter={()=>setTooltip(true)} onMouseLeave={()=>setTooltip(false)}>
      <div className="relative">
        <div className="absolute inset-0 bg-wa rounded-full opacity-20 a-glow"/>
        <div className="relative w-14 h-14 bg-wa hover:bg-wa-hover rounded-full flex items-center justify-center shadow-lg shadow-wa/15 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-wa/25">
          <WaIco c="w-7 h-7 text-white"/>
          {/* Notification dot */}
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full"/>
          </span>
        </div>
        {tooltip && (
          <div className="absolute bottom-16 right-0 bg-fg text-surface text-xs font-bold px-3.5 py-2 rounded-xl whitespace-nowrap shadow-lg a-fade">
            Scrie-mi pe WhatsApp!
            <div className="absolute -bottom-1 right-4 w-2 h-2 bg-fg rotate-45"/>
          </div>
        )}
      </div>
    </a>
  );
}

/* ═══════ PAGE ═══════ */
/* Change 81: added HowItWorks section to page flow */
export default function Home() {
  const [stage,setStage] = useState<"hero"|"quiz"|"done">("hero");
  const [qi,setQi] = useState(0);
  const [ans,setAns] = useState<Record<string,string>>({});

  const go = useCallback(()=>{setStage("quiz");scrollTo({top:0,behavior:"smooth"})},[]);
  const pick = useCallback((v:string)=>{
    const q=quiz[qi]; const next={...ans,[q.id]:v}; setAns(next);
    if(qi<quiz.length-1) setQi(qi+1);
    else {setStage("done");scrollTo({top:0,behavior:"smooth"})}
  },[qi,ans]);
  const back = useCallback(()=>{if(qi>0) setQi(qi-1); else setStage("hero")},[qi]);
  const reset = useCallback(()=>{setStage("hero");setQi(0);setAns({});scrollTo({top:0,behavior:"smooth"})},[]);

  return (
    <div id="main-content" className="min-h-screen flex flex-col">
      {/* Brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-brand via-gold to-brand w-full shrink-0" aria-hidden="true"/>
      <Nav stage={stage} qi={qi} qt={quiz.length} reset={reset}/>

      {stage==="hero" && <>
        <Hero go={go}/>
        <Credentials/>
        <About/>
        <HowItWorks go={go}/>
        <Maraton go={go}/>
        <Transformari/>
        <TrustStrip/>
        <Results/>
        <Gallery/>
        <FAQ/>
        <CTA/>
      </>}

      {stage==="quiz" && (
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-16 relative">
          {/* Subtle background pattern for quiz */}
          <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none"/>
          <div className="absolute top-20 right-10 w-40 h-40 bg-brand/[0.03] rounded-full blur-[60px] pointer-events-none"/>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-wa/[0.03] rounded-full blur-[60px] pointer-events-none"/>
          <div className="relative flex items-center gap-2 justify-center mb-8 a-fade">
            <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-brand/20"><Image src="/images/profile.jpg" alt="" width={28} height={28} className="w-full h-full object-cover"/></div>
            <span className="text-xs text-fg-4 font-medium">Quiz de nutriție · Doboș Dumitrița</span>
          </div>
          <Progress i={qi} t={quiz.length}/>
          <QCard q={quiz[qi]} qi={qi} pick={pick} key={quiz[qi].id}/>
          <button onClick={back} className="mt-10 mx-auto flex items-center gap-2 text-sm text-fg-4 hover:text-fg-2 transition-colors cursor-pointer font-medium">
            <Back/> {qi>0?"Înapoi":"Pagina principală"}
          </button>
        </main>
      )}

      {stage==="done" && (
        <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-16 relative">
          {/* Celebration decorative bg */}
          <div className="absolute inset-0 bg-gradient-to-b from-wa/[0.03] via-transparent to-brand/[0.02] pointer-events-none"/>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[10%] w-3 h-3 rounded-full bg-wa/20 a-float" style={{animationDelay:"0s"}}/>
            <div className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-brand/20 a-float" style={{animationDelay:"0.5s"}}/>
            <div className="absolute top-32 left-[25%] w-2.5 h-2.5 rounded-full bg-gold/20 a-float" style={{animationDelay:"1s"}}/>
            <div className="absolute bottom-20 right-[20%] w-3 h-3 rounded-full bg-olive/15 a-float" style={{animationDelay:"1.5s"}}/>
            <div className="absolute bottom-32 left-[15%] w-2 h-2 rounded-full bg-wa/15 a-float" style={{animationDelay:"2s"}}/>
          </div>
          <Done answers={ans}/>
        </main>
      )}

      <Foot/>
      <FloatWA/>
      {stage==="hero" && <ScrollTop/>}
    </div>
  );
}
