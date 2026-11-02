import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Save,
  RotateCcw,
  Upload,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  HelpCircle,
} from 'lucide-react';
import { Student, EvaluationRecord, SubjectName, ExaminationType } from '../../types';
import { SAMPLE_QUESTIONS } from '../../data/sampleData';
import { ALL_SUBJECTS } from '../../services/edaCalculations';

interface AnswerEvaluationViewProps {
  students: Student[];
  onSaveEvaluation: (record: EvaluationRecord) => void;
  hasApiKey: boolean;
}

export const AnswerEvaluationView: React.FC<AnswerEvaluationViewProps> = ({
  students,
  onSaveEvaluation,
  hasApiKey,
}) => {
  // Form fields
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STU-2026-001'
  );
  const [subject, setSubject] = useState<SubjectName>(
    'Data Exploration and Visualization'
  );
  const [assessmentName, setAssessmentName] = useState<string>(
    'DEV Unit 3 Descriptive Evaluation'
  );
  const [assessmentType, setAssessmentType] = useState<ExaminationType>(
    'CAT 1'
  );
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [question, setQuestion] = useState<string>(
    SAMPLE_QUESTIONS[0].question
  );
  const [modelAnswer, setModelAnswer] = useState<string>(
    SAMPLE_QUESTIONS[0].modelAnswer
  );
  const [studentAnswer, setStudentAnswer] = useState<string>(
    SAMPLE_QUESTIONS[0].sampleStudentAnswers[0].text
  );

  // Evaluation states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<{
    marksAwarded: number;
    maxMarks: number;
    percentage: number;
    rubricBreakdown: {
      conceptualUnderstanding: number;
      technicalAccuracy: number;
      completeness: number;
      structureAndClarity: number;
    };
    strengths: string[];
    missingConcepts: string[];
    areasForImprovement: string[];
    feedback: string;
    keywordCoveragePercent: number;
    evaluatedAt: string;
  } | null>(null);

  // Teacher manual adjustment
  const [adjustedMarks, setAdjustedMarks] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState<string>(
    'Verified and approved by faculty evaluator.'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Quick preset loader
  const handleLoadQuestionTemplate = (tplIdx: number, sampleAnsIdx: number = 0) => {
    const tpl = SAMPLE_QUESTIONS[tplIdx];
    if (!tpl) return;
    setSubject(tpl.subject);
    setQuestion(tpl.question);
    setModelAnswer(tpl.modelAnswer);
    setMaxMarks(tpl.maxMarks);
    setStudentAnswer(tpl.sampleStudentAnswers[sampleAnsIdx].text);
    setEvaluationResult(null);
    setErrorMessage(null);
    setSavedSuccess(false);
  };

  // File upload for student answer (.txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setStudentAnswer(text);
      }
    };
    reader.readAsText(file);
  };

  // Perform AI Evaluation
  const handleStartEvaluation = async () => {
    if (!question.trim()) {
      setErrorMessage('Please provide the question before evaluating.');
      return;
    }
    if (!studentAnswer.trim()) {
      setErrorMessage('Please provide or upload the student answer to evaluate.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    const studentObj = students.find((s) => s.id === selectedStudentId);

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          modelAnswer,
          studentAnswer,
          maxMarks: Number(maxMarks),
          subject,
          studentName: studentObj?.name || 'Student',
          assessmentName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI Evaluation request failed.');
      }

      setEvaluationResult(data.data);
      setAdjustedMarks(data.data.marksAwarded);
    } catch (err: any) {
      console.error('AI evaluation failed:', err);
      setErrorMessage(
        err.message || 'Unable to communicate with the Gemini evaluation engine.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save approved evaluation
  const handleSaveApprovedEvaluation = () => {
    if (!evaluationResult) return;
    const studentObj = students.find((s) => s.id === selectedStudentId);
    if (!studentObj) return;

    const finalMarks = Number(adjustedMarks);
    const finalPercent = Math.round((finalMarks / maxMarks) * 1000) / 10;

    let grade = 'F';
    if (finalPercent >= 90) grade = 'A+';
    else if (finalPercent >= 80) grade = 'A';
    else if (finalPercent >= 70) grade = 'B';
    else if (finalPercent >= 60) grade = 'C';
    else if (finalPercent >= 50) grade = 'D';

    const newRecord: EvaluationRecord = {
      id: `EVL-${Date.now().toString().slice(-6)}`,
      studentId: studentObj.id,
      studentName: studentObj.name,
      department: studentObj.department,
      classYear: studentObj.classYear,
      subject,
      assessmentName,
      assessmentType,
      date: new Date().toISOString().split('T')[0],
      maxMarks,
      aiMarks: evaluationResult.marksAwarded,
      adjustedMarks: finalMarks,
      finalMarks,
      percentage: finalPercent,
      grade,
      status: 'TEACHER_APPROVED',
      isPublishedToStudent: false,
      question,
      modelAnswer,
      studentAnswer,
      feedback: evaluationResult.feedback,
      strengths: evaluationResult.strengths,
      missingConcepts: evaluationResult.missingConcepts,
      areasForImprovement: evaluationResult.areasForImprovement,
      rubricBreakdown: evaluationResult.rubricBreakdown,
      keywordCoveragePercent: evaluationResult.keywordCoveragePercent,
      evaluatedAt: new Date().toISOString(),
      teacherNotes,
    };

    onSaveEvaluation(newRecord);
    setSavedSuccess(true);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      {/* Banner / Instructions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900">
              Descriptive Answer AI Evaluation Studio
            </h2>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Gemini 3.8 Flash • Zero Hallucination Rubric
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grades subjective answers for conceptual depth, accuracy, logic, and completeness with human-in-the-loop teacher approval.
          </p>
        </div>

        {/* Quick Sample Loader Dropdown */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-600">Sample Template:</span>
          <select
            onChange={(e) => {
              const val = e.target.value.split('-');
              handleLoadQuestionTemplate(parseInt(val[0], 10), parseInt(val[1], 10));
            }}
            className="text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="0-0">DEV: Box Plot IQR (High Score Sample)</option>
            <option value="0-1">DEV: Box Plot IQR (Average Sample)</option>
            <option value="0-2">DEV: Box Plot IQR (Needs Improvement)</option>
            <option value="1-0">DBMS: ACID & WAL (High Score)</option>
            <option value="1-2">DBMS: ACID & WAL (Needs Improvement)</option>
            <option value="2-0">AI: Bias-Variance Tradeoff (High Score)</option>
            <option value="2-1">AI: Bias-Variance Tradeoff (Average)</option>
          </select>
        </div>
      </div>

      {/* Two Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Assessment & Student Metadata</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectName)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {ALL_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Assessment Title
                </label>
                <input
                  type="text"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Exam Type
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as ExaminationType)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="CAT 1">CAT 1</option>
                    <option value="CAT 2">CAT 2</option>
                    <option value="Model Examination">Model Exam</option>
                    <option value="Semester Examination">Semester Exam</option>
                    <option value="Lab Practical">Lab Practical</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Question Field */}
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-800">
                Question Statement
              </label>
              <textarea
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the examination question..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
              />
            </div>

            {/* Model / Reference Answer */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800">
                  Model / Reference Answer & Key Rubric Points
                </label>
                <span className="text-[10px] text-slate-400">Used as evaluation ground truth</span>
              </div>
              <textarea
                rows={3}
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="Provide reference points, key terms, or expected model answer..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
              />
            </div>

            {/* Student Answer */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-800">
                  Student's Descriptive Submission
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                  <Upload className="w-3 h-3" />
                  <span>Upload .txt answer file</span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={5}
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Paste the student's descriptive written response..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y shadow-2xs leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Word count: {studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0} words</span>
                <span>Assigned to: {selectedStudent?.name}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Evaluation Error</div>
                  <div className="mt-0.5">{errorMessage}</div>
                  <div className="text-[11px] text-rose-600 mt-1">
                    Ensure the Gemini API key is configured in Secrets panel and valid inputs are provided.
                  </div>
                </div>
              </div>
            )}

            {/* Evaluation Action Button */}
            <button
              onClick={handleStartEvaluation}
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Conceptual Understanding with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Start AI Descriptive Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Assessment Results & Teacher Approval (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {evaluationResult ? (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-5 animate-in fade-in duration-200">
              {/* Header result */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    AI Evaluation Result
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-black text-indigo-600">
                      {evaluationResult.marksAwarded}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      / {evaluationResult.maxMarks} marks
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                      {evaluationResult.percentage}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">
                    Key Concept Coverage
                  </div>
                  <div className="text-base font-extrabold text-slate-800">
                    {evaluationResult.keywordCoveragePercent}%
                  </div>
                </div>
              </div>

              {/* Rubric Breakdown (out of 10) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rubric Dimension Breakdown
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Conceptual Depth</span>
                      <span className="font-bold text-slate-800">
                        {evaluationResult.rubricBreakdown.conceptualUnderstanding} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{
                          width: `${evaluationResult.rubricBreakdown.conceptualUnderstanding * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Technical Accuracy & Terms</span>
                      <span className="font-bold text-slate-800">
                        {evaluationResult.rubricBreakdown.technicalAccuracy} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{
                          width: `${evaluationResult.rubricBreakdown.technicalAccuracy * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Completeness of Explanation</span>
                      <span className="font-bold text-slate-800">
                        {evaluationResult.rubricBreakdown.completeness} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{
                          width: `${evaluationResult.rubricBreakdown.completeness * 10}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-600">Structure & Clarity</span>
                      <span className="font-bold text-slate-800">
                        {evaluationResult.rubricBreakdown.structureAndClarity} / 10
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full"
                        style={{
                          width: `${evaluationResult.rubricBreakdown.structureAndClarity * 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {evaluationResult.strengths?.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identified Strengths</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
                    {evaluationResult.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Concepts */}
              {evaluationResult.missingConcepts?.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Missing Concepts / Gaps</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px]">
                    {evaluationResult.missingConcepts.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Constructive Feedback */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800">Faculty & Student Feedback:</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {evaluationResult.feedback}
                </p>
              </div>

              {/* TEACHER REVIEW & APPROVAL CONTROLS */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Teacher Review & Marks Adjustment</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Human-in-the-Loop
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">
                      AI Suggested
                    </label>
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg font-bold text-slate-700">
                      {evaluationResult.marksAwarded} / {maxMarks}
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      Teacher Approved Marks
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={0}
                      max={maxMarks}
                      value={adjustedMarks}
                      onChange={(e) => setAdjustedMarks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border-2 border-indigo-500 rounded-lg text-slate-900 font-black text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 font-medium mb-1">
                    Teacher Verification Notes
                  </label>
                  <input
                    type="text"
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  />
                </div>

                {savedSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Evaluation verified and saved to database successfully!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveApprovedEvaluation}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Approve & Save Evaluation Record</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Awaiting Evaluation Request
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Select or configure a question and student answer on the left, then click{' '}
                <strong className="text-slate-700">"Start AI Descriptive Evaluation"</strong>.
              </p>
              <div className="pt-2 text-[11px] text-indigo-600 bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100/80 text-left">
                <strong>Evaluation Philosophy:</strong> IntelliGrade checks semantic comprehension,
                domain taxonomy, structural reasoning, and completeness. Teachers retain final grading authority.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
