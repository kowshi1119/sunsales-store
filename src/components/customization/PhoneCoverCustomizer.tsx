'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronLeft,
  Palette,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import DesignToolbar from '@/components/customization/DesignToolbar';
import LayerManager from '@/components/customization/LayerManager';
import LivePreviewCanvas, { type LivePreviewCanvasHandle } from '@/components/customization/LivePreviewCanvas';
import TextOverlayEditor from '@/components/customization/TextOverlayEditor';
import Button from '@/components/ui/Button';
import { Badge, EmptyState, SkeletonCard, SkeletonText } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatters';
import { useCustomizerStore } from '@/stores/customizerStore';
import type { DesignElement, ImageQuality, PhoneModel, PrintArea } from '@/types/customization';

interface PhoneBrandSummary {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  modelCount: number;
}

interface CaseTypeOption {
  value: string;
  label: string;
  price: number;
  description: string;
}

const CASE_TYPE_OPTIONS: CaseTypeOption[] = [
  { value: 'hard', label: 'Hard Case', price: 0, description: 'Slim profile with crisp edge-to-edge print.' },
  { value: 'soft', label: 'Soft Silicone', price: 300, description: 'Flexible grip with extra comfort and shock support.' },
  { value: 'tough', label: 'Tough Case', price: 800, description: 'Dual-layer protection built for everyday drops.' },
];

const STEP_LABELS = [
  { id: 1, label: 'Brand', icon: Smartphone },
  { id: 2, label: 'Model', icon: Smartphone },
  { id: 3, label: 'Case', icon: ShieldCheck },
  { id: 4, label: 'Design', icon: Palette },
  { id: 5, label: 'Preview', icon: Sparkles },
];

