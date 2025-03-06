const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function listProjectCardsQuery() {
  return `
  query ListProjectCards($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        id
        title
        items(first: 50) {
          nodes {
            id
            content {
              ... on Issue {
                id
                title
                number
                url
              }
              ... on PullRequest {
                id
                title
                number
                url
              }
            }
            fieldValues(first: 10) {
              nodes {
                __typename
                ... on ProjectV2SingleSelectFieldValue {
                  id
                  name
                }
                ... on ProjectV2IterationFieldValue {
                  id
                  title
                }
                ... on ProjectV2TextFieldValue {
                  id
                  text
                }
              }
            }
          }
        }
      }
    }
  }
  `;
}

export async function listProjectCards(projectId: string) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: listProjectCardsQuery(),
        variables: { projectId },
      }),
    });

    const data = await response.json();

    console.log('GraphQL Response:', JSON.stringify(data, null, 2));

    if (!data?.data?.node) {
      console.error("Error: Missing 'node' in API response. Check project ID.");
      console.error('Full Response:', data);
      return null;
    }

    console.log('Project Cards:', data.data.node.items.nodes);
    return data.data.node.items.nodes;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
