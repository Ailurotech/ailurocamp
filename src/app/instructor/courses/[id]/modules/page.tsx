'use client';

import React, { useEffect, useState } from 'react';
import ModuleList from '@/components/ui/InstructorModulePage/ModuleList';
import ModuleCard from '@/components/ui/InstructorModulePage/ModuleCard';
import ErrorPopupModal from '@/components/ui/ErrorPopupModal';
import Loading from '@/components/ui/Loading';
import {
  fetchModules,
  updateModule,
  deleteModule,
} from '@/lib/instructor/ModuleRequest';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import EditModuleModal from '@/components/ui/InstructorModulePage/EditModuleModal';
import DeleteModuleModal from '@/components/ui/InstructorModulePage/DeleteModuleModal';
import { IModule } from '@/types/module';

interface PopupError {
  errorMsg: string;
  onClose?: () => void;
}

export default function InstructorModulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const { id: courseId } = useParams<{ id: string }>();
  const { id: courseId }: { id: string } = React.use(params);

  // State for a selected module
  // const [modulesState, setModulesState] = useState<IModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<IModule | null>(null);

  // State for editing
  const [editModule, setEditModule] = useState<IModule | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDuration, setEditDuration] = useState(0);

  // State for deleting
  const [moduleToDelete, setModuleToDelete] = useState<IModule | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for error handling
  const [error, setError] = useState<PopupError | undefined>(undefined);

  // Session
  const { data: session, status: sessionStatus } = useSession();

  const router = useRouter();
  const queryClient = useQueryClient();

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
    if (isSuccess && fetchedModules.modules.length > 0) {
      // setModulesState(fetchedModules.modules);
      // Auto-select first module if available
      setSelectedModule(fetchedModules.modules[0]);
    }
  }, [isSuccess, fetchedModules]);

  // Error handling for fetch modules
  useEffect(() => {
    if (isError) {
      setError({
        errorMsg: 'Failed to fetch modules, please try again.',
        onClose: () => {
          setError(undefined);
          fetchModules(courseId);
        },
      });
    }
  }, [isError, courseId]);

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: (variables: { moduleId: string; changes: Partial<IModule> }) =>
      updateModule(courseId, variables.moduleId, variables.changes),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      if (selectedModule?._id === res.updatedModule._id) {
        setSelectedModule(res.updatedModule);
      }
    },
    onError: () => {
      setError({
        errorMsg: 'Failed to update module, please try again.',
        onClose: () => {
          setError(undefined);
        },
      });
    },
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => deleteModule(courseId, moduleId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
      if (selectedModule?._id === res.deletedModule._id) {
        console.log('selectedModule', selectedModule);
        console.log('res.deletedModule', res.deletedModule);
        
        setSelectedModule(null);
        console.log('selectedModule', selectedModule);
        
      }
    },
    onError: () => {
      setError({
        errorMsg: 'Failed to delete module, please try again.',
        onClose: () => {
          setError(undefined);
        },
      });
    },
  });

  // Edit logic
  function openEditModal(module: IModule): void {
    setEditModule(module);
    setEditTitle(module.title);
    setEditContent(module.content);
    setEditDuration(module.duration);
    setIsEditModalOpen(true);
  }

  // Save edited module
  async function handleSaveEdit(): Promise<void> {
    if (!editModule) return;

    // Check if there are any changes
    const changes: {
      title?: string;
      content?: string;
      order?: number;
      duration?: number;
    } = {};
    if (editModule.title !== editTitle) {
      changes.title = editTitle;
    }
    if (editModule.content !== editContent) {
      changes.content = editContent;
    }
    if (editModule.duration !== editDuration) {
      changes.duration = editDuration;
    }

    // If there are no changes, close the modal
    if (Object.keys(changes).length === 0) {
      setIsEditModalOpen(false);
      setEditModule(null);
      return;
    }

    // Send update request
    updateModuleMutation.mutate({
      moduleId: editModule._id,
      changes: changes,
    });

    // Close the modal
    setIsEditModalOpen(false);
    setEditModule(null);
  }

  // Delete logic
  function openDeleteModal(module: IModule): void {
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  }

  // Send delete request
  async function handleDeleteModule(moduleId: string): Promise<void> {
    // Send delete request
    deleteModuleMutation.mutate(moduleId);

    // Close the modal
    setIsDeleteModalOpen(false);
    setModuleToDelete(null);
  }

  /**
   * Handle reordering modules after a drag-and-drop event in ModuleList.
   * This function is passed to <ModuleList onReorderModules={...} />.
   */
  function handleReorderModules(newModules: IModule[]) {
    // Optimistically update the list in the query cache (optional but nice).
    queryClient.setQueryData(['modules', courseId], (oldData: { modules: IModule[] }) => {
      if (!oldData || !oldData.modules) return oldData;
      return {
        ...oldData,
        modules: newModules,
      };
    });

    // Update each module’s `order` in the database
    newModules.forEach((module: IModule, index: number) => {
      if (module.order !== index) {
        updateModuleMutation.mutate({
          moduleId: module._id,
          changes: { order: index },
        });
      }
    });
  }

  // Show loading component if courses are being fetched
  if (isPending) {
    return <Loading />;
  }

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Module List */}
      <div className="w-1/2">
        {fetchedModules && (
          <ModuleList
            modules={fetchedModules.modules}
            selectedModuleId={selectedModule ? selectedModule._id : null}
            onSelectModule={(module) => setSelectedModule(module)}
            courseId={courseId}
            onReorderModules={handleReorderModules}
          />
        )}
      </div>

      {/* Module Details Card */}
      <div className="w-1/2">
        <ModuleCard
          module={selectedModule}
          onEdit={openEditModal}
          isSavingEdit={updateModuleMutation.isPending}
          onDelete={openDeleteModal}
          isDeleting={deleteModuleMutation.isPending}
        />
      </div>

      {/* Error Popup Modal */}
      <ErrorPopupModal
        error={error?.errorMsg}
        onClose={error?.onClose || (() => {})}
      />

      {/* Edit Module Modal */}
      <EditModuleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditModule(null);
        }}
        onSaveEdit={handleSaveEdit}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editContent={editContent}
        setEditContent={setEditContent}
        editDuration={editDuration}
        setEditDuration={setEditDuration}
      />

      {/* Delete Module Modal */}
      <DeleteModuleModal
        isOpen={isDeleteModalOpen}
        moduleToDelete={moduleToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteModule}
      />
    </main>
  );
}
