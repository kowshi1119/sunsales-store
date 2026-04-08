'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Save, Sparkles, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TabContent, TabList, Tabs, TabTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { adminProductSchema, type AdminProductInput } from '@/lib/validators';

interface ProductCategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface EditableProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  type: AdminProductInput['type'];
  basePrice: number;
  salePrice: number | null;
  sku: string | null;
  stock: number;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags: string[];
  categoryIds: string[];
  imageUrls: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}

interface ProductFormProps {
  mode: 'create' | 'edit';
  categories: ProductCategoryOption[];
  product?: EditableProduct | null;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  type: AdminProductInput['type'];
  basePrice: string;
  salePrice: string;
  sku: string;
  stock: string;
  weight: string;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  tags: string;
  categoryIds: string[];
  imageUrls: string[];
  seoTitle: string;
  seoDescription: string;
}

const productTypeOptions = [
  { value: 'STANDARD', label: 'Standard product' },
  { value: 'CUSTOMIZABLE_PHONE_COVER', label: 'Custom phone cover' },
  { value: 'CUSTOMIZABLE_FRAME', label: 'Custom photo frame' },
  { value: 'CUSTOMIZABLE_OTHER', label: 'Other customizable item' },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function buildInitialState(product?: EditableProduct | null): FormState {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    shortDescription: product?.shortDescription ?? '',
    type: product?.type ?? 'STANDARD',
    basePrice: product?.basePrice?.toString() ?? '0',
    salePrice: product?.salePrice?.toString() ?? '',
    sku: product?.sku ?? '',
    stock: product?.stock?.toString() ?? '0',
    weight: product?.weight?.toString() ?? '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isNewArrival: product?.isNewArrival ?? false,
    tags: product?.tags.join(', ') ?? '',
    categoryIds: product?.categoryIds ?? [],
    imageUrls: product?.imageUrls ?? [],
    seoTitle: product?.seoTitle ?? '',
    seoDescription: product?.seoDescription ?? '',
  };
}

