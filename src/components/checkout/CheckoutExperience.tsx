'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  TicketPercent,
  Truck,
} from 'lucide-react';
import { AnimatedSection } from '@/components/shared/SectionHeading';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/Skeleton';
import { useHydration } from '@/hooks/useHydration';
import { DISTRICT_TO_PROVINCE, SRI_LANKA_DISTRICTS } from '@/lib/constants';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { addressSchema, type AddressInput } from '@/lib/validators';

type CheckoutStep = 'address' | 'review' | 'payment';

interface CheckoutAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  province: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CouponState {
  code: string;
  type: string;
  discount: number;
  freeShipping: boolean;
  description: string;
}

const CHECKOUT_STEPS: Array<{ id: CheckoutStep; label: string; icon: typeof MapPin }> = [
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'review', label: 'Review', icon: Package },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

const EMPTY_ADDRESS_FORM: AddressInput = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  district: 'Colombo',
  province: DISTRICT_TO_PROVINCE.Colombo,
  postalCode: '',
  country: 'Sri Lanka',
  isDefault: false,
};

function submitExternalForm(action: string, params: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydration();
  const { items, clearCart, getSubtotal } = useCartStore();

  const [step, setStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressInput>(EMPTY_ADDRESS_FORM);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [notes, setNotes] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAYHERE' | 'CASH_ON_DELIVERY'>('PAYHERE');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cancelled = searchParams.get('cancelled') === 'true';
  const cancelledOrder = searchParams.get('order');

  const subtotal = hydrated ? getSubtotal() : 0;
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

  const shippingQuote = useMemo(() => {
    if (!selectedAddress) {
      return {
        cost: 0,
        estimatedDays: 'Select an address to calculate delivery',
      };
    }

    if (selectedAddress.district === 'Colombo') {
      return {
        cost: subtotal >= 5000 ? 0 : 300,
        estimatedDays: '1-2 days',
      };
    }

    return {
      cost: subtotal >= 8000 ? 0 : 500,
      estimatedDays: '2-4 days',
    };
  }, [selectedAddress, subtotal]);

  const shippingCost = appliedCoupon?.freeShipping ? 0 : shippingQuote.cost;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let ignore = false;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);

      try {
        const response = await fetch('/api/addresses', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load your saved addresses.');
        }

        if (!ignore) {
          const list = (payload.data as CheckoutAddress[]) ?? [];
          setAddresses(list);
          setSelectedAddressId(list.find((address) => address.isDefault)?.id || list[0]?.id || '');
        }
      } catch (error) {
        if (!ignore) {
          toast.error(error instanceof Error ? error.message : 'Could not load your addresses.');
        }
      } finally {
        if (!ignore) {
          setIsLoadingAddresses(false);
        }
      }
    };

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (cancelled) {
      toast.error(cancelledOrder ? `Payment cancelled for ${cancelledOrder}. You can try again.` : 'Payment cancelled.');
    }
  }, [cancelled, cancelledOrder]);

  const nextStep = () => {
    if (step === 'address') {
      if (!selectedAddressId) {
        toast.error('Please choose a delivery address before continuing.');
        return;
      }
      setStep('review');
      return;
    }

    if (step === 'review') {
      setStep('payment');
    }
  };

  const previousStep = () => {
    if (step === 'payment') {
      setStep('review');
      return;
    }

    if (step === 'review') {
      setStep('address');
    }
  };

  const handleAddressFieldChange = (field: keyof AddressInput, value: string | boolean) => {
    setAddressForm((current) => {
      const next = {
        ...current,
        [field]: value,
      } as AddressInput;

      if (field === 'district' && typeof value === 'string') {
        next.province = DISTRICT_TO_PROVINCE[value as keyof typeof DISTRICT_TO_PROVINCE] || '';
      }

      return next;
    });
  };

  const handleCreateAddress = async () => {
    const parsed = addressSchema.safeParse(addressForm);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setAddressErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([key, value]) => [key, value?.[0] || 'Please review this field'])
        )
      );
      return;
    }

    setIsSavingAddress(true);
    setAddressErrors({});

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to save your address.');
      }

      const savedAddress = payload.data as CheckoutAddress;
      setAddresses((current) => {
        const next = savedAddress.isDefault
          ? current.map((address) => ({ ...address, isDefault: false }))
          : current;
        return [savedAddress, ...next];
      });
      setSelectedAddressId(savedAddress.id);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setIsAddressModalOpen(false);
      toast.success('Address saved successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save your address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Coupon could not be applied.');
      }

      setAppliedCoupon(payload.data as CouponState);
      setCouponCode(payload.data.code);
      toast.success(payload.message || 'Coupon applied.');
    } catch (error) {
      setAppliedCoupon(null);
      toast.error(error instanceof Error ? error.message : 'Coupon could not be applied.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed.');
  };

  const placeOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please choose a delivery address before placing your order.');
      setStep('address');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          notes: notes.trim(),
          giftMessage: giftMessage.trim(),
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            designId: item.designId,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to place your order.');
      }

      const { orderId, orderNumber, paymentRequired } = payload.data as {
        orderId: string;
        orderNumber: string;
        paymentRequired: boolean;
      };

      if (paymentRequired) {
        const paymentResponse = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const paymentPayload = await paymentResponse.json();

        if (!paymentResponse.ok || !paymentPayload.success) {
          throw new Error(paymentPayload.message || 'Order was created, but PayHere could not be initialized.');
        }

        clearCart();
        submitExternalForm(paymentPayload.data.checkoutUrl, paymentPayload.data.params as Record<string, string>);
        return;
      }

      clearCart();
      toast.success('Order placed successfully.');
      router.push(`/checkout/confirmation?order=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to place your order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-base py-6 md:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
            <div className="space-y-4">
              <div className="h-20 animate-pulse rounded-2xl bg-surface-warm" />
              <div className="h-64 animate-pulse rounded-2xl bg-surface-warm" />
            </div>
            <div className="h-72 animate-pulse rounded-2xl bg-surface-warm" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-base py-6 md:py-10">
          <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout', href: '/checkout' }]} />
          <AnimatedSection className="mt-6">
            <EmptyState
              icon={Package}
              title="Your cart is empty"
              description="Add a few products before continuing to checkout."
              action={
                <Link href="/shop">
                  <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Browse the shop</Button>
                </Link>
              }
            />
          </AnimatedSection>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout', href: '/checkout' }]} />

        <AnimatedSection className="mb-8 mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-body-sm font-semibold uppercase tracking-[0.24em] text-primary-600">Secure checkout</p>
            <h1 className="mt-2 text-display-md font-display text-foreground">Complete your Sun Sales order</h1>
            <p className="mt-2 max-w-2xl text-body-md text-muted">
              Choose your delivery address, review your items, and pay securely with PayHere or cash on delivery.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-white px-4 py-2 text-body-sm text-muted shadow-card">
            <ShieldCheck className="h-4 w-4 text-success-500" />
            Protected by secure checkout validation
          </div>
        </AnimatedSection>

        {cancelled && (
          <div className="mb-6 rounded-2xl border border-warning-200 bg-warning-50 px-4 py-3 text-body-sm text-warning-800">
            Payment was cancelled{cancelledOrder ? ` for ${cancelledOrder}` : ''}. You can safely retry below.
          </div>
        )}

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {CHECKOUT_STEPS.map((checkoutStep, index) => {
            const isActive = step === checkoutStep.id;
            const isComplete = CHECKOUT_STEPS.findIndex((item) => item.id === step) > index;
            const Icon = checkoutStep.icon;

            return (
              <button
                key={checkoutStep.id}
                type="button"
                onClick={() => {
                  if (checkoutStep.id === 'review' && !selectedAddressId) {
                    toast.error('Please add an address first.');
                    return;
                  }
                  setStep(checkoutStep.id);
                }}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                  isActive || isComplete
                    ? 'border-primary-200 bg-primary-50 text-foreground shadow-card'
                    : 'border-surface-border bg-white text-muted'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isComplete ? 'bg-success-500 text-white' : isActive ? 'bg-primary-500 text-white' : 'bg-surface-warm text-muted'
                  )}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>
                <span>
                  <span className="block text-body-xs uppercase tracking-[0.2em] text-muted">Step {index + 1}</span>
                  <span className="block text-body-md font-semibold">{checkoutStep.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.9fr]">
          <section className="space-y-6">
            {step === 'address' && (
              <AnimatedSection className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-display-sm font-display text-foreground">Delivery address</h2>
                    <p className="mt-1 text-body-sm text-muted">Choose a saved address or add a new one for faster delivery.</p>
                  </div>
                  <Button variant="outline" onClick={() => setIsAddressModalOpen(true)}>Add new address</Button>
                </div>

                {isLoadingAddresses ? (
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="h-28 animate-pulse rounded-2xl bg-surface-warm" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-surface-border bg-surface-warm/70 px-4 py-6 text-center">
                    <p className="text-body-md font-semibold text-foreground">No addresses saved yet</p>
                    <p className="mt-1 text-body-sm text-muted">Add your first delivery address to continue.</p>
                    <Button className="mt-4" onClick={() => setIsAddressModalOpen(true)}>Add address</Button>
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3">
                    {addresses.map((address) => {
                      const isSelected = selectedAddressId === address.id;

                      return (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => setSelectedAddressId(address.id)}
                          className={cn(
                            'rounded-2xl border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary-300 bg-primary-50 shadow-card'
                              : 'border-surface-border bg-white hover:border-primary-200'
                          )}
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-body-md font-semibold text-foreground">{address.fullName}</p>
                                {address.isDefault && (
                                  <span className="rounded-full bg-secondary-500 px-2.5 py-0.5 text-body-xs font-semibold text-white">Default</span>
                                )}
                              </div>
                              <p className="mt-1 text-body-sm text-muted">{address.phone}</p>
                            </div>
                            <span className={cn('text-body-xs font-semibold uppercase tracking-[0.2em]', isSelected ? 'text-primary-700' : 'text-muted')}>
                              {isSelected ? 'Selected' : 'Choose'}
                            </span>
                          </div>
                          <p className="mt-3 text-body-sm text-muted">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.district}
                            {address.province ? `, ${address.province}` : ''} {address.postalCode}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </AnimatedSection>
            )}

            {step === 'review' && (
              <AnimatedSection className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-display-sm font-display text-foreground">Review your items</h2>
                    <p className="mt-1 text-body-sm text-muted">Check quantities, delivery timing, and your coupon before payment.</p>
                  </div>
                  <Link href="/cart">
                    <Button variant="outline">Edit cart</Button>
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {items.map((item) => {
                    const linePrice = (item.salePrice ?? item.price) * item.quantity;

                    return (
                      <div key={`${item.productId}-${item.variantId ?? 'none'}-${item.designId ?? 'none'}`} className="flex gap-4 rounded-2xl border border-surface-border bg-surface-warm/40 p-4">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">
                          <Image
                            src={item.image || '/images/placeholders/product-placeholder.png'}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                            unoptimized={item.image.startsWith('/images/')}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-body-md font-semibold text-foreground">{item.name}</p>
                              <p className="mt-1 text-body-sm text-muted">
                                {item.variantName || 'Standard option'} • Qty {item.quantity}
                              </p>
                              {item.designId && (
                                <span className="mt-2 inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-body-xs font-semibold text-primary-700">
                                  Custom design attached
                                </span>
                              )}
                            </div>
                            <p className="text-body-md font-semibold text-foreground">{formatPrice(linePrice)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-surface-border bg-surface-warm/40 p-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <TicketPercent className="h-4 w-4 text-primary-600" />
                    <p className="text-body-sm font-semibold">Apply coupon</p>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      wrapperClassName="flex-1"
                    />
                    <Button variant="outline" onClick={applyCoupon} isLoading={isApplyingCoupon}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-success-200 bg-success-50 px-3 py-2 text-body-sm text-success-800 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        <strong>{appliedCoupon.code}</strong> applied — {appliedCoupon.description}
                      </span>
                      <button type="button" onClick={removeCoupon} className="font-semibold text-success-800 underline underline-offset-2">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            )}

            {step === 'payment' && (
              <AnimatedSection className="space-y-6">
                <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                  <h2 className="text-display-sm font-display text-foreground">Choose a payment method</h2>
                  <p className="mt-1 text-body-sm text-muted">Pay online securely via PayHere or confirm your order with cash on delivery.</p>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PAYHERE')}
                      className={cn(
                        'rounded-2xl border p-4 text-left transition-all',
                        paymentMethod === 'PAYHERE'
                          ? 'border-primary-300 bg-primary-50 shadow-card'
                          : 'border-surface-border bg-white hover:border-primary-200'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-body-md font-semibold text-foreground">PayHere</p>
                          <p className="mt-1 text-body-sm text-muted">Visa, Mastercard, and online payment gateway checkout.</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-primary-600" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                      className={cn(
                        'rounded-2xl border p-4 text-left transition-all',
                        paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'border-primary-300 bg-primary-50 shadow-card'
                          : 'border-surface-border bg-white hover:border-primary-200'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-body-md font-semibold text-foreground">Cash on delivery</p>
                          <p className="mt-1 text-body-sm text-muted">Confirm the order now and pay the courier when your parcel arrives.</p>
                        </div>
                        <Truck className="h-5 w-5 text-primary-600" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                  <h2 className="text-display-sm font-display text-foreground">Optional order notes</h2>
                  <div className="mt-4 grid gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-body-sm font-medium text-foreground">Order notes</span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value.slice(0, 500))}
                        rows={4}
                        maxLength={500}
                        className="min-h-[110px] rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
                        placeholder="Add any delivery notes, landmark guidance, or tracking request."
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-body-sm font-medium text-foreground">Gift message</span>
                      <textarea
                        value={giftMessage}
                        onChange={(event) => setGiftMessage(event.target.value.slice(0, 500))}
                        rows={3}
                        maxLength={500}
                        className="min-h-[100px] rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
                        placeholder="Include a short gift message for the recipient (optional)."
                      />
                    </label>
                  </div>
                </div>
              </AnimatedSection>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={step === 'address' ? () => router.push('/cart') : previousStep} leftIcon={<ArrowLeft className="h-4 w-4" />}>
                {step === 'address' ? 'Back to cart' : 'Back'}
              </Button>

              {step === 'payment' ? (
                <Button onClick={placeOrder} isLoading={isPlacingOrder} loadingText="Processing order..." rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Place order
                </Button>
              ) : (
                <Button onClick={nextStep} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Continue
                </Button>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-surface-border bg-white p-5 shadow-card lg:sticky lg:top-24 lg:h-fit">
            <h2 className="text-display-sm font-display text-foreground">Order summary</h2>
            <p className="mt-1 text-body-sm text-muted">{items.length} item{items.length === 1 ? '' : 's'} ready for checkout.</p>

            {selectedAddress && (
              <div className="mt-5 rounded-2xl border border-surface-border bg-surface-warm/40 p-4">
                <p className="text-body-xs font-semibold uppercase tracking-[0.2em] text-muted">Deliver to</p>
                <p className="mt-2 text-body-md font-semibold text-foreground">{selectedAddress.fullName}</p>
                <p className="mt-1 text-body-sm text-muted">{selectedAddress.addressLine1}, {selectedAddress.city}, {selectedAddress.district}</p>
              </div>
            )}

            <div className="mt-5 space-y-3 text-body-md">
              <div className="flex items-center justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted">
                <span>Shipping</span>
                <span className="font-medium text-foreground">{selectedAddress ? formatPrice(shippingCost) : 'Select address'}</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-success-700">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="my-4 border-t border-surface-border" />

            <div className="flex items-center justify-between">
              <span className="text-body-lg font-semibold text-foreground">Total</span>
              <span className="text-price-md font-bold text-foreground">{formatPrice(total)}</span>
            </div>

            <div className="mt-4 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-body-sm text-primary-900">
              <p className="font-semibold">Estimated delivery</p>
              <p className="mt-1">{shippingQuote.estimatedDays}</p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-surface-border bg-surface-warm/40 px-4 py-3 text-body-sm text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-success-500" />
              Shipping, coupons, and item availability are re-validated on the server before your order is finalized.
            </div>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add a delivery address"
        description="Save a Sri Lankan address for faster checkout and easier gifting."
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={addressForm.fullName}
            onChange={(event) => handleAddressFieldChange('fullName', event.target.value)}
            error={addressErrors.fullName}
            required
          />
          <Input
            label="Phone number"
            value={addressForm.phone}
            onChange={(event) => handleAddressFieldChange('phone', event.target.value)}
            error={addressErrors.phone}
            required
          />
          <Input
            label="Address line 1"
            value={addressForm.addressLine1}
            onChange={(event) => handleAddressFieldChange('addressLine1', event.target.value)}
            error={addressErrors.addressLine1}
            required
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Address line 2"
            value={addressForm.addressLine2 || ''}
            onChange={(event) => handleAddressFieldChange('addressLine2', event.target.value)}
            error={addressErrors.addressLine2}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="City"
            value={addressForm.city}
            onChange={(event) => handleAddressFieldChange('city', event.target.value)}
            error={addressErrors.city}
            required
          />
          <Select
            label="District"
            value={addressForm.district}
            onChange={(event) => handleAddressFieldChange('district', event.target.value)}
            error={addressErrors.district}
            options={SRI_LANKA_DISTRICTS.map((district) => ({ value: district, label: district }))}
            required
          />
          <Input
            label="Province"
            value={addressForm.province || ''}
            onChange={(event) => handleAddressFieldChange('province', event.target.value)}
            error={addressErrors.province}
            readOnly
          />
          <Input
            label="Postal code"
            value={addressForm.postalCode}
            onChange={(event) => handleAddressFieldChange('postalCode', event.target.value)}
            error={addressErrors.postalCode}
            required
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-body-sm text-foreground">
          <input
            type="checkbox"
            checked={addressForm.isDefault}
            onChange={(event) => handleAddressFieldChange('isDefault', event.target.checked)}
            className="h-4 w-4 rounded border-surface-border text-primary-500 focus:ring-primary-400"
          />
          Save as my default delivery address
        </label>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAddress} isLoading={isSavingAddress} loadingText="Saving address...">Save address</Button>
        </div>
      </Modal>
    </div>
  );
}
