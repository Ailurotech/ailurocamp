'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  ClipboardIcon,
  ChartBarIcon,
  CogIcon,
  ChevronUpDownIcon,
  LogoutIcon,
} from '@/components/ui/Icons';
import AccessDeniedRedirect from '@/components/auth/AccessDeniedRedirect';

const navigation = [
  { name: 'Overview', href: '/instructor', icon: HomeIcon },
  { name: 'Students', href: '/instructor/students', icon: UsersIcon },
  { name: 'Courses', href: '/instructor/courses', icon: BookOpenIcon },
  { name: 'Assignments', href: '/instructor/assignments', icon: ClipboardIcon },
  { name: 'Analytics', href: '/instructor/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/instructor/settings', icon: CogIcon },
];

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // If the session is still loading, show a loading message
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // Redirect if not instructor
  if (!session?.user?.roles.includes('instructor')) {
    return <AccessDeniedRedirect redirectPath="dashboard" />;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const switchToRole = async (role: string) => {
    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newRole: role }),
      });

      if (!response.ok) {
        throw new Error('Failed to switch role');
      }

      // update the session
      await update({ currentRole: role });

      if (session?.user?.currentRole !== 'instructor') {
        return <AccessDeniedRedirect redirectPath="dashboard" />;
      }

      // Refresh the page to update the session
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'instructor') {
        router.push('/instructor');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error switching role:', error);
    }
  };

  return (
    <div>
      <div className="min-h-full">
        <div className="bg-indigo-600 pb-32">
          <nav className="border-b border-indigo-300 border-opacity-25 bg-indigo-600 lg:border-none">
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
              <div className="relative flex h-16 items-center justify-between lg:border-b lg:border-indigo-400 lg:border-opacity-25">
                <div className="flex items-center px-2 lg:px-0">
                  <div className="flex-shrink-0">
                    <Link
                      href="/instructor"
                      className="text-2xl font-bold text-white"
                    >
                      LMS
                    </Link>
                  </div>
                  <div className="hidden lg:ml-10 lg:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`${
                              isActive
                                ? 'bg-indigo-700 text-white'
                                : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                            } rounded-md py-2 px-3 text-sm font-medium`}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex lg:hidden">
                  {/* Mobile menu button */}
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                  >
                    <span className="sr-only">Open main menu</span>
                    {/* Menu icon */}
                    <svg
                      className="block h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:ml-4 lg:block">
                  <div className="flex items-center">
                    <div className="relative ml-3">
                      <div>
                        <button
                          type="button"
                          className="flex items-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                          onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                        >
                          <span>{session?.user?.currentRole}</span>
                          <ChevronUpDownIcon
                            className="ml-2 -mr-0.5 h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      {isRoleMenuOpen && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {session?.user?.roles.map((role: string) => (
                            <button
                              key={role}
                              className={`${
                                role === session?.user?.currentRole
                                  ? 'bg-gray-100'
                                  : ''
                              } block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50`}
                              onClick={() => {
                                switchToRole(role);
                                setIsRoleMenuOpen(false);
                              }}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ml-3 flex items-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                      onClick={handleSignOut}
                    >
                      <LogoutIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="lg:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'text-white hover:bg-indigo-500 hover:bg-opacity-75'
                      } block rounded-md py-2 px-3 text-base font-medium`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="border-t border-indigo-700 pb-3 pt-4">
                <div className="space-y-1 px-2">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex w-full items-center rounded-md py-2 px-3 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                      onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    >
                      <span>{session?.user?.currentRole}</span>
                      <ChevronUpDownIcon
                        className="ml-2 -mr-0.5 h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                    {isRoleMenuOpen && (
                      <div className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {session?.user?.roles.map((role: string) => (
                          <button
                            key={role}
                            className={`${
                              role === session?.user?.currentRole
                                ? 'bg-gray-100'
                                : ''
                            } block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50`}
                            onClick={() => {
                              switchToRole(role);
                              setIsRoleMenuOpen(false);
                            }}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center rounded-md py-2 px-3 text-base font-medium text-white hover:bg-indigo-500 hover:bg-opacity-75"
                    onClick={handleSignOut}
                  >
                    <LogoutIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <header className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                {navigation.find((item) => item.href === pathname)?.name ||
                  'Instructor Dashboard'}
              </h1>
            </div>
          </header>
        </div>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
