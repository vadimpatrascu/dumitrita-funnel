"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ═══════ Types ═══════ */
interface Q { id:string; question:string; sub?:string; opts:{label:string; value:string}[] }

/* ═══════ Data ═══════ */
const WA = "393288461370";

const quiz: Q[] = [
  { id:"goal", question:"Care este obiectivul tău principal?", sub:"Alege varianta care te descrie cel mai bine", opts:[
    {label:"Vreau să slăbesc sănătos",value:"slabire"},
    {label:"Vreau să mă mențin în formă",value:"mentinere"},
    {label:"Vreau să mănânc mai sănătos",value:"sanatos"},
    {label:"Am o condiție medicală",value:"medical"},
  ]},
  { id:"tried", question:"Ai mai încercat diete înainte?", sub:"Nu există răspunsuri greșite", opts:[
    {label:"Da, multe — fără rezultat durabil",value:"multe"},
    {label:"Da, dar am revenit la kg inițiale",value:"yoyo"},
    {label:"Câteva, cu succes parțial",value:"partial"},
    {label:"Nu, e prima dată",value:"prima"},
  ]},
  { id:"eating", question:"Cum arată alimentația ta acum?", sub:"Gândește-te la o zi obișnuită", opts:[
    {label:"Mănânc neregulat, ce apuc",value:"neregulat"},
    {label:"Gătesc, dar nu știu ce-i sănătos",value:"gatesc"},
    {label:"Mănânc destul de bine deja",value:"bine"},
    {label:"Am restricții / intoleranțe alimentare",value:"restrictii"},
  ]},
  { id:"challenge", question:"Ce te oprește cel mai mult?", sub:"Identifică principalul obstacol", opts:[
    {label:"Nu am timp să gătesc zilnic",value:"timp"},
    {label:"Nu știu ce ar trebui să mănânc",value:"nu_stiu"},
    {label:"Poftele și mâncatul emoțional",value:"pofte"},
    {label:"Lipsa de motivație și disciplină",value:"motivatie"},
  ]},
  { id:"support", question:"Ce tip de ajutor cauți?", sub:"Alege ce ți-ar fi cel mai util acum", opts:[
    {label:"Plan alimentar personalizat",value:"plan"},
    {label:"Rețete simple și gustoase",value:"retete"},
    {label:"Ghidare și motivare continuă",value:"ghidare"},
    {label:"Program complet de transformare",value:"complet"},
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
  { name:"Clientă Maraton, 40 ani", q:"Rezultatul meu în poze și cifre. Aceasta a fost cea mai bună decizie pe care am luat-o în noiembrie, acum sunt mândră că la 40 ani pot arăta bine! Succes tuturor!", kg:"-18.3 kg", src:"Postare fixată Instagram" },
  { name:"Clientă transformare", q:"Drumul nu e ușor, dar rezultatele vorbesc de la sine. Această poveste arată ce se întâmplă când nu mai cauți scuze, ci soluții.", kg:"Vizibil", src:"Postare @dobos_dumitrita, Oct 2025" },
  { name:"Comentariu verificat", q:"Ce transformare frumoasă! Bravo!", kg:"—", src:"@sanduta_stepan pe Instagram" },
];

const faqs = [
  {q:"Cum funcționează Maratonul de Slăbit?", a:"Program cu suport zilnic prin grupul de WhatsApp (136+ membri), rețete noi săptămânal și plan alimentar personalizat. Fără diete drastice, fără suplimente — doar mâncare reală, susținere zilnică și rezultate vizibile."},
  {q:"Trebuie să renunț la alimentele preferate?", a:"Nu. Cu mine înveți să te alimentezi sănătos și gustos. Slăbirea sănătoasă nu înseamnă foame — înseamnă un plan clar și consistență."},
  {q:"Ce rezultate au avut participantele?", a:"Cea mai documentată transformare pe Instagram: -18.3 kg, -16 cm talie, -18 cm bust, de la 99.8 la 81.5 kg. Toate măsurătorile sunt publice pe pagina @dobos_dumitrita."},
  {q:"Cât costă un plan alimentar?", a:"Depinde de nevoile tale. Completează quiz-ul și scrie-mi pe WhatsApp — discutăm gratuit despre situația ta și găsim varianta potrivită."},
  {q:"Am o condiție medicală. Mă poți ajuta?", a:"Ca Consultant Nutriție Generală acreditat AIPNSF, Dumitrița are competențe în alimentația adaptată diferitelor condiții. Discuți pe WhatsApp despre situația ta specifică."},
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
function useVisible(t=0.12) {
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
    const o=new IntersectionObserver(([e])=>{if(e.isIntersecting&&!go){setGo(true);o.disconnect()}},{threshold:.5});
    o.observe(el); return ()=>o.disconnect();
  },[go]);
  useEffect(()=>{
    if(!go) return; let cur=0; const step=n/45; const iv=ms/45;
    const t=setInterval(()=>{cur+=step;if(cur>=n){setC(n);clearInterval(t)}else setC(Math.floor(cur))},iv);
    return ()=>clearInterval(t);
  },[go,n,ms]);
  return <span ref={ref} className="stat">{go?c.toLocaleString("ro-RO"):"0"}{s}</span>;
}

/* ═══════ Icons ═══════ */
const WaIco=({c="w-5 h-5"}:{c?:string})=><svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
const IgIco=({c="w-5 h-5"}:{c?:string})=><svg className={c} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const Arrow=()=><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>;
const ChevD=({open}:{open:boolean})=><svg className={`w-4 h-4 text-fg-4 transition-transform duration-300 ${open?"rotate-180":""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>;
const Back=()=><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7"/></svg>;

/* ═══════════════════ SECTIONS ═══════════════════ */

/* ─── Nav ─── */
function Nav({stage,qi,qt,reset}:{stage:string;qi:number;qt:number;reset:()=>void}) {
  const [s,setS]=useState(false);
  useEffect(()=>{const h=()=>setS(scrollY>30);addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h)},[]);
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${s?"bg-surface/95 backdrop-blur-2xl border-b border-line":"bg-transparent"}`}>
      <nav className="max-w-[1140px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <button onClick={reset} className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-line">
            <Image src="/images/profile.jpg" alt="" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-medium hidden sm:block">Doboș Dumitrița</span>
        </button>
        {stage==="quiz" && <span className="text-xs text-fg-4 font-mono">{qi+1}/{qt}</span>}
        {stage==="hero" && (
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-fg-4 hover:text-fg-2 transition-colors"><IgIco c="w-[18px] h-[18px]"/></a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-fg-2 hover:text-brand transition-colors flex items-center gap-1.5">
              Contactează-mă <Arrow/>
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}

/* ─── Hero ─── */
function Hero({go}:{go:()=>void}) {
  return (
    <section className="relative">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 pt-8 sm:pt-16 pb-20 sm:pb-28">
        <div className="grid lg:grid-cols-[1fr,0.85fr] gap-12 lg:gap-20 items-end">

          {/* Copy */}
          <div className="order-2 lg:order-1 max-w-xl">
            <p className="a-up text-xs font-medium uppercase tracking-[.2em] text-brand mb-6">
              Consultant Nutriție Generală — AIPNSF
            </p>

            <h1 className="a-up d1 f-serif text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-normal leading-[1.1] mb-6">
              Clienta mea a slăbit<br/>
              <span className="font-bold text-grad">26 kg în doar 5 luni</span><br/>
              <span className="text-fg-3 text-[0.65em] font-light italic">fără înfometare!</span>
            </h1>

            <p className="a-up d2 text-fg-3 text-[15px] sm:text-base leading-relaxed mb-4 max-w-md">
              Cu mine înveți să te alimentezi sănătos și gustos.
              Transformări reale, fără diete extreme — doar un plan clar, suport și consistență.
            </p>
            <p className="a-up d2 text-fg-4 text-sm italic mb-10 max-w-md f-serif">
              &ldquo;Schimbarea începe cu un singur pas.&rdquo;
            </p>

            <div className="a-up d3 flex flex-col sm:flex-row gap-3">
              <button onClick={go} className="group bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
                Începe quiz-ul gratuit <Arrow/>
              </button>
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-fg-2 border border-line hover:border-fg-4 px-6 py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                <WaIco c="w-4 h-4 text-wa"/> Scrie-mi direct
              </a>
            </div>

            {/* Stats — minimal, no emojis */}
            <div className="a-up d4 mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <div><p className="text-lg sm:text-xl font-semibold text-fg"><Counter n={16700} s="+"/></p><p className="text-fg-4 mt-0.5">urmăritori</p></div>
              <div><p className="text-lg sm:text-xl font-semibold text-fg"><Counter n={108} ms={1200}/></p><p className="text-fg-4 mt-0.5">rețete postate</p></div>
              <div><p className="text-lg sm:text-xl font-semibold text-fg">136+</p><p className="text-fg-4 mt-0.5">membri comunitate</p></div>
            </div>
          </div>

          {/* Photo — asymmetric, no floating badges */}
          <div className="order-1 lg:order-2 a-up">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <Image src="/images/hero.jpg" alt="Doboș Dumitrița" width={560} height={700} className="w-full h-auto" priority/>
              </div>
              {/* Subtle credential line — not a floating card */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-fg-4">
                <span className="w-8 h-px bg-brand"/>
                <span>Aviz Liberă Practică AIPNSF · Nr. 598 · 2025</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Credentials (certificate image + compact details) ─── */
function Credentials() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-5 sm:px-8 bg-surface-raised">
      <div className="sep mb-20"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-[0.55fr,1fr] gap-10 lg:gap-16 items-start">

          {/* Certificate — contained height */}
          <div className={v?"a-sl":""}>
            <div className="rounded-xl overflow-hidden shadow-sm border border-line max-h-[500px] flex items-start">
              <Image src="/images/aviz-certificate.jpg" alt="Aviz Liberă Practică — AIPNSF" width={440} height={780} className="w-full h-auto object-cover object-top" unoptimized/>
            </div>
            <p className="text-[11px] text-fg-5 mt-2">Certificat original · Vizibil pe Instagram @dobos_dumitrita → Studii</p>
          </div>

          {/* Details — editorial, no emojis */}
          <div className={v?"a-sr":""}>
            <p className="text-xs font-medium uppercase tracking-[.2em] text-brand mb-4">Acreditare</p>
            <h2 className="f-serif text-2xl sm:text-3xl font-normal mb-6 leading-tight">
              Consultant Nutriție Generală<br/>
              <span className="text-fg-3 font-light">certificat AIPNSF</span>
            </h2>

            <div className="border border-line rounded-xl divide-y divide-line mb-6">
              {([["Nume","Doboș Dumitrița"],["Domeniu","Consultant Nutriție Generală"],["Emitent","AIPNSF"],["Președinte","Iulian Dinu"],["Registru","Serie NG · Nr. 598"],["An","2025"]] as [string,string][]).map(([k,val])=>(
                <div key={k} className="flex justify-between px-5 py-3 text-sm">
                  <span className="text-fg-4">{k}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="bg-olive-subtle border border-olive/10 rounded-xl px-5 py-4">
              <p className="text-sm font-medium text-olive mb-1">Fitness Education School</p>
              <p className="text-xs text-fg-3 leading-relaxed">
                Curs absolvit 22.02 – 17.08.2025. Competențe: planuri alimentare, macro/micro nutrienți,
                calcul nutrițional, alimentația copiilor, vârstnicilor, în sarcină și alăptare.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── About — portrait + editorial copy ─── */
function About() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-5 sm:px-8">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div className={v?"a-sl":""}>
            <div className="rounded-2xl overflow-hidden">
              <Image src="/images/client-result.jpg" alt="Doboș Dumitrița — portret" width={480} height={640} className="w-full h-auto" unoptimized/>
            </div>
          </div>

          <div className={v?"a-sr":""}>
            <p className="text-xs font-medium uppercase tracking-[.2em] text-brand mb-4">Despre mine</p>
            <h2 className="f-serif text-2xl sm:text-3xl font-normal mb-6 leading-tight">
              Bună, sunt Dumitrița.<br/>
              <span className="text-fg-3 font-light text-lg sm:text-xl">Nutritionistă.</span>
            </h2>
            <div className="space-y-4 text-fg-3 text-[15px] leading-relaxed">
              <p>Sunt <strong className="text-fg font-medium">Consultant Nutriție Generală</strong> acreditată
              de Asociația Internațională de Psihologie, Nutriție, Sport și Fitness (AIPNSF).</p>
              <p>Cu mine înveți să te alimentezi <strong className="text-fg font-medium">sănătos și gustos</strong>.
              Fără diete drastice. Fără suplimente. Doar mâncare reală, susținere zilnică și
              rezultate vizibile.</p>
              <p>Rezultatele fetelor din Maratonul de Slăbit sunt absolut incredibile — transformări
              reale, cu un plan clar, suport și consistență.</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {([
                ["Maratonul de Slăbit","Program activ"],
                ["Planuri personalizate","Adaptate fiecărei cliente"],
                ["Rețete sănătoase","Gustoase, rapide"],
                ["Comunitate activă","136+ membri"],
              ] as [string,string][]).map(([t,s])=>(
                <div key={t} className="border border-line rounded-lg px-4 py-3">
                  <p className="text-sm font-medium">{t}</p>
                  <p className="text-xs text-fg-4 mt-0.5">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Results — transformation photo + data table + testimonials ─── */
function Results() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-20 sm:py-28 px-5 sm:px-8 bg-surface-raised">
      <div className="sep mb-20"/>
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>

        <div className="max-w-2xl mb-16">
          <p className={`text-xs font-medium uppercase tracking-[.2em] text-brand mb-4 ${v?"a-up":""}`}>Rezultate verificate</p>
          <h2 className={`f-serif text-2xl sm:text-3xl font-normal leading-tight ${v?"a-up d1":""}`}>
            Rezultatele vorbesc<br/>
            <span className="text-fg-3 font-light">de la sine.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
          {/* Transformation photos — real clients from Instagram */}
          <div className={`space-y-3 ${v?"a-up d2":""}`}>
            <div className="rounded-xl overflow-hidden">
              <Image src="/images/client-beforeafter.jpg" alt="Transformare clientă — postare fixată @dobos_dumitrita, Octombrie 2025" width={540} height={540} className="w-full h-auto" unoptimized/>
            </div>
            <div className="rounded-xl overflow-hidden">
              <Image src="/images/food1.jpg" alt="Transformare Reală — Maraton de Slăbit — @veradurnea7 și @dobos_dumitrita" width={540} height={540} className="w-full h-auto" unoptimized/>
            </div>
            <div className="rounded-xl overflow-hidden">
              <Image src="/images/client-result-2.jpg" alt="Rezultat clientă — Maratonul de Slăbit, Decembrie 2025" width={540} height={540} className="w-full h-auto" unoptimized/>
            </div>
            <p className="text-[11px] text-fg-5">Fotografii reale de pe Instagram @dobos_dumitrita · Postări verificate</p>
          </div>

          {/* Data table — clean, no color headers */}
          <div className={`border border-line rounded-xl overflow-hidden ${v?"a-up d3":""}`}>
            <div className="px-5 py-3 border-b border-line bg-bg">
              <p className="text-xs font-medium text-fg-4 uppercase tracking-wider">Măsurători verificate · Postare fixată Instagram</p>
            </div>
            <div className="divide-y divide-line-subtle text-sm">
              <div className="grid grid-cols-4 px-3 sm:px-5 py-2.5 text-[10px] sm:text-[11px] font-medium text-fg-4 uppercase tracking-wider">
                <span>Măsură</span><span className="text-center">Înainte</span><span className="text-center">După</span><span className="text-right">Diferență</span>
              </div>
              {measurements.map(r=>(
                <div key={r.m} className="grid grid-cols-4 px-3 sm:px-5 py-3 hover:bg-surface-raised transition-colors text-[13px] sm:text-sm">
                  <span className="font-medium">{r.m}</span>
                  <span className="text-center text-fg-3">{r.b}</span>
                  <span className="text-center">{r.a}</span>
                  <span className="text-right font-semibold text-brand">{r.d}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-2.5 border-t border-line text-[11px] text-fg-4 bg-bg">
              Sursă: postare verificată @dobos_dumitrita
            </div>
          </div>
        </div>

        {/* Pull quotes — editorial style, not card grid */}
        <div className="grid sm:grid-cols-3 gap-px bg-line rounded-xl overflow-hidden">
          {reviews.map((r,i)=>(
            <div key={i} className={`bg-surface p-6 sm:p-8 ${v?"a-up":""}`} style={{animationDelay:`${.3+i*.1}s`}}>
              <p className="f-serif text-[15px] text-fg-2 leading-relaxed italic mb-4">
                &ldquo;{r.q}&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-fg-4">{r.name}</span>
                <span className="font-semibold text-brand">{r.kg}</span>
              </div>
              <p className="text-[10px] text-fg-5 mt-1">{r.src}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ─── Gallery — minimal, 3 images ─── */
function Gallery() {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-16 sm:py-24 px-5 sm:px-8">
      <div className={`max-w-[1140px] mx-auto ${v?"":"opacity-0"}`}>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[.2em] text-brand mb-2">Instagram</p>
            <h2 className="f-serif text-xl sm:text-2xl font-normal">Rețete sănătoase și gustoase</h2>
          </div>
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-sm text-fg-3 hover:text-brand transition-colors flex items-center gap-1.5 shrink-0">
            @dobos_dumitrita <Arrow/>
          </a>
        </div>
        <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${v?"a-up d1":""}`}>
          {["/images/pinned1.jpg","/images/pinned2.jpg","/images/food2.jpg"].map((src,i)=>(
            <a key={i} href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="aspect-square rounded-lg overflow-hidden group">
              <Image src={src} alt="" width={380} height={380} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" unoptimized/>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ — clean accordion ─── */
function FAQ() {
  const {ref,v} = useVisible();
  const [open,setOpen] = useState<number|null>(null);
  return (
    <section ref={ref} className="py-20 sm:py-28 px-5 sm:px-8 bg-surface-raised">
      <div className="sep mb-20"/>
      <div className={`max-w-2xl mx-auto ${v?"":"opacity-0"}`}>
        <p className={`text-xs font-medium uppercase tracking-[.2em] text-brand mb-4 ${v?"a-up":""}`}>Întrebări frecvente</p>
        <h2 className={`f-serif text-2xl sm:text-3xl font-normal mb-10 ${v?"a-up d1":""}`}>Întrebări și răspunsuri</h2>

        <div className={`divide-y divide-line border-t border-b border-line ${v?"a-up d2":""}`}>
          {faqs.map((f,i)=>(
            <div key={i}>
              <button onClick={()=>setOpen(open===i?null:i)} className="w-full flex items-center justify-between py-5 text-left cursor-pointer group">
                <span className="text-[15px] font-medium pr-8 group-hover:text-brand transition-colors">{f.q}</span>
                <ChevD open={open===i}/>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open===i?"max-h-48 pb-5 opacity-100":"max-h-0 opacity-0"}`}>
                <p className="text-sm text-fg-3 leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function CTA({go}:{go:()=>void}) {
  const {ref,v} = useVisible();
  return (
    <section ref={ref} className="py-24 sm:py-32 px-5 sm:px-8 text-center">
      <div className={`max-w-lg mx-auto ${v?"a-up":"opacity-0"}`}>
        <h2 className="f-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight mb-4">
          Aceeași persoană.<br/>Altă energie. Altă viață.
        </h2>
        <p className="text-fg-3 text-[15px] mb-2 italic f-serif">
          &ldquo;Fiecare transformare începe cu o decizie: Gata, de azi aleg altceva.&rdquo;
        </p>
        <p className="text-fg-4 text-sm mb-10">
          Quiz gratuit · 1 minut · Fără date personale
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={go} className="group bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-8 py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
            Începe quiz-ul <Arrow/>
          </button>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="bg-wa hover:bg-wa-hover text-white text-sm font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2">
            <WaIco c="w-4 h-4"/> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Foot() {
  return (
    <footer className="border-t border-line px-5 sm:px-8 py-8">
      <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-line">
            <Image src="/images/profile.jpg" alt="" width={32} height={32} className="w-full h-full object-cover"/>
          </div>
          <div className="text-xs text-fg-4">
            <span className="text-fg font-medium">Doboș Dumitrița</span> · Consultant Nutriție Generală · AIPNSF
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://instagram.com/dobos_dumitrita" target="_blank" rel="noopener noreferrer" className="text-fg-4 hover:text-fg-2 transition-colors"><IgIco c="w-4 h-4"/></a>
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="text-fg-4 hover:text-wa transition-colors"><WaIco c="w-4 h-4"/></a>
        </div>
      </div>
      <div className="max-w-[1140px] mx-auto mt-6 pt-4 border-t border-line-subtle text-center">
        <p className="text-[11px] text-fg-5">© {new Date().getFullYear()} Doboș Dumitrița. Toate drepturile rezervate.</p>
      </div>
    </footer>
  );
}

/* ═══════ Quiz ═══════ */
function Progress({i,t}:{i:number;t:number}) {
  const p=((i+1)/t)*100;
  return (
    <div className="max-w-md mx-auto mb-12">
      <div className="flex justify-between text-xs text-fg-4 mb-2">
        <span>Întrebarea {i+1} din {t}</span>
        <span className="font-mono">{Math.round(p)}%</span>
      </div>
      <div className="h-1 bg-line-subtle rounded-full overflow-hidden">
        <div className="progress-bar h-full bg-brand rounded-full" style={{width:`${p}%`}}/>
      </div>
    </div>
  );
}

function QCard({q,qi,pick}:{q:Q;qi:number;pick:(v:string)=>void}) {
  return (
    <div className="a-up max-w-md mx-auto">
      <h2 className="f-serif text-xl sm:text-2xl font-normal text-center mb-2">{q.question}</h2>
      {q.sub && <p className="text-sm text-fg-4 text-center mb-8">{q.sub}</p>}
      <div className="space-y-2">
        {q.opts.map(o=>(
          <button key={o.value} onClick={()=>pick(o.value)} className="q-opt w-full flex items-center justify-between bg-surface border border-line rounded-xl px-5 py-4 text-left cursor-pointer">
            <span className="text-[15px] text-fg-2">{o.label}</span>
            <svg className="w-4 h-4 text-fg-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7"/></svg>
          </button>
        ))}
      </div>
      {qi===0 && <p className="text-center text-[11px] text-fg-5 mt-6">Răspunsurile tale sunt confidențiale</p>}
    </div>
  );
}

function Done({answers}:{answers:Record<string,string>}) {
  const url = waUrl(answers);
  const titles: Record<string,string> = {slabire:"Programul tău de slăbire",mentinere:"Menținere pe termen lung",sanatos:"Alimentație sănătoasă",medical:"Plan adaptat"};
  const gl: Record<string,string> = {slabire:"Slăbire sănătoasă",mentinere:"Menținere",sanatos:"Alimentație sănătoasă",medical:"Condiție medicală"};
  const cl: Record<string,string> = {timp:"Lipsa timpului",nu_stiu:"Nu știu ce să mănânc",pofte:"Pofte",motivatie:"Motivație"};
  const sl: Record<string,string> = {plan:"Plan alimentar",retete:"Rețete simple",ghidare:"Ghidare continuă",complet:"Program complet"};

  return (
    <div className="a-up max-w-md mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-[.2em] text-brand mb-3">Quiz completat</p>
        <h2 className="f-serif text-2xl font-normal mb-2">{titles[answers.goal]||"Planul tău personalizat"}</h2>
        <p className="text-sm text-fg-3">Dumitrița îți va crea un plan adaptat nevoilor tale.</p>
      </div>

      <div className="border border-line rounded-xl divide-y divide-line mb-8">
        {([["Obiectiv",gl[answers.goal]||answers.goal],["Provocare",cl[answers.challenge]||answers.challenge],["Suport dorit",sl[answers.support]||answers.support]] as [string,string][]).map(([k,val])=>(
          <div key={k} className="flex justify-between px-5 py-3.5 text-sm">
            <span className="text-fg-4">{k}</span>
            <span className="font-medium">{val}</span>
          </div>
        ))}
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer" className="a-glow w-full bg-wa hover:bg-wa-hover text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
        <WaIco c="w-5 h-5"/> Scrie-mi pe WhatsApp
      </a>
      <p className="text-center text-xs text-fg-4 mt-3">Răspunsurile tale vor fi trimise automat în mesaj</p>

      <div className="mt-8 flex justify-center gap-6 text-[11px] text-fg-4">
        <span>Răspuns în max 24h</span>
        <span>Consultație gratuită</span>
        <span>Fără obligații</span>
      </div>
    </div>
  );
}

/* ─── Floating WA ─── */
function FloatWA() {
  const [show,setShow]=useState(false);
  useEffect(()=>{const h=()=>setShow(scrollY>500);addEventListener("scroll",h,{passive:true});return()=>removeEventListener("scroll",h)},[]);
  if(!show) return null;
  return (
    <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 right-5 z-50 a-scl" aria-label="WhatsApp">
      <div className="w-12 h-12 bg-wa hover:bg-wa-hover rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
        <WaIco c="w-6 h-6 text-white"/>
      </div>
    </a>
  );
}

/* ═══════ PAGE ═══════ */
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
      <Nav stage={stage} qi={qi} qt={quiz.length} reset={reset}/>

      {stage==="hero" && <>
        <Hero go={go}/>
        <Credentials/>
        <About/>
        <Results/>
        <Gallery/>
        <FAQ/>
        <CTA go={go}/>
      </>}

      {stage==="quiz" && (
        <main className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-12 sm:py-20">
          {/* Trust element during quiz */}
          <div className="flex items-center gap-2 justify-center mb-8 a-fade">
            <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-line">
              <Image src="/images/profile.jpg" alt="" width={24} height={24} className="w-full h-full object-cover"/>
            </div>
            <span className="text-xs text-fg-4">Quiz de nutriție · Doboș Dumitrița</span>
          </div>
          <Progress i={qi} t={quiz.length}/>
          <QCard q={quiz[qi]} qi={qi} pick={pick} key={quiz[qi].id}/>
          <button onClick={back} className="mt-10 mx-auto flex items-center gap-1.5 text-sm text-fg-4 hover:text-fg-2 transition-colors cursor-pointer">
            <Back/> {qi>0?"Înapoi":"Pagina principală"}
          </button>
        </main>
      )}

      {stage==="done" && (
        <main className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-12 sm:py-20">
          <Done answers={ans}/>
        </main>
      )}

      <Foot/>
      <FloatWA/>
    </div>
  );
}
