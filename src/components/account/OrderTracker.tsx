import { formatDateTime, formatOrderStatus } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface OrderTrackerItem {
  id: string;
  status: string;
  note?: string | null;
  createdAt: string;
}

interface OrderTrackerProps {
  history: OrderTrackerItem[];
  currentStatus: string;
}

export default function OrderTracker({ history }: OrderTrackerProps) {
  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <div key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-3 w-3 rounded-full bg-primary-500" />
            {index < history.length - 1 && <span className="mt-1 h-full w-px bg-surface-border" />}
          </div>
          <div className="rounded-2xl bg-surface-warm/50 px-4 py-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700')}>
                {formatOrderStatus(entry.status)}
              </span>
              <span className="text-body-xs text-muted">{formatDateTime(entry.createdAt)}</span>
            </div>
            {entry.note && <p className="mt-2 text-body-sm text-foreground">{entry.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
