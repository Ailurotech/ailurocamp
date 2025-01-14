import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRoleAccess(requiredRole: string) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    const userRoles = session.user.roles || ['student'];
    const currentRole = session.user.currentRole || 'student';

    // If user doesn't have the required role, redirect to appropriate dashboard
    if (!userRoles.includes(requiredRole)) {
      const redirectPath = userRoles.includes('admin') ? '/admin' :
                         userRoles.includes('instructor') ? '/instructor' : 
                         '/dashboard';
      router.push(redirectPath);
      return;
    }

    // If user has the role but it's not their current role, redirect to switch
    if (requiredRole !== currentRole) {
      router.push(`/${currentRole}`);
    }
  }, [session, status, requiredRole, router]);

  return {
    isAuthorized: session?.user.roles?.includes(requiredRole) && session?.user.currentRole === requiredRole,
    isLoading: status === 'loading',
    session,
  };
} 