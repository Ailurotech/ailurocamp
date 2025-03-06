const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function addDraftIssueToProjectMutation() {
  return `
    mutation AddDraftIssueToProject($projectId: ID!, $title: String!, $body: String!) {
      addProjectV2DraftIssue(input: { projectId: $projectId, title: $title, body: $body }) {
        projectItem {
          id
        }
      }
    }
  `;
}

export async function addDraftIssueToProject(
  projectId: string,
  title: string,
  body: string
) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: addDraftIssueToProjectMutation(),
        variables: { projectId, title, body },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(
        'Draft issue added successfully:',
        data.data.addProjectV2DraftIssue.projectItem.id
      );
      return data.data.addProjectV2DraftIssue.projectItem.id;
    } else {
      console.error('Error adding draft issue:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
