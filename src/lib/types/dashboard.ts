export interface StudentProfileDTO {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  parentEmail?: string | null;
  role: 'STUDENT' | 'ADMIN';
  gradeId?: string | null;
  gradeName?: string | null;
  stage?: string | null;
  createdAt: string;
}

export interface StudentSubscriptionDTO {
  hasActiveSubscription: boolean;
  subscription: {
    id: string;
    planId: string;
    planName: string;
    startsAt: string;
    expiresAt: string;
    daysRemaining: number;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  } | null;
}

export interface ContinueLearningLessonDTO {
  id: string;
  unitId: string;
  unitTitle: string;
  branchName: string;
  gradeName: string;
  title: string;
  description: string;
  videoPath?: string | null;
  pdfPath?: string | null;
  thumbnailPath?: string | null;
  durationMinutes: number;
  lastPosition: number;
  watchPercentage: number;
  isCompleted: boolean;
}

export interface StudentProgressSummaryDTO {
  totalLessonsInGrade: number;
  completedLessonsCount: number;
  overallProgressPercentage: number;
  averageQuizScorePercentage: number;
  totalWatchHours: number;
  passedQuizzesCount: number;
  totalQuizzesCount: number;
}

export interface CurriculumLessonDTO {
  id: string;
  unitId: string;
  title: string;
  description: string;
  videoPath?: string | null;
  pdfPath?: string | null;
  thumbnailPath?: string | null;
  durationMinutes: number;
  sortOrder: number;
  isPublished: boolean;
  isLocked: boolean;
  minPassScore: number;
  watchPercentage: number;
  isCompleted: boolean;
  lastPosition: number;
}

export interface CurriculumUnitDTO {
  id: string;
  branchId: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  lessons: CurriculumLessonDTO[];
}

export interface CurriculumBranchDTO {
  id: string;
  termId: string;
  name: string;
  sortOrder: number;
  units: CurriculumUnitDTO[];
}

export interface CurriculumTermDTO {
  id: string;
  gradeId: string;
  name: string;
  sortOrder: number;
  branches: CurriculumBranchDTO[];
}

export interface CurriculumGradeDTO {
  id: string;
  name: string;
  stage: string;
  description?: string | null;
  sortOrder: number;
  terms: CurriculumTermDTO[];
}

export interface StudentQuizItemDTO {
  id: string;
  lessonId: string;
  lessonTitle: string;
  branchName: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  passScore: number;
  maxAttempts: number;
  questionsCount: number;
  attemptsCount: number;
  bestScorePercentage?: number | null;
  hasPassed: boolean;
  isLocked: boolean;
  pdfPath?: string | null;
  fileType?: string | null;
  type?: 'mcq' | 'file';
}

export interface StudentExamResultDTO {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  branchName: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export interface StudentNotificationDTO {
  id: string;
  type: 'LESSON' | 'QUIZ' | 'SUBSCRIPTION' | 'ANNOUNCEMENT';
  title: string;
  description: string;
  createdAt: string;
  linkUrl?: string;
  isRead?: boolean;
}

export interface StudentDashboardData {
  profile: StudentProfileDTO;
  subscription: StudentSubscriptionDTO;
  continueLearning: ContinueLearningLessonDTO | null;
  progressSummary: StudentProgressSummaryDTO;
  curriculum: CurriculumTermDTO[];
  availableQuizzes: StudentQuizItemDTO[];
  recentResults: StudentExamResultDTO[];
  notifications: StudentNotificationDTO[];
}

// Admin Dashboard Types
export interface AdminOverviewStatsDTO {
  totalStudents: number;
  activeSubscriptions: number;
  totalLessons: number;
  totalQuizzes: number;
  totalQuestions: number;
  unusedVouchers: number;
  recentAuditLogs: AdminAuditLogDTO[];
}

export interface AdminStudentDTO {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  governorate?: string | null;
  gradeId?: string | null;
  gradeName?: string | null;
  isActive: boolean;
  hasActiveSubscription: boolean;
  subscriptionPlanName?: string | null;
  subscriptionExpiresAt?: string | null;
  daysRemaining?: number | null;
  createdAt: string;
  lastLoginAt?: string | null;
  completedLessonsCount?: number;
  examAttemptsCount?: number;
}

export interface AdminVoucherDTO {
  id: string;
  code: string;
  planId: string;
  planName: string;
  durationDays: number;
  price: number;
  status: 'UNUSED' | 'USED' | 'DISABLED';
  usedById?: string | null;
  usedByName?: string | null;
  usedByPhone?: string | null;
  usedAt?: string | null;
  createdAt: string;
}

export interface AdminSubscriptionDTO {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  planId: string;
  planName: string;
  durationDays: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  source: 'CODE' | 'MANUAL';
  startsAt: string;
  expiresAt: string;
  daysRemaining: number;
  createdAt: string;
}

export interface AdminAuditLogDTO {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface QuestionOptionDTO {
  label: string;
  text: string;
}

export interface QuestionItemDTO {
  id: string;
  questionText: string;
  questionLatex?: string | null;
  imageUrl?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'MCQ' | 'TRUE_FALSE';
  options: QuestionOptionDTO[];
  correctAnswer: string;
  explanation?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  branchName?: string;
}

export interface QuizDetailsDTO {
  id: string;
  lessonId: string;
  lessonTitle?: string;
  branchName?: string;
  gradeName?: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  passScore: number;
  maxAttempts: number;
  isPublished: boolean;
  questionsCount: number;
  questions?: QuestionItemDTO[];
  pdfPath?: string | null;
  type?: 'mcq' | 'file';
  createdAt: string;
}

export interface LessonDetailsDTO {
  id: string;
  unitId: string;
  unitTitle: string;
  branchId: string;
  branchName: string;
  termId: string;
  termName: string;
  gradeId: string;
  gradeName: string;
  stage: string;
  title: string;
  description: string;
  videoPath?: string | null;
  parsedMedia: { type: 'video' | 'iframe'; src: string };
  pdfPath?: string | null;
  thumbnailPath?: string | null;
  durationMinutes: number;
  sortOrder: number;
  isPublished: boolean;
  isLocked: boolean;
  minPassScore: number;
  quizzes: Array<{
    id: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    passScore: number;
    maxAttempts: number;
  }>;
  studentProgress?: {
    watchPercentage: number;
    lastPosition: number;
    isCompleted: boolean;
    completedAt?: string | null;
  } | null;
  hasAccess: boolean;
  accessReason?: string;
  requiresSubscription?: boolean;
  gradeMismatch?: boolean;
  assignedGradeName?: string | null;
}

export interface LessonAccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiresSubscription?: boolean;
  gradeMismatch?: boolean;
  isGuest?: boolean;
  lesson?: {
    id: string;
    title: string;
    gradeId: string;
    gradeName: string;
    isLocked: boolean;
  };
  user?: {
    id: string;
    fullName: string;
    role: 'ADMIN' | 'STUDENT';
    gradeId?: string;
    gradeName?: string;
    hasActiveSubscription: boolean;
  };
}

export interface UpdateProgressResult {
  isCompleted: boolean;
  watchPercentage: number;
  lastPosition: number;
  completedAt?: string | null;
}

