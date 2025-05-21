
export interface LessonProgress {
  moduleIndex: number;
  lessonIndex: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  lastPosition?: number;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment';
  totalPoints: number;
  submission?: {
    score?: number;
    submittedAt: string;
    gradedAt?: string;
  };
}

export interface StudentProgressData {
  student: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    modules: {
      title: string;
      lessons: {
        title: string;
      }[];
    }[];
  };
  progress: {
    overallProgress: number;
    completedModules: {
      moduleIndex: number;
      completedAt: string;
      timeSpent: number;
    }[];
    completedLessons: LessonProgress[];
    lastAccessedAt: string | null;
  };
  assessments: Assessment[];
}

export interface ProgressReport {
  completedLessonsCount: number;
  totalLessonsCount: number;
  percentComplete: number;
  totalTimeSpent: number;
  completedAssessments: number;
  totalAssessments: number;
  averageScore: number;
  isStruggling: boolean;
}

export type TabType = 'lessons' | 'assessments' | 'report';