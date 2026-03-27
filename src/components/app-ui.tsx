"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const IcoHome = ({c="w-5 h-5",s=1.5}:{c?:string,s?:number}) => <svg className={c} strokeWidth={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const IcoMese = ({c="w-5 h-5",s=1.5}:{c?:string,s?:number}) => <svg className={c} strokeWidth={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const IcoProgres = ({c="w-5 h-5",s=1.5}:{c?:string,s?:number}) => <svg className={c} strokeWidth={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 9l-5 5-4-4-5 5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 9h-4M18 9v4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
export const IcoProfil = ({c="w-5 h-5",s=1.5}:{c?:string,s?:number}) => <svg className={c} strokeWidth={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export function BottomNav() {
  const p = usePathname() || "";
  const nav = [
    {href: "/maraton", label: "Acasă", Ico: IcoHome},
    {href: "/maraton/mese", label: "Mese", Ico: IcoMese},
    {href: "/maraton/progres", label: "Progres", Ico: IcoProgres},
    {href: "/maraton/cont", label: "Cont", Ico: IcoProfil},
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-line safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {nav.map(n => {
          const act = p === n.href || (n.href !== "/maraton" && p.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${act ? "text-brand" : "text-fg-4 hover:text-fg-2"}`}>
              <n.Ico c={`w-6 h-6 transition-transform ${act ? "scale-110" : ""}`} s={act ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${act ? "font-bold" : ""}`}>{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({title, action}:{title:string, action?:React.ReactNode}) {
  return (
    <header className="sticky top-0 bg-surface/90 backdrop-blur-xl border-b border-line z-40 safe-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
        <h1 className="f-serif text-xl font-semibold text-fg-2">{title}</h1>
        {action}
      </div>
    </header>
  );
}
