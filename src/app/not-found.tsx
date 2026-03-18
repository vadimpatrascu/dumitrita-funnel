import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-6">🌿</span>
      <h1 className="text-3xl font-bold mb-3">Pagina nu a fost găsită</h1>
      <p className="text-muted mb-8 max-w-md">
        Se pare că această pagină nu există. Hai să te ducem înapoi la quiz-ul
        de nutriție!
      </p>
      <Link
        href="/"
        className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-2xl shadow-md transition-all duration-300"
      >
        Înapoi la pagina principală →
      </Link>
    </div>
  );
}
