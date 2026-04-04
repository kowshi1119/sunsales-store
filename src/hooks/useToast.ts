import toast from 'react-hot-toast';

/** Convenience hook for consistent toast notifications */
export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string) => toast.dismiss(toastId),
    promise: <T,>(
      promise: Promise<T>,
      messages: { loading: string; success: string; error: string }
    ) => toast.promise(promise, messages),
    custom: (message: string, options?: Parameters<typeof toast>[1]) =>
      toast(message, options),
  };
}
