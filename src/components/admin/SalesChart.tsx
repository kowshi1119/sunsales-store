import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RevenueDataPoint } from '@/types/admin';

const SalesChartClient = dynamic(() => import('./SalesChartClient'), {
  ssr: false,
  loading: () => (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </section>
  ),
});

interface SalesChartProps {
  data: RevenueDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return <SalesChartClient data={data} />;
}
