"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="text-4xl text-fg-5 mb-4">—</p>
      <h1 className="f-serif text-xl font-normal mb-3">Ceva nu a funcționat</h1>
      <p className="text-fg-3 text-sm mb-8">Te rugăm să încerci din nou.</p>
      <button onClick={reset} className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all cursor-pointer">
        Încearcă din nou
      </button>
    </div>
  );
}
