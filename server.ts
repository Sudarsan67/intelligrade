import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { dbStore, hashPassword } from './server/dbStore';
import { EvaluationRecord, Examination, SyllabusDocument, StudyTask } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// 1. HEALTH & DIAGNOSTICS
// ==========================================
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    databaseUsers: dbStore.get().users.length,
    rosterCount: dbStore.get().roster.length,
    evaluationsCount: dbStore.get().evaluations.length,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 2. AUTHENTICATION & ROLE MANAGEMENT (PHASE 2)
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbStore.get();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const inputHash = hashPassword(password);
  if (user.passwordHash !== inputHash) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  // Check account status
  if (user.status === 'pending_approval') {
    return res.status(403).json({
      error: 'Your staff account is currently PENDING_APPROVAL. An administrator must approve your registration before you can access the faculty portal.',
    });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({
      error: 'This account has been disabled. Please contact the university administrator.',
    });
  }

  // Generate safe session token
  const token = `tok_${user.id}_${Date.now()}`;
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    classYear: user.classYear,
    rollNumber: user.rollNumber,
    designation: user.designation,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
  };

  return res.json({
    success: true,
    token,
    user: safeUser,
  });
});

// Student Account Registration (Verified against official Roster)
app.post('/api/auth/student-register', (req: Request, res: Response) => {
  const { institutionalEmail, name, rollNumber, department, year, password } = req.body;

  if (!institutionalEmail || !rollNumber || !password || !name) {
    return res.status(400).json({ error: 'All fields are mandatory for student verification.' });
  }

  const cleanEmail = institutionalEmail.trim().toLowerCase();
  const cleanRoll = rollNumber.trim().toUpperCase();

  // Validate institutional domain
  if (!cleanEmail.endsWith('@nandhaengg.org') && !cleanEmail.includes('@')) {
    return res.status(400).json({
      error: 'Students must register using their official college email address (e.g. 732225AI104@nandhaengg.org).',
    });
  }

  const db = dbStore.get();

  // Check if already registered
  const existingUser = db.users.find(
    (u) => u.email.toLowerCase() === cleanEmail || u.rollNumber?.toUpperCase() === cleanRoll
  );
  if (existingUser) {
    return res.status(409).json({
      error: 'An account with this institutional email or roll number already exists. Please log in directly.',
    });
  }

  // Verify against student roster
  const rosterEntry = db.roster.find(
    (r) =>
      r.institutionalEmail.toLowerCase() === cleanEmail &&
      r.rollNumber.toUpperCase() === cleanRoll
  );

  if (!rosterEntry) {
    return res.status(403).json({
      error: 'Verification failed: Email and roll number do not match the official student roster. Please verify with your department coordinator.',
    });
  }

  if (rosterEntry.isRegistered) {
    return res.status(409).json({
      error: 'This roster entry has already been registered. Please log in with your existing account.',
    });
  }

  const newUserId = `USR-STU-${cleanRoll}`;
  const newUser = {
    id: newUserId,
    email: cleanEmail,
    name: name.trim(),
    role: 'student' as const, // Trusted server-side role assignment
    department: rosterEntry.department || department,
    classYear: `${rosterEntry.year || year} - Sec A`,
    rollNumber: cleanRoll,
    status: 'active' as const,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  dbStore.update((d) => {
    d.users.push(newUser);
    // Mark roster entry as registered
    const rIdx = d.roster.findIndex((r) => r.id === rosterEntry.id);
    if (rIdx !== -1) {
      d.roster[rIdx].isRegistered = true;
      d.roster[rIdx].registeredUserId = newUserId;
    }
    d.auditLogs.push({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'STUDENT_REGISTERED',
      actor: cleanEmail,
      details: `Student account created and linked to roster ${cleanRoll}`,
    });
  });

  return res.json({
    success: true,
    message: 'Student account successfully verified and activated! You may now sign in.',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      rollNumber: newUser.rollNumber,
      department: newUser.department,
    },
  });
});

