import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as githubService from '@/services/github';

interface Card {
  id: string | number;
  note: string;
  content_url: string;
  title?: string;
  created_at: string;
  number?: number;
}

interface Column {
  id: string | number;
  name: string;
  cards?: Card[];
  isV2?: boolean;
}

export async function GET(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);

    // For debugging:
    console.log('Session data:', session);

    if (!session) {
      // Return both error and empty arrays to prevent client-side errors
      return NextResponse.json(
        {
          error: 'Unauthorized',
          projects: [],
          columns: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      // Get all projects with better error handling
      try {
        const projects = await githubService.getProjects();
        console.log('API response projects:', projects);

        if (projects && projects.length > 0) {
          return NextResponse.json({ projects });
        } else {
          console.log('No projects found');
          return NextResponse.json({
            projects: [],
            message: 'No GitHub Project boards found',
          });
        }
      } catch (projectError) {
        console.error('Error fetching projects:', projectError);
        return NextResponse.json({
          error: 'Error fetching projects',
          errorDetails:
            projectError instanceof Error
              ? projectError.message
              : 'Unknown error',
          projects: [],
        });
      }
    } else {
      // Get columns for specific project
      const columns = await githubService.getProjectColumns(Number(projectId));
      console.log(`API received ${columns.length} columns from GitHub service`);

      if (columns && columns.length > 0) {
        // Log column details to help debug
        columns.forEach((col: Column, index: number) => {
          console.log(
            `Column ${index + 1}: ${col.name} (ID: ${col.id}, isV2: ${col.isV2 || false})`
          );
          console.log(`  Cards: ${col.cards?.length || 0}`);
        });
        console.log(4);

        return NextResponse.json({ columns });
      } else {
        console.log('No columns found for project');
        return NextResponse.json({
          columns: [],
          message: 'No columns found for this project',
        });
      }
    }
  } catch (error) {
    console.error('Error in board API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        projects: [],
        columns: [],
      },
      { status: 500 }
    );
  }
}

interface MoveCardParams {
  cardId: string | number;
  columnId: string | number;
  position?: string;
  isV2?: boolean;
  fieldId?: string;
}

interface CreateIssueParams {
  title: string;
  body: string;
  labels?: string[];
  repo: string;
}

interface RequestBody {
  action: 'moveCard' | 'createIssue';
  // Include all possible fields from both parameter types
  cardId?: string | number;
  columnId?: string | number;
  position?: string;
  isV2?: boolean;
  fieldId?: string;
  title?: string;
  body?: string;
  labels?: string[];
}

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);

    // For debugging:
    console.log('POST - Session data:', session);

    if (!session) {
      // Return both error and empty arrays to prevent client-side errors
      return NextResponse.json(
        {
          error: 'Unauthorized',
          success: false,
        },
        { status: 401 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { action, ...params } = body;

    switch (action) {
      case 'moveCard': {
        const { cardId, columnId, position, isV2, fieldId } =
          params as MoveCardParams;
        const result = await githubService.moveCard(
          cardId,
          columnId,
          position,
          isV2,
          fieldId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'createIssue': {
        const { title, body, labels = [], repo } = params as CreateIssueParams;
        const issue = await githubService.createIssue(
          title,
          body,
          labels,
          repo
        );
        return NextResponse.json({ success: true, data: issue });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in board API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
