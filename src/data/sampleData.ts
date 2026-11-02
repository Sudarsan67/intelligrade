import { Student, EvaluationRecord, SubjectName, ExaminationType } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  { id: 'STU-2026-001', rollNumber: '732225AI104', name: 'Aarav Sharma', email: '732225AI104@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-15', phone: '+1 (555) 019-2831', accountStatus: 'active' },
  { id: 'STU-2026-002', rollNumber: '732225AI105', name: 'Ananya Iyer', email: '732225AI105@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-15', phone: '+1 (555) 019-2832', accountStatus: 'active' },
  { id: 'STU-2026-003', rollNumber: '732225CS101', name: 'Rohan Deshmukh', email: '732225CS101@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-16', phone: '+1 (555) 019-2833', accountStatus: 'active' },
  { id: 'STU-2026-004', rollNumber: '732225IT102', name: 'Priya Venkatesh', email: '732225IT102@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-16', phone: '+1 (555) 019-2834', accountStatus: 'active' },
  { id: 'STU-2026-005', rollNumber: '732225CS103', name: 'Vikram Malhotra', email: '732225CS103@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-17', phone: '+1 (555) 019-2835', accountStatus: 'active' },
  { id: 'STU-2026-006', rollNumber: '732225AI106', name: 'Sneha Kulkarni', email: '732225AI106@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-17', phone: '+1 (555) 019-2836', accountStatus: 'active' },
  { id: 'STU-2026-007', rollNumber: '732225IT104', name: 'Aditya Verma', email: '732225IT104@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-18', phone: '+1 (555) 019-2837', accountStatus: 'active' },
  { id: 'STU-2026-008', rollNumber: '732225AI107', name: 'Meera Nambiar', email: '732225AI107@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-18', phone: '+1 (555) 019-2838', accountStatus: 'active' },
  { id: 'STU-2026-009', rollNumber: '732225CS105', name: 'Kabir Singhania', email: '732225CS105@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-19', phone: '+1 (555) 019-2839', accountStatus: 'active' },
  { id: 'STU-2026-010', rollNumber: '732225IT106', name: 'Diya Patel', email: '732225IT106@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-19', phone: '+1 (555) 019-2840', accountStatus: 'active' },
  { id: 'STU-2026-011', rollNumber: '732225CS107', name: 'Arjun Nair', email: '732225CS107@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-20', phone: '+1 (555) 019-2841', accountStatus: 'active' },
  { id: 'STU-2026-012', rollNumber: '732225AI109', name: 'Tanvi Sen', email: '732225AI109@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-20', phone: '+1 (555) 019-2842', accountStatus: 'active' },
  { id: 'STU-2026-013', rollNumber: '732225IT108', name: 'Siddharth Rao', email: '732225IT108@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-21', phone: '+1 (555) 019-2843', accountStatus: 'active' },
  { id: 'STU-2026-014', rollNumber: '732225CS109', name: 'Ishita Banerjee', email: '732225CS109@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-21', phone: '+1 (555) 019-2844', accountStatus: 'active' },
  { id: 'STU-2026-015', rollNumber: '732225AI111', name: 'Varun Chopra', email: '732225AI111@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-22', phone: '+1 (555) 019-2845', accountStatus: 'active' },
  { id: 'STU-2026-016', rollNumber: '732225IT110', name: 'Kavya Pillai', email: '732225IT110@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-22', phone: '+1 (555) 019-2846', accountStatus: 'active' },
  { id: 'STU-2026-017', rollNumber: '732225CS111', name: 'Nikhil Reddy', email: '732225CS111@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-23', phone: '+1 (555) 019-2847', accountStatus: 'active' },
  { id: 'STU-2026-018', rollNumber: '732225AI113', name: 'Riya Gupta', email: '732225AI113@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-23', phone: '+1 (555) 019-2848', accountStatus: 'active' },
  { id: 'STU-2026-019', rollNumber: '732225IT112', name: 'Manish Pandey', email: '732225IT112@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-24', phone: '+1 (555) 019-2849', accountStatus: 'active' },
  { id: 'STU-2026-020', rollNumber: '732225CS113', name: 'Pooja Hegde', email: '732225CS113@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-24', phone: '+1 (555) 019-2850', accountStatus: 'active' },
  { id: 'STU-2026-021', rollNumber: '732225AI115', name: 'Gaurav Joshi', email: '732225AI115@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-25', phone: '+1 (555) 019-2851', accountStatus: 'active' },
  { id: 'STU-2026-022', rollNumber: '732225IT114', name: 'Shruti Bhatt', email: '732225IT114@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-25', phone: '+1 (555) 019-2852', accountStatus: 'active' },
  { id: 'STU-2026-023', rollNumber: '732225CS115', name: 'Devendra Nath', email: '732225CS115@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-26', phone: '+1 (555) 019-2853', accountStatus: 'active' },
  { id: 'STU-2026-024', rollNumber: '732225AI117', name: 'Kritika Roy', email: '732225AI117@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-26', phone: '+1 (555) 019-2854', accountStatus: 'active' },
  { id: 'STU-2026-025', rollNumber: '732225IT116', name: 'Pranav Saxena', email: '732225IT116@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-27', phone: '+1 (555) 019-2855', accountStatus: 'active' },
  { id: 'STU-2026-026', rollNumber: '732225CS117', name: 'Ananya Mukherjee', email: '732225CS117@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-27', phone: '+1 (555) 019-2856', accountStatus: 'active' },
  { id: 'STU-2026-027', rollNumber: '732225AI119', name: 'Yash Vardhan', email: '732225AI119@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-28', phone: '+1 (555) 019-2857', accountStatus: 'active' },
  { id: 'STU-2026-028', rollNumber: '732225IT118', name: 'Neha Chawla', email: '732225IT118@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-28', phone: '+1 (555) 019-2858', accountStatus: 'active' },
  { id: 'STU-2026-029', rollNumber: '732225CS119', name: 'Abhishek Tiwari', email: '732225CS119@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-29', phone: '+1 (555) 019-2859', accountStatus: 'active' },
  { id: 'STU-2026-030', rollNumber: '732225AI121', name: 'Shreya Menon', email: '732225AI121@nandhaengg.org', department: 'AI & Data Science', classYear: 'Year 3 - Sec A', semester: 'Sem 5', enrollmentDate: '2024-08-29', phone: '+1 (555) 019-2860', accountStatus: 'active' },
  { id: 'STU-2026-031', rollNumber: '732225IT120', name: 'Deepak Chauhan', email: '732225IT120@nandhaengg.org', department: 'Information Technology', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-30', phone: '+1 (555) 019-2861', accountStatus: 'active' },
  { id: 'STU-2026-032', rollNumber: '732225CS121', name: 'Bhavna Sethi', email: '732225CS121@nandhaengg.org', department: 'Computer Science & Engineering', classYear: 'Year 3 - Sec B', semester: 'Sem 5', enrollmentDate: '2024-08-30', phone: '+1 (555) 019-2862', accountStatus: 'active' },
];

