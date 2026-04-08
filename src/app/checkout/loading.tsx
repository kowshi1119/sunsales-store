export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <div className="mb-6 h-16 animate-pulse rounded-2xl bg-surface-warm" />
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded-2xl bg-surface-warm" />
            <div className="h-72 animate-pulse rounded-2xl bg-surface-warm" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-surface-warm" />
        </div>
      </div>
    </div>
  );
}
