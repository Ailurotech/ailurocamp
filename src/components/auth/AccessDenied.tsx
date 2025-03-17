import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  redirectPath?: string;
}

export default function AccessDenied({
  redirectPath = '/dashboard',
}: AccessDeniedProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(redirectPath);
  }, [redirectPath, router]);

  return <div>Access Denied</div>;
}
