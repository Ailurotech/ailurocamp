import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import type { IModule } from '@/types/module';

// Module List
interface PreviewModuleListProps {
  modules: IModule[];
  selectedModuleId: string | null;
  onSelectModule: (module: IModule) => void;
}

export function PreviewModuleList({
  modules,
  selectedModuleId,
  onSelectModule,
}: PreviewModuleListProps) {
  const router = useRouter();

  return (
    <div className="h-full border-r border-gray-200 bg-white overflow-y-auto">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="font-semibold text-lg">Modules</h2>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
      <ul>
        {modules.map((module) => (
          <li
            key={module._id}
            className={clsx(
              'cursor-pointer p-3 border-b hover:bg-gray-50',
              selectedModuleId === module._id && 'bg-blue-50'
            )}
            onClick={() => onSelectModule(module)}
          >
            {module.title}
          </li>
        ))}
        {modules.length === 0 && (
          <li className="p-4 text-center text-sm text-gray-500">
            No modules for now.
          </li>
        )}
      </ul>
    </div>
  );
}

// Module Card
export function PreviewModuleCard({ module }: { module: IModule | null }) {
  return (
    <div className="h-full bg-white border-l shadow-md flex flex-col">
      {module ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Module Details</h2>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <h3 className="text-xl font-bold">Title: {module.title}</h3>
            <div>
              <h4 className="font-medium mb-1">Content:</h4>
              <p className="text-gray-700 text-sm">{module.content}</p>
            </div>
            <p className="text-sm text-gray-600">Order: {module.order}</p>
            <p className="text-sm text-gray-600">
              Duration: {module.duration} minutes
            </p>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500"></div>
      )}
    </div>
  );
}