// Staff Account Registration (Pending administrative approval)
app.post('/api/auth/staff-register', (req: Request, res: Response) => {
  const { name, email, department, designation, password } = req.body;

  if (!name || !email || !password || !department) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbStore.get();

  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const requestId = `REQ-${Date.now().toString().slice(-4)}`;
  const newUserId = `USR-STAFF-${Date.now().toString().slice(-4)}`;

  const newUser = {
    id: newUserId,
    email: cleanEmail,
    name: name.trim(),
    role: 'teacher' as const,
    department,
    designation: designation || 'Assistant Professor',
    status: 'pending_approval' as const, // Strict pending status per specification
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  };

  const accessRequest = {
    id: requestId,
    name: name.trim(),
    email: cleanEmail,
    department,
    designation: designation || 'Assistant Professor',
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
  };

  dbStore.update((d) => {
    d.users.push(newUser);
    d.staffRequests.push(accessRequest);
    d.auditLogs.push({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'STAFF_REGISTRATION_REQUESTED',
      actor: cleanEmail,
      details: `Staff registration pending admin approval.`,
    });
  });

  return res.json({
    success: true,
    message: 'Staff onboarding request submitted. Your account is pending administrative approval.',
    status: 'pending_approval',
  });
});

// Password Change Endpoint (Required for admin bootstrap & users)
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = dbStore.get();
  const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user || user.passwordHash !== hashPassword(currentPassword)) {
    return res.status(401).json({ error: 'Current password verification failed.' });
  }

  dbStore.update((d) => {
    const u = d.users.find((usr) => usr.email.toLowerCase() === cleanEmail);
    if (u) {
      u.passwordHash = hashPassword(newPassword);
      u.mustChangePassword = false;
    }
  });

  return res.json({
    success: true,
    message: 'Password updated successfully. You may now proceed.',
  });
});

// Staff Requests & Approvals (Admin only)
app.get('/api/admin/staff-requests', (_req: Request, res: Response) => {
  const db = dbStore.get();
  res.json({ requests: db.staffRequests });
});

app.post('/api/admin/approve-staff', (req: Request, res: Response) => {
  const { requestId, decision } = req.body; // decision: 'approved' | 'rejected'
  const db = dbStore.get();
  const reqItem = db.staffRequests.find((r) => r.id === requestId);

  if (!reqItem) {
    return res.status(404).json({ error: 'Request not found.' });
  }

  dbStore.update((d) => {
    const r = d.staffRequests.find((item) => item.id === requestId);
    if (r) {
      r.status = decision === 'approved' ? 'approved' : 'rejected';
      r.reviewedAt = new Date().toISOString();
    }
    const user = d.users.find((u) => u.email.toLowerCase() === reqItem.email.toLowerCase());
    if (user) {
      user.status = decision === 'approved' ? 'active' : 'disabled';
    }
    d.auditLogs.push({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `STAFF_${decision.toUpperCase()}`,
      actor: 'ADMIN',
      details: `${reqItem.email} status set to ${decision}`,
    });
  });

  res.json({ success: true, message: `Staff request ${decision} successfully.` });
});

// Student Roster Management & CSV Import
app.get('/api/roster', (_req: Request, res: Response) => {
  res.json({ roster: dbStore.get().roster });
});

