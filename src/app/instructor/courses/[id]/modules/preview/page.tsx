'use client';

import React, { useEffect, useState } from 'react';
import PopupModal, { PopupProps } from '@/components/ui/PopupModal';
import Loading from '@/components/ui/Loading';
import { fetchModules } from '@/lib/instructor/ModuleRequest';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  PreviewModuleList,
  PreviewModuleCard,
} from '@/components/instructor/InstructorModulePage/ModulePreview';
import type { IModule } from '@/types/module';

export default function InstructorModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const courseId: string = React.use(params).id;

  // State for a selected module
  const [selectedModule, setSelectedModule] = useState<IModule | null>(null);

  // State for popup modal (error)
  const [popup, setPopup] = useState<PopupProps | null>(null);

  // Session
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();

  // Check if user is authenticated and is an instructor
  useEffect(() => {
    if (
      sessionStatus !== 'authenticated' ||
      session?.user?.currentRole !== 'instructor'
    ) {
      // Redirect to login page
      router.push('auth/login');
      return;
    }
  }, [session, sessionStatus, router]);

  // Fetch modules by course ID
  const {
    data: fetchedModules,
    isPending,
    isSuccess,
    isError,
  } = useQuery<{ modules: IModule[] }, Error>({
    queryKey: ['modules', courseId],
    queryFn: () => fetchModules(courseId),
    enabled:
      sessionStatus === 'authenticated' &&
      session?.user?.currentRole === 'instructor',
  });

  useEffect(() => {
    if (isSuccess && fetchedModules.modules.length > 0 && !selectedModule) {
      // Auto-select first module if available
      setSelectedModule(fetchedModules.modules[0]);
    }
  }, [isSuccess, fetchedModules, selectedModule]);

  // Error handling for fetch modules
  useEffect(() => {
    if (isError) {
      setPopup({
        message: 'Failed to fetch modules, please refresh to try again.',
        type: 'error',
        onClose: () => {
          setPopup(null);
        },
      });
    }
  }, [isError, courseId]);

  // Show loading component if courses are being fetched
  if (isPending) {
    return <Loading />;
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Module List */}
      <div className="w-1/2">
        {fetchedModules && (
          <PreviewModuleList
            modules={fetchedModules.modules}
            selectedModuleId={selectedModule ? selectedModule._id : null}
            onSelectModule={(module) => setSelectedModule(module)}
          />
        )}
      </div>

      {/* Module Details Card */}
      <div className="w-1/2">
        <PreviewModuleCard module={selectedModule} />
      </div>

      {/* Popup Modal */}
      {popup && <PopupModal {...popup} onClose={popup.onClose} />}
    </main>
  );
}
