'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, LinkIcon, CalendarIcon } from '@heroicons/react/20/solid';
import CreateProjectModal from './CreateProjectModal';
import NewIssueModal from './NewIssueModal';

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
}

export default function KanbanBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [expandedColumns, setExpandedColumns] = useState<
    Record<string, boolean>
  >({});

  const { status } = useSession();
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectColumns(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      console.log(1);
      const response = await fetch('/api/board');

      console.log(2);
      const data = await response.json();

      if (response.status === 401) {
        setLoading(false);
        return;
      }

      if (data && data.projects) {
        setProjects(data.projects);

        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        }
      } else {
        setProjects([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const fetchProjectColumns = async (projectId: number) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/board?projectId=${projectId}`);
      const data = await response.json();

      if (response.status === 401) {
        setLoading(false);
        return;
      }

      if (data && data.columns) {
        // Process columns to ensure consistent data format
        const processedColumns = data.columns.map((column: Column) => {
          // Ensure column ID is a string
          const processedColumn = {
            ...column,
            id: column.id.toString(),
          };

          // Process cards if they exist
          if (column.cards && Array.isArray(column.cards)) {
            processedColumn.cards = column.cards.map((card: Card) => ({
              ...card,
              id: card.id.toString(),
            }));
          } else {
            processedColumn.cards = [];
          }

          return processedColumn;
        });

        setColumns(processedColumns);
      } else {
        setColumns([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching project columns:', error);
      setLoading(false);
      setColumns([]);
    }
  };

  const handleCreateIssue = async (
    title: string,
    body: string,
    labels: string[]
  ) => {
    try {
      await fetch('/api/board', {
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

      // Refresh the board after creating a new issue
      if (selectedProject) {
        fetchProjectColumns(selectedProject);
      }

      setIsNewIssueModalOpen(false);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleCardClick = (card: Card) => {
    if (card.content_url) {
      window.open(card.content_url, '_blank');
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agile Board</h1>
          <Button onClick={() => setIsCreateProjectModalOpen(true)}>
            Create Project
          </Button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No Projects Found
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  No GitHub Project boards were found for this repository. You
                  can:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>
                    Click the &quot;Create Project&quot; button above to create
                    a new project
                  </li>
                  <li>
                    Check that your GitHub token has the correct permissions
                  </li>
                  <li>
                    Verify that GitHub Projects are enabled for your repository
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    );
  }
  console.log('columns: ', columns);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agile Board</h1>

        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(Number(e.target.value))}
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
          >
            <PlusIcon className="w-5 h-5 mr-1" />
            New Issue
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...columns].reverse().map((column) => {
            const toggleExpand = (columnId: string) => {
              setExpandedColumns((prev) => ({
                ...prev,
                [columnId]: !prev[columnId],
              }));
            };

            const isExpanded = expandedColumns[column.id.toString()];
            const visibleCards = isExpanded
              ? column.cards
              : column.cards.slice(0, 5);

            return (
              <div
                key={column.id.toString()}
                className="bg-gray-100 rounded-lg p-2"
              >
                <h2 className="font-semibold text-lg mb-2 px-2">
                  {column.name}
                </h2>
                <div className="min-h-[500px]">
                  {visibleCards.map((card) => (
                    <Card
                      key={card.id.toString()}
                      className="mb-2 cursor-pointer"
                      onClick={() => handleCardClick(card)}
                    >
                      {card.title && (
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            {card.title}
                            {card.number && (
                              <span className="ml-2 text-gray-500 text-sm">
                                #{card.number}
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>
                      )}

                      {card.note && (
                        <CardContent className="py-0 px-4 text-xs text-gray-600">
                          {card.note.length > 100
                            ? `${card.note.substring(0, 100)}...`
                            : card.note}
                        </CardContent>
                      )}

                      <CardContent className="py-2 px-4 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {new Date(card.created_at).toLocaleDateString()}
                        </div>

                        {card.content_url && (
                          <div className="text-blue-500">
                            <LinkIcon className="w-3 h-3" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Expand/Collapse Button */}
                {column.cards.length > 5 && (
                  <button
                    className="w-full text-blue-500 text-sm mt-2"
                    onClick={() => toggleExpand(column.id.toString())}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <NewIssueModal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
