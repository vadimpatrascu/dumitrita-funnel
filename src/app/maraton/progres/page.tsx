"use client";

import { AppHeader } from "@/components/app-ui";
import { useState, useEffect } from "react";

const INITIAL_HISTORY = [
  {date: "17 Mar", w: 81.5},
  {date: "14 Mar", w: 82.2},
  {date: "07 Mar", w: 83.8},
  {date: "28 Feb", w: 85.1},
  {date: "21 Feb", w: 86.4},
];

export default function ProgresPage() {
  const [weight, setWeight] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [istoric, setIstoric] = useState(INITIAL_HISTORY);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("maraton-istoric");
    if (saved) {
      try {
        setIstoric(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const adaugaGreutate = () => {
    if (!weight || isNaN(Number(weight))) return;
    const now = new Date();
    const months = ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Nov","Dec"];
    const dStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]}`;
    
    const nou = { date: dStr, w: parseFloat(weight) };
    const newIstoric = [nou, ...istoric];
    setIstoric(newIstoric);
    localStorage.setItem("maraton-istoric", JSON.stringify(newIstoric));
    setWeight("");
    setShowLog(false);
  };

  const maxW = Math.max(...istoric.map(i => i.w));
  const minW = Math.min(...istoric.map(i => i.w)) - 2;

  // Evită hydration mismatch așteptând montarea
  if (!isMounted) return <div className="min-h-screen bg-bg"></div>;

  return (
    <>
      <AppHeader title="Evoluția Mea" action={<button onClick={() => setShowLog(!showLog)} className="text-2xl text-brand w-8 h-8 rounded-full hover:bg-brand/10 transition-colors flex items-center justify-center pb-1">+</button>} />
      
      <div className="p-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Adaugă progres */}
        {showLog && (
          <div className="premium-card rounded-2xl p-4 bg-brand-subtle/30 animate-in slide-in-from-top-4 duration-300 border border-brand/20">
            <h3 className="text-sm font-bold text-fg-2 mb-3">Adaugă Măsurătoare Nouă</h3>
            <div className="flex gap-2">
              <input type="number" step="0.1" value={weight} onChange={(e)=>setWeight(e.target.value)} placeholder="ex: 81.0" className="flex-1 bg-surface border border-line-subtle rounded-xl px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-fg-2 font-bold text-lg" />
              <button onClick={adaugaGreutate} className="bg-wa hover:bg-wa-hover text-white font-bold px-5 rounded-xl transition-all shadow-sm">Salvează</button>
            </div>
          </div>
        )}

        {/* Rezumat */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4 border border-line shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-olive/10 rounded-full blur-xl pointer-events-none" />
             <p className="text-[10px] font-bold text-fg-4 uppercase tracking-wider mb-1">Greutate Curentă</p>
             <p className="text-2xl font-bold text-fg-2">{istoric[0].w} <span className="text-[11px] font-medium text-fg-5">kg</span></p>
             <p className="text-[10px] text-olive font-bold mt-1 bg-olive/10 inline-block px-1.5 py-0.5 rounded-sm">-4.9 kg total</p>
          </div>
          <div className="glass rounded-2xl p-4 border border-line shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-brand/10 rounded-full blur-xl pointer-events-none" />
             <p className="text-[10px] font-bold text-fg-4 uppercase tracking-wider mb-1">Obiectivul Tău</p>
             <p className="text-2xl font-bold text-fg-2">75.0 <span className="text-[11px] font-medium text-fg-5">kg</span></p>
             <p className="text-[10px] text-fg-5 font-semibold mt-1">Au mai rămas 6.5 kg</p>
          </div>
        </div>

        {/* Grafic (CSS simplificat) */}
        <div className="premium-card rounded-2xl p-5 bg-surface mb-2 shadow-sm">
          <h3 className="text-xs font-bold text-fg-3 uppercase tracking-widest mb-6">Grafic Scădere</h3>
          <div className="flex items-end gap-2 justify-between h-32 pt-2 border-b border-line-subtle relative">
            {/* Horizontal line for goal (mocked relative position) */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-wa/30 border-b border-dashed border-wa/60 z-0" />
            
            {[...istoric].reverse().map((m, i) => {
              const hPct = ((m.w - minW) / (maxW - minW)) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group z-10">
                  <span className="text-[9px] font-bold text-fg-4 mb-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2">{m.w}</span>
                  <div className="w-full max-w-[24px] bg-brand-subtle rounded-t-sm relative group-hover:bg-brand/30 transition-colors" style={{height: `${hPct}%`}}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-brand rounded-t-sm" />
                  </div>
                  <span className="text-[9px] text-fg-5 mt-2 font-medium absolute -bottom-5">{m.date.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
          <div className="h-6" /> {/* Spacer for labels */}
        </div>

        {/* Listă istoric */}
        <div>
          <h3 className="text-xs font-bold text-fg-3 uppercase tracking-widest mb-3 px-1">Istoric Detaliat</h3>
          <div className="premium-card rounded-2xl bg-surface overflow-hidden shadow-sm">
            {istoric.map((m, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-3.5 ${i > 0 ? 'border-t border-line-subtle' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-raised border border-line-subtle flex items-center justify-center">
                    <span className="text-[10px] font-bold text-brand">{m.date.split(' ')[0]}</span>
                  </div>
                  <span className="text-xs font-medium text-fg-4">{m.date.split(' ')[1]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-fg-2">{m.w} kg</span>
                  <span className="text-[10px] font-bold text-olive w-10 text-right">{i < istoric.length-1 ? `-${(istoric[i+1].w - m.w).toFixed(1)}` : 'start'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </>
  );
}
