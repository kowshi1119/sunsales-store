'use client';

import { useMemo, useState } from 'react';
import { Clock3, MapPinned, Truck } from 'lucide-react';
import Select from '@/components/ui/Select';
import { formatPrice } from '@/lib/formatters';
import { SRI_LANKA_DISTRICTS } from '@/lib/constants';

interface DeliveryEstimateProps {
  amount: number;
}

function getDeliveryInfo(district: string) {
  const fastDistricts = ['Colombo', 'Gampaha', 'Kalutara'];
  const standardDistricts = ['Kandy', 'Galle', 'Matara', 'Kurunegala', 'Kegalle', 'Ratnapura'];

  if (fastDistricts.includes(district)) {
    return {
      eta: '1–2 business days',
      price: 350,
      note: 'Fast delivery available for the Western Province and nearby areas.',
    };
  }

  if (standardDistricts.includes(district)) {
    return {
      eta: '2–3 business days',
      price: 450,
      note: 'Standard islandwide delivery with careful packaging and tracking updates.',
    };
  }

  return {
    eta: '3–5 business days',
    price: 550,
    note: 'Extended delivery time may apply for longer-distance routes and custom orders.',
  };
}

export default function DeliveryEstimate({ amount }: DeliveryEstimateProps) {
  const [district, setDistrict] = useState<string>(SRI_LANKA_DISTRICTS[0]);
  const estimate = useMemo(() => getDeliveryInfo(district), [district]);
  const qualifiesForFreeShipping = amount >= 5000;

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Truck className="h-4 w-4 text-primary-500" />
        <h3 className="text-body-md font-semibold text-foreground">Delivery Estimate</h3>
      </div>

      <Select
        label="Deliver to"
        value={district}
        onChange={(event) => setDistrict(event.target.value)}
        options={SRI_LANKA_DISTRICTS.map((item) => ({ value: item, label: item }))}
        leftIcon={<MapPinned className="h-4 w-4" />}
      />

      <div className="mt-4 space-y-2 text-body-sm text-muted">
        <p className="inline-flex items-center gap-2 text-foreground">
          <Clock3 className="h-4 w-4 text-primary-500" />
          Estimated arrival: <span className="font-semibold">{estimate.eta}</span>
        </p>
        <p>
          Shipping: <span className="font-semibold text-foreground">{qualifiesForFreeShipping ? 'Free' : formatPrice(estimate.price)}</span>
        </p>
        <p>{estimate.note}</p>
        {qualifiesForFreeShipping && (
          <p className="rounded-full bg-success-50 px-3 py-1 text-success-700 inline-flex items-center gap-2">
            <Truck className="h-3.5 w-3.5" />
            This item qualifies for free shipping over Rs. 5,000.
          </p>
        )}
      </div>
    </div>
  );
}
