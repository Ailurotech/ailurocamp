const GITHUB_RATE_LIMIT_API = 'https://api.github.com/rate_limit';
const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || 'Ailurotech';
const repo = process.env.GITHUB_REPO || 'ailurocamp';

interface ProjectNode {
  id: string;
  number: number;
  title: string;
}

interface OrgProjectsResponse {
  organization?: {
    projectsV2?: {
      nodes?: ProjectNode[];
    };
  };
}

export async function getProjects() {
  try {
    try {
      const graphqlQuery = `
      query {
        organization(login: "${owner}") {
          projectsV2(first: 10) {
            nodes {
              id
              number
              title
            }
          }
        }
      }`;

      const response = (await octokit.graphql(
        graphqlQuery
      )) as OrgProjectsResponse;

      if (
        response?.organization?.projectsV2?.nodes &&
        response.organization.projectsV2.nodes.length > 0
      ) {
        const formattedProjects = response.organization.projectsV2.nodes.map(
          (project: ProjectNode) => ({
            id: project.number,
            name: project.title,
            body: '',
            isV2: true,
            orgProject: true,
          })
        );

        return formattedProjects;
      } else {
      }
    } catch (graphqlError) {
      console.error(
        'Error fetching organization projects v2:',
        graphqlError instanceof Error ? graphqlError.message : 'Unknown error'
      );
    }

    try {
      const repoResponse = await octokit.rest.projects.listForRepo({
        owner,
        repo,
      });

      if (repoResponse.data.length > 0) {
        return repoResponse.data;
      }
    } catch (error) {
      console.error('Error fetching repository classic projects:', error);
    }

    try {
      const orgResponse = await octokit.rest.projects.listForOrg({
        org: owner,
      });

      if (orgResponse.data.length > 0) {
        return orgResponse.data;
      }
    } catch (error) {
      console.error('Error fetching organization classic projects:', error);
    }

    return [];
  } catch (error) {
    console.error('Error in getProjects:', error);
    return [];
  }
}

interface FieldOption {
  id: string;
  name: string;
  dataType?: string;
  options?: Array<{ id: string; name: string }>;
}

// Update the ProjectItemNode interface to avoid any types in field values
interface FieldValue {
  text?: string;
  date?: string;
  name?: string;
  field?: {
    id?: string;
    name?: string;
  };
}

interface ProjectItemNode {
  id: string;
  type: string;
  content?: {
    title?: string;
    body?: string;
    number?: number;
    url?: string;
    state?: string;
    createdAt?: string;
  };
  fieldValues?: {
    nodes?: Array<FieldValue>;
  };
}

interface ProjectV2Response {
  organization?: {
    projectV2?: {
      id: string;
      title: string;
      url: string;
      closed: boolean;
      fields?: {
        nodes?: FieldOption[];
      };
      items?: {
        nodes?: ProjectItemNode[];
      };
    };
  };
}

