const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function listProjectColumnsQuery() {
  return `
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
}

export async function listProjectColumns(projectId: string) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: listProjectColumnsQuery(),
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
