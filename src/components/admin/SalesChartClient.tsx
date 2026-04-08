'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, TrendingUp } from 'lucide-react';
import type { RevenueDataPoint } from '@/types/admin';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';

const periods = [7, 30, 90] as const;

interface SalesChartClientProps {
  data: RevenueDataPoint[];
}

export default function SalesChartClient({ data }: SalesChartClientProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]>(30);

  const filteredData = useMemo(() => {
    if (data.length === 0) {
      return periods.map((value) => value).includes(period) ? [] : data;
    }

    return data.slice(-period);
  }, [data, period]);

  const totalRevenue = filteredData.reduce((sum, point) => sum + point.revenue, 0);
  const maxRevenue = Math.max(1, ...filteredData.map((point) => point.revenue));

  const chartPoints = filteredData
    .map((point, index) => {
      const x = filteredData.length === 1 ? 50 : (index / Math.max(filteredData.length - 1, 1)) * 100;
      const y = 100 - (point.revenue / maxRevenue) * 85;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
            <TrendingUp className="h-4 w-4" />
            Revenue trend
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Sales performance</h2>
          <p className="mt-1 text-sm text-slate-600">Track revenue momentum across the last 7, 30, or 90 days.</p>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {periods.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                period === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {value}D
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          {filteredData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <CalendarDays className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">Revenue data will appear here once orders start syncing.</p>
            </div>
          ) : (
            <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible" aria-label="Revenue chart">
              {[20, 40, 60, 80].map((line) => (
                <line key={line} x1="0" y1={line} x2="100" y2={line} stroke="#e2e8f0" strokeDasharray="2 3" />
              ))}
              <polyline
                fill="none"
                stroke="#f5a623"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={chartPoints}
              />
              {filteredData.map((point, index) => {
                const x = filteredData.length === 1 ? 50 : (index / Math.max(filteredData.length - 1, 1)) * 100;
                const y = 100 - (point.revenue / maxRevenue) * 85;

                return (
                  <circle key={point.date} cx={x} cy={y} r="1.8" fill="#e87461" stroke="#fff" strokeWidth="0.6" />
                );
              })}
            </svg>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected window</p>
            <p className="mt-1 text-2xl font-semibold">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Orders logged</p>
            <p className="mt-1 text-lg font-semibold">{filteredData.reduce((sum, point) => sum + point.orders, 0)}</p>
          </div>
          <div className="rounded-2xl bg-white/5 px-3 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average daily revenue</p>
            <p className="mt-1 text-lg font-semibold">
              {formatPrice(filteredData.length > 0 ? totalRevenue / filteredData.length : 0)}
            </p>
          </div>
          <p className="text-xs leading-5 text-slate-300">
            The dashboard uses live order totals when a database is connected and gracefully falls back to zero-state analytics in local offline mode.
          </p>
        </div>
      </div>
    </section>
  );
}
