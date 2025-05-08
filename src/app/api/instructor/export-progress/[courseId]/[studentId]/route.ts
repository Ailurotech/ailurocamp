import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// API route for exporting student progress as a text file
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
    const progressData = await response.json();

    // Generate the report text
    const reportText = generateProgressReport(progressData);

    // Return the report as a downloadable text file
    return new NextResponse(reportText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="student_progress_${studentId}.txt"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting progress report:', error);

    return NextResponse.json(
      { error: `导出进度报告时发生错误: ${error.message}` },
      { status: 500 }
    );
  }
}

// Function to generate a formatted progress report
function generateProgressReport(data: any): string {
  try {
    // Extract student and course information
    const studentName = data.student?.name || 'Unknown Student';
    const studentEmail = data.student?.email || 'Unknown Email';
    const courseTitle = data.course?.title || 'Unknown Course';

    // Calculate completion statistics
    const completedLessonsCount =
      data.progress?.completedLessons?.filter((l: any) => l.completed)
        ?.length || 0;

    // Calculate total lessons from course modules
    let totalLessonsCount = 0;
    if (data.course?.modules) {
      totalLessonsCount = data.course.modules.reduce(
        (count: number, module: any) => count + (module.lessons?.length || 0),
        0
      );
    }

    // Calculate completion percentage
    const completionPercentage =
      totalLessonsCount > 0
        ? ((completedLessonsCount / totalLessonsCount) * 100).toFixed(1)
        : '0.0';

    // Calculate time metrics
    const totalTimeSpent =
      data.progress?.completedLessons?.reduce(
        (total: number, lesson: any) => total + (lesson.timeSpent || 0),
        0
      ) || 0;

    const timeSpentHours = Math.floor(totalTimeSpent / 60);
    const timeSpentMinutes = Math.round(totalTimeSpent % 60);

    // Format date strings
    const lastActivityDate = data.progress?.lastAccessedAt
      ? new Date(data.progress.lastAccessedAt).toLocaleString()
      : 'No record';

    const startDate =
      data.progress?.completedLessons?.length > 0
        ? new Date(
            [...data.progress.completedLessons].sort(
              (a: any, b: any) =>
                new Date(a.startedAt).getTime() -
                new Date(b.startedAt).getTime()
            )[0]?.startedAt
          ).toLocaleString()
        : 'Not started';

    // Build the report header
    let report = `Student Progress Report
==========================
Student Name: ${studentName}
Student Email: ${studentEmail}
Course Title: ${courseTitle}
Generated Time: ${new Date().toLocaleString()}

Course Completion Status
==========================
Overall Progress: ${data.progress?.overallProgress || 0}%

Completed Lessons: ${completedLessonsCount}/${totalLessonsCount}
Total Learning Time: ${timeSpentHours} hours ${timeSpentMinutes} minutes
Start Date: ${startDate}
Last Activity: ${lastActivityDate}

Module Learning Details
==========================
`;

    // Add lesson progress details
    if (data.progress?.completedLessons?.length > 0) {
      // Sort lessons by module and lesson index
      const sortedLessons = [...data.progress.completedLessons].sort(
        (a: any, b: any) => {
          if (a.moduleIndex !== b.moduleIndex) {
            return a.moduleIndex - b.moduleIndex;
          }
          return a.lessonIndex - b.lessonIndex;
        }
      );

      // Group lessons by module
      const lessonsByModule: { [key: number]: any[] } = {};

      sortedLessons.forEach((lesson: any) => {
        if (!lessonsByModule[lesson.moduleIndex]) {
          lessonsByModule[lesson.moduleIndex] = [];
        }
        lessonsByModule[lesson.moduleIndex].push(lesson);
      });

      // Add each module and its lessons to the report
      Object.keys(lessonsByModule).forEach((moduleIndexStr) => {
        const moduleIndex = parseInt(moduleIndexStr);
        const moduleLessons = lessonsByModule[moduleIndex];

        // Get module title if available
        const moduleTitle =
          data.course?.modules[moduleIndex]?.title ||
          `Module ${moduleIndex + 1}`;

        report += `\nModule: ${moduleTitle}\n`;
        report += `${'-'.repeat(moduleTitle.length + 4)}\n`;

        // Add each lesson in the module
        moduleLessons.forEach((lesson: any) => {
          // Get lesson title if available
          const lessonTitle =
            data.course?.modules[moduleIndex]?.lessons[lesson.lessonIndex]
              ?.title || `Lesson ${lesson.lessonIndex + 1}`;

          const status = lesson.completed ? 'Completed' : 'In Progress';
          const timeSpent = formatTime(lesson.timeSpent);
          const startTime = new Date(lesson.startedAt).toLocaleString();
          const completedTime = lesson.completedAt
            ? new Date(lesson.completedAt).toLocaleString()
            : 'Not completed';

          report += `* ${lessonTitle}\n`;
          report += `  Status: ${status}\n`;
          report += `  Learning Time: ${timeSpent}\n`;
          report += `  Start Time: ${startTime}\n`;
          if (lesson.completed) {
            report += `  Completion Time: ${completedTime}\n`;
          }
          report += '\n';
        });
      });
    } else {
      report += 'No lessons started yet\n';
    }

    // Add assessment information
    report += `\nAssessment Completion Status\n`;
    report += `==========================\n`;

    if (data.assessments && data.assessments.length > 0) {
      data.assessments.forEach((assessment: any, index: number) => {
        const assessmentType =
          assessment.type === 'quiz' ? 'Quiz' : 'Assignment';
        const submission = assessment.submission;

        report += `${index + 1}. ${assessment.title} (${assessmentType})\n`;
        report += `   Total Points: ${assessment.totalPoints} points\n`;

        if (submission) {
          report += `   Submission Time: ${new Date(submission.submittedAt).toLocaleString()}\n`;

          if (submission.score !== undefined) {
            const scorePercentage = (
              (submission.score / assessment.totalPoints) *
              100
            ).toFixed(1);
            report += `   Score: ${submission.score}/${assessment.totalPoints} (${scorePercentage}%)\n`;
            if (submission.gradedAt) {
              report += `   Grading Time: ${new Date(submission.gradedAt).toLocaleString()}\n`;
            }
          } else {
            report += `   Status: Submitted, Pending Grade\n`;
          }
        } else {
          report += `   Status: Not Submitted\n`;
        }

        report += '\n';
      });
    } else {
      report += 'No assessments in this course\n';
    }

    // Add learning status analysis
    report += `\nLearning Status Analysis\n`;
    report += `==========================\n`;

    // Determine if the student is struggling based on criteria
    let isStruggling = false;
    let struggleReasons = [];

    // No progress or low progress
    if (data.progress?.overallProgress < 25) {
      isStruggling = true;
      struggleReasons.push('Course completion rate below 25%');
    }

    // No activity in the last two weeks
    if (data.progress?.lastAccessedAt) {
      const lastActivity = new Date(data.progress.lastAccessedAt);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      if (lastActivity < twoWeeksAgo) {
        isStruggling = true;
        struggleReasons.push('No learning activity for over two weeks');
      }
    }

    // Time spent is much higher than average on some lessons
    const excessiveTimeSpent = data.progress?.completedLessons?.some(
      (lesson: any) => lesson.timeSpent > 90 // Over 90 minutes considered abnormal
    );

    if (excessiveTimeSpent) {
      isStruggling = true;
      struggleReasons.push(
        'Excessive time spent on some lessons, may be facing difficulties'
      );
    }

    // Add the analysis to the report
    if (isStruggling) {
      report += `Learning Status: Needs Attention\n`;
      report += `Potential Issues:\n`;
      struggleReasons.forEach((reason) => {
        report += `- ${reason}\n`;
      });
      report += `\nSuggestion: Consider providing additional learning support and resources.\n`;
    } else {
      report += `Learning Status: Good\n`;
      report += `Student is progressing normally through the course with no apparent learning obstacles.\n`;
    }

    return report;
  } catch (error) {
    console.error('Error generating report text:', error);
    return `Error generating report.\nPlease contact system administrator.\n\nError details: ${error}`;
  }
}

// Helper function to format time in minutes to a readable string
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours} hours ${mins} minutes`;
  }
  return `${mins} minutes`;
}
