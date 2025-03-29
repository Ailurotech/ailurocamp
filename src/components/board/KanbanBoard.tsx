'use client';

import { useEffect, useState, useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, LinkIcon, CalendarIcon } from '@heroicons/react/20/solid';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProps,
  DragStart,
} from 'react-beautiful-dnd';
import CreateProjectModal from './CreateProjectModal';
import NewIssueModal from './NewIssueModal';

// StrictModeDroppable component to handle React 18 strict mode
const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) {
    return null;
  }
  return <Droppable {...props}>{children}</Droppable>;
};

// To fix the isCombineEnabled error in development
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Project {
  id: number;
  name: string;
  isV2?: boolean;
  orgProject?: boolean;
}

interface Card {
  id: number | string;
  note: string;
  content_url: string;
  title?: string;
  created_at: string;
  number?: number;
}

interface Column {
  id: number | string;
  name: string;
  cards: Card[];
  isV2?: boolean;
  field_id?: string;
  project_id?: number;
}

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

  // Load projects
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

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/board');
      const data = await response.json();

      if (response.ok && data.projects) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        }
      } else {
        setDragError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setDragError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectColumns = async (projectId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/board?projectId=${projectId}`);
      const data = await response.json();

      if (response.ok && data.columns) {
        // Log the first card of each column if it exists
        data.columns.forEach((col: Column) => {
          if (col.cards && col.cards.length > 0) {
          }
        });
        setColumns(data.columns);
      } else {
        setDragError('Failed to load board columns');
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      setDragError('Failed to load board columns');
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (result: DragStart) => {
    console.log('Drag started:', result);
  };

  const onDragEnd = async (result: DropResult) => {
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
      // Find the source and destination columns
      const sourceColumn = columns.find(
        (col) => col.id.toString() === source.droppableId
      );
      const destColumn = columns.find(
        (col) => col.id.toString() === destination.droppableId
      );

      if (!sourceColumn || !destColumn) {
        console.error('Column not found:', {
          source: source.droppableId,
          destination: destination.droppableId,
        });
        throw new Error('Invalid column');
      }

      // Find the card being moved
      const movedCard = sourceColumn.cards[source.index];
      if (!movedCard) {
        console.error('Card not found:', {
          index: source.index,
          cards: sourceColumn.cards,
        });
        throw new Error('Card not found');
      }

      // Create new arrays for the cards
      const newSourceCards = Array.from(sourceColumn.cards);
      newSourceCards.splice(source.index, 1);

      let newDestCards;
      if (sourceColumn.id === destColumn.id) {
        // If moving within the same column
        newDestCards = newSourceCards;
      } else {
        // If moving to a different column
        newDestCards = Array.from(destColumn.cards);
      }
      newDestCards.splice(destination.index, 0, movedCard);

      // Update the columns state optimistically
      const updatedColumns = columns.map((col) => {
        if (col.id.toString() === source.droppableId) {
          return {
            ...col,
            cards:
              sourceColumn.id === destColumn.id ? newDestCards : newSourceCards,
          };
        }
        if (
          col.id.toString() === destination.droppableId &&
          sourceColumn.id !== destColumn.id
        ) {
          return { ...col, cards: newDestCards };
        }
        return col;
      });

      // Update the state immediately for a smooth UI experience
      setColumns(updatedColumns);

      // Make the API call to persist the change
      const requestBody = {
        action: 'moveCard',
        cardId: movedCard.id,
        columnId: destColumn.id,
        position: destination.index === 0 ? 'top' : 'bottom',
        isV2: Boolean(destColumn.isV2),
        fieldId: destColumn.field_id,
        projectId: destColumn.project_id,
      };

      console.log('Moving card with data:', {
        card: movedCard,
        sourceColumn,
        destColumn,
        requestBody,
      });

      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.clone().json();

      if (!response.ok) {
        console.error('API Error:', responseData);
        throw new Error(responseData.error || 'Failed to update card position');
      }
    } catch (error) {
      console.error('Error moving card:', error);
      // Revert to the original state if there was an error
      setColumns(columns);
      setDragError('Failed to move card. Changes reverted.');
    }
  };

  const handleCreateIssue = async (
    title: string,
    body: string,
    labels: string[]
  ) => {
    try {
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createIssue',
          title,
          body,
          labels,
        }),
      });

      if (response.ok) {
        if (selectedProject) {
          fetchProjectColumns(selectedProject);
        }
      } else {
        setDragError('Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      setDragError('Failed to create issue');
    } finally {
      setIsNewIssueModalOpen(false);
    }
  };

  if (!session || !enabled) {
    return null;
  }

  return (
    <div className="p-4">
      {/* Error message */}
      {dragError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {dragError}
        </div>
      )}

      {/* Header */}
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

      {/* Board */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <DragDropContext
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          isCombineEnabled={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {columns.map((column) => {
              const columnId =
                typeof column.id === 'string'
                  ? column.id
                  : `PVTSSF_${column.id}`;
              return (
                <StrictModeDroppable
                  key={columnId}
                  droppableId={columnId}
                  isDropDisabled={false}
                  isCombineEnabled={false}
                  ignoreContainerClipping={false}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-100 rounded-lg p-2 transition-colors duration-200 ${
                        snapshot.isDraggingOver
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : ''
                      }`}
                    >
                      <h2 className="font-semibold text-lg mb-2 px-2">
                        {column.name}
                      </h2>
                      <div className="min-h-[500px]">
                        {column.cards.map((card, index) => {
                          // Use the exact ID format from the API
                          const cardId =
                            typeof card.id === 'string'
                              ? card.id
                              : `PVTI_${card.id}`;
                          return (
                            <Draggable
                              key={cardId}
                              draggableId={cardId}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={provided.draggableProps.style}
                                  className="mb-2"
                                >
                                  <div
                                    className={`bg-white rounded-lg shadow p-3 ${
                                      snapshot.isDragging
                                        ? 'shadow-lg opacity-75'
                                        : ''
                                    }`}
                                  >
                                    {card.title && (
                                      <div className="text-sm font-medium mb-2">
                                        {card.title}
                                        {card.number && (
                                          <span className="ml-2 text-gray-500">
                                            #{card.number}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {card.note && (
                                      <div className="text-xs text-gray-600 mb-2">
                                        {card.note.length > 100
                                          ? `${card.note.substring(0, 100)}...`
                                          : card.note}
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <div className="flex items-center">
                                        <CalendarIcon className="w-3 h-3 mr-1" />
                                        {new Date(
                                          card.created_at
                                        ).toLocaleDateString()}
                                      </div>
                                      {card.content_url && (
                                        <a
                                          href={card.content_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-blue-500"
                                        >
                                          <LinkIcon className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </StrictModeDroppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Modals */}
      <NewIssueModal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />
    </div>
  );
}