app.post('/api/roster/import', (req: Request, res: Response) => {
  const { entries } = req.body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Invalid roster entries.' });
  }

  dbStore.update((d) => {
    entries.forEach((e: any) => {
      if (!d.roster.some((r) => r.rollNumber === e.rollNumber)) {
        d.roster.push({
          id: `ROS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          rollNumber: e.rollNumber,
          name: e.name,
          institutionalEmail: e.institutionalEmail,
          department: e.department || 'AI & Data Science',
          year: e.year || 'Year 3',
          semester: e.semester || 'Sem 5',
          isRegistered: false,
        });
      }
    });
  });

  res.json({ success: true, count: dbStore.get().roster.length });
});

// ==========================================
// 3. EXAMINATIONS & QUESTION PAPERS (PHASE 10)
// ==========================================
app.get('/api/examinations', (_req: Request, res: Response) => {
  res.json({ examinations: dbStore.get().examinations });
});

app.post('/api/examinations', (req: Request, res: Response) => {
  const exam: Examination = req.body;
  if (!exam.name || !exam.subject) {
    return res.status(400).json({ error: 'Examination name and subject are required.' });
  }

  dbStore.update((d) => {
    const existingIdx = d.examinations.findIndex((e) => e.id === exam.id);
    if (existingIdx !== -1) {
      d.examinations[existingIdx] = exam;
    } else {
      d.examinations.push({
        ...exam,
        id: exam.id || `EXAM-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    }
  });

  res.json({ success: true, examination: exam });
});

// ==========================================
// 4. SYLLABUS MANAGEMENT (PHASE 9)
// ==========================================
app.get('/api/syllabus', (_req: Request, res: Response) => {
  res.json({ syllabusDocuments: dbStore.get().syllabusDocuments });
});

app.post('/api/syllabus', (req: Request, res: Response) => {
  const doc: SyllabusDocument = req.body;
  dbStore.update((d) => {
    const idx = d.syllabusDocuments.findIndex((s) => s.id === doc.id);
    if (idx !== -1) {
      d.syllabusDocuments[idx] = doc;
    } else {
      d.syllabusDocuments.push({
        ...doc,
        id: doc.id || `SYL-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      });
    }
  });
  res.json({ success: true, document: doc });
});

// ==========================================
// 5. ANSWER SHEET CAMERA SCAN / UPLOAD (PHASE 11)
// ==========================================
app.post('/api/answer-sheets/submit', (req: Request, res: Response) => {
  const submission = req.body;
  dbStore.update((d) => {
    d.submissions.push({
      ...submission,
      id: submission.id || `SUB-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    });
  });
  res.json({ success: true, submissionId: submission.id });
});

// ==========================================
// 6. AI SEMANTIC EVALUATION (PHASE 12)
// ==========================================
app.post('/api/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const {
      question,
      modelAnswer,
      studentAnswer,
      maxMarks = 20,
      subject = 'General',
      studentName = 'Student',
      assessmentName = 'Assessment',
      syllabusContext = '',
    } = req.body;

    if (!question || !studentAnswer) {
      return res.status(400).json({
        error: 'Missing required fields: question and studentAnswer are mandatory.',
      });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please configure GEMINI_API_KEY in the Secrets panel.',
      });
    }

    const evaluationPrompt = `
You are an expert academic university evaluator grading descriptive papers in "${subject}".
Evaluate the following student descriptive answer for "${studentName}" in "${assessmentName}".

CRITICAL INSTRUCTIONS:
- Grade strictly by semantic understanding, conceptual correctness, accuracy, and logical reasoning.
- Do NOT perform exact keyword counting. Accept valid alternative phrasings and correct explanations.
- Maximum marks allowed: ${maxMarks}. Awarded marks must be between 0 and ${maxMarks}.
- If syllabus context is provided, ground the assessment within that scope:
${syllabusContext ? `Syllabus Context:\n${syllabusContext}\n` : ''}

QUESTION:
"""
${question}
"""

MODEL / REFERENCE ANSWER:
"""
${modelAnswer || 'Use subject domain principles and rigor.'}
"""

STUDENT ANSWER:
"""
${studentAnswer}
"""
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        systemInstruction:
          'You are an expert academic evaluator. Assess student descriptive answers strictly and provide structured JSON assessment reports with criterion scores, evidence, strengths, and areas for improvement.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marksAwarded: {
              type: Type.NUMBER,
              description: `Marks awarded out of ${maxMarks}.`,
            },
            rubricBreakdown: {
              type: Type.OBJECT,
              properties: {
                conceptualUnderstanding: { type: Type.NUMBER },
                technicalAccuracy: { type: Type.NUMBER },
                completeness: { type: Type.NUMBER },
                structureAndClarity: { type: Type.NUMBER },
              },
              required: [
                'conceptualUnderstanding',
                'technicalAccuracy',
                'completeness',
                'structureAndClarity',
              ],
            },
            criterionScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterionName: { type: Type.STRING },
                  maxMarks: { type: Type.NUMBER },
                  marksAwarded: { type: Type.NUMBER },
                  evidence: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ['criterionName', 'maxMarks', 'marksAwarded', 'evidence', 'reason'],
              },
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            feedback: { type: Type.STRING },
            keywordCoveragePercent: { type: Type.NUMBER },
          },
          required: [
            'marksAwarded',
            'rubricBreakdown',
            'strengths',
            'missingConcepts',
            'areasForImprovement',
            'feedback',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from AI evaluation model');

    const parsed = JSON.parse(text);
    let marks = Number(parsed.marksAwarded);
    if (isNaN(marks)) marks = 0;
    marks = Math.max(0, Math.min(maxMarks, Math.round(marks * 10) / 10));
    const percentage = Math.round((marks / maxMarks) * 1000) / 10;

    return res.json({
      success: true,
      data: {
        marksAwarded: marks,
        maxMarks,
        percentage,
        rubricBreakdown: parsed.rubricBreakdown,
        criterionScores: parsed.criterionScores || [],
        strengths: parsed.strengths || [],
        missingConcepts: parsed.missingConcepts || [],
        areasForImprovement: parsed.areasForImprovement || [],
        feedback: parsed.feedback || 'Evaluation completed successfully.',
        keywordCoveragePercent: parsed.keywordCoveragePercent || Math.round(percentage),
        evaluatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error during answer evaluation:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to complete AI evaluation.',
    });
  }
});

// ==========================================
// 7. MARKS & CONTROLLED PUBLICATION (PHASE 13)
// ==========================================
app.get('/api/evaluations', (req: Request, res: Response) => {
  const { studentId, role } = req.query;
  const db = dbStore.get();

  // STRICT RLS ENFORCEMENT:
  // If request is from a student, return ONLY their own PUBLISHED marks!
  if (role === 'student' && studentId) {
    const studentRecords = db.evaluations.filter(
      (e) => e.studentId === studentId && e.isPublishedToStudent === true
    );
    return res.json({ evaluations: studentRecords });
  }

  // Teachers / Admins can see all evaluations
  res.json({ evaluations: db.evaluations });
});

app.post('/api/evaluations', (req: Request, res: Response) => {
  const evaluation: EvaluationRecord = req.body;
  dbStore.update((d) => {
    const idx = d.evaluations.findIndex((e) => e.id === evaluation.id);
    if (idx !== -1) {
      d.evaluations[idx] = evaluation;
    } else {
      d.evaluations.unshift(evaluation);
    }
  });
  res.json({ success: true, evaluation });
});

// Publish Marks Endpoint (Confirmation workflow)
app.post('/api/marks/publish', (req: Request, res: Response) => {
  const { evaluationIds, examinationId, publishedBy } = req.body;
  const db = dbStore.get();
  let affectedCount = 0;

  dbStore.update((d) => {
    d.evaluations.forEach((e) => {
      const matchId = evaluationIds ? evaluationIds.includes(e.id) : false;
      const matchExam = examinationId ? e.examinationId === examinationId : false;

      if (matchId || matchExam) {
        e.status = 'PUBLISHED';
        e.isPublishedToStudent = true;
        e.publishedAt = new Date().toISOString();
        e.publishedBy = publishedBy || 'Faculty Assessor';
        e.publicationVersion = (e.publicationVersion || 1) + 1;
        affectedCount++;
      }
    });

    d.auditLogs.push({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'MARKS_PUBLISHED',
      actor: publishedBy || 'TEACHER',
      details: `Published ${affectedCount} marks records to students.`,
    });
  });

  res.json({
    success: true,
    message: `Successfully published marks for ${affectedCount} student records.`,
    affectedCount,
  });
});

// ==========================================
// 8. AI STUDENT MENTOR (PHASE 5)
// ==========================================
app.post('/api/ai/mentor', async (req: Request, res: Response) => {
  try {
    const { studentId, userMessage, publishedMarksSummary, syllabusTopics } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const mentorPrompt = `
You are the personal AI Academic Mentor for a college student in the Computer Science / AI & Data Science department.
Your mission is to help the student understand their performance, tackle weak areas, and prepare for upcoming exams.

STUDENT'S PUBLISHED ACADEMIC RECORD (Ground Truth):
${JSON.stringify(publishedMarksSummary, null, 2)}

APPROVED SYLLABUS HIGHLIGHTS:
${JSON.stringify(syllabusTopics, null, 2)}

STUDENT QUESTION:
"${userMessage}"

GUIDELINES:
1. Provide practical, concise, motivating academic guidance.
2. Ground your advice directly in their actual published scores and weak topics.
3. Recommend specific revision tactics (e.g. practicing IQR calculations, WAL recovery checkpoints).
4. Keep response under 3 paragraphs.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: mentorPrompt,
    });

    const replyText = response.text || 'Keep revising consistently and review your rubric feedback!';

    return res.json({
      success: true,
      reply: replyText,
    });
  } catch (err: any) {
    console.error('Mentor error:', err);
    return res.status(500).json({ error: 'Mentor service temporarily unavailable.' });
  }
});

