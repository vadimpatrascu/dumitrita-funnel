import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl font-light text-fg-5 mb-6 f-serif">404</p>
      <h1 className="f-serif text-2xl font-normal mb-3">Pagina nu a fost găsită</h1>
      <p className="text-fg-3 text-sm mb-8 max-w-sm">Se pare că această pagină nu există.</p>
      <Link href="/" className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
        Înapoi la pagina principală
      </Link>
    </div>
  );
}
