export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-border-light border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted mt-4">Se încarcă...</p>
    </div>
  );
}
