'use client';

import {
  useEffect,
  useState,
  useLayoutEffect,
  useCallback,
  useMemo,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/20/solid';
import { DragDropContext, DragStart, DropResult } from 'react-beautiful-dnd';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Project,
  Column,
  MoveCardRequest,
  Card,
  APIError,
  APIErrorHandler,
} from '@/types/board';
import { BoardColumn } from './BoardColumn';
import CreateProjectModal from './CreateProjectModal';
import NewIssueModal from './NewIssueModal';

// To fix the isCombineEnabled error in development
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ErrorState {
  message: string;
  type: 'error' | 'warning';
  timestamp: number;
}

/**
 * Handles API requests with proper error handling
 * @param request The fetch request to make
 * @returns The response data
 * @throws Error with proper error message
 */
async function handleAPIRequest<T>(request: Promise<Response>): Promise<T> {
  try {
    const response = await request;
    const data = await response.json();

    if (!response.ok) {
      throw data.error || new Error('API request failed');
    }

    return data;
  } catch (error) {
    const errorMessage = APIErrorHandler.getErrorMessage(error);
    throw new Error(errorMessage);
  }
}

/**
 * KanbanBoard component - Main component for displaying and managing the kanban board
 * Handles project selection, column management, and drag-and-drop functionality
 */
