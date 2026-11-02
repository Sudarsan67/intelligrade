export * from './auth';

export type SubjectName =
  | 'Mathematics'
  | 'Data Structures'
  | 'Database Management Systems'
  | 'Artificial Intelligence'
  | 'Data Exploration and Visualization';

export type DepartmentName =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'AI & Data Science';

export type ExaminationType =
  | 'CAT 1'
  | 'CAT 2'
  | 'Model Examination'
  | 'Semester Examination'
  | 'Lab Practical'
  | 'Assignment';

export type MarkStatus =
  | 'NOT_EVALUATED'
  | 'AI_PROCESSING'
  | 'NEEDS_REVIEW'
  | 'AI_EVALUATED'
  | 'TEACHER_APPROVED'
  | 'PUBLISHED';

export interface Student {
  id: string; // e.g. "STU-2026-001" or "732225AI104"
  rollNumber: string;
  name: string;
  email: string; // institutional email e.g. "732225AI104@nandhaengg.org"
  department: DepartmentName;
  classYear: string; // e.g. "Year 3 - Sec A"
  semester: string; // e.g. "Sem 5"
  enrollmentDate: string;
  avatarSeed?: string;
  phone?: string;
  accountStatus: 'active' | 'pending' | 'disabled';
}

export interface SyllabusTopic {
  id: string;
  unitNumber: number;
  unitTitle: string;
  topicTitle: string;
  description: string;
  learningOutcomes: string[];
  importanceWeight: number; // 1 to 5
  estimatedHours: number;
}

export interface SyllabusDocument {
  id: string;
  subject: SubjectName;
  semester: string;
  academicYear: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'active' | 'draft' | 'archived';
  topics: SyllabusTopic[];
}

export interface ExamQuestion {
  id: string;
  questionNumber: string; // e.g. "1.a", "2", "3"
  questionText: string;
  maxMarks: number;
  unitNumber: number;
  topicId?: string;
  modelAnswer?: string;
  rubricCriteria: {
    criterionName: string;
    maxMarks: number;
    description: string;
  }[];
}

export interface Examination {
  id: string;
  name: string; // e.g. "CAT 1 - Continuous Assessment Test I"
  type: ExaminationType;
  subject: SubjectName;
  department: DepartmentName;
  semester: string;
  academicYear: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passingMarks: number;
  instructions: string;
  syllabusVersionId?: string;
  questions: ExamQuestion[];
  createdAt: string;
  createdBy: string;
}

export interface AnswerPage {
  pageNumber: number;
  imageUrl: string;
  ocrText?: string;
  ocrConfidence?: number;
  needsReview?: boolean;
}

export interface AnswerSubmission {
  id: string;
  examinationId: string;
  subject: SubjectName;
  studentId: string;
  studentRollNumber: string;
  studentName: string;
  submittedAt: string;
  source: 'upload' | 'camera_scan';
  pages: AnswerPage[];
  extractedAnswers: {
    questionId: string;
    questionNumber: string;
    studentAnswerText: string;
    pageReferences: number[];
    ocrConfidence: number;
    isCorrectedManually?: boolean;
  }[];
}

export interface RubricBreakdown {
  conceptualUnderstanding: number; // out of 10
  technicalAccuracy: number; // out of 10
  completeness: number; // out of 10
  structureAndClarity: number; // out of 10
}

export interface EvaluationCriterionScore {
  criterionName: string;
  maxMarks: number;
  marksAwarded: number;
  evidence: string;
  syllabusReference?: string;
  reason: string;
  suggestion: string;
}

export interface EvaluationRecord {
  id: string;
  examinationId?: string;
  studentId: string;
  studentRollNumber?: string;
  studentName: string;
  department: DepartmentName;
  classYear: string;
  semester?: string;
  subject: SubjectName;
  assessmentName: string;
  assessmentType: ExaminationType;
  date: string;
  maxMarks: number;
  aiMarks: number;
  adjustedMarks: number;
  finalMarks: number;
  percentage: number;
  grade: string;
  status: MarkStatus;
  isSampleData?: boolean;
  question?: string;
  modelAnswer?: string;
  studentAnswer?: string;
  ocrConfidence?: number;
  feedback?: string;
  strengths?: string[];
  missingConcepts?: string[];
  areasForImprovement?: string[];
  rubricBreakdown?: RubricBreakdown;
  criterionScores?: EvaluationCriterionScore[];
  keywordCoveragePercent?: number;
  evaluatedAt?: string;
  evaluatedBy?: string;
  teacherNotes?: string;
  publishedAt?: string;
  publishedBy?: string;
  publicationVersion?: number;
  isPublishedToStudent: boolean;
}

export interface StudyTask {
  id: string;
  studentId: string;
  subject: SubjectName;
  unitNumber?: number;
  topicTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Hard' | 'Moderate' | 'Easy';
  isSmartScheduled: boolean;
  completed: boolean;
  lastRevisionDate?: string;
  intervalDays?: number; // SM-2 spaced repetition
  easeFactor?: number;
  repetitions?: number;
}

export interface MentorMessage {
  id: string;
  sender: 'student' | 'mentor';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'open_planner' | 'view_subject' | 'revise_topic';
    label: string;
    payload?: string;
  };
}

export interface EDAStats {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  stdDev: number;
  variance: number;
  q1: number;
  q3: number;
  iqr: number;
  passPercentage: number;
  failCount: number;
  passCount: number;
}

export interface SubjectComparison {
  subject: SubjectName;
  averageMarks: number;
  averagePercentage: number;
  highestMarks: number;
  lowestMarks: number;
  passRate: number;
  studentCount: number;
  stdDev: number;
}

export interface CorrelationCell {
  subjectA: SubjectName;
  subjectB: SubjectName;
  correlation: number;
}

export interface BoxPlotData {
  subject: SubjectName;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

export interface FilterState {
  search: string;
  subject: string;
  department: string;
  classYear: string;
  assessmentType: string;
  status: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface DataCleaningIssue {
  type: 'missing' | 'duplicate' | 'out_of_bounds' | 'type_mismatch';
  rowId: string;
  field: string;
  description: string;
  suggestedFix?: string;
}