export const SAMPLE_QUESTIONS: {
  subject: SubjectName;
  question: string;
  modelAnswer: string;
  maxMarks: number;
  sampleStudentAnswers: {
    type: 'High Scoring' | 'Average' | 'Needs Improvement';
    text: string;
  }[];
}[] = [
  {
    subject: 'Data Exploration and Visualization',
    question:
      'Explain the purpose and mathematical construction of a Box and Whisker Plot. Discuss how it identifies potential outliers using the Interquartile Range (IQR) rule.',
    maxMarks: 20,
    modelAnswer:
      'A Box and Whisker Plot is a standardized non-parametric graphical tool used in exploratory data analysis to display the five-number summary: Minimum, First Quartile (Q1), Median (Q2), Third Quartile (Q3), and Maximum. The central box spans from Q1 to Q3, representing the Interquartile Range (IQR = Q3 - Q1), which encapsulates the middle 50% of the dataset. Whiskers extend outward to the minimum and maximum data values that fall within the lower and upper fences. Outliers are mathematically flagged using John Tukey\'s rule: Lower Fence = Q1 - (1.5 * IQR) and Upper Fence = Q3 + (1.5 * IQR). Any observation lying outside these boundaries is plotted as an individual discrete point (outlier). It provides immediate visual insight into distribution symmetry, skewness, spread, and outlier presence without distributional assumptions.',
    sampleStudentAnswers: [
      {
        type: 'High Scoring',
        text:
          'A Box Plot provides a five-number summary: Min, Q1, Median, Q3, and Max. The central box represents the Interquartile Range (IQR), calculated as IQR = Q3 - Q1, which contains the central 50% of data observations. Whiskers extend to the most extreme data points within the boundaries defined by the fences. Tukey’s rule identifies outliers: points below Q1 - 1.5*IQR or above Q3 + 1.5*IQR are considered outliers and drawn as distinct dots. This plot highlights skewness, dispersion, and extreme anomalies without assuming a normal bell curve.',
      },
      {
        type: 'Average',
        text:
          'A box plot shows min, max, median and quartiles. The box is made from quartile 1 to quartile 3. The difference is called IQR. Whiskers go to the minimum and maximum values. Outliers are values that are too far from the rest of the data. We find them by calculating 1.5 times the IQR added to Q3 or subtracted from Q1. If a point is outside, it is plotted as an outlier.',
      },
      {
        type: 'Needs Improvement',
        text:
          'A box plot is a graph in statistics with a box in the middle and two whiskers on each side. The line in the middle is the average of the marks. Whiskers show the highest and lowest scores in the exam. Outliers are scores that are weird or very high.',
      },
    ],
  },
  {
    subject: 'Database Management Systems',
    question:
      'Explain the ACID properties in transaction processing and describe how write-ahead logging (WAL) guarantees the Durability and Atomicity properties.',
    maxMarks: 20,
    modelAnswer:
      'ACID properties represent the fundamental guarantees for reliable database transactions: Atomicity (all-or-nothing execution), Consistency (preservation of database invariants and constraints), Isolation (concurrent transactions execute without interfering with one another, equivalent to serial order), and Durability (committed changes persist permanently even after hardware crashes). Write-Ahead Logging (WAL) enforces Atomicity and Durability by ensuring that log records containing redo and undo data are written and flushed to stable non-volatile storage before corresponding dirty database pages are written to disk. During recovery, uncommitted transactions are rolled back using undo log entries (guaranteeing Atomicity), while committed changes that were not yet flushed to tables are reapplied using redo log entries (guaranteeing Durability).',
    sampleStudentAnswers: [
      {
        type: 'High Scoring',
        text:
          'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all operations succeed or none do. Consistency preserves database constraints across states. Isolation prevents dirty reads and concurrency conflicts. Durability ensures committed transactions survive power failures. Write-Ahead Logging (WAL) ensures all log records (both Undo and Redo operations) are strictly written to disk before modifying actual data pages. In case of unexpected server crashes, the recovery manager reads the log: it redoes committed changes for Durability and undos incomplete transactions to maintain Atomicity.',
      },
      {
        type: 'Average',
        text:
          'ACID properties are Atomicity, Consistency, Isolation, and Durability. Atomicity means transaction either happens completely or fails completely. Consistency means database remains valid. Isolation means other users cannot see intermediate results. Durability means data is saved on disk. Write ahead log writes log files before updating tables. If the system crashes, we can restore from logs.',
      },
      {
        type: 'Needs Improvement',
        text:
          'ACID means atomic, constant, isolated and durable. Transactions must be durable so they do not get lost when electricity goes out. Logging writes logs so the administrator can see what happened.',
      },
    ],
  },
  {
    subject: 'Artificial Intelligence',
    question:
      'Discuss the Bias-Variance tradeoff in supervised machine learning models. How do model complexity, overfitting, and regularization relate to this tradeoff?',
    maxMarks: 20,
    modelAnswer:
      'The Bias-Variance tradeoff characterizes the tension between two sources of error in supervised learning. Bias error stems from erroneous, overly simplistic assumptions in the learning algorithm, leading to underfitting (high training and test error). Variance error stems from excessive sensitivity to small fluctuations in the training dataset, leading to overfitting (low training error but high generalization error on unseen data). Total expected prediction error is the sum of Bias^2 + Variance + Irreducible Error. As model complexity increases (e.g., deep neural networks or high-degree polynomials), bias decreases while variance increases. Regularization techniques (like L1/L2 penalties, pruning, or dropout) constrain model complexity, penalizing extreme parameter weights to balance variance reduction against a slight increase in bias, thereby minimizing overall test error.',
    sampleStudentAnswers: [
      {
        type: 'High Scoring',
        text:
          'The bias-variance tradeoff describes the balance between underfitting and overfitting in predictive models. High bias occurs when models are too simple (underfitting), missing real data patterns. High variance occurs when models over-memorize training noise (overfitting). Total test error = Bias^2 + Variance + Irreducible Noise. As model complexity grows, bias drops but variance spikes. Regularization techniques such as L1 Lasso, L2 Ridge, and tree pruning restrict parameter magnitude, trading a slight increase in bias for a massive drop in variance to achieve optimal generalization.',
      },
      {
        type: 'Average',
        text:
          'Bias is when the model is too simple and underfits the data. Variance is when the model is too complex and fits the training data too well, leading to overfitting. We want to find the sweet spot where total error is lowest. Regularization helps stop overfitting by adding a penalty to the loss function.',
      },
      {
        type: 'Needs Improvement',
        text:
          'Bias is when a model has bias towards certain predictions. Variance is variance in marks. If a model has too much complexity it crashes. Regularization makes the dataset regular.',
      },
    ],
  },
];

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

