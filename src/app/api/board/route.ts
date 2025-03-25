import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as githubService from '@/services/github';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          projects: [],
          columns: [],
          cards: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const columnId = searchParams.get('columnId');

    if (!projectId && !columnId) {
      try {
        const projects = await githubService.getProjects();

        if (projects && projects.length > 0) {
          return NextResponse.json({ projects });
        } else {
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
    }

    if (projectId && !columnId) {
      try {
        const columns = await githubService.getProjectColumns(
          Number(projectId)
        );

        if (columns.length > 0) {
          return NextResponse.json({ columns });
        } else {
          return NextResponse.json({
            columns: [],
            message: 'No columns found for this project',
          });
        }
      } catch (columnError) {
        console.error('Error fetching columns:', columnError);
        return NextResponse.json({
          error: 'Error fetching columns',
          errorDetails:
            columnError instanceof Error
              ? columnError.message
              : 'Unknown error',
          columns: [],
        });
      }
    }

    if (columnId) {
      try {
        const cards = await githubService.getColumnCards(Number(columnId));
        return NextResponse.json({ cards });
      } catch (cardError) {
        console.error('Error fetching cards:', cardError);
        return NextResponse.json({
          error: 'Error fetching cards',
          errorDetails:
            cardError instanceof Error ? cardError.message : 'Unknown error',
          cards: [],
        });
      }
    }

    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error in board API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        projects: [],
        columns: [],
        cards: [],
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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const body = (await req.json()) as RequestBody;

    const { action, ...params } = body;

    switch (action) {
      case 'moveCard': {
        const { cardId, columnId, position } = params as MoveCardParams;

        try {
          const result = await githubService.moveCard(
            cardId,
            columnId,
            position
          );
          return NextResponse.json({ success: true, data: result });
        } catch (moveError) {
          console.error('Error in moveCard function:', moveError);
          return NextResponse.json(
            { error: 'Error moving card', errorDetails: moveError },
            { status: 500 }
          );
        }
      }

      case 'createIssue': {
        const { title, body, labels = [], repo } = params as CreateIssueParams;

        try {
          const issue = await githubService.createIssue(
            title,
            body,
            labels,
            repo
          );
          return NextResponse.json({ success: true, data: issue });
        } catch (issueError) {
          return NextResponse.json(
            { error: 'Error creating issue', errorDetails: issueError },
            { status: 500 }
          );
        }
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
