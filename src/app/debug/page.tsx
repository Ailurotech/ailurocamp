'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface GitHubStatus {
  status?: string;
  user?: string | null;
  token?: string;
  owner?: string;
  repo?: string;
  organizationAccess?: boolean;
}

interface DebugInfoData {
  authenticated?: boolean;
  sessionData?: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  } | null;
  github?: GitHubStatus;
}

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<DebugInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch('/api/debug');
        const data = await response.json();
        setDebugInfo(data);
      } catch (err) {
        setError('Error fetching debug information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDebugInfo();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GitHub Integration Debug</h1>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Authentication Status</h2>
        <p>
          Session Status: <strong>{status}</strong>
        </p>
        {session && (
          <p>
            Logged in as:{' '}
            <strong>{session.user?.name || session.user?.email}</strong>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">GitHub Status</h2>
            <p>
              API Status: <strong>{debugInfo?.github?.status}</strong>
            </p>
            <p>
              GitHub User:{' '}
              <strong>{debugInfo?.github?.user || 'Not authenticated'}</strong>
            </p>
            <p>
              Organization Access:{' '}
              <strong>
                {debugInfo?.github?.organizationAccess ? 'Yes' : 'No'}
              </strong>
            </p>
            <p>
              Token: <code>{debugInfo?.github?.token}</code>
            </p>
            <p>
              Owner: <code>{debugInfo?.github?.owner}</code>
            </p>
            <p>
              Repo: <code>{debugInfo?.github?.repo}</code>
            </p>
          </div>

          <h2 className="text-xl font-semibold mb-3">Debug Information</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </>
      )}

      <div className="mt-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Ensure you&apos;re logged in with a valid user account</li>
          <li>
            Check that your GitHub token has the proper permissions:
            <ul className="list-disc pl-6 mt-1">
              <li>
                <code>repo</code> - Full access to repositories
              </li>
              <li>
                <code>read:org</code> - Read organization data
              </li>
              <li>
                <code>admin:org</code> - Admin access to organization
              </li>
              <li>
                <code>project</code> - Access to project boards
              </li>
            </ul>
          </li>
          <li>Verify your token can access the Ailurotech organization</li>
          <li>
            Make sure your <code>.env.local</code> file has the correct
            variables:
            <pre className="bg-gray-100 p-2 rounded mt-1">
              GITHUB_TOKEN=your_personal_access_token GITHUB_OWNER=Ailurotech
              GITHUB_REPO=ailurocamp
            </pre>
          </li>
        </ol>
      </div>
    </div>
  );
}
