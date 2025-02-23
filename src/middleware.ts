import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequestWithAuth } from 'next-auth/middleware';

// Define role-based route patterns
const roleRoutePatterns = {
  admin: ['/admin', '/admin/dashboard'],
  instructor: ['/instructor', '/instructor/dashboard'],
  student: ['/dashboard'],
};

// Define the default landing pages for each role
const roleDefaultPages = {
  admin: '/admin/dashboard',
  instructor: '/instructor',
  student: '/dashboard',
};

export default async function middleware(req: NextRequestWithAuth) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/'];
  const isPublicPath = publicPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // If the path is public, allow access
  if (isPublicPath) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && req.nextUrl.pathname.startsWith('/auth/')) {
      const currentRole = (token.currentRole as string) || 'student';
      const redirectPath =
        roleDefaultPages[currentRole as keyof typeof roleDefaultPages];
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
    return NextResponse.next();
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRoles = (token.roles as string[]) || ['student'];
  const currentRole = (token.currentRole as string) || userRoles[0];

  // Check if the user is trying to access a role-specific route
  for (const [role, patterns] of Object.entries(roleRoutePatterns)) {
    if (patterns.some((pattern) => req.nextUrl.pathname.startsWith(pattern))) {
      // If user doesn't have the required role, redirect to their appropriate dashboard
      if (!userRoles.includes(role)) {
        const highestRole = userRoles.includes('admin')
          ? 'admin'
          : userRoles.includes('instructor')
            ? 'instructor'
            : 'student';
        return NextResponse.redirect(
          new URL(roleDefaultPages[highestRole], req.url)
        );
      }
      // If user has the role but it's not their current role, redirect to switch role
      if (role !== currentRole) {
        return NextResponse.redirect(
          new URL(
            roleDefaultPages[currentRole as keyof typeof roleDefaultPages],
            req.url
          )
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
