import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/** Convenience hook for authentication state and actions */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user ?? null;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isStaff = user?.role === 'STAFF' || isAdmin;

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const requireAuth = (callbackUrl?: string) => {
    if (!isAuthenticated && !isLoading) {
      const url = callbackUrl || window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(url)}`);
      return false;
    }
    return true;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isStaff,
    logout,
    requireAuth,
    session,
  };
}