export default function PhoneCoverCustomizer() {
  const router = useRouter();
  const canvasRef = useRef<LivePreviewCanvasHandle | null>(null);
  const { addToCart } = useCart();
  const { isAuthenticated, requireAuth } = useAuth();
  const [brands, setBrands] = useState<PhoneBrandSummary[]>([]);
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    step,
    setStep,
    nextStep,
    previousStep,
    resetCustomizer,
    selectedBrandId,
    selectedBrandSlug,
    selectedBrandName,
    selectedModelId,
    selectedModelName,
    selectedCaseType,
    setSelectedBrand,
    setSelectedModel,
    setSelectedCaseType,
    elements,
    selectedElementId,
    backgroundColor,
    printArea,
    previewImage,
    uploadedImages,
    addUploadedImage,
    removeUploadedImage,
    setPreviewImage,
  } = useCustomizerStore((state) => ({
    step: state.step,
    setStep: state.setStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    resetCustomizer: state.resetCustomizer,
    selectedBrandId: state.selectedBrandId,
    selectedBrandSlug: state.selectedBrandSlug,
    selectedBrandName: state.selectedBrandName,
    selectedModelId: state.selectedModelId,
    selectedModelName: state.selectedModelName,
    selectedCaseType: state.selectedCaseType,
    setSelectedBrand: state.setSelectedBrand,
    setSelectedModel: state.setSelectedModel,
    setSelectedCaseType: state.setSelectedCaseType,
    elements: state.elements,
    selectedElementId: state.selectedElementId,
    backgroundColor: state.backgroundColor,
    printArea: state.printArea,
    previewImage: state.previewImage,
    uploadedImages: state.uploadedImages,
    addUploadedImage: state.addUploadedImage,
    removeUploadedImage: state.removeUploadedImage,
    setPreviewImage: state.setPreviewImage,
  }));

  const selectedModel = models.find((model) => model.id === selectedModelId) ?? null;
  const activePrintArea: PrintArea = selectedModel?.printArea ?? printArea ?? { x: 50, y: 80, width: 300, height: 550 };
  const selectedElement: DesignElement | null = elements.find((element) => element.id === selectedElementId) ?? null;

  const selectedCase = useMemo(() => {
    if (!selectedCaseType) return null;
    return CASE_TYPE_OPTIONS.find((option) => option.value === selectedCaseType) ?? null;
  }, [selectedCaseType]);

  const totalPrice = 3490 + (selectedCase?.price ?? 0);

  useEffect(() => {
    let active = true;

    async function loadBrands() {
      try {
        setBrandsLoading(true);
        setErrorMessage(null);
        const response = await fetch('/api/phone-models', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load phone brands.');
        }

        if (active) {
          setBrands(result.data as PhoneBrandSummary[]);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load phone brands right now.');
        }
      } finally {
        if (active) {
          setBrandsLoading(false);
        }
      }
    }

    void loadBrands();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBrandSlug) {
      setModels([]);
      return;
    }

    const brandSlug = selectedBrandSlug;
    let active = true;

    async function loadModels() {
      try {
        setModelsLoading(true);
        setErrorMessage(null);
        const response = await fetch(`/api/phone-models?brand=${encodeURIComponent(brandSlug)}`, {
          cache: 'no-store',
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Unable to load phone models.');
        }

        if (active) {
          const nextModels = (result.data.models as PhoneModel[]).map((model) => ({
            ...model,
            printArea: model.printArea || { x: 50, y: 80, width: 300, height: 550 },
            caseTypes: Array.isArray(model.caseTypes) ? model.caseTypes : ['hard', 'soft', 'tough'],
            brand: { name: result.data.name, slug: result.data.slug },
          }));

          setModels(nextModels);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load phone models right now.');
        }
      } finally {
        if (active) {
          setModelsLoading(false);
        }
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, [selectedBrandSlug]);

  const availableCaseTypes = useMemo(() => {
    if (!selectedModel?.caseTypes?.length) {
      return CASE_TYPE_OPTIONS;
    }

    return CASE_TYPE_OPTIONS.filter((option) => selectedModel.caseTypes.includes(option.value));
  }, [selectedModel]);

  const handlePreview = () => {
    const preview = canvasRef.current?.exportPreview();
    if (!preview) {
      toast.error('Please add a design before opening the preview.');
      return;
    }

    setPreviewImage(preview);
    setStep(5);
  };

  const handleSaveAndAddToCart = async () => {
    if (!isAuthenticated) {
      requireAuth('/customize/phone-cover');
      return;
    }

    if (!selectedModelId || !selectedCaseType) {
      toast.error('Please choose a phone model and case type first.');
      return;
    }

    const preview = previewImage || canvasRef.current?.exportPreview();
    if (!preview) {
      toast.error('Create a preview before saving your design.');
      return;
    }

    setSaveLoading(true);

    try {
      const response = await fetch('/api/customization/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneModelId: selectedModelId,
          caseType: selectedCaseType,
          previewImage: preview,
          uploadedImages,
          designData: {
            elements,
            backgroundColor,
            canvasWidth: 400,
            canvasHeight: 700,
            printArea: activePrintArea,
            previewImage: preview,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to save this design.');
      }

      addToCart({
        productId: result.data.product.id,
        variantId: result.data.variant?.id ?? null,
        quantity: 1,
        designId: result.data.designId,
        name: result.data.product.name,
        price: result.data.variant?.price ?? result.data.product.basePrice,
        salePrice: result.data.product.salePrice,
        image: result.data.product.image || preview,
        variantName: result.data.variant?.name ?? selectedCase?.label ?? null,
        slug: result.data.product.slug,
      });

      toast.success('Custom phone cover saved and added to cart!');
      router.push('/cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save your custom phone cover.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-custom py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Customize', href: '/shop' }, { label: 'Phone Cover Studio' }]} />

        <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge variant="primary" dot>
                Phase 3.1 • Live Customizer
              </Badge>
              <h1 className="mt-3 text-display-lg font-display text-foreground">Design your phone cover in minutes</h1>
              <p className="mt-3 max-w-2xl text-body-lg leading-7 text-muted">
                Choose your device, pick the finish you love, upload your artwork, and see a live preview before checkout.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button type="button" onClick={() => setStep(Math.max(step, 1))} leftIcon={<Sparkles className="h-4 w-4" />}>
                  Continue designing
                </Button>
                <Link href="/shop" className="block">
                  <Button type="button" variant="outline">Browse products</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-surface-card p-4 md:p-5">
              <div className="grid gap-3 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
                {STEP_LABELS.map((item) => {
                  const isActive = step === item.id;
                  const isComplete = step > item.id;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border px-3 py-3 text-center ${isActive ? 'border-primary-400 bg-primary-50' : isComplete ? 'border-success-200 bg-success-50' : 'border-surface-border bg-white'}`}
                    >
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-primary-600">
                        {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                      </div>
                      <p className="text-body-xs font-semibold text-foreground">Step {item.id}</p>
                      <p className="text-body-xs text-muted">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-error-200 bg-error-50 px-4 py-3 text-body-sm text-error-700">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 space-y-8">
          {step === 1 && (
            <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Step 1</p>
                  <h2 className="text-display-md font-display text-foreground">Select your phone brand</h2>
                </div>
                {selectedBrandName && <Badge variant="outline">{selectedBrandName}</Badge>}
              </div>

              {brandsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : brands.length === 0 ? (
                <EmptyState title="No phone brands available" description="Please check back soon or contact support for a manual custom order." />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {brands.map((brand) => {
                    const isSelected = brand.id === selectedBrandId;
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => setSelectedBrand({ id: brand.id, slug: brand.slug, name: brand.name })}
                        className={`rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-primary-400 bg-primary-50 shadow-md' : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-surface-card">
                            {brand.logo ? (
                              <Image src={brand.logo} alt={`${brand.name} logo`} fill sizes="48px" className="object-cover" unoptimized={brand.logo.startsWith('/images/')} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-primary-600">
                                <Smartphone className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-foreground">{brand.name}</p>
                            <p className="text-body-xs text-muted">{brand.modelCount} supported models</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Step 2</p>
                  <h2 className="text-display-md font-display text-foreground">Choose the exact model</h2>
                </div>
                <Button type="button" variant="outline" onClick={previousStep} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                  Back
                </Button>
              </div>

              {modelsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {models.map((model) => {
                    const isSelected = model.id === selectedModelId;
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel({ id: model.id, slug: model.slug, name: model.name })}
                        className={`rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-primary-400 bg-primary-50 shadow-md' : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm'}`}
                      >
                        <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-xl bg-surface-card">
                          <Image src={model.mockupImage} alt={model.name} fill sizes="(max-width: 768px) 50vw, 220px" className="object-cover" unoptimized={model.mockupImage.startsWith('/images/')} />
                        </div>
                        <p className="text-body-md font-semibold text-foreground">{model.name}</p>
                        <p className="text-body-xs text-muted">Optimized print area for a clean edge-to-edge result.</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Step 3</p>
                  <h2 className="text-display-md font-display text-foreground">Pick your case finish</h2>
                </div>
                <Button type="button" variant="outline" onClick={previousStep} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                  Back
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {availableCaseTypes.map((option) => {
                  const isActive = option.value === selectedCaseType;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedCaseType(option.value)}
                      className={`rounded-2xl border p-5 text-left transition-all ${isActive ? 'border-primary-400 bg-primary-50 shadow-md' : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm'}`}
                    >
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <h3 className="text-body-lg font-semibold text-foreground">{option.label}</h3>
                      <p className="mt-2 text-body-sm text-muted">{option.description}</p>
                      <p className="mt-3 text-body-md font-semibold text-primary-700">
                        {option.price === 0 ? 'Included in base price' : `+ ${formatPrice(option.price)}`}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex justify-end">
                <Button type="button" onClick={nextStep} disabled={!selectedCaseType}>
                  Continue to design studio
                </Button>
              </div>
            </section>
          )}

          {step === 4 && selectedModel && selectedCase && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                <div>
                  <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Step 4</p>
                  <h2 className="text-display-md font-display text-foreground">Design studio</h2>
                  <p className="text-body-sm text-muted">{selectedBrandName} • {selectedModel.name} • {selectedCase.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={previousStep} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                    Back
                  </Button>
                  <Button type="button" onClick={handlePreview} leftIcon={<Sparkles className="h-4 w-4" />}>
                    Preview Design
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
                <DesignToolbar
                  printArea={activePrintArea}
                  backgroundColor={backgroundColor}
                  onAddText={() => canvasRef.current?.addText()}
                  onUndo={() => canvasRef.current?.undo()}
                  onRedo={() => canvasRef.current?.redo()}
                  onDeleteSelected={() => canvasRef.current?.removeSelected()}
                  onReset={() => {
                    canvasRef.current?.clearCanvas();
                    uploadedImages.forEach((image) => removeUploadedImage(image));
                    toast.success('Canvas reset successfully.');
                  }}
                  onBackgroundColorChange={(color) => {
                    useCustomizerStore.getState().setBackgroundColor(color);
                  }}
                  onImageReady={(dataUrl: string, quality: ImageQuality, fileName: string) => {
                    addUploadedImage(dataUrl);
                    void canvasRef.current?.addImage(dataUrl, fileName);
                    if (quality.level === 'poor') {
                      toast.error('The image looks low resolution for print.');
                    } else {
                      toast.success('Artwork added to the canvas.');
                    }
                  }}
                />

                <LivePreviewCanvas ref={canvasRef} mockupImage={selectedModel.mockupImage} printArea={activePrintArea} />

                <div className="space-y-4">
                  <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
                    <p className="mb-2 text-body-sm font-semibold text-foreground">Selected setup</p>
                    <div className="space-y-2 text-body-sm text-muted">
                      <p><span className="font-semibold text-foreground">Brand:</span> {selectedBrandName}</p>
                      <p><span className="font-semibold text-foreground">Model:</span> {selectedModelName}</p>
                      <p><span className="font-semibold text-foreground">Case:</span> {selectedCase.label}</p>
                      <p><span className="font-semibold text-foreground">Starting from:</span> {formatPrice(totalPrice)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
                    <p className="mb-3 text-body-sm font-semibold text-foreground">Layers</p>
                    <LayerManager
                      elements={elements}
                      selectedId={selectedElementId}
                      onSelect={(id) => canvasRef.current?.selectLayer(id)}
                      onMoveUp={(id) => canvasRef.current?.moveLayerUp(id)}
                      onMoveDown={(id) => canvasRef.current?.moveLayerDown(id)}
                      onToggleVisibility={(id) => canvasRef.current?.toggleVisibility(id)}
                      onDelete={(id) => {
                        canvasRef.current?.selectLayer(id);
                        canvasRef.current?.removeSelected();
                      }}
                    />
                  </div>

                  <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
                    <p className="mb-3 text-body-sm font-semibold text-foreground">Text editor</p>
                    <TextOverlayEditor
                      element={selectedElement}
                      onChange={(updates) => canvasRef.current?.updateSelectedText(updates)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 5 && selectedModel && selectedCase && (
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Step 5</p>
                <h2 className="text-display-md font-display text-foreground">Preview your finished cover</h2>
                <p className="mt-2 text-body-sm text-muted">Review the final look, then save it to your account and cart.</p>

                <div className="mt-5 overflow-hidden rounded-3xl bg-surface-card p-4">
                  {previewImage ? (
                    <div className="relative mx-auto aspect-[4/7] max-w-[420px] overflow-hidden rounded-[2rem] border border-surface-border bg-white">
                      <Image
                        src={previewImage}
                        alt="Customized phone cover preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <SkeletonText lines={4} className="py-12" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                  <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Order summary</p>
                  <div className="mt-4 space-y-3 text-body-sm text-muted">
                    <p><span className="font-semibold text-foreground">Brand:</span> {selectedBrandName}</p>
                    <p><span className="font-semibold text-foreground">Model:</span> {selectedModel.name}</p>
                    <p><span className="font-semibold text-foreground">Case type:</span> {selectedCase.label}</p>
                    <p><span className="font-semibold text-foreground">Design layers:</span> {elements.length}</p>
                    <p><span className="font-semibold text-foreground">Estimated total:</span> {formatPrice(totalPrice)}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
                  <div className="flex flex-col gap-3">
                    <Button type="button" onClick={() => setStep(4)} variant="outline">
                      Edit Design
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveAndAddToCart}
                      isLoading={saveLoading}
                      loadingText="Saving..."
                      leftIcon={<ShoppingCart className="h-4 w-4" />}
                    >
                      Save + Add to Cart
                    </Button>
                    {!isAuthenticated && (
                      <p className="text-body-xs text-muted">
                        You will be asked to sign in before we save the design to your account.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-surface-border bg-white px-4 py-3 shadow-card">
            <p className="text-body-sm text-muted">Need a fresh start? Reset the current draft and begin again.</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetCustomizer();
                setModels([]);
                toast.success('Started a new phone cover design.');
              }}
            >
              Start fresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
