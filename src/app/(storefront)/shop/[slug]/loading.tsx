export default function ProductDetailLoading() {
  return (
    <div className="container-custom py-6 md:py-10 animate-pulse space-y-6">
      <div className="h-4 w-48 rounded bg-surface-border" />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="aspect-square rounded-3xl bg-surface-border" />
        <div className="space-y-4">
          <div className="h-6 w-24 rounded bg-surface-border" />
          <div className="h-12 w-3/4 rounded bg-surface-border" />
          <div className="h-5 w-1/2 rounded bg-surface-border" />
          <div className="h-28 rounded-2xl bg-surface-border" />
          <div className="h-44 rounded-2xl bg-surface-border" />
          <div className="h-32 rounded-2xl bg-surface-border" />
        </div>
      </div>
      <div className="h-64 rounded-3xl bg-surface-border" />
    </div>
  );
}
