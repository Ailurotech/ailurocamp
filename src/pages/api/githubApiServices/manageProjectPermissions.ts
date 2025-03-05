const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN; // Ensure it's set in .env.local

// TODO: remove
export const fetchProjectPermissions = async (
  projectId: string,
  username: string
) => {
  const response = await fetch(
    `${GITHUB_API_URL}/projects/${projectId}/collaborators/${username}/permission`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }
  return await response.json();
};

export const addProjectCollaborator = async (
  projectId: string,
  username: string,
  permission: 'admin' | 'write' | 'read'
) => {
  const response = await fetch(
    `${GITHUB_API_URL}/projects/${projectId}/collaborators/${username}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        permission,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return await response.json();
};
