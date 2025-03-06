const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export async function createIssue(
  repositoryId: string,
  title: string,
  body = ''
) {
  const query = `
      mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
        createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body }) {
          issue {
            id
            title
            number
            url
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
    body: JSON.stringify({ query, variables: { repositoryId, title, body } }),
  });

  const data = await response.json();
  console.log('Created Issue:', data);
  return data?.data?.createIssue?.issue || null;
}
