const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function addItemToProjectMutation() {
  return `
    mutation AddItemToProject($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item {
          id
        }
      }
    }
  `;
}

// projectId is ProjectV2 Node ID, contentId is Issue/PR Node ID
export async function addItemToProject(projectId: string, contentId: string) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: addItemToProjectMutation(),
        variables: { projectId, contentId },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(
        'Item added successfully:',
        data.data.addProjectV2ItemById.item.id
      );
      return data.data.addProjectV2ItemById.item.id;
    } else {
      console.error('Error adding item to project:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
