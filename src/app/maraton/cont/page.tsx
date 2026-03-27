"use client";

import { AppHeader } from "@/components/app-ui";

export default function ContPage() {
  return (
    <>
      <AppHeader title="Contul Meu" action={<span className="text-[9px] font-bold text-olive bg-olive/10 border border-olive/20 px-2.5 py-1 rounded-full uppercase tracking-widest">Activ</span>} />
      
      <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Profile Card */}
        <div className="premium-card rounded-3xl p-5 bg-gradient-to-br from-surface to-brand-subtle/30 flex items-center gap-4 border border-brand/10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold/10 rounded-full blur-2xl" />
          <div className="w-16 h-16 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-brand font-serif text-2xl shrink-0 z-10 shadow-sm">
            A
          </div>
          <div className="z-10">
            <h2 className="text-lg font-bold text-fg-2">Alina Popescu</h2>
            <p className="text-xs text-fg-4">alina.p@exemplu.ro</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-fg-5 mt-1.5 bg-surface-raised inline-block px-1.5 py-0.5 rounded border border-line-subtle shadow-[0_1px_2px_rgba(0,0,0,0.02)]">Maraton Ediția 3</p>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="grid grid-cols-2 gap-3">
          <button className="premium-card rounded-2xl p-4 bg-surface text-left group border border-line-subtle hover:border-wa transition-colors shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-wa/10 flex items-center justify-center text-wa mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-fg-2 mb-0.5 group-hover:text-wa transition-colors">Cumpărături</h3>
            <p className="text-[9px] text-fg-4 leading-tight">Lista auto-generată pentru meniul tău</p>
          </button>
          
          <button className="premium-card rounded-2xl p-4 bg-surface text-left group border border-line-subtle hover:border-gold transition-colors shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-3 group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h3 className="text-sm font-bold text-fg-2 mb-0.5 group-hover:text-gold transition-colors">Rețetar Extins</h3>
            <p className="text-[9px] text-fg-4 leading-tight">Peste 100 de rețete bonus sănătoase</p>
          </button>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xs font-bold text-fg-3 uppercase tracking-widest mb-3 px-1">Suport</h3>
          <div className="premium-card rounded-2xl bg-surface overflow-hidden shadow-sm">
            <a href="https://wa.me/393288461370" target="_blank" className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-wa/10 flex items-center justify-center text-wa group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg-2 group-hover:text-wa transition-colors">Contactează-mă pe WhatsApp</h4>
                  <p className="text-[10px] text-fg-5 mt-0.5">Discută direct cu Dumitrița</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-fg-5 group-hover:text-wa transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </a>
            <div className="h-px bg-line-subtle" />
            <div className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-fg-2 group-hover:text-brand transition-colors">Întrebări Frecvente & Reguli</h4>
                  <p className="text-[10px] text-fg-5 mt-0.5">Tot ce trebuie să știi despre program</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-fg-5 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
        
        {/* Logout */}
        <div className="pt-4 pb-6 text-center">
          <button className="text-[10px] font-bold text-fg-5 hover:text-rose transition-colors uppercase tracking-[0.15em] cursor-pointer">
            Ieși din cont
          </button>
        </div>

      </div>
    </>
  );
}
