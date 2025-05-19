'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, LinkIcon, CalendarIcon } from '@heroicons/react/20/solid';
import CreateProjectModal from './CreateProjectModal';
import NewIssueModal from './NewIssueModal';
import {
  addIssueToProjectBoard,
  fetchAllProjects,
  fetchIssuesWithinProjects,
} from '@/services/github';
import NoProjectFound from './NoProjectFound';
import Spinner from './Spinner';
import { useCallback } from 'react';

interface Project {
  id: number;
  name: string;
  isV2?: boolean;
  orgProject?: boolean;
}

interface UniqueProject {
  id: string;
  title: string;
  url: string;
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
  const [uniqueProjects, setUniqueProjects] = useState<UniqueProject[]>([]);
  const [, setUniqueProjectId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [, setNewIssueId] = useState<string>('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const [expandedColumns, setExpandedColumns] = useState<
    Record<string, boolean>
  >({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectColumns(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
      fetchUniqueProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/board');
      const data = await response.json();

      if (response.status === 401) {
        setLoading(false);
        return;
      }

      if (data && data.projects) {
        setProjects(data.projects);

        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
          setSelectedProjectName(data.projects[0].name);
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

  // const fetchUniqueProjects = async () => {
  //   const projects = await fetchAllProjects();
  //   console.log('projects: ', projects);
  //   setUniqueProjects(projects);

  //   if (selectedProjectName) {
  //     const matchedProject = projects.find(
  //       (p: UniqueProject) => p.title === selectedProjectName
  //     );
  //     setUniqueProjectId(matchedProject?.id || '');
  //   }
  // };
  const fetchUniqueProjects = useCallback(async () => {
    const projects = await fetchAllProjects();
    console.log('projects: ', projects);
    setUniqueProjects(projects);

    if (selectedProjectName) {
      const matchedProject = projects.find(
        (p: UniqueProject) => p.title === selectedProjectName
      );
      setUniqueProjectId(matchedProject?.id || '');
    }
  }, [selectedProjectName]);

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
        const processedColumns = data.columns.map((column: Column) => {
          const processedColumn = {
            ...column,
            id: column.id.toString(),
          };

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

  const handleSearchChange = (columnId: string, value: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [columnId]: value.toLowerCase(),
    }));
  };

  const handleCreateIssue = async (
    title: string,
    body: string,
    labels: string[]
  ) => {
    try {
      const repoName = selectedProjectName.toLowerCase().replace(/\s+/g, '-');

      await fetch('/api/board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createIssue',
          title,
          body,
          labels,
          repo: repoName,
        }),
      });

      if (selectedProject) {
        fetchProjectColumns(selectedProject);

        const issues = await fetchIssuesWithinProjects(selectedProjectName);
        const lastIssueId = issues.at(-1)?.id || '';

        const matchedProject = uniqueProjects.find(
          (p) => p.title === selectedProjectName
        );
        const projectId = matchedProject?.id || '';

        if (projectId && lastIssueId) {
          addIssueToProjectBoard(projectId, lastIssueId);
        }

        setNewIssueId(lastIssueId);
        setUniqueProjectId(projectId);
      }

      setIsNewIssueModalOpen(false);
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const handleProjectSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = Number(e.target.value);
    const projectName = projects.find((p) => p.id === projectId)?.name || '';

    setSelectedProject(projectId);
    setSelectedProjectName(projectName);

    const matchedProject = uniqueProjects.find((p) => p.title === projectName);
    setUniqueProjectId(matchedProject?.id || '');
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
    return <Spinner />;
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

        <NoProjectFound />

        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agile Board</h1>

        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border rounded-md"
            value={selectedProject || ''}
            onChange={handleProjectSelection}
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

            const filteredCards = column.cards.filter((card) => {
              const searchTerm = searchTerms[column.id.toString()] || '';
              const formattedDate = new Date(
                card.created_at
              ).toLocaleDateString();
              const cardNumber = card.number ? card.number.toString() : '';

              return (
                card.title?.toLowerCase().includes(searchTerm) ||
                card.note?.toLowerCase().includes(searchTerm) ||
                formattedDate.includes(searchTerm) ||
                cardNumber.includes(searchTerm)
              );
            });

            const visibleCards = isExpanded
              ? filteredCards
              : filteredCards.slice(0, 5);

            return (
              <div
                key={column.id.toString()}
                className="bg-gray-100 rounded-lg p-2"
              >
                <div className="flex justify-between items-center mb-2 px-2">
                  <h2 className="font-semibold text-lg">{column.name}</h2>
                  <input
                    type="text"
                    className="border px-2 py-1 rounded-md text-sm"
                    placeholder="Search by any..."
                    value={searchTerms[column.id.toString()] || ''}
                    onChange={(e) =>
                      handleSearchChange(column.id.toString(), e.target.value)
                    }
                  />
                </div>

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
