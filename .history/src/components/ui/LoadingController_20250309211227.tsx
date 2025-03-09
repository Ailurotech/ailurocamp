// 'use client';

// import LoadingSpinner from './LoadingSpinner';
// import React, { useState, useEffect } from 'react';

// export default function LoadingController() {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 2000);
//     return () => clearTimeout(timer);
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <LoadingSpinner label="Loading.............." />
//       </div>
//     );
//   }
// }

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import LoadingSpinner from '@/components/LoadingSpinner'; // 引入你自定义的 LoadingSpinner 组件

// 假设这些 icon 已经正确导入
import {
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  ChevronUpDownIcon,
  LogoutIcon,
} from '@/components/icons';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
  { name: 'Instructors', href: '/admin/instructors', icon: AcademicCapIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false); // 新增状态记录角色切换加载情况

  // 如果会话正在加载，显示 Loading 信息
  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  // 非管理员用户访问提示
  if (session?.user?.currentRole !== 'admin') {
    return <div>Access Denied. Admin only.</div>;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  // 修改 switchToRole 函数，增加 loading 状态控制
  const switchToRole = async (role: string) => {
    try {
      setRoleSwitchLoading(true); // 开始加载，显示 Spinner
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

      // 更新会话中的当前角色
      await update({ currentRole: role });

      // 根据切换后的角色决定跳转页面
      const link: string =
        role === 'student' ? '/dashboard' : `/${role.toLowerCase()}`;
      router.push(link);
    } catch (error) {
      console.error('Error switching role:', error);
    } finally {
      setRoleSwitchLoading(false); // 请求完成后关闭 Spinner
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <Link
                  href="/admin"
                  className="text-2xl font-bold text-indigo-600"
                >
                  Admin Panel
                </Link>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                          isActive
                            ? 'text-indigo-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-900"
                >
                  <LogoutIcon
                    className="mr-3 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500"
                    aria-hidden="true"
                  />
                  Logout
                </button>
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="relative inline-block text-left w-full">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="group w-full flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="inline-block h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                          <svg
                            className="h-full w-full text-gray-300"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                    <ChevronUpDownIcon
                      className="ml-2 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute bottom-full mb-2 right-0 left-0 z-10 w-full origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {/* 当正在加载角色切换时，显示 LoadingSpinner */}
                        {roleSwitchLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <LoadingSpinner size="small" label="Switching..." />
                          </div>
                        ) : (
                          <>
                            {session?.user?.roles?.includes('instructor') &&
                              session?.user?.currentRole !== 'instructor' && (
                                <button
                                  onClick={() => switchToRole('instructor')}
                                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                  Switch to Instructor
                                </button>
                              )}
                            {session?.user?.roles?.includes('student') &&
                              session?.user?.currentRole !== 'student' && (
                                <button
                                  onClick={() => switchToRole('student')}
                                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                >
                                  Switch to Student
                                </button>
                              )}
                            <button
                              onClick={handleSignOut}
                              className="block w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100 text-left"
                            >
                              Sign out
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-64 flex-1">
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
