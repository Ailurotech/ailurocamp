const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export const fetchProjectIssues = async (repo: string) => {
  const owner = 'Ailurotech';
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/issues`,
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
