export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-bg">
      {/* Brand spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-line"/>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand animate-spin"/>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-fg-2">Doboș Dumitrița</p>
        <p className="text-[11px] text-fg-4 mt-0.5">Consultant Nutriție Generală</p>
      </div>
    </div>
  );
}