// ==========================================
// 9. SMART STUDY PLANNER (PHASE 6)
// ==========================================
app.get('/api/study-tasks', (req: Request, res: Response) => {
  const { studentId } = req.query;
  const db = dbStore.get();
  const tasks = studentId ? db.studyTasks.filter((t) => t.studentId === studentId) : db.studyTasks;
  res.json({ tasks });
});

app.post('/api/study-tasks', (req: Request, res: Response) => {
  const task: StudyTask = req.body;
  dbStore.update((d) => {
    const idx = d.studyTasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      d.studyTasks[idx] = task;
    } else {
      d.studyTasks.push({
        ...task,
        id: task.id || `TSK-${Date.now()}`,
      });
    }
  });
  res.json({ success: true, task });
});

app.delete('/api/study-tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbStore.update((d) => {
    d.studyTasks = d.studyTasks.filter((t) => t.id !== id);
  });
  res.json({ success: true });
});

// Smart Schedule Generator (Weighted-priority + Spaced Repetition)
app.post('/api/ai/generate-study-plan', (req: Request, res: Response) => {
  const { studentId, availableHoursPerDay = 3, targetExamName = 'Model Exam' } = req.body;
  const db = dbStore.get();

  // Find student's weak subjects from published marks
  const sEvals = db.evaluations.filter((e) => e.studentId === studentId && e.isPublishedToStudent);
  const subjectScores: Record<string, number> = {};
  sEvals.forEach((e) => {
    subjectScores[e.subject] = e.percentage;
  });

  // Topics from syllabus
  const allTopics: { subject: string; title: string; unit: number; importance: number; weaknessWeight: number }[] = [];
  db.syllabusDocuments.forEach((doc) => {
    const score = subjectScores[doc.subject] || 70;
    const weaknessWeight = Math.max(1, Math.round((100 - score) / 10)); // Lower score -> higher urgency

    doc.topics.forEach((t) => {
      allTopics.push({
        subject: doc.subject,
        title: t.topicTitle,
        unit: t.unitNumber,
        importance: t.importanceWeight,
        weaknessWeight,
      });
    });
  });

  // Sort by priority = importance * weaknessWeight
  allTopics.sort((a, b) => b.importance * b.weaknessWeight - a.importance * a.weaknessWeight);

  // Generate 7-day study plan with SM-2 spaced intervals
  const generatedTasks: StudyTask[] = [];
  const today = new Date();

  allTopics.slice(0, 6).forEach((top, idx) => {
    const taskDate = new Date(today);
    taskDate.setDate(today.getDate() + Math.floor(idx / 2) + 1);
    const dateStr = taskDate.toISOString().split('T')[0];

    const isSlot1 = idx % 2 === 0;
    const startTime = isSlot1 ? '17:30' : '19:15';
    const endTime = isSlot1 ? '18:45' : '20:30';

    generatedTasks.push({
      id: `SMART-${Date.now()}-${idx}`,
      studentId: studentId || 'USR-STU-732225AI104',
      subject: top.subject as any,
      unitNumber: top.unit,
      topicTitle: top.title,
      date: dateStr,
      startTime,
      endTime,
      durationMinutes: 75,
      priority: top.weaknessWeight >= 4 ? 'High' : 'Medium',
      difficulty: top.weaknessWeight >= 4 ? 'Hard' : 'Moderate',
      isSmartScheduled: true,
      completed: false,
      intervalDays: 2,
      easeFactor: 2.5,
      repetitions: 1,
    });
  });

  dbStore.update((d) => {
    generatedTasks.forEach((gt) => d.studyTasks.push(gt));
  });

  res.json({
    success: true,
    message: `Generated ${generatedTasks.length} smart spaced-repetition study sessions based on academic weakness analysis.`,
    tasks: generatedTasks,
  });
});

// ==========================================
// 10. AI PEDAGOGICAL INSIGHTS (FACULTY)
// ==========================================
app.post('/api/generate-insights', async (req: Request, res: Response) => {
  try {
    const { summaryData, subjectStats, atRiskCount } = req.body;

    if (!process.env.GEMINI_API_KEY || !ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const prompt = `
Analyze the student academic performance data:
Summary: ${JSON.stringify(summaryData)}
Subject Stats: ${JSON.stringify(subjectStats)}
At-Risk Count: ${atRiskCount}

Provide 4 concise, actionable pedagogical insights for faculty.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  actionableRecommendation: { type: Type.STRING },
                },
                required: ['title', 'category', 'description', 'actionableRecommendation'],
              },
            },
          },
          required: ['insights'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"insights": []}');
    return res.json({ success: true, insights: parsed.insights });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// START SERVER & ATTACH VITE
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`INTELLIGRADE production server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
