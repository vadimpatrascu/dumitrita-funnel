"use client";

import { useState, useEffect, useRef } from "react";

/* ═══════ Constants ═══════ */
export const WA = "393288461370";

/* ═══════ Types ═══════ */
export interface QuizQuestion {
  id: string;
  question: string;
  sub?: string;
  opts: { label: string; value: string; icon: string }[];
}

/* ═══════ Hooks ═══════ */
export function useVisible(t = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setV(true);
          o.disconnect();
        }
      },
      { threshold: t }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [t]);
  return { ref, v };
}

export function useCountdown(targetDate: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return time;
}

/* ═══════ Counter Component ═══════ */
export function Counter({ n, s = "", ms = 1800 }: { n: number; s?: string; ms?: number }) {
  const [c, setC] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !go) {
          setGo(true);
          o.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    o.observe(el);
    return () => o.disconnect();
  }, [go]);
  useEffect(() => {
    if (!go) return;
    let cur = 0;
    const step = n / 50;
    const iv = ms / 50;
    const t = setInterval(() => {
      cur += step;
      if (cur >= n) {
        setC(n);
        clearInterval(t);
      } else setC(Math.floor(cur));
    }, iv);
    return () => clearInterval(t);
  }, [go, n, ms]);
  return (
    <span ref={ref} className="stat">
      {go ? c.toLocaleString("ro-RO") : "0"}
      {s}
    </span>
  );
}

/* ═══════ Icons ═══════ */
export const WaIco = ({ c = "w-5 h-5" }: { c?: string }) => (
  <svg className={c} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export const IgIco = ({ c = "w-5 h-5" }: { c?: string }) => (
  <svg className={c} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const ThreadsIco = ({ c = "w-5 h-5" }: { c?: string }) => (
  <svg className={c} fill="currentColor" viewBox="0 0 192 192">
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.745C82.2364 44.745 70.1369 51.5765 63.2175 63.6309L76.5756 72.2232C81.7752 63.5585 90.1631 61.0674 97.2724 61.0674C97.3472 61.0674 97.4226 61.0674 97.4974 61.0681C105.044 61.1172 110.752 63.5285 114.526 68.2395C117.257 71.6156 119.044 76.2216 119.843 81.9977C113.145 80.8762 105.855 80.4472 98.0355 80.7272C75.1978 81.5513 60.4932 95.2946 61.6556 114.479C62.2451 124.229 67.2387 132.563 75.7299 137.901C83.0295 142.499 92.2837 144.825 101.934 144.348C114.304 143.723 123.934 138.748 130.469 129.577C135.377 122.683 138.475 113.888 139.879 103.016C145.333 106.278 149.417 110.569 151.737 115.835C155.749 124.703 156.009 139.437 146.106 149.338C137.328 158.114 126.696 162.078 108.22 162.234C87.7056 162.064 72.5801 155.542 62.8757 142.735C53.9272 130.926 49.2669 114.106 49.0647 92.7403C49.2668 71.3744 53.9272 54.5543 62.8757 42.7451C72.5801 29.9381 87.7056 23.4163 108.22 23.2461C128.874 23.4176 144.247 30.0091 154.063 42.8976C158.839 49.1496 162.472 56.8671 164.865 65.9048L180.305 61.6488C177.349 50.5284 172.709 41.037 166.474 33.2737C153.538 16.8794 134.724 8.27985 108.329 8.07867C108.293 8.07867 108.257 8.07867 108.22 8.07867C81.9244 8.27935 63.2028 16.8282 50.286 33.0743C39.4048 47.3698 33.8929 66.6814 33.6729 92.6899L33.6729 93.0102C33.8929 118.939 39.4048 138.151 50.286 152.347C63.2028 168.493 81.9244 177.042 108.22 177.243C108.257 177.243 108.293 177.243 108.329 177.243C130.449 177.061 144.804 171.581 156.416 159.97C172.421 143.967 171.649 123.741 165.85 110.658C161.803 101.515 153.592 93.8647 141.537 88.9883ZM99.2162 129.135C87.0124 129.771 76.3659 123.012 75.8024 113.382C75.3752 106.379 80.411 98.339 98.6499 97.6277C101.061 97.5325 103.432 97.4871 105.762 97.4871C111.983 97.4871 117.868 98.0471 123.312 99.1216C121.382 122.671 109.903 128.578 99.2162 129.135Z" />
  </svg>
);

export const Arrow = () => (
  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export const ChevD = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 text-fg-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const Back = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
  </svg>
);

export const Check = () => (
  <svg className="w-4 h-4 text-olive shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const Star = () => (
  <svg className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/* ═══════ WhatsApp URL helper ═══════ */
export function waLink(msg?: string): string {
  const base = `https://wa.me/${WA}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

/* ═══════ Analytics ═══════ */
export function trackEvent(event: string, data?: Record<string, string>) {
  // Future: integrate with Google Analytics, Meta Pixel, etc.
  if (typeof window !== "undefined") {
    try {
      // Log to console in dev
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${event}`, data);
      }
      // Push to dataLayer for GTM
      const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
      w.dataLayer?.push({ event, ...data });
    } catch {
      // silently fail
    }
  }
}
