const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function fetchfetchIssuesWithinProjectsQuery() {
  return `
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
}

export async function fetchIssuesWithinProjects(repo: string) {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: fetchfetchIssuesWithinProjectsQuery(),
        variables: { repo },
      }),
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