export default function KanbanBoard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [columnLoading, setColumnLoading] = useState<Record<string, boolean>>(
    {}
  );

  // Enable drag and drop only after hydration
  useIsomorphicLayoutEffect(() => {
    setEnabled(true);
  }, []);

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load projects when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  // Load columns when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchProjectColumns(selectedProject);
    }
  }, [selectedProject]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (dragError) {
      const timer = setTimeout(() => setDragError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [dragError]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error in ${context}:`, error);
    setError({
      message: APIErrorHandler.getErrorMessage(error),
      type: 'error',
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Fetches all projects from the API
   * Sets the first project as selected if available
   */
  const fetchProjects = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await handleAPIRequest<{ projects: Project[] }>(
        fetch('/api/board')
      );

      setProjects(data.projects);
      if (data.projects.length > 0) {
        setSelectedProject(data.projects[0].id);
      }
    } catch (error) {
      handleError(error, 'fetchProjects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches columns and their cards for a specific project
   */
  const fetchProjectColumns = async (projectId: number): Promise<void> => {
    if (!projectId) {
      handleError(new Error('Project ID is required'), 'fetchProjectColumns');
      return;
    }

    try {
      setLoading(true);
      const data = await handleAPIRequest<{ columns: Column[] }>(
        fetch(`/api/board?projectId=${projectId}`)
      );

      setColumns(data.columns);
    } catch (error) {
      handleError(error, 'fetchProjectColumns');
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = useCallback((result: DragStart) => {
    console.log('Drag started:', result);
  }, []);

  /**
   * Updates the columns state after a card move
   */
  const updateColumnsState = useCallback(
    (
      currentColumns: Column[],
      sourceColumn: Column,
      destColumn: Column,
      sourceIndex: number,
      destIndex: number,
      movedCard: Card
    ) => {
      const newSourceCards = Array.from(sourceColumn.cards);
      newSourceCards.splice(sourceIndex, 1);

      let newDestCards;
      if (sourceColumn.id === destColumn.id) {
        newDestCards = newSourceCards;
      } else {
        newDestCards = Array.from(destColumn.cards);
      }
      newDestCards.splice(destIndex, 0, movedCard);

      return currentColumns.map((col) => {
        if (col.id.toString() === sourceColumn.id.toString()) {
          return {
            ...col,
            cards:
              sourceColumn.id === destColumn.id ? newDestCards : newSourceCards,
          };
        }
        if (
          col.id.toString() === destColumn.id.toString() &&
          sourceColumn.id !== destColumn.id
        ) {
          return { ...col, cards: newDestCards };
        }
        return col;
      });
    },
    []
  );

  /**
   * Makes an API call to persist card movement
   */
  const persistCardMove = async (
    movedCard: Card,
    destColumn: Column,
    destIndex: number
  ): Promise<void> => {
    if (!movedCard.id || !destColumn.id) {
      throw new Error('Invalid card or column data');
    }

    const requestBody: MoveCardRequest = {
      action: 'moveCard',
      cardId: movedCard.id,
      columnId: destColumn.id,
      position: destIndex === 0 ? 'top' : 'bottom',
      isV2: Boolean(destColumn.isV2),
      fieldId: destColumn.field_id,
      projectId: destColumn.project_id,
    };

    try {
      setColumnLoading((prev: Record<string, boolean>) => ({
        ...prev,
        [destColumn.id.toString()]: true,
      }));

      await handleAPIRequest(
        fetch('/api/board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
      );
    } catch (error) {
      handleError(error, 'persistCardMove');
      throw error; // Re-throw to trigger optimistic update rollback
    } finally {
      setColumnLoading((prev: Record<string, boolean>) => ({
        ...prev,
        [destColumn.id.toString()]: false,
      }));
    }
  };

  /**
   * Handles the end of a drag operation
   * Updates the UI optimistically and makes an API call to persist the changes
   */
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, source } = result;

      if (!destination) {
        console.log('No destination');
        return;
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        console.log('Dropped in same position');
        return;
      }

      try {
        const sourceColumn = columns.find(
          (col) => col.id.toString() === source.droppableId
        );
        const destColumn = columns.find(
          (col) => col.id.toString() === destination.droppableId
        );

        if (!sourceColumn || !destColumn) {
          throw new Error('Invalid column');
        }

        const movedCard = sourceColumn.cards[source.index];
        if (!movedCard) {
          throw new Error('Card not found');
        }

        // Update columns state optimistically
        const updatedColumns = updateColumnsState(
          columns,
          sourceColumn,
          destColumn,
          source.index,
          destination.index,
          movedCard
        );
        setColumns(updatedColumns);

        // Make API call to persist changes
        await persistCardMove(movedCard, destColumn, destination.index);
      } catch (error) {
        console.error('Error moving card:', error);
        setColumns(columns); // Revert to original state
        setDragError('Failed to move card. Changes reverted.');
      }
    },
    [columns, updateColumnsState]
  );

  const handleCreateIssue = useCallback(
    async (title: string, body: string, labels: string[]) => {
      try {
        const response = await fetch('/api/board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'createIssue',
            title,
            body,
            labels,
          }),
        });

        if (response.ok && selectedProject) {
          fetchProjectColumns(selectedProject);
        } else {
          setDragError('Failed to create issue');
        }
      } catch (error) {
        console.error('Error creating issue:', error);
        setDragError('Failed to create issue');
      } finally {
        setIsNewIssueModalOpen(false);
      }
    },
    [selectedProject]
  );

  // Memoize the board content
  const boardContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    return (
      <DragDropContext
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        isCombineEnabled={false}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {columns.map((column, index) => (
            <BoardColumn key={column.id} column={column} index={index} />
          ))}
        </div>
      </DragDropContext>
    );
  }, [columns, loading, onDragStart, onDragEnd]);

  if (!session || !enabled) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="p-4">
        {error && (
          <div
            className={`fixed top-4 right-4 px-4 py-3 rounded ${
              error.type === 'error'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : 'bg-yellow-100 border border-yellow-400 text-yellow-700'
            }`}
          >
            {error.message}
          </div>
        )}

        {dragError && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {dragError}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              className="px-3 py-2 border rounded-md"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              disabled={loading}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>

            <Button
              onClick={() => setIsNewIssueModalOpen(true)}
              className="flex items-center"
              disabled={loading || !selectedProject}
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              New Issue
            </Button>
          </div>
        </div>

        {boardContent}

        <NewIssueModal
          isOpen={isNewIssueModalOpen}
          onClose={() => setIsNewIssueModalOpen(false)}
          onSubmit={handleCreateIssue}
        />

        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onProjectCreated={fetchProjects}
        />
      </div>
    </ErrorBoundary>
  );
}
