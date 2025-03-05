const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function fetchAllProjectsQuery() {
  return `
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
}

export async function fetchAllProjects() {
  try {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: fetchAllProjectsQuery() }),
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
