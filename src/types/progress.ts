import { ICourse } from './course';

export interface LessonProgress {
  moduleIndex: number;
  lessonIndex: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  timeSpent: number;
  lastPosition?: number;
}

export interface ModuleProgress {
  moduleIndex: number;
  completedAt: string;
  timeSpent: number;
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

export interface IModuleLesson {
  title: string;
}

export interface ICourseModule {
  title: string;
  lessons: IModuleLesson[];
}

export interface IStudentProgressCourse {
  id: string;
  title: string;
  modules: ICourseModule[];
}

export interface IStudentUser {
  id: string;
  name: string;
  email: string;
}

export interface IProgressData {
  overallProgress: number;
  completedModules: ModuleProgress[];
  completedLessons: LessonProgress[];
  lastAccessedAt: string | null;
}

export interface StudentProgressData {
  student: IStudentUser;
  course: IStudentProgressCourse;
  progress: IProgressData;
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