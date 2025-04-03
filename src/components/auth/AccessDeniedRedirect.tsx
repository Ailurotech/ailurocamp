import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessDeniedRedirectProps {
  redirectPath?: string;
}

export default function AccessDeniedRedirect({
  redirectPath = '/dashboard',
}: AccessDeniedRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    try {
      router.replace(redirectPath);
    } catch (error) {
      console.error('Failed to redirect:', error);
    }
  }, [redirectPath, router]);

  return <div>Access Denied</div>;
}