export async function getProjectColumns(projectId: number) {
  try {
    try {
      const projectQuery = `
      query {
        organization(login: "${owner}") {
          projectV2(number: ${projectId}) {
            id
            title
            url
            closed
            fields(first: 50) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                  dataType
                }
                ... on ProjectV2IterationField {
                  id
                  name
                  dataType
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  dataType
                  options {
                    id
                    name
                  }
                }
              }
            }
            items(first: 100) {
              nodes {
                id
                type
                content {
                  ... on Issue {
                    title
                    body
                    number
                    url
                    state
                    createdAt
                  }
                  ... on PullRequest {
                    title
                    body
                    number
                    url
                    state
                    createdAt
                  }
                  ... on DraftIssue {
                    title
                    body
                  }
                }
                fieldValues(first: 50) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      text
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      date
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2FieldCommon {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`;

      const projectData = (await octokit.graphql(
        projectQuery
      )) as ProjectV2Response;

      const allFields =
        projectData?.organization?.projectV2?.fields?.nodes || [];

      const fieldValueCounts: Record<string, Set<string>> = {};

      projectData?.organization?.projectV2?.items?.nodes?.forEach((item) => {
        if (!item.fieldValues?.nodes) return;

        item.fieldValues.nodes.forEach((value) => {
          if (value && value.field && value.field.name && value.name) {
            const fieldName = value.field.name;
            if (!fieldValueCounts[fieldName]) {
              fieldValueCounts[fieldName] = new Set();
            }
            fieldValueCounts[fieldName].add(value.name);
          }
        });
      });

      let statusFieldName = '';
      const statusKeywords = ['status', 'state', 'stage', 'progress', 'kanban'];

      for (const fieldName of Object.keys(fieldValueCounts)) {
        const lowercaseName = fieldName.toLowerCase();
        if (statusKeywords.some((keyword) => lowercaseName.includes(keyword))) {
          statusFieldName = fieldName;
          break;
        }
      }

      if (!statusFieldName) {
        const statusValueKeywords = [
          'todo',
          'to do',
          'in progress',
          'done',
          'complete',
          'ready',
        ];
        for (const [fieldName, values] of Object.entries(fieldValueCounts)) {
          const valueArray = Array.from(values);
          if (
            valueArray.some((value) =>
              statusValueKeywords.some((keyword) =>
                value.toLowerCase().includes(keyword)
              )
            )
          ) {
            statusFieldName = fieldName;
            break;
          }
        }
      }

      if (!statusFieldName && Object.keys(fieldValueCounts).length > 0) {
        statusFieldName = Object.keys(fieldValueCounts)[0];
      }

      if (statusFieldName) {
        const statusField = allFields.find(
          (f: any) => f.name === statusFieldName
        );

        if (statusField) {
          const uniqueValues = Array.from(fieldValueCounts[statusFieldName]);

          const columns: Array<{
            id: string;
            name: string;
            isV2: boolean;
            field_id?: string;
            cards: any[];
          }> = uniqueValues.map((value: string) => ({
            id: value,
            name: value,
            field_id: statusField.id,
            isV2: true,
            cards: [],
          }));

          projectData?.organization?.projectV2?.items?.nodes?.forEach(
            (item: any) => {
              if (!item.fieldValues?.nodes) return;
              const statusValue = item.fieldValues.nodes.find(
                (value: any) =>
                  value.field && value.field.name === statusFieldName
              );

              if (statusValue && statusValue.name) {
                const column = columns.find(
                  (col) => col.name === statusValue.name
                );

                if (column) {
                  const card = {
                    id: item.id,
                    note: item.content?.body || '',
                    content_url: item.content?.url || '',
                    title:
                      item.content?.title ||
                      `Item #${item.content?.number || ''}`,
                    created_at:
                      item.content?.createdAt || new Date().toISOString(),
                    number: item.content?.number,
                  };
                  column.cards.push(card);
                }
              }
            }
          );

          return columns;
        }
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const columnsResponse = await octokit.rest.projects.listColumns({
        project_id: projectId,
      });

      const columns = await Promise.all(
        columnsResponse.data.map(async (column: any) => {
          const cardsResponse = await octokit.rest.projects.listCards({
            column_id: column.id,
          });

          const cards = await Promise.all(
            cardsResponse.data.map(async (card: any) => {
              try {
                if (card.content_url) {
                  const parts = new URL(card.content_url).pathname.split('/');
                  const issue_number = parts[parts.length - 1];

                  try {
                    const issueResponse = await octokit.rest.issues.get({
                      owner,
                      repo,
                      issue_number: parseInt(issue_number),
                    });

                    const issue = issueResponse.data;

                    return {
                      id: card.id,
                      note: issue.body || '',
                      content_url: card.content_url,
                      title: issue.title,
                      created_at: issue.created_at,
                      number: issue.number,
                    };
                  } catch (issueError) {
                    console.error(
                      `Error getting issue details: ${card.content_url}`,
                      issueError instanceof Error
                        ? issueError.message
                        : 'Unknown error'
                    );

                    return {
                      id: card.id,
                      note: card.note || '',
                      content_url: card.content_url || '',
                      created_at: new Date().toISOString(),
                    };
                  }
                }

                return {
                  id: card.id,
                  note: card.note || '',
                  content_url: card.content_url || '',
                  created_at: new Date().toISOString(),
                };
              } catch (cardError) {
                console.error(
                  'Error processing card:',
                  cardError instanceof Error
                    ? cardError.message
                    : 'Unknown error'
                );

                return {
                  id: card.id,
                  note: card.note || '',
                  content_url: card.content_url || '',
                  created_at: new Date().toISOString(),
                };
              }
            })
          );

          return {
            id: column.id,
            name: column.name,
            cards,
          };
        })
      );

      return columns;
    } catch (restError) {
      console.error(
        'Error fetching classic project columns:',
        restError instanceof Error ? restError.message : 'Unknown error'
      );

      return [
        { id: 'to-do', name: 'To Do', isV2: true, cards: [] },
        { id: 'in-progress', name: 'In Progress', isV2: true, cards: [] },
        { id: 'done', name: 'Done', isV2: true, cards: [] },
      ];
    }
  } catch (error) {
    console.error('Error fetching project columns:', error);
    return [
      { id: 'to-do', name: 'To Do', isV2: true, cards: [] },
      { id: 'in-progress', name: 'In Progress', isV2: true, cards: [] },
      { id: 'done', name: 'Done', isV2: true, cards: [] },
    ];
  }
}

export async function listProjectColumns(projectId: string) {
  const query = `
  query ListProjectColumns($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        title
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options {
                id,
                name,
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: { projectId },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.data.node.fields.nodes); // only index=2 column has todo, doing and done
      return data.data.node.fields.nodes;
    } else {
      console.error('Error listing project columns:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function getStatusColumns(projectId: string) {
  try {
    const allColumns = await listProjectColumns(projectId);
    const statusColumn = allColumns[2];
    return statusColumn;
  } catch (error) {
    console.log('Error getting Status column: ', error);
    return null;
  }
}

export async function getColumnCards(columnId: number) {
  try {
    const response = await octokit.rest.projects.listCards({
      column_id: columnId,
    });

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching column cards:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return [];
  }
}

export async function moveCard(
  cardId: string | number,
  columnId: string | number,
  position: string = 'top',
  isV2: boolean = false,
  fieldId?: string
) {
  try {
    if (isV2 && fieldId) {
      const graphqlMutation = `
      mutation {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: "${owner}/projects/${fieldId}"
            itemId: "${cardId}"
            fieldId: "${fieldId}"
            value: {
              singleSelectOptionId: "${columnId}"
            }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }`;

      const response = await octokit.graphql(graphqlMutation);
      return response;
    } else {
      const response = await octokit.rest.projects.moveCard({
        card_id: Number(cardId),
        column_id: Number(columnId),
        position,
      });
      return response.data;
    }
  } catch (error) {
    console.error(
      'Error moving card:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

export async function createIssue(
  title: string,
  body: string,
  labels: string[] = [],
  repo: string
) {
  try {
    console.log(`Creating issue: ${title}`);

    // Create the issue
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
    });

    return response.data;
  } catch (error) {
    console.error(
      'Error creating issue:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

export async function fetchAllProjects() {
  const query = `
  {
    organization(login: "Ailurotech") {
      projectsV2(first: 100) {
        nodes {
          id
          title
          url
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('data: ', data.data.organization.projectsV2.nodes);
      return data.data.organization.projectsV2.nodes;
    } else {
      console.error('Error fetching projects:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function checkRateLimit() {
  try {
    const response = await fetch(GITHUB_RATE_LIMIT_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.rate);
      return data.rate;
    } else {
      console.error('Error checking rate limit:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function fetchIssuesWithinProjects(repo: string) {
  const query = `
    query FetchIssues($repo: String!) {
      repository(owner: "Ailurotech", name: $repo) {
        issues(first: 100, states: OPEN) {
          nodes {
            id
            title
            url
            state
            createdAt
            author {
              login
            }
            assignees(first: 5) {
              nodes {
                login
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { repo } }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data.data.repository.issues.nodes);
      return data.data.repository.issues.nodes;
    } else {
      console.error('Error fetching issues:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function getPermissionForUser(
  projectId: string,
  username: string
) {
  try {
    const numericProjectId = Number(projectId);

    if (isNaN(numericProjectId)) {
      console.error(
        `Error: projectId "${projectId}" is not a valid numeric ID. Projects V2 are not supported.`
      );
      return null;
    }

    const response = await octokit.rest.projects.getPermissionForUser({
      project_id: numericProjectId,
      username,
    });

    return response.data.permission;
  } catch (error) {
    console.error('Error fetching user permission:', error);
    return null;
  }
}

export async function getRepositoryId(owner: string, repo: string) {
  const query = `
    query GetRepoId($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { owner, repo } }),
  });

  const data = await response.json();
  console.log('Repository ID:', data?.data?.repository?.id);
  return data?.data?.repository?.id || null;
}

export async function addIssueToProjectBoard(
  projectId: string,
  issueId: string
) {
  const query = `
    mutation AddIssueToProject($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item {
          id
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { projectId, contentId: issueId },
    }),
  });

  const data = await response.json();
  return data?.data?.addProjectV2ItemById?.item?.id || null;
}
