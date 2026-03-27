"use client";

import { AppHeader } from "@/components/app-ui";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function MaratonDashboard() {
  const [water, setWater] = useState(3);
  
  return (
    <>
      <AppHeader title="Acasă" action={<div className="w-8 h-8 rounded-full bg-brand-subtle flex items-center justify-center text-brand font-bold text-xs border border-brand/20">A</div>} />
      
      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Salutation */}
        <div>
          <h2 className="text-2xl f-serif text-fg">Bună, Alina! 👋</h2>
          <p className="text-sm text-fg-4">Ziua 4 din Maratonul Tău</p>
        </div>

        {/* Calories & Macros */}
        <div className="glass rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-end mb-4 relative z-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-fg-4">Calorii</p>
              <p className="text-2xl font-bold text-fg-2 tabular-nums">1,240 <span className="text-sm font-normal text-fg-5">/ 1,500 kcal</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-[3px] border-wa flex items-center justify-center bg-surface shadow-sm">
              <span className="text-[11px] font-bold text-wa">82%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {[
              {l: "Proteine", v: "85g", p: "70%", c: "bg-brand"},
              {l: "Carbo", v: "120g", p: "60%", c: "bg-gold"},
              {l: "Grăsimi", v: "42g", p: "50%", c: "bg-olive"}
            ].map((m, i) => (
              <div key={i} className="bg-surface-raised rounded-xl p-2.5 border border-line-subtle shadow-sm">
                <p className="text-[9px] text-fg-5 font-semibold uppercase tracking-wider">{m.l}</p>
                <p className="text-sm font-bold text-fg-2">{m.v}</p>
                <div className="h-1 w-full bg-line rounded-full mt-1.5 overflow-hidden">
                  <div className={`h-full ${m.c} rounded-full`} style={{width: m.p}} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Meal */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="font-semibold text-fg-3 text-xs uppercase tracking-widest">Următoarea Masă</h3>
            <Link href="/maraton/mese" className="text-[11px] font-bold text-brand hover:text-brand-hover">Vezi tot planul</Link>
          </div>
          <Link href="/maraton/mese" className="block premium-card bg-surface rounded-2xl p-3 flex gap-4 items-center group">
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative shadow-sm border border-line-subtle">
              <Image src="/images/food1.jpg" alt="Prânz" fill sizes="80px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-olive bg-olive/10 border border-olive/15 px-2 py-0.5 rounded-full mb-1">
                <span className="w-1 h-1 rounded-full bg-olive animate-pulse"/> Prânz
              </span>
              <h4 className="font-semibold text-fg-2 text-sm leading-tight group-hover:text-brand transition-colors">Salată cu pui și avocado</h4>
              <p className="text-[11px] text-fg-4 mt-1 font-medium flex items-center gap-1.5">
                <span className="text-brand">350 kcal</span> <span className="text-line-subtle">•</span> 15 min
              </p>
            </div>
          </Link>
        </div>

        {/* Water Intake */}
        <div className="bg-gradient-to-br from-[#F0F7FA] to-[#E1EFF5] border border-[#BDE0EF] rounded-2xl p-4.5 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4FB3E0]/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-semibold text-[#1F5F7A] text-sm mb-1">Apă (Pahare)</h3>
          <p className="text-[11px] text-[#42819E] mb-4 font-medium">Scopul tău: 8 pahare pe zi</p>
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {Array.from({length: 8}).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setWater(i+1)}
                  className={`w-7 h-9 rounded-b-xl rounded-t-[4px] transition-all duration-300 ${i < water ? 'bg-[#3AA1D4] shadow-sm transform hover:scale-105' : 'bg-[#CBE4F0] hover:bg-[#86CAED]'}`}
                  aria-label={`Pahar apă ${i+1}`}
                />
              ))}
            </div>
            <div className="text-xl font-bold text-[#1F5F7A] w-12 text-right tabular-nums">{water}<span className="text-sm font-medium text-[#5B95AF]">/8</span></div>
          </div>
        </div>

        {/* Quote */}
        <div className="border border-brand/15 bg-gradient-to-br from-brand-subtle/50 to-transparent rounded-2xl p-5 text-center relative shadow-sm">
          <span className="quote-mark text-brand/20 opacity-50 relative top-2 -left-2 text-4xl leading-none">"</span>
          <p className="text-[15px] font-serif italic text-fg-3 leading-relaxed relative z-10 block pt-1">
            Reușita nu înseamnă să nu greșești niciodată, ci să nu renunți după ce ai greșit.
          </p>
          <p className="text-[9px] font-bold text-brand uppercase tracking-[0.15em] mt-3">— Dumitrița</p>
        </div>

      </div>
    </>
  );
}
