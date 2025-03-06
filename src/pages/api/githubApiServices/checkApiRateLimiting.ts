const GITHUB_RATE_LIMIT_API = 'https://api.github.com/rate_limit';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

export async function checkRateLimit() {
  try {
    const response = await fetch(GITHUB_RATE_LIMIT_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Rate Limit: ${data.rate.limit}`);
      console.log(`Remaining: ${data.rate.remaining}`);
      console.log(`Resets At: ${new Date(data.rate.reset * 1000)}`);
      return data.rate;
    } else {
      console.error('Error checking rate limit:', data);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
