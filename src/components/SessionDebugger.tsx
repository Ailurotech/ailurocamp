'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionDebugger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('NextAuth Session Status:', status);
    console.log('Session Data:', session);
  }, [session, status]);

  return null;
}
