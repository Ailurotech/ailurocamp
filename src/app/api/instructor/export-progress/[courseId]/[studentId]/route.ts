import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define interfaces for type safety
interface StudentData {
  name: string;
  email: string;
}

interface CourseModule {
  title: string;
  lessons?: LessonData[];
}

interface CourseData {
  title: string;
  modules: CourseModule[];
}

interface LessonProgress {
  moduleIndex: number;
  lessonIndex: number;
  title?: string;
  completed: boolean;
  timeSpent: number;
  startedAt: string;
  completedAt?: string;
}

interface AssessmentSubmission {
  score?: number;
  status: string;
  submittedAt?: string;
}

interface Assessment {
  title: string;
  type: string;
  totalPoints: number;
  submission?: AssessmentSubmission;
}

interface ProgressData {
  overallProgress: number;
  completedLessons: LessonProgress[];
  lastAccessedAt?: string;
}

interface ApiResponseData {
  student: StudentData;
  course: CourseData;
  progress: ProgressData;
  assessments?: Assessment[];
}

interface LessonData {
  title: string;
}

// API route for displaying student progress as an HTML page
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; studentId: string } }
) {
  // Retrieve the current session using NextAuth
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: 'You must be logged in.' },
      { status: 401 }
    );
  }

  // Ensure the user has sufficient permissions (either instructor or admin)
  if (
    !session.user?.roles?.includes('instructor') &&
    !session.user?.roles?.includes('admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions.' },
      { status: 403 }
    );
  }

  // Safely extract courseId and studentId from the params
  const courseId = params.courseId;
  const studentId = params.studentId;

  // Check if the required parameters are provided
  if (!courseId || !studentId) {
    return NextResponse.json(
      { error: 'Course ID and Student ID are required' },
      { status: 400 }
    );
  }

  try {
    // Use the existing API to fetch the student progress data
    const apiUrl = new URL(request.url);
    const baseUrl = `${apiUrl.protocol}//${apiUrl.host}`;

    // Make request to your existing API endpoint
    const response = await fetch(
      `${baseUrl}/api/instructor/student-progress/${courseId}/${studentId}`,
      {
        headers: {
          // Forward cookies and auth headers for session validation
          cookie: request.headers.get('cookie') || '',
          authorization: request.headers.get('authorization') || '',
        },
      }
    );

    // Check if the API request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `API returned status: ${response.status}`
      );
    }

    // Parse the response data
    const progressData: ApiResponseData = await response.json();

    // Generate the report as HTML
    const reportHtml = generateProgressReportHtml(progressData);

    // Return the report as an HTML page (not as a download)
    return new NextResponse(reportHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Removed Content-Disposition header to display in browser instead of downloading
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exporting progress report:', error);

    return NextResponse.json(
      { error: `Error exporting progress report: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Function to generate a simplified HTML progress report with English content
function generateProgressReportHtml(data: ApiResponseData): string {
  try {
    // Extract basic student and course information
    const studentName = data.student?.name || 'Unknown Student';
    const studentEmail = data.student?.email || 'Unknown Email';
    const courseTitle = data.course?.title || 'Unknown Course';

    // Calculate completion statistics
    // Count lessons that have been marked as completed
    const completedLessonsCount =
      data.progress?.completedLessons?.filter(
        (l: LessonProgress) => l.completed
      )?.length || 0;

    // Calculate total lessons from course modules structure
    let totalLessonsCount = 0;
    if (data.course?.modules) {
      // Sum up lessons across all modules
      totalLessonsCount = data.course.modules.reduce(
        (count: number, courseModule: CourseModule) =>
          count + (courseModule.lessons?.length || 0),
        0
      );
    }

    // Calculate time metrics - total minutes spent learning
    const totalTimeSpent =
      data.progress?.completedLessons?.reduce(
        (total: number, lesson: LessonProgress) =>
          total + (lesson.timeSpent || 0),
        0
      ) || 0;

    // Convert total minutes to hours and minutes format
    const timeSpentHours = Math.floor(totalTimeSpent / 60);
    const timeSpentMinutes = Math.round(totalTimeSpent % 60);

    // Format date strings for better readability
    const lastActivityDate = data.progress?.lastAccessedAt
      ? new Date(data.progress.lastAccessedAt).toLocaleString()
      : 'No record';

    // Find the earliest lesson start date to determine when student began the course
  
    const startDate = data.progress?.completedLessons?.length
      ? new Date(
          [...data.progress.completedLessons].sort(
            (a: LessonProgress, b: LessonProgress) =>
              new Date(a.startedAt).getTime() -
              new Date(b.startedAt).getTime()
          )[0]?.startedAt
        ).toLocaleString()
      : 'Not started';

    // Generate assessment summary if available
    let assessmentHtml = '';
    if (data.assessments && data.assessments.length > 0) {
      assessmentHtml = `
        <div class="section">
          <h2>Assessment Results</h2>
          <table>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Type</th>
                <th>Score</th>
                <th>Status</th>
                <th>Submission Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.assessments
                .map(
                  (assessment: Assessment) => `
                <tr>
                  <td>${assessment.title}</td>
                  <td>${assessment.type}</td>
                  <td>${
                    assessment.submission?.score !== undefined
                      ? `${assessment.submission.score}/${assessment.totalPoints}`
                      : 'Not graded'
                  }</td>
                  <td>${assessment.submission?.status || 'Not submitted'}</td>
                  <td>${
                    assessment.submission?.submittedAt
                      ? new Date(
                          assessment.submission.submittedAt
                        ).toLocaleString()
                      : 'N/A'
                  }</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Build module progress details with simplified format
    let moduleDetailsHtml = '';
    if (data.progress?.completedLessons?.length > 0) {
      // Sort lessons by module and lesson index
      const sortedLessons = [...data.progress.completedLessons].sort(
        (a: LessonProgress, b: LessonProgress) => {
          if (a.moduleIndex !== b.moduleIndex) {
            return a.moduleIndex - b.moduleIndex;
          }
          return a.lessonIndex - b.lessonIndex;
        }
      );

      // Group lessons by module
      const lessonsByModule: { [key: number]: LessonProgress[] } = {};

      sortedLessons.forEach((lesson: LessonProgress) => {
        if (!lessonsByModule[lesson.moduleIndex]) {
          lessonsByModule[lesson.moduleIndex] = [];
        }
        lessonsByModule[lesson.moduleIndex].push(lesson);
      });

      // Generate HTML for each module and its lessons
      moduleDetailsHtml = `
        <div class="section">
          <h2>Module Learning Details</h2>
          ${Object.keys(lessonsByModule)
            .map((moduleIndexStr) => {
              const moduleIndex = parseInt(moduleIndexStr);
              const moduleLessons = lessonsByModule[moduleIndex];
              const moduleTitle =
                data.course?.modules[moduleIndex]?.title ||
                `Module ${moduleIndex + 1}`;

              return `
                <div class="module">
                  <h3>${moduleTitle}</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Lesson</th>
                        <th>Status</th>
                        <th>Time Spent</th>
                        <th>Started</th>
                        <th>Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${moduleLessons
                        .map(
                          (lesson: LessonProgress) => `
                        <tr>
                          <td>${lesson.title || `Lesson ${lesson.lessonIndex + 1}`}</td>
                          <td>${lesson.completed ? 'Completed' : 'In Progress'}</td>
                          <td>${Math.floor(lesson.timeSpent / 60)}h ${
                            lesson.timeSpent % 60
                          }m</td>
                          <td>${
                            lesson.startedAt
                              ? new Date(lesson.startedAt).toLocaleString()
                              : 'N/A'
                          }</td>
                          <td>${
                            lesson.completedAt
                              ? new Date(lesson.completedAt).toLocaleString()
                              : 'N/A'
                          }</td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    }

    // Build the complete HTML report with simplified CSS and English content
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Progress Report - ${studentName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          .section {
            margin-bottom: 25px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .summary-item {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
          }
          .progress-bar {
            height: 15px;
            background-color: #ecf0f1;
            border-radius: 8px;
            margin-top: 8px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background-color: #3498db;
            width: ${data.progress?.overallProgress || 0}%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Progress Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h2>Student Information</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <h3>Student Name</h3>
              <p>${studentName}</p>
            </div>
            <div class="summary-item">
              <h3>Email</h3>
              <p>${studentEmail}</p>
            </div>
            <div class="summary-item">
              <h3>Course</h3>
              <p>${courseTitle}</p>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Course Completion</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <h3>Overall Progress</h3>
              <p>${data.progress?.overallProgress || 0}%</p>
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
            </div>
            <div class="summary-item">
              <h3>Completed Lessons</h3>
              <p>${completedLessonsCount}/${totalLessonsCount}</p>
            </div>
            <div class="summary-item">
              <h3>Total Time Spent</h3>
              <p>${timeSpentHours}h ${timeSpentMinutes}m</p>
            </div>
            <div class="summary-item">
              <h3>Start Date</h3>
              <p>${startDate}</p>
            </div>
            <div class="summary-item">
              <h3>Last Activity</h3>
              <p>${lastActivityDate}</p>
            </div>
          </div>
        </div>
        
        ${assessmentHtml}
        
        ${moduleDetailsHtml}
        

        
        <div style="text-align: center; margin-top: 20px;">
          <p>Tip: Use your browser's print function (Ctrl+P / Command+P) to save this report as PDF</p>
        </div>
      </body>
      </html>
    `;
  } catch (error) {
    console.error('Error generating HTML report:', error);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error Generating Report</title>
      </head>
      <body>
        <h1>Error Generating Report</h1>
        <p>An error occurred while generating the progress report: ${error}</p>
      </body>
      </html>
    `;
  }
}

// Remove unused function generateProgressReport
