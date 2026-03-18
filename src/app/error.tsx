"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-6">😔</span>
      <h1 className="text-2xl font-bold mb-3">Ceva nu a funcționat</h1>
      <p className="text-muted mb-8 max-w-md">
        Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.
      </p>
      <button
        onClick={reset}
        className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-2xl shadow-md transition-all duration-300 cursor-pointer"
      >
        Încearcă din nou →
      </button>
    </div>
  );
}
