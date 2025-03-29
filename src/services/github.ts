/* eslint-disable @typescript-eslint/no-explicit-any */

import { Octokit } from 'octokit';

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Define the repository owner and name
const owner = process.env.GITHUB_OWNER || 'Ailurotech';
const repo = process.env.GITHUB_REPO || 'ailurocamp';

// For debugging
console.log('GitHub Service Initialized with:', {
  token: process.env.GITHUB_TOKEN
    ? `${process.env.GITHUB_TOKEN.substring(0, 4)}...`
    : 'Not set',
  owner,
  repo,
});

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
    console.log(
      `Attempting to fetch projects for ${owner} organization and ${repo} repository...`
    );

    // New: Try fetching organization projects v2 first (this is likely what the user has)
    try {
      console.log(`Querying organization projects V2 for ${owner}...`);

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
      console.log('GraphQL response:', JSON.stringify(response, null, 2));

      if (
        response?.organization?.projectsV2?.nodes &&
        response.organization.projectsV2.nodes.length > 0
      ) {
        console.log(
          `Found ${response.organization.projectsV2.nodes.length} organization projects v2`
        );

        // Format projects to match the classic projects API format
        const formattedProjects = response.organization.projectsV2.nodes.map(
          (project: ProjectNode) => ({
            id: project.number, // Use number as ID since it's more accessible
            name: project.title,
            body: '',
            isV2: true,
            orgProject: true,
          })
        );

        return formattedProjects;
      } else {
        console.log('No organization projects v2 found');
      }
    } catch (graphqlError) {
      console.error(
        'Error fetching organization projects v2:',
        graphqlError instanceof Error ? graphqlError.message : 'Unknown error'
      );
    }

    // Fallback to classic projects API if no v2 projects found
    try {
      console.log('Attempting to fetch repository classic projects (v1)...');
      const repoResponse = await octokit.rest.projects.listForRepo({
        owner,
        repo,
      });

      if (repoResponse.data.length > 0) {
        console.log(
          `Found ${repoResponse.data.length} repository classic projects`
        );
        return repoResponse.data;
      } else {
        console.log('No repository classic projects found');
      }
    } catch (repoError: any) {
      console.error(
        'Error fetching repository classic projects:',
        repoError instanceof Error ? repoError.message : 'Unknown error'
      );
    }

    // Try organization classic projects as a last resort
    try {
      console.log(
        `Attempting to fetch organization classic projects for ${owner}...`
      );
      const orgResponse = await octokit.rest.projects.listForOrg({
        org: owner,
      });

      if (orgResponse.data.length > 0) {
        console.log(
          `Found ${orgResponse.data.length} organization classic projects`
        );
        return orgResponse.data;
      } else {
        console.log('No organization classic projects found');
      }
    } catch (orgError: any) {
      console.error(
        'Error fetching organization classic projects:',
        orgError instanceof Error ? orgError.message : 'Unknown error'
      );
    }

    // Return empty array if nothing found
    console.log('No projects found after all attempts');
    return [];
  } catch (error: any) {
    console.error(
      'Error in getProjects:',
      error instanceof Error ? error.message : 'Unknown error'
    );
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

export async function getProjectColumns(projectNumber: number) {
  try {
    // For debugging
    // console.log(`Fetching columns for project ID: ${projectNumber}`);

    // Check if this is a v2 project - different handling
    try {
      // Try to get columns for a V2 project first (which are actually statuses)
      console.log('Attempting to fetch columns for Projects V2...');

      // Simpler query to get all project data first
      const projectQuery = `
      query {
        organization(login: "${owner}") {
          projectV2(number: ${projectNumber}) {
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

      // Save the raw project data for debugging
      console.log(
        'V2 Project title:',
        projectData?.organization?.projectV2?.title
      );
      console.log('V2 Project URL:', projectData?.organization?.projectV2?.url);
      console.log(
        'V2 Project closed:',
        projectData?.organization?.projectV2?.closed
      );

      // Save the project ID for later use
      const projectId = projectData?.organization?.projectV2?.id;
      // console.log('Project V2 ID:', projectId);

      // 1. Log all fields to help debug
      console.log('Project fields:');
      const allFields =
        projectData?.organization?.projectV2?.fields?.nodes || [];
      allFields.forEach((field) => {
        console.log(
          `  Field: ${field.name} (${field.dataType || 'unknown type'})`
        );
        if (field.options) {
          console.log(
            '    Options:',
            field.options.map((option) => option.name).join(', ')
          );
        }
      });

      // 2. Log the itemCount
      const itemCount =
        projectData?.organization?.projectV2?.items?.nodes?.length || 0;
      console.log(`Project has ${itemCount} items`);

      // 3. Look for field values to determine what fields are actually being used
      console.log('Analyzing item field values to detect columns...');

      // Collect all field names that have single select values
      const fieldValueCounts: Record<string, Set<string>> = {};

      projectData?.organization?.projectV2?.items?.nodes?.forEach((item) => {
        if (!item.fieldValues?.nodes) return;

        item.fieldValues.nodes.forEach((value) => {
          // Only interested in fields with names and single select values
          if (value && value.field && value.field.name && value.name) {
            const fieldName = value.field.name;
            if (!fieldValueCounts[fieldName]) {
              fieldValueCounts[fieldName] = new Set();
            }
            fieldValueCounts[fieldName].add(value.name);
          }
        });
      });

      // Log the discovered fields and their unique values
      console.log('Fields with single select values:');
      Object.entries(fieldValueCounts).forEach(([fieldName, values]) => {
        console.log(`  ${fieldName}: ${Array.from(values).join(', ')}`);
      });

      // Now look for a field that has Status-like values (Todo, In Progress, etc.)
      let statusFieldName = '';
      const statusKeywords = ['status', 'state', 'stage', 'progress', 'kanban'];

      // First try to find a field with a status-like name
      for (const fieldName of Object.keys(fieldValueCounts)) {
        const lowercaseName = fieldName.toLowerCase();
        if (statusKeywords.some((keyword) => lowercaseName.includes(keyword))) {
          statusFieldName = fieldName;
          console.log(`Found status-like field: ${fieldName}`);
          break;
        }
      }

      // If no status-like field name, look for a field with status-like values
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
            console.log(`Found field with status-like values: ${fieldName}`);
            break;
          }
        }
      }

      // If still no status field, just use the first field with values
      if (!statusFieldName && Object.keys(fieldValueCounts).length > 0) {
        statusFieldName = Object.keys(fieldValueCounts)[0];
        console.log(
          `No status field found, using first field with values: ${statusFieldName}`
        );
      }

      // If we found any field we can use
      if (statusFieldName) {
        // Find the field definition
        const statusField = allFields.find(
          (f: any) => f.name === statusFieldName
        );

        if (statusField) {
          console.log(`Using field "${statusFieldName}" as status field`);

          // Get the unique values for this field
          const uniqueValues = Array.from(fieldValueCounts[statusFieldName]);
          console.log(`Status values: ${uniqueValues.join(', ')}`);

          // Create columns from the unique values
          const columns: Array<{
            id: string;
            name: string;
            isV2: boolean;
            field_id?: string;
            project_id?: string;
            cards: any[];
          }> =
            statusField.options?.map((option: any) => ({
              id: option.id, // Use the actual option ID
              name: option.name,
              field_id: statusField.id,
              project_id: projectId,
              isV2: true,
              cards: [],
            })) || [];

          // Group items by their status value
          projectData?.organization?.projectV2?.items?.nodes?.forEach(
            (item: any) => {
              if (!item.fieldValues?.nodes) return;

              // Find the status value for this item
              const statusValue = item.fieldValues.nodes.find(
                (value: any) =>
                  value.field && value.field.name === statusFieldName
              );

              if (statusValue && statusValue.name) {
                // Find the matching column by name
                const column = columns.find(
                  (col) => col.name === statusValue.name
                );

                if (column) {
                  // Create card
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

                  // Add to column
                  column.cards.push(card);
                }
              }
            }
          );

          // Log the final columns and card counts
          console.log('Final columns:');
          columns.forEach((col) => {
            console.log(`  ${col.name}: ${col.cards.length} cards`);
          });

          return columns;
        }
      }

      console.log(
        'CRITICAL: Could not find any usable fields to build columns!'
      );
    } catch (graphqlError: any) {
      console.error(
        'Error fetching Project V2 data:',
        graphqlError instanceof Error ? graphqlError.message : 'Unknown error'
      );
      console.error('GraphQL Error Details:', graphqlError);
    }

    // Fallback to classic projects
    console.log('Fallback to classic projects API...');
    try {
      console.log('Attempting to fetch project columns for classic project...');

      const columnsResponse = await octokit.rest.projects.listColumns({
        project_id: projectNumber,
      });

      console.log(`Found ${columnsResponse.data.length} columns`);

      // Get cards for each column
      const columns = await Promise.all(
        columnsResponse.data.map(async (column: any) => {
          console.log(`Fetching cards for column: ${column.name}`);

          // Get cards for this column
          const cardsResponse = await octokit.rest.projects.listCards({
            column_id: column.id,
          });

          console.log(
            `Found ${cardsResponse.data.length} cards in column ${column.name}`
          );

          // Process cards to extract note and url
          const cards = await Promise.all(
            cardsResponse.data.map(async (card: any) => {
              try {
                // Extract issue details if available
                if (card.content_url) {
                  const parts = new URL(card.content_url).pathname.split('/');
                  const issue_number = parts[parts.length - 1];

                  try {
                    // Try to get issue details
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

                    // Return basic card info if issue details can't be fetched
                    return {
                      id: card.id,
                      note: card.note || '',
                      content_url: card.content_url || '',
                      created_at: new Date().toISOString(),
                    };
                  }
                }

                // Return note card (non-issue)
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

                // Fallback to basic card info
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

      // Last resort - create some default columns
      console.log('Creating default columns as last resort...');
      return [
        { id: 'to-do', name: 'To Do', isV2: true, cards: [] },
        { id: 'in-progress', name: 'In Progress', isV2: true, cards: [] },
        { id: 'done', name: 'Done', isV2: true, cards: [] },
      ];
    }
  } catch (error: any) {
    console.error(
      'Error fetching project columns:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    // Always return some default columns as absolute last resort
    console.log('ERROR RECOVERY: Creating default columns');
    return [
      { id: 'to-do', name: 'To Do', isV2: true, cards: [] },
      { id: 'in-progress', name: 'In Progress', isV2: true, cards: [] },
      { id: 'done', name: 'Done', isV2: true, cards: [] },
    ];
  }
}

export async function getColumnCards(columnId: number) {
  try {
    console.log(`Fetching cards for column ID: ${columnId}`);
    const response = await octokit.rest.projects.listCards({
      column_id: columnId,
    });

    console.log(
      `Found ${response.data.length} cards for column ID: ${columnId}`
    );
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
  fieldId?: string,
  projectId?: string
) {
  try {
    console.log(`Moving card ${cardId} to column ${columnId}, isV2: ${isV2}`);

    if (isV2 && fieldId && projectId) {
      // For Projects V2, update the status field
      console.log('Using GraphQL to update ProjectV2 item field');

      const graphqlMutation = `
      mutation {
        updateProjectV2ItemFieldValue(
          input: {
            projectId: "${projectId}"
            itemId: "${cardId}"
            fieldId: "${fieldId}"
            value: { 
              singleSelectOptionId: "${columnId.toString()}"
            }
          }
        ) {
          projectV2Item {
            id
          }
        }
      }`;

      console.log('Executing GraphQL mutation:', graphqlMutation);
      const response = await octokit.graphql(graphqlMutation);
      console.log('GraphQL update response:', response);
      return response;
    } else {
      // For classic projects, use the REST API
      console.log('Using REST API to move card');
      const response = await octokit.rest.projects.moveCard({
        card_id: Number(cardId),
        column_id: Number(columnId),
        position,
      });
      console.log('REST API response:', response.status);
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
  labels: string[] = []
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

    console.log(`Issue created: #${response.data.number}`);
    return response.data;
  } catch (error) {
    console.error(
      'Error creating issue:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}
