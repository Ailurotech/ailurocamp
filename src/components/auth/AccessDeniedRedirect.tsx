import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessDeniedRedirectProps {
  redirectPath?: string;
}

const isValidPath = (path: string) => {
  try {
    const url = new URL(path, window.location.origin);
    return url.origin === window.location.origin; // Ensure the path is relative to the same origin
  } catch {
    return false;
  }
};

export default function AccessDeniedRedirect({
  redirectPath = '/dashboard',
}: AccessDeniedRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    try {
      if (!isValidPath(redirectPath)) {
        console.warn(
          'Invalid redirect path detected, defaulting to /dashboard'
        );
        router.replace('/dashboard');
      } else {
        router.replace(redirectPath);
      }
    } catch (error) {
      console.error('Failed to redirect:', error);
    }
  }, [redirectPath, router]);

  return <div>Access Denied</div>;
}
