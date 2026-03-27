"use client";

import { AppHeader } from "@/components/app-ui";
import { useState } from "react";
import Image from "next/image";

const zile = ["L", "M", "Mi", "J", "V", "S", "D"];

const masaDay = [
  {type: "Mic dejun", name: "Iaurt grecesc cu fructe de pădure", kcal: 250, time: "5 min", img: "/images/pinned1.jpg", tags: ["Proteic"]},
  {type: "Prânz", name: "Salată cu pui și avocado", kcal: 350, time: "15 min", img: "/images/food1.jpg", tags: ["Sănătos"]},
  {type: "Gustare", name: "Un măr și migdale", kcal: 150, time: "2 min", img: "/images/food2.jpg", tags: ["Rapid"]},
  {type: "Cină", name: "Somon la cuptor cu sparanghel", kcal: 400, time: "30 min", img: "/images/pinned2.jpg", tags: ["Omega 3"]}
];

export default function MesePage() {
  const [activeDay, setActiveDay] = useState(2); // Miercuri

  return (
    <>
      <AppHeader title="Plan Alimentar" />
      
      {/* Selector Zile */}
      <div className="sticky top-14 bg-surface/95 backdrop-blur-xl border-b border-line z-30 px-3 py-3 shadow-sm">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          {zile.map((z, i) => (
            <button 
              key={i}
              onClick={() => setActiveDay(i)}
              className={`flex flex-col items-center justify-center w-[42px] h-[52px] rounded-full transition-all duration-300 ${
                activeDay === i 
                  ? "bg-brand text-white shadow-[0_4px_12px_rgba(176,99,45,0.3)] scale-105" 
                  : "bg-surface-raised text-fg-4 font-medium hover:bg-brand-subtle/50 border border-line-subtle"
              }`}
            >
              <span className={`text-[11px] ${activeDay === i ? "font-bold" : "font-medium"}`}>{z}</span>
              <span className={`text-[10px] mt-0.5 ${activeDay === i ? "text-white/90 font-semibold" : "text-fg-5"}`}>{15 + i}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-sm mx-auto">
        <div className="flex justify-between items-end mb-2 px-1">
          <div>
            <h2 className="text-lg font-bold text-fg-2 font-serif">Meniul Zilei</h2>
            <p className="text-[11px] text-fg-4">Miercuri, 17 Martie</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-brand">1,150</span>
            <span className="text-[10px] text-fg-5"> kcal total</span>
          </div>
        </div>

        {masaDay.map((m, i) => (
          <div key={i} className="premium-card rounded-2xl overflow-hidden group cursor-pointer animate-in fade-in slide-in-from-bottom-2" style={{animationDelay: `${i*100}ms`, animationFillMode: "both"}}>
            <div className="relative h-36 w-full">
              <Image src={m.img} alt={m.name} fill sizes="400px" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A120D]/80 via-[#1A120D]/20 to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3">
                 <div className="w-6 h-6 rounded-full bg-surface/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-brand transition-colors">
                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                 </div>
              </div>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted drop-shadow-md mb-1 block">{m.type}</span>
                <h3 className="font-semibold text-[15px] leading-tight drop-shadow-md">{m.name}</h3>
              </div>
            </div>
            <div className="p-3 bg-surface flex justify-between items-center">
              <div className="flex gap-1.5 flex-wrap">
                {m.tags.map(t => (
                  <span key={t} className="text-[9px] font-bold text-olive bg-olive/10 border border-olive/15 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-[11px] font-bold text-fg-2">{m.kcal} kcal</p>
                <p className="text-[9px] text-fg-5 font-medium">{m.time}</p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-2 pb-6">
          <button className="w-full bg-surface border-2 border-dashed border-brand/20 text-brand-hover font-semibold text-xs py-3.5 rounded-xl hover:bg-brand-subtle/30 hover:border-brand/40 transition-colors flex items-center justify-center gap-2 group cursor-pointer">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Adaugă o masă extra
          </button>
        </div>
      </div>
    </>
  );
}
