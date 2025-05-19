import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Octokit } from 'octokit';

interface ProjectColumn {
  id: number;
  name: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'Ailurotech';
    const repo = process.env.GITHUB_REPO || 'ailurocamp';

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub token not configured' },
        { status: 500 }
      );
    }

    const octokit = new Octokit({ auth: token });

    try {
      // const response = await octokit.rest.projects.createForRepo({
      //   owner,
      //   repo,
      //   name,
      //   body: description || 'Created from AiluroCamp',
      // });
      const response = await octokit.request('POST /repos/{owner}/{repo}/projects', {
        owner,
        repo,
        name,
        body: description || 'Created from AiluroCamp',
      });

      const projectId = response.data.id;

      const columns = ['To Do', 'In Progress', 'Done'];
      const createdColumns: ProjectColumn[] = [];

      for (const columnName of columns) {
        const columnResponse = await octokit.request('POST /projects/{project_id}/columns', {
          project_id: projectId,
          name: columnName,
        });

        createdColumns.push({
          id: columnResponse.data.id,
          name: columnResponse.data.name,
        });
      }

      return NextResponse.json({
        success: true,
        project: {
          id: projectId,
          name: response.data.name,
          columns: createdColumns,
        },
      });
    } catch (error) {
      console.error(
        'Error creating project:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return NextResponse.json(
        {
          error: 'Error creating project',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