const SUBJECTS: SubjectName[] = [
  'Mathematics',
  'Data Structures',
  'Database Management Systems',
  'Artificial Intelligence',
  'Data Exploration and Visualization',
];

const ASSESSMENTS: { name: string; type: ExaminationType; maxMarks: number; date: string }[] = [
  { name: 'Continuous Assessment Test 1 (CAT 1)', type: 'CAT 1', maxMarks: 50, date: '2026-09-15' },
  { name: 'DEV Unit 2 Analytical Practical', type: 'Lab Practical', maxMarks: 25, date: '2026-10-05' },
  { name: 'Continuous Assessment Test 2 (CAT 2)', type: 'CAT 2', maxMarks: 50, date: '2026-10-22' },
  { name: 'Capstone Project Assessment', type: 'Assignment', maxMarks: 30, date: '2026-10-26' },
  { name: 'Pre-Semester Model Examination', type: 'Model Examination', maxMarks: 100, date: '2026-10-30' },
];

function getBasePerformance(studentIndex: number, subjectIndex: number): number {
  let baseScoreRatio = 0.75;
  if (studentIndex < 6) baseScoreRatio = 0.88;
  else if (studentIndex < 16) baseScoreRatio = 0.78;
  else if (studentIndex < 26) baseScoreRatio = 0.68;
  else baseScoreRatio = 0.44;

  const subjectModifiers = [-0.08, 0.02, 0.05, 0.01, 0.07];
  const micro = (((studentIndex * 13 + subjectIndex * 17) % 19) - 9) * 0.012;
  return Math.max(0.25, Math.min(0.98, baseScoreRatio + subjectModifiers[subjectIndex] + micro));
}

