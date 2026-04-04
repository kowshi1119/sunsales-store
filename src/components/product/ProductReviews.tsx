'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MessageSquareText, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUploader from '@/components/ui/ImageUploader';
import Modal from '@/components/ui/Modal';
import { Badge, EmptyState } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/PriceDisplay';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/formatters';
import { reviewSchema, type ReviewInput } from '@/lib/validators';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/types/product';

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
  avgRating: number;
  reviewCount: number;
}

const REVIEWS_PER_PAGE = 4;

function getBarWidthClass(percentage: number) {
  if (percentage <= 0) return 'w-0';
  if (percentage <= 10) return 'w-[10%]';
  if (percentage <= 20) return 'w-[20%]';
  if (percentage <= 30) return 'w-[30%]';
  if (percentage <= 40) return 'w-[40%]';
  if (percentage <= 50) return 'w-1/2';
  if (percentage <= 60) return 'w-[60%]';
  if (percentage <= 70) return 'w-[70%]';
  if (percentage <= 80) return 'w-[80%]';
  if (percentage <= 90) return 'w-[90%]';
  return 'w-full';
}

export default function ProductReviews({ productId, productSlug, reviews, avgRating, reviewCount }: ProductReviewsProps) {
  const router = useRouter();
  const { isAuthenticated, requireAuth } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<ReviewInput>({
    defaultValues: {
      rating: 5,
      title: '',
      comment: '',
    },
  });

  const currentRating = watch('rating');
  const currentPageReviews = reviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));

  const breakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      return {
        stars,
        count,
        percentage: reviewCount > 0 ? (count / reviewCount) * 100 : 0,
      };
    });
  }, [reviews, reviewCount]);

  const openReviewModal = () => {
    const callbackUrl = `/shop/${productSlug}#product-reviews`;

    if (!requireAuth(callbackUrl)) {
      return;
    }

    setIsModalOpen(true);
  };

  const onSubmit = async (data: ReviewInput) => {
    if (!isAuthenticated) {
      requireAuth(`/shop/${productSlug}#product-reviews`);
      return;
    }

    const parsed = reviewSchema.safeParse(data);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = (issue?.path[0] as keyof ReviewInput | undefined) ?? 'comment';
      setError(field, { type: 'manual', message: issue?.message || 'Please review your input.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];

      for (const image of reviewImages) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('folder', 'reviews');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data?.url) {
          throw new Error(uploadResult.message || 'Failed to upload review image.');
        }

        imageUrls.push(uploadResult.data.url);
      }

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: imageUrls,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to submit your review.');
      }

      toast.success(result.message || 'Review submitted successfully.');
      setIsModalOpen(false);
      setReviewImages([]);
      reset({ rating: 5, title: '', comment: '' });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit your review right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="product-reviews" className="rounded-3xl border border-surface-border bg-white p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Customer Reviews</p>
          <h2 className="mt-1 text-display-md font-display text-foreground">What customers are saying</h2>
        </div>

        <Button onClick={openReviewModal} leftIcon={<MessageSquareText className="h-4 w-4" />}>
          Write a Review
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-2xl bg-surface-card p-4">
          <div className="flex items-end gap-3">
            <span className="text-display-lg font-display text-foreground">{avgRating.toFixed(1)}</span>
            <div>
              <StarRating rating={avgRating} showCount count={reviewCount} />
              <p className="mt-1 text-body-sm text-muted">Based on {reviewCount} verified reviews</p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {breakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-2">
                <span className="w-10 text-body-sm text-foreground">{item.stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-border">
                  <div className={cn('h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-coral', getBarWidthClass(item.percentage))} />
                </div>
                <span className="w-8 text-right text-body-xs text-muted">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="No reviews yet"
            description="Be the first to share your experience with this product."
            action={
              <Button onClick={openReviewModal}>Be the First Reviewer</Button>
            }
            className="py-10"
          />
        ) : (
          <div className="space-y-4">
            {currentPageReviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-surface-border p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={review.user.fullName} src={review.user.avatar} size="md" />
                    <div>
                      <p className="text-body-md font-semibold text-foreground">{review.user.fullName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-body-xs text-muted">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {review.isVerified && (
                    <Badge variant="success" dot>
                      Verified Purchase
                    </Badge>
                  )}
                </div>

                {review.title && (
                  <h3 className="mt-4 text-body-md font-semibold text-foreground">{review.title}</h3>
                )}
                <p className="mt-2 whitespace-pre-line text-body-md leading-7 text-muted">{review.comment}</p>

                {review.images.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.images.map((image, index) => (
                      <div key={`${review.id}-${index}`} className="relative h-16 w-16 overflow-hidden rounded-xl border border-surface-border bg-surface-warm">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized={image.startsWith('/images/')}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {review.adminReply && (
                  <div className="mt-4 rounded-xl bg-surface-card p-3">
                    <p className="text-body-xs font-semibold uppercase tracking-wider text-primary-500">Sun Sales response</p>
                    <p className="mt-1 text-body-sm text-muted">{review.adminReply}</p>
                  </div>
                )}
              </article>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-surface-border pt-3">
                <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <span className="text-body-sm text-muted">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Review" description="Share your honest experience to help other shoppers." size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <p className="mb-2 text-body-sm font-medium text-foreground">Your Rating</p>
            <StarRating
              rating={currentRating}
              interactive
              size="lg"
              onChange={(rating) => setValue('rating', rating, { shouldValidate: true })}
            />
            {errors.rating && <p className="mt-1 text-body-xs text-error-500">{errors.rating.message}</p>}
          </div>

          <Input
            label="Review Title"
            placeholder="What stood out to you?"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="review-comment" className="text-body-sm font-medium text-foreground">
              Review
            </label>
            <textarea
              id="review-comment"
              rows={5}
              className={cn(
                'w-full rounded-md border border-surface-border bg-white px-4 py-3 text-body-md text-foreground placeholder:text-muted-light transition-all duration-fast',
                'focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400',
                errors.comment && 'border-error-500 focus:ring-error-500/30 focus:border-error-500'
              )}
              placeholder="Tell us about quality, delivery, and the overall experience."
              {...register('comment')}
            />
            {errors.comment && <p className="text-body-xs text-error-500">{errors.comment.message}</p>}
          </div>

          <ImageUploader
            maxFiles={3}
            label="Add Photos"
            hint="Optional — upload up to 3 images to show your product in real life."
            onFilesChange={setReviewImages}
          />

          <div className="flex items-start gap-2 rounded-xl bg-surface-card p-3 text-body-sm text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-primary-500" />
            Reviews from signed-in customers are moderated before appearing publicly to keep the storefront helpful and trustworthy.
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} loadingText="Submitting...">
              Submit Review
            </Button>
          </div>

          {!isAuthenticated && (
            <p className="text-body-xs text-muted">
              Need to sign in first? <Link href={`/login?callbackUrl=/shop/${productSlug}#product-reviews`} className="font-medium text-primary-600">Go to login</Link>
            </p>
          )}
        </form>
      </Modal>
    </section>
  );
}
