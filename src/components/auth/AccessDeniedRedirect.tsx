import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessDeniedRedirectProps {
  redirectPath?: string;
}

export default function AccessDenied({
  redirectPath = '/dashboard',
}: AccessDeniedRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectPath);
  }, [redirectPath, router]);

  return <div>Access Denied</div>;
}