export const INITIAL_EVALUATIONS: EvaluationRecord[] = [];

INITIAL_STUDENTS.forEach((student, sIdx) => {
  SUBJECTS.forEach((subject, subIdx) => {
    const assessment = ASSESSMENTS[(sIdx + subIdx) % ASSESSMENTS.length];
    const ratio = getBasePerformance(sIdx, subIdx);
    const rawMarks = Math.round(assessment.maxMarks * ratio * 2) / 2;
    const finalMarks = Math.min(assessment.maxMarks, Math.max(0, rawMarks));
    const percentage = Math.round((finalMarks / assessment.maxMarks) * 1000) / 10;
    const grade = calculateGrade(percentage);

    const rubricConceptual = Math.min(10, Math.max(2, Math.round(ratio * 10 * 10) / 10));
    const rubricTechnical = Math.min(10, Math.max(2, Math.round((ratio + 0.02) * 10 * 10) / 10));
    const rubricCompleteness = Math.min(10, Math.max(2, Math.round((ratio - 0.03) * 10 * 10) / 10));
    const rubricStructure = Math.min(10, Math.max(2, Math.round(ratio * 10 * 10) / 10));

    INITIAL_EVALUATIONS.push({
      id: `EVL-2026-${String(sIdx * 5 + subIdx + 1).padStart(4, '0')}`,
      studentId: student.id,
      studentRollNumber: student.rollNumber,
      studentName: student.name,
      department: student.department,
      classYear: student.classYear,
      semester: student.semester,
      subject,
      assessmentName: assessment.name,
      assessmentType: assessment.type,
      date: assessment.date,
      maxMarks: assessment.maxMarks,
      aiMarks: finalMarks,
      adjustedMarks: finalMarks,
      finalMarks,
      percentage,
      grade,
      status: 'PUBLISHED',
      isPublishedToStudent: true,
      publishedAt: `${assessment.date}T16:00:00Z`,
      publishedBy: 'Prof. Balaji S.',
      isSampleData: true,
      rubricBreakdown: {
        conceptualUnderstanding: rubricConceptual,
        technicalAccuracy: rubricTechnical,
        completeness: rubricCompleteness,
        structureAndClarity: rubricStructure,
      },
      strengths: [
        'Accurate application of standard terminology',
        'Clear structured progression from definition to implementation',
        'Valid mathematical / structural reasoning demonstrated',
      ],
      missingConcepts:
        percentage < 70
          ? ['Deeper exploration of edge cases and boundary behaviors', 'Mathematical derivation clarity']
          : ['Brief mention of modern distributed extensions'],
      areasForImprovement:
        percentage < 60
          ? ['Review foundational principles before proceeding to advanced queries', 'Practice standard diagrammatic representations']
          : ['Expand on real-world industrial tradeoffs'],
      feedback: `Demonstrates ${percentage >= 75 ? 'solid' : 'developing'} academic comprehension of ${subject}. ${
        percentage >= 75
          ? 'Strong technical articulation and good structural clarity.'
          : 'Requires reinforcement on core definitions and complete algorithmic steps.'
      }`,
      keywordCoveragePercent: Math.min(100, Math.round(percentage + 4)),
      evaluatedAt: `${assessment.date}T14:30:00Z`,
      teacherNotes: 'Verified and approved by faculty assessor.',
    });
  });
});