export default function ProductForm({ mode, categories, product }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(() => buildInitialState(product));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [hasCustomSlug, setHasCustomSlug] = useState(Boolean(product?.slug));

  const selectedCategoryCount = formData.categoryIds.length;
  const pageTitle = mode === 'create' ? 'Create product' : 'Edit product';
  const submitLabel = mode === 'create' ? 'Create product' : 'Save changes';

  const summaryText = useMemo(() => {
    if (selectedCategoryCount === 0) {
      return 'Select at least one category before saving.';
    }

    return `${selectedCategoryCount} categor${selectedCategoryCount === 1 ? 'y is' : 'ies are'} selected.`;
  }, [selectedCategoryCount]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleNameChange = (value: string) => {
    setField('name', value);

    if (!hasCustomSlug) {
      setField('slug', slugify(value));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const nextIds = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter((id) => id !== categoryId)
      : [...formData.categoryIds, categoryId];

    setField('categoryIds', nextIds);
  };

  const removeImageUrl = (url: string) => {
    setField(
      'imageUrls',
      formData.imageUrls.filter((imageUrl) => imageUrl !== url)
    );
  };

  const uploadPendingFiles = async () => {
    const uploadedUrls: string[] = [];

    for (const file of pendingFiles) {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('folder', 'products');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.success || !result?.data?.url) {
        throw new Error(result?.message || `Failed to upload ${file.name}.`);
      }

      uploadedUrls.push(result.data.url as string);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setErrors({});
    setIsSaving(true);

    try {
      const uploadedUrls = await uploadPendingFiles();
      const payload = {
        name: formData.name.trim(),
        slug: slugify(formData.slug || formData.name),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        type: formData.type,
        basePrice: Number(formData.basePrice || 0),
        salePrice: formData.salePrice.trim() ? Number(formData.salePrice) : null,
        sku: formData.sku.trim() || null,
        stock: Number(formData.stock || 0),
        weight: formData.weight.trim() ? Number(formData.weight) : null,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        categoryIds: formData.categoryIds,
        imageUrls: [...formData.imageUrls, ...uploadedUrls],
        seoTitle: formData.seoTitle.trim() || null,
        seoDescription: formData.seoDescription.trim() || null,
      };

      const parsed = adminProductSchema.safeParse(payload);

      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const nextErrors: FormErrors = {};

        for (const [key, value] of Object.entries(fieldErrors)) {
          nextErrors[key] = value?.[0];
        }

        setErrors(nextErrors);
        throw new Error('Please correct the highlighted product fields.');
      }

      const endpoint = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.success) {
        if (result?.errors && typeof result.errors === 'object') {
          const apiErrors: FormErrors = {};
          for (const [key, value] of Object.entries(result.errors as Record<string, string[]>)) {
            apiErrors[key] = value?.[0];
          }
          setErrors(apiErrors);
        }

        throw new Error(result?.message || 'Failed to save the product.');
      }

      if (mode === 'create' && result?.data?.id) {
        router.push(`/admin/products/${result.data.id}`);
        return;
      }

      router.refresh();
      setPendingFiles([]);
      setFormData((current) => ({ ...current, imageUrls: parsed.data.imageUrls }));
    } catch (saveError) {
      setSubmitError(saveError instanceof Error ? saveError.message : 'Failed to save the product.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">{pageTitle}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep catalog details, pricing, and storefront visibility in sync from one editor.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/admin/products">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={isSaving} loadingText={mode === 'create' ? 'Creating...' : 'Saving...'} leftIcon={<Save className="h-4 w-4" />}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </section>

      {submitError && (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {!categories.length && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No active categories are available yet. Create categories before publishing a new product.
        </div>
      )}

      <Tabs defaultTab="overview" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <TabList className="overflow-x-auto">
          <TabTrigger id="overview">Overview</TabTrigger>
          <TabTrigger id="pricing">Pricing & visibility</TabTrigger>
          <TabTrigger id="media">Media & SEO</TabTrigger>
        </TabList>

        <TabContent id="overview" className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Product name"
              value={formData.name}
              onChange={(event) => handleNameChange(event.target.value)}
              error={errors.name}
              required
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(event) => {
                setHasCustomSlug(true);
                setField('slug', slugify(event.target.value));
              }}
              error={errors.slug}
              hint="Lowercase letters, numbers, and hyphens only."
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Product type"
              options={productTypeOptions.map((option) => ({ value: option.value, label: option.label }))}
              value={formData.type}
              onChange={(event) => setField('type', event.target.value as FormState['type'])}
              error={errors.type}
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(event) => setField('sku', event.target.value)}
              error={errors.sku}
              placeholder="SUN-TSHIRT-001"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="mb-1.5 block text-body-sm font-medium text-foreground">
              Description <span className="ml-0.5 text-error-500">*</span>
            </label>
            <textarea
              id="product-description"
              value={formData.description}
              onChange={(event) => setField('description', event.target.value)}
              rows={6}
              className={cn(
                'w-full rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground transition-all',
                'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
                errors.description && 'border-error-500 focus:border-error-500 focus:ring-error-500/30'
              )}
            />
            {errors.description && <p className="mt-1 text-body-xs text-error-500">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="product-short-description" className="mb-1.5 block text-body-sm font-medium text-foreground">
              Short description
            </label>
            <textarea
              id="product-short-description"
              value={formData.shortDescription}
              onChange={(event) => setField('shortDescription', event.target.value)}
              rows={3}
              className="w-full rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400"
            />
            {errors.shortDescription && <p className="mt-1 text-body-xs text-error-500">{errors.shortDescription}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-body-sm font-medium text-foreground">Categories</p>
                <p className="text-body-xs text-muted">{summaryText}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {selectedCategoryCount} selected
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const isSelected = formData.categoryIds.includes(category.id);

                return (
                  <label
                    key={category.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all',
                      isSelected
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{category.name}</span>
                      <span className="block text-xs text-slate-500">/{category.slug}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.categoryIds && <p className="mt-1 text-body-xs text-error-500">{errors.categoryIds}</p>}
          </div>
        </TabContent>

        <TabContent id="pricing" className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="Base price"
              type="number"
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(event) => setField('basePrice', event.target.value)}
              error={errors.basePrice}
              required
            />
            <Input
              label="Sale price"
              type="number"
              min="0"
              step="0.01"
              value={formData.salePrice}
              onChange={(event) => setField('salePrice', event.target.value)}
              error={errors.salePrice}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(event) => setField('stock', event.target.value)}
              error={errors.stock}
            />
            <Input
              label="Weight (kg)"
              type="number"
              min="0"
              step="0.01"
              value={formData.weight}
              onChange={(event) => setField('weight', event.target.value)}
              error={errors.weight}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { key: 'isActive', label: 'Visible on storefront', description: 'Allow customers to see and buy this item.' },
              { key: 'isFeatured', label: 'Featured product', description: 'Promote this item on landing sections.' },
              { key: 'isBestSeller', label: 'Best seller', description: 'Highlight strong-performing products.' },
              { key: 'isNewArrival', label: 'New arrival', description: 'Flag this product as recently launched.' },
            ].map((option) => {
              const field = option.key as keyof Pick<FormState, 'isActive' | 'isFeatured' | 'isBestSeller' | 'isNewArrival'>;
              const checked = formData[field];

              return (
                <label key={option.key} className={cn(
                  'flex cursor-pointer flex-col gap-2 rounded-2xl border px-4 py-3 transition-all',
                  checked ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white'
                )}>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => setField(field, event.target.checked as FormState[typeof field])}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600"
                    />
                    {option.label}
                  </span>
                  <span className="text-xs text-slate-600">{option.description}</span>
                </label>
              );
            })}
          </div>
        </TabContent>

        <TabContent id="media" className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-slate-900">Images, tags, and SEO</p>
            </div>
            <p className="text-sm text-slate-600">
              Keep gallery images and search metadata aligned so the catalog stays polished across the storefront.
            </p>
          </div>

          {formData.imageUrls.length > 0 && (
            <div>
              <p className="mb-2 text-body-sm font-medium text-foreground">Existing gallery images</p>
              <div className="flex flex-wrap gap-3">
                {formData.imageUrls.map((url) => (
                  <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="Product preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImageUrl(url)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-slate-950/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove gallery image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ImageUploader
            label="Upload gallery images"
            maxFiles={6}
            hint="Upload JPG, PNG, or WebP assets for the product gallery."
            onFilesChange={setPendingFiles}
          />
          {errors.imageUrls && <p className="text-body-xs text-error-500">{errors.imageUrls}</p>}

          <Input
            label="Tags"
            value={formData.tags}
            onChange={(event) => setField('tags', event.target.value)}
            hint="Separate tags with commas, e.g. gift, premium, birthday"
            error={errors.tags}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="SEO title"
              value={formData.seoTitle}
              onChange={(event) => setField('seoTitle', event.target.value)}
              hint={`${formData.seoTitle.length}/70 characters`}
              error={errors.seoTitle}
            />
            <div>
              <label htmlFor="seo-description" className="mb-1.5 block text-body-sm font-medium text-foreground">
                SEO description
              </label>
              <textarea
                id="seo-description"
                value={formData.seoDescription}
                onChange={(event) => setField('seoDescription', event.target.value)}
                rows={4}
                className={cn(
                  'w-full rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
                  errors.seoDescription && 'border-error-500 focus:border-error-500 focus:ring-error-500/30'
                )}
              />
              <p className="mt-1 text-body-xs text-muted">{formData.seoDescription.length}/160 characters</p>
              {errors.seoDescription && <p className="mt-1 text-body-xs text-error-500">{errors.seoDescription}</p>}
            </div>
          </div>
        </TabContent>
      </Tabs>
    </form>
  );
}
