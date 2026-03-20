/* Change 93: loading with brand spinner + text */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-line border-t-brand animate-spin" />
      <p className="text-xs text-fg-4 font-medium">Se încarcă...</p>
    </div>
  );
}
