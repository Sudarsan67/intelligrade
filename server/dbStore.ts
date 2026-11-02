import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserProfile,
  StudentRosterEntry,
  StaffAccessRequest,
  Examination,
  SyllabusDocument,
  AnswerSubmission,
  EvaluationRecord,
  StudyTask,
  MentorMessage,
} from '../src/types';

const DATA_FILE = path.resolve(process.cwd(), '.intelligrade_db.json');

// Helper to hash password
export function hashPassword(plainText: string): string {
  return crypto.createHash('sha256').update(`salt_ig_2026_${plainText}`).digest('hex');
}

export interface ServerDatabase {
  users: (UserProfile & { passwordHash: string })[];
  roster: StudentRosterEntry[];
  staffRequests: StaffAccessRequest[];
  examinations: Examination[];
  syllabusDocuments: SyllabusDocument[];
  submissions: AnswerSubmission[];
  evaluations: EvaluationRecord[];
  studyTasks: StudyTask[];
  mentorMessages: Record<string, MentorMessage[]>;
  auditLogs: { id: string; timestamp: string; action: string; actor: string; details: string }[];
}

// Initial seed generation
function createInitialSeed(): ServerDatabase {
  const adminUser: UserProfile & { passwordHash: string } = {
    id: 'USR-ADMIN-001',
    email: 'admin@nandhaengg.org',
    name: 'Administrator (Dr. Sudarsan)',
    role: 'admin',
    department: 'Computer Science & Engineering',
    status: 'active',
    mustChangePassword: true, // Requires password change on first login as per spec
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword('sudarsan'), // spec demonstration initial credential
  };

  const teacherUser: UserProfile & { passwordHash: string } = {
    id: 'USR-TEACHER-001',
    email: 'prof.balaji@nandhaengg.org',
    name: 'Prof. Balaji S.',
    role: 'teacher',
    department: 'AI & Data Science',
    designation: 'Associate Professor & DEV Lead',
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword('teacher123'),
  };

  // Student test account matching spec 732225AI104@nandhaengg.org
  const studentUser: UserProfile & { passwordHash: string } = {
    id: 'USR-STU-732225AI104',
    email: '732225AI104@nandhaengg.org',
    name: 'Aarav Sharma',
    role: 'student',
    department: 'AI & Data Science',
    classYear: 'Year 3 - Sec A',
    rollNumber: '732225AI104',
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword('student123'),
  };

  // 32 verified roster entries for Nandha Engineering College (nandhaengg.org)
  const roster: StudentRosterEntry[] = [
    { id: 'ROS-001', rollNumber: '732225AI104', name: 'Aarav Sharma', institutionalEmail: '732225AI104@nandhaengg.org', department: 'AI & Data Science', year: 'Year 3', semester: 'Sem 5', isRegistered: true, registeredUserId: studentUser.id },
    { id: 'ROS-002', rollNumber: '732225AI105', name: 'Ananya Iyer', institutionalEmail: '732225AI105@nandhaengg.org', department: 'AI & Data Science', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-003', rollNumber: '732225CS101', name: 'Rohan Deshmukh', institutionalEmail: '732225CS101@nandhaengg.org', department: 'Computer Science & Engineering', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-004', rollNumber: '732225IT102', name: 'Priya Venkatesh', institutionalEmail: '732225IT102@nandhaengg.org', department: 'Information Technology', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-005', rollNumber: '732225CS103', name: 'Vikram Malhotra', institutionalEmail: '732225CS103@nandhaengg.org', department: 'Computer Science & Engineering', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-006', rollNumber: '732225AI106', name: 'Sneha Kulkarni', institutionalEmail: '732225AI106@nandhaengg.org', department: 'AI & Data Science', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-007', rollNumber: '732225IT104', name: 'Aditya Verma', institutionalEmail: '732225IT104@nandhaengg.org', department: 'Information Technology', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
    { id: 'ROS-008', rollNumber: '732225AI107', name: 'Meera Nambiar', institutionalEmail: '732225AI107@nandhaengg.org', department: 'AI & Data Science', year: 'Year 3', semester: 'Sem 5', isRegistered: false },
  ];

  // Syllabus documents for subjects
  const syllabusDocuments: SyllabusDocument[] = [
    {
      id: 'SYL-DEV-001',
      subject: 'Data Exploration and Visualization',
      semester: 'Sem 5',
      academicYear: '2026-2027',
      version: 1,
      uploadedAt: '2026-08-01T10:00:00Z',
      uploadedBy: teacherUser.id,
      status: 'active',
      topics: [
        { id: 'TOP-DEV-01', unitNumber: 1, unitTitle: 'Exploratory Data Analysis Foundations', topicTitle: 'Descriptive Statistics & Five-Number Summary', description: 'Calculation of mean, median, mode, IQR, standard deviation and Tukey outlier detection.', learningOutcomes: ['Understand parametric vs non-parametric metrics', 'Compute Quartiles and IQR', 'Identify anomalies using Tukey fences'], importanceWeight: 5, estimatedHours: 4.5 },
        { id: 'TOP-DEV-02', unitNumber: 2, unitTitle: 'Data Quality & Preprocessing', topicTitle: 'Missing Value Handling & Normalization', description: 'Techniques for mean/median imputation, row omission, and min-max feature scaling.', learningOutcomes: ['Identify missingness mechanisms', 'Perform median imputation'], importanceWeight: 4, estimatedHours: 3.5 },
        { id: 'TOP-DEV-03', unitNumber: 3, unitTitle: 'Multivariate Visualization', topicTitle: 'Correlation Matrices & Scatter Regression', description: 'Pearson correlation coefficient derivation, heatmaps, and linear regression trendlines.', learningOutcomes: ['Interpret correlation matrix -1.0 to +1.0', 'Plot bivariate scatter with R-squared'], importanceWeight: 5, estimatedHours: 5.0 },
      ],
    },
    {
      id: 'SYL-DBMS-001',
      subject: 'Database Management Systems',
      semester: 'Sem 5',
      academicYear: '2026-2027',
      version: 1,
      uploadedAt: '2026-08-01T10:00:00Z',
      uploadedBy: teacherUser.id,
      status: 'active',
      topics: [
        { id: 'TOP-DBMS-01', unitNumber: 1, unitTitle: 'Transaction Management', topicTitle: 'ACID Properties and Concurrency Control', description: 'Atomicity, Consistency, Isolation, Durability guarantees and two-phase locking.', learningOutcomes: ['Explain ACID guarantees', 'Contrast serializability with dirty reads'], importanceWeight: 5, estimatedHours: 4.0 },
        { id: 'TOP-DBMS-02', unitNumber: 2, unitTitle: 'Database Recovery', topicTitle: 'Write-Ahead Logging (WAL) & ARIES Protocol', description: 'Redo and Undo logging mechanisms ensuring crash recovery.', learningOutcomes: ['Describe WAL principles', 'Explain rollback and rollforward recovery phases'], importanceWeight: 5, estimatedHours: 4.5 },
      ],
    },
  ];

  // Examinations (CAT 1, CAT 2, etc.)
  const examinations: Examination[] = [
    {
      id: 'EXAM-CAT1-DEV',
      name: 'Continuous Assessment Test 1 (CAT 1) — DEV',
      type: 'CAT 1',
      subject: 'Data Exploration and Visualization',
      department: 'AI & Data Science',
      semester: 'Sem 5',
      academicYear: '2026-2027',
      date: '2026-09-15',
      startTime: '09:30',
      endTime: '11:00',
      maxMarks: 50,
      passingMarks: 25,
      instructions: 'Answer all descriptive questions. Show mathematical steps for IQR and box plot boundary calculations.',
      syllabusVersionId: 'SYL-DEV-001',
      createdAt: '2026-08-20T09:00:00Z',
      createdBy: teacherUser.id,
      questions: [
        {
          id: 'Q-DEV-1',
          questionNumber: '1',
          questionText: 'Explain the mathematical construction of a Box and Whisker Plot. Discuss how it identifies potential outliers using the Interquartile Range (IQR) rule.',
          maxMarks: 20,
          unitNumber: 1,
          topicId: 'TOP-DEV-01',
          modelAnswer: 'A Box Plot displays the five-number summary: Min, Q1, Median, Q3, and Max. The central box represents IQR = Q3 - Q1. Outliers are points beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR.',
          rubricCriteria: [
            { criterionName: 'Five-Number Summary Definition', maxMarks: 5, description: 'Correctly identifies Min, Q1, Median, Q3, Max' },
            { criterionName: 'IQR Formula & Meaning', maxMarks: 5, description: 'States IQR = Q3 - Q1 and middle 50% spread' },
            { criterionName: 'Tukey Outlier Fences', maxMarks: 7, description: 'Defines Lower Fence (Q1 - 1.5*IQR) and Upper Fence (Q3 + 1.5*IQR)' },
            { criterionName: 'Clarity and Structure', maxMarks: 3, description: 'Logically organized with diagrams/steps' },
          ],
        },
        {
          id: 'Q-DEV-2',
          questionNumber: '2',
          questionText: 'Compare Pearson Correlation Coefficient with Spearman Rank Correlation in bivariate data exploration.',
          maxMarks: 30,
          unitNumber: 3,
          topicId: 'TOP-DEV-03',
          modelAnswer: 'Pearson measures linear relationships for continuous variables. Spearman measures monotonic relationships based on ranked orders.',
          rubricCriteria: [
            { criterionName: 'Pearson Linearity', maxMarks: 10, description: 'Linear relationship and parametric assumptions' },
            { criterionName: 'Spearman Monotonicity', maxMarks: 10, description: 'Rank-based monotonic relationship and robustness to outliers' },
            { criterionName: 'Mathematical Formulations', maxMarks: 10, description: 'Accurate formulas and range [-1.0 to +1.0]' },
          ],
        },
      ],
    },
    {
      id: 'EXAM-CAT2-DBMS',
      name: 'Continuous Assessment Test 2 (CAT 2) — DBMS',
      type: 'CAT 2',
      subject: 'Database Management Systems',
      department: 'Computer Science & Engineering',
      semester: 'Sem 5',
      academicYear: '2026-2027',
      date: '2026-10-22',
      startTime: '13:30',
      endTime: '15:00',
      maxMarks: 50,
      passingMarks: 25,
      instructions: 'Explain transaction schedules with rollback traces.',
      syllabusVersionId: 'SYL-DBMS-001',
      createdAt: '2026-09-10T09:00:00Z',
      createdBy: teacherUser.id,
      questions: [
        {
          id: 'Q-DBMS-1',
          questionNumber: '1',
          questionText: 'Explain the ACID properties in transaction processing and describe how write-ahead logging (WAL) guarantees the Durability and Atomicity properties.',
          maxMarks: 25,
          unitNumber: 1,
          topicId: 'TOP-DBMS-01',
          modelAnswer: 'Atomicity (all or nothing), Consistency, Isolation, Durability. WAL writes log records to disk before data pages to allow undo and redo on crash.',
          rubricCriteria: [
            { criterionName: 'ACID Properties Definition', maxMarks: 10, description: 'Full and accurate definition of A, C, I, D' },
            { criterionName: 'Write-Ahead Logging Mechanics', maxMarks: 10, description: 'Explains undo/redo logs before flushing dirty pages' },
            { criterionName: 'Crash Recovery Execution', maxMarks: 5, description: 'Details rollforward for durability and rollback for atomicity' },
          ],
        },
      ],
    },
  ];

  // Evaluations with controlled publication statuses
  const evaluations: EvaluationRecord[] = [
    {
      id: 'EVL-CAT1-DEV-001',
      examinationId: 'EXAM-CAT1-DEV',
      studentId: studentUser.id,
      studentRollNumber: '732225AI104',
      studentName: 'Aarav Sharma',
      department: 'AI & Data Science',
      classYear: 'Year 3 - Sec A',
      subject: 'Data Exploration and Visualization',
      assessmentName: 'Continuous Assessment Test 1 (CAT 1) — DEV',
      assessmentType: 'CAT 1',
      date: '2026-09-15',
      maxMarks: 50,
      aiMarks: 44.5,
      adjustedMarks: 45.0,
      finalMarks: 45.0,
      percentage: 90.0,
      grade: 'A+',
      status: 'PUBLISHED',
      isPublishedToStudent: true, // Student can view this!
      publishedAt: '2026-09-18T14:00:00Z',
      publishedBy: teacherUser.name,
      feedback: 'Excellent conceptual depth and rigorous explanation of Tukey outlier fences.',
      strengths: ['Accurate 1.5*IQR formula', 'Well structured diagrammatic description', 'Distinguished parametric vs non-parametric properties'],
      missingConcepts: ['Could mention extreme outlier fence (3.0*IQR)'],
      areasForImprovement: ['Practice drawing symmetric vs skewed box plot shapes'],
      rubricBreakdown: { conceptualUnderstanding: 9.5, technicalAccuracy: 9.0, completeness: 9.0, structureAndClarity: 9.5 },
      keywordCoveragePercent: 94,
      evaluatedAt: '2026-09-16T11:00:00Z',
      teacherNotes: 'Outstanding paper. Verified by Prof. Balaji.',
    },
    {
      id: 'EVL-CAT2-DBMS-001',
      examinationId: 'EXAM-CAT2-DBMS',
      studentId: studentUser.id,
      studentRollNumber: '732225AI104',
      studentName: 'Aarav Sharma',
      department: 'AI & Data Science',
      classYear: 'Year 3 - Sec A',
      subject: 'Database Management Systems',
      assessmentName: 'Continuous Assessment Test 2 (CAT 2) — DBMS',
      assessmentType: 'CAT 2',
      date: '2026-10-22',
      maxMarks: 50,
      aiMarks: 41.0,
      adjustedMarks: 42.0,
      finalMarks: 42.0,
      percentage: 84.0,
      grade: 'A',
      status: 'PUBLISHED',
      isPublishedToStudent: true, // Student can view this!
      publishedAt: '2026-10-25T16:30:00Z',
      publishedBy: teacherUser.name,
      feedback: 'Very good articulation of write-ahead logging and recovery rollback.',
      strengths: ['Clear definition of Atomicity and Durability', 'Explains undo/redo log records correctly'],
      missingConcepts: ['Minor omission of checkpointing mechanisms'],
      areasForImprovement: ['Elaborate on how fuzzy checkpoints speed up restart recovery'],
      rubricBreakdown: { conceptualUnderstanding: 8.5, technicalAccuracy: 8.5, completeness: 8.0, structureAndClarity: 8.5 },
      keywordCoveragePercent: 88,
      evaluatedAt: '2026-10-23T15:20:00Z',
      teacherNotes: 'Approved.',
    },
    {
      id: 'EVL-DRAFT-AI-001',
      examinationId: 'EXAM-CAT1-DEV',
      studentId: studentUser.id,
      studentRollNumber: '732225AI104',
      studentName: 'Aarav Sharma',
      department: 'AI & Data Science',
      classYear: 'Year 3 - Sec A',
      subject: 'Artificial Intelligence',
      assessmentName: 'Pre-Semester Model Exam — AI',
      assessmentType: 'Model Examination',
      date: '2026-10-30',
      maxMarks: 50,
      aiMarks: 39.0,
      adjustedMarks: 39.0,
      finalMarks: 39.0,
      percentage: 78.0,
      grade: 'B',
      status: 'TEACHER_APPROVED', // NOT YET PUBLISHED! Demonstrates security: hidden from student!
      isPublishedToStudent: false,
      feedback: 'Solid explanation of bias-variance tradeoff. Pending faculty release.',
      evaluatedAt: '2026-10-31T10:00:00Z',
    },
  ];

  // Initial Spaced Repetition Study Tasks for Aarav
  const studyTasks: StudyTask[] = [
    {
      id: 'TSK-001',
      studentId: studentUser.id,
      subject: 'Data Exploration and Visualization',
      unitNumber: 2,
      topicTitle: 'Missing Value Imputation & IQR Bounds',
      date: '2026-11-03',
      startTime: '17:00',
      endTime: '18:30',
      durationMinutes: 90,
      priority: 'High',
      difficulty: 'Moderate',
      isSmartScheduled: true,
      completed: false,
      intervalDays: 3,
      easeFactor: 2.5,
      repetitions: 1,
    },
    {
      id: 'TSK-002',
      studentId: studentUser.id,
      subject: 'Database Management Systems',
      unitNumber: 2,
      topicTitle: 'Write-Ahead Logging (WAL) Checkpoints',
      date: '2026-11-04',
      startTime: '18:00',
      endTime: '19:15',
      durationMinutes: 75,
      priority: 'Medium',
      difficulty: 'Hard',
      isSmartScheduled: true,
      completed: false,
      intervalDays: 2,
      easeFactor: 2.3,
      repetitions: 2,
    },
  ];

  return {
    users: [adminUser, teacherUser, studentUser],
    roster,
    staffRequests: [],
    examinations,
    syllabusDocuments,
    submissions: [],
    evaluations,
    studyTasks,
    mentorMessages: {
      [studentUser.id]: [
        {
          id: 'MSG-001',
          sender: 'mentor',
          text: 'Hello Aarav! I am your IntelliGrade Academic AI Mentor. I have reviewed your published marks in DEV (90% A+) and DBMS (84% A). What topic would you like to focus on for your upcoming Model Exams?',
          timestamp: '2026-10-26T09:00:00Z',
        },
      ],
    },
    auditLogs: [
      {
        id: 'LOG-001',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_BOOTSTRAP',
        actor: 'SYSTEM',
        details: 'Initialized administrator (admin@nandhaengg.org) and student roster.',
      },
    ],
  };
}

class DatabaseManager {
  private data: ServerDatabase;

  constructor() {
    this.data = this.load();
  }

  private load(): ServerDatabase {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load database file, generating fresh seed:', e);
    }
    const seed = createInitialSeed();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: ServerDatabase) {
    try {
      const payload = dataToSave || this.data;
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database file:', e);
    }
  }

  public get(): ServerDatabase {
    return this.data;
  }

  public update(updater: (db: ServerDatabase) => void) {
    updater(this.data);
    this.save();
  }

  public resetToSeed() {
    this.data = createInitialSeed();
    this.save();
    return this.data;
  }
}

export const dbStore = new DatabaseManager();
