'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function SessionDebugger() {
  const { data: session, status } = useSession();

  useEffect(() => {}, [session, status]);

  return null;
}
