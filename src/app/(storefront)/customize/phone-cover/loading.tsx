export default function PhoneCoverCustomizerLoading() {
  return (
    <div className="container-custom py-8 md:py-10 animate-pulse space-y-6">
      <div className="h-5 w-40 rounded bg-surface-border" />
      <div className="rounded-3xl bg-surface-border p-8">
        <div className="h-8 w-64 rounded bg-white/70" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-white/70" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <div className="h-72 rounded-3xl bg-surface-border" />
        <div className="h-[540px] rounded-3xl bg-surface-border" />
        <div className="h-72 rounded-3xl bg-surface-border" />
      </div>
    </div>
  );
}
