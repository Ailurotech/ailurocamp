const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function getStatusColumnQuery() {
  return `
  query GetProjectColumn($columnId: ID!) {
    node(id: $columnId) {
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
  `;
}

export async function getStatusColumn(columnId: string) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getStatusColumnQuery(),
        variables: { columnId },
      }),
    });

    const data = await response.json();

    console.log('GraphQL Response:', JSON.stringify(data, null, 2));

    if (!data?.data?.node) {
      console.error("Error: Missing 'node' in API response. Check column ID.");
      console.error('Full Response:', data);
      return null;
    }

    console.log('Project Column:', data.data.node);
    return data.data.node;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
