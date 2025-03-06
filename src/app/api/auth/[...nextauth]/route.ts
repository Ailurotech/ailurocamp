import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Removed static export configuration

// NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
