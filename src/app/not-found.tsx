import Link from "next/link";

/* Change 92: 404 with better design + suggestions */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="text-7xl font-light text-fg-5 mb-4 f-serif">404</p>
      <h1 className="f-serif text-2xl font-normal mb-3">Pagina nu a fost găsită</h1>
      <p className="text-fg-3 text-sm mb-8 max-w-sm">Se pare că această pagină nu există sau a fost mutată.</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="bg-brand hover:bg-brand-hover text-white text-sm font-bold px-7 py-3 rounded-full transition-all shadow-md hover:shadow-lg">
          Pagina principală
        </Link>
        <a href="https://wa.me/393288461370" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-fg-2 border-2 border-line hover:border-brand/30 px-7 py-3 rounded-full transition-all flex items-center justify-center gap-2">
          Contactează pe WhatsApp
        </a>
      </div>
    </div>
  );
}
