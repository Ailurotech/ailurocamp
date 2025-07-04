'use client';

import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { IModule } from '@/types/module';

// Child component for each item in the list that you can drag and drop
function SortableModuleItem({
  module,
  selectedModuleId,
  onSelectModule,
}: {
  module: IModule;
  selectedModuleId: string | null;
  onSelectModule: (module: IModule) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module._id });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'relative cursor-move p-4 border border-gray-200 rounded-md shadow-sm mb-2 bg-white transition-colors',
        isDragging && 'opacity-80 ring-2 ring-blue-200',
        selectedModuleId === module._id && '!border-blue-500'
      )}
      onClick={() => {
        onSelectModule(module);
      }}
    >
      {/* drag handle icon */}
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2 text-gray-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M3 9h4V5H3v4zM9 9h4V5H9v4zM15 9h4V5h-4v4zM3 15h4v-4H3v4zM9 15h4v-4H9v4zM15 15h4v-4h-4v4z" />
          </svg>
        </div>
        <span className="font-medium">{module.title}</span>
      </div>
    </li>
  );
}

interface ModuleListProps {
  modules: IModule[];
  selectedModuleId: string | null;
  onSelectModule: (module: IModule) => void;
  courseId: string;
  onReorderModules: (newModules: IModule[]) => void;
}

export default function ModuleList({
  modules,
  selectedModuleId,
  onSelectModule,
  courseId,
  onReorderModules,
}: ModuleListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Do nothing if we didn't move or dropped in the same place
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m._id === active.id);
    const newIndex = modules.findIndex((m) => m._id === over.id);
    const newModules = arrayMove(modules, oldIndex, newIndex);
    onSelectModule(newModules[newIndex]);

    onReorderModules(newModules);
  }

  return (
    <div className="h-full border-r border-gray-200 bg-gray-50 overflow-y-auto">
      {/* Header with navigation and actions */}
      <div className="p-4 border-b bg-white">
        {/* Course navigation */}
        <div className="mb-3">
          <Link
            href="/instructor/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Courses
          </Link>
        </div>

        {/* Module management */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Modules</h2>
          <div className="flex space-x-2">
            <Link href={`/instructor/courses/${courseId}/modules/preview`}>
              <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                Preview
              </button>
            </Link>
            <Link href={`/instructor/courses/${courseId}/modules/new`}>
              <button className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                New Module
              </button>
            </Link>
          </div>
        </div>

        {/* Course content navigation */}
        <div className="flex space-x-4 text-sm">
          <span className="font-medium text-blue-600 border-b-2 border-blue-600 pb-1">
            📚 Modules
          </span>
          <Link
            href={`/instructor/courses/${courseId}/assignments`}
            className="text-gray-600 hover:text-blue-600 transition-colors pb-1"
          >
            📋 Assignments
          </Link>
        </div>
      </div>

      {/* List of modules */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={modules.map((module) => module._id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="px-4 pt-4 pb-12">
            {modules.length === 0 && (
              <li className="p-4 text-center text-sm text-gray-500">
                No modules available.
              </li>
            )}
            {modules.map((module) => (
              <SortableModuleItem
                key={module._id}
                module={module}
                selectedModuleId={selectedModuleId}
                onSelectModule={onSelectModule}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
