import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Send,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  CalendarCheck,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { EvaluationRecord, StudyTask, SubjectName, Examination } from '../../types';
import { StudentNavTab, StudentSidebar } from './StudentSidebar';
import { EvaluationDetailModal } from '../common/EvaluationDetailModal';

interface StudentDashboardViewProps {
  user: UserProfile;
  onLogout: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<StudentNavTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Student's own published evaluations
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [selectedEvaluationDetail, setSelectedEvaluationDetail] = useState<EvaluationRecord | null>(null);

  // Mentor Chat State
  const [mentorChat, setMentorChat] = useState<{ sender: 'student' | 'mentor'; text: string; time: string }[]>([
    {
      sender: 'mentor',
      text: `Hello ${user.name}! I am your IntelliGrade Academic AI Mentor. I have analyzed your published test performance. Ask me anything about weak concepts, syllabus revision, or upcoming CAT exams!`,
      time: 'Just now',
    },
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);

  // Manual task creation form
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState<SubjectName>('Data Exploration and Visualization');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskStart, setNewTaskStart] = useState('17:00');
  const [newTaskEnd, setNewTaskEnd] = useState('18:15');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState<'Hard' | 'Moderate' | 'Easy'>('Moderate');

  // Load student's data with strict RLS: role=student
  const fetchStudentData = async () => {
    try {
      // 1. Evaluations (RLS returns ONLY published marks for this student)
      const evlRes = await fetch(`/api/evaluations?studentId=${user.id}&role=student`);
      const evlData = await evlRes.json();
      if (evlData.evaluations) setEvaluations(evlData.evaluations);

      // 2. Upcoming examinations
      const exRes = await fetch('/api/examinations');
      const exData = await exRes.json();
      if (exData.examinations) setExaminations(exData.examinations);

      // 3. Study tasks
      const tskRes = await fetch(`/api/study-tasks?studentId=${user.id}`);
      const tskData = await tskRes.json();
      if (tskData.tasks) setStudyTasks(tskData.tasks);
    } catch (e) {
      console.error('Failed to load student dashboard data:', e);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user.id]);

  // Derived stats
  const percentages = evaluations.map((e) => e.percentage);
  const avgScore =
    percentages.length > 0
      ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 10) / 10
      : 0;

  const sortedByScore = [...evaluations].sort((a, b) => b.percentage - a.percentage);
  const highestSubject = sortedByScore[0];
  const lowestSubject = sortedByScore[sortedByScore.length - 1];

  // Send message to AI Student Mentor
  const handleSendMentorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorInput.trim()) return;

    const userText = mentorInput.trim();
    const newChat = [...mentorChat, { sender: 'student' as const, text: userText, time: 'Just now' }];
    setMentorChat(newChat);
    setMentorInput('');
    setMentorLoading(true);

    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          userMessage: userText,
          publishedMarksSummary: evaluations.map((e) => ({
            subject: e.subject,
            exam: e.assessmentName,
            percentage: e.percentage,
            grade: e.grade,
            strengths: e.strengths,
            missingConcepts: e.missingConcepts,
          })),
        }),
      });

      const data = await res.json();
      setMentorChat([
        ...newChat,
        {
          sender: 'mentor',
          text: data.reply || 'Continue regular revision and follow your rubric feedback!',
          time: 'Just now',
        },
      ]);
    } catch {
      setMentorChat([
        ...newChat,
        {
          sender: 'mentor',
          text: 'I am temporarily experiencing connection latency. In the meantime, focus on the topics highlighted in your areas for improvement!',
          time: 'Just now',
        },
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  // Generate Smart Spaced Repetition Study Plan
  const handleGenerateSmartPlan = async () => {
    try {
      const res = await fetch('/api/ai/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          availableHoursPerDay: 3,
        }),
      });
      const data = await res.json();
      if (data.tasks) {
        setStudyTasks(data.tasks);
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save manual task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: StudyTask = {
      id: `TSK-${Date.now()}`,
      studentId: user.id,
      subject: newTaskSubject,
      topicTitle: newTaskTitle.trim(),
      date: newTaskDate,
      startTime: newTaskStart,
      endTime: newTaskEnd,
      durationMinutes: 75,
      priority: newTaskPriority,
      difficulty: newTaskDifficulty,
      isSmartScheduled: false,
      completed: false,
    };

    await fetch('/api/study-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    setStudyTasks([newTask, ...studyTasks]);
    setIsTaskModalOpen(false);
    setNewTaskTitle('');
  };

  const handleToggleTaskCompleted = async (task: StudyTask) => {
    const updated = { ...task, completed: !task.completed };
    setStudyTasks(studyTasks.map((t) => (t.id === task.id ? updated : t)));
    await fetch('/api/study-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const handleDeleteTask = async (id: string) => {
    setStudyTasks(studyTasks.filter((t) => t.id !== id));
    await fetch(`/api/study-tasks/${id}`, { method: 'DELETE' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Student Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        studentUser={user}
        onLogout={onLogout}
        publishedCount={evaluations.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Student Workspace
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize">
                {activeTab === 'dashboard'
                  ? 'Academic Overview'
                  : activeTab === 'marks'
                  ? 'My Published Examination Marks'
                  : activeTab === 'analytics'
                  ? 'Personal Performance Analytics'
                  : activeTab === 'mentor'
                  ? 'IntelliGrade AI Student Mentor'
                  : activeTab === 'planner'
                  ? 'Smart Study Planner & Spaced Repetition'
                  : activeTab === 'timetable'
                  ? 'My Academic Timetable'
                  : 'Profile & Settings'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {user.rollNumber}
            </span>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Welcome back, {user.name}</span>
                  </div>
                  <h2 className="text-xl font-black mt-1">
                    Continuous Assessment Progress
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-md">
                    Track verified marks, AI rubric feedback, and spaced repetition study targets.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                  <div className="text-right">
                    <div className="text-[10px] text-indigo-200 uppercase font-bold">
                      Cumulative Score
                    </div>
                    <div className="text-2xl font-black text-white">{avgScore}%</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {avgScore >= 80 ? 'A' : avgScore >= 60 ? 'B' : 'C'}
                  </div>
                </div>
              </div>

              {/* 4 Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Published Tests</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{evaluations.length}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Faculty verified</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Top Subject</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1 truncate">
                    {highestSubject?.subject || 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {highestSubject ? `${highestSubject.percentage}%` : 'No records'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Focus Subject</div>
                  <div className="text-sm font-bold text-amber-700 mt-1 truncate">
                    {lowestSubject?.subject || 'N/A'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {lowestSubject ? `${lowestSubject.percentage}%` : 'No records'}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Pending Tasks</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {studyTasks.filter((t) => !t.completed).length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Scheduled study units</div>
                </div>
              </div>

              {/* Recent Published Results */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Published Evaluations
                  </h3>
                  <button
                    onClick={() => setActiveTab('marks')}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    View All Marks →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {evaluations.map((evl) => (
                    <div
                      key={evl.id}
                      onClick={() => setSelectedEvaluationDetail(evl)}
                      className="p-4 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{evl.subject}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {evl.assessmentName} • {evl.date}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">
                            {evl.finalMarks} / {evl.maxMarks}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                            {evl.percentage}% ({evl.grade})
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. MY MARKS (PHASE 4 - STRICT RLS: PUBLISHED ONLY) */}
          {activeTab === 'marks' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Published Examination Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified grades and feedback released by your course faculty
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Total Released: <strong className="text-slate-800">{evaluations.length} assessments</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Examination</th>
                      <th className="px-4 py-3 text-center">Date</th>
                      <th className="px-4 py-3 text-center">Marks</th>
                      <th className="px-4 py-3 text-center">Percentage</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3 text-center">Publication Status</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.subject}</td>
                        <td className="px-4 py-3 text-slate-600">{row.assessmentName}</td>
                        <td className="px-4 py-3 text-center text-slate-500 font-mono text-[11px]">
                          {row.date}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-slate-900">
                          {row.finalMarks} / {row.maxMarks}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">{row.grade}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Published
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedEvaluationDetail(row)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded font-semibold text-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rubric</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. AI STUDENT MENTOR (PHASE 5) */}
          {activeTab === 'mentor' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col h-[650px]">
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>IntelliGrade Academic Mentor</span>
                      <span className="text-[10px] font-bold bg-indigo-700 px-2 py-0.5 rounded text-indigo-100">
                        Gemini Grounded
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Academic coaching based strictly on your published scores and approved syllabus.
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
                {mentorChat.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                        msg.sender === 'student'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      <div className="font-semibold text-[10px] mb-1 opacity-75">
                        {msg.sender === 'student' ? 'You' : 'AI Academic Mentor'}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {mentorLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Reviewing your syllabus & published results...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMentorMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask for revision advice (e.g. 'How can I improve my marks in DBMS transactions?')..."
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={mentorLoading || !mentorInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* 4. SMART STUDY PLANNER (PHASE 6) */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              {/* Planner Action Header */}
              <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Spaced Repetition Study Planner
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weighted priority algorithm calculating urgency based on academic weaknesses and exam dates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateSmartPlan}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Smart Study Routine</span>
                  </button>

                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manual Session</span>
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Scheduled Study Units ({studyTasks.length})
                  </span>
                  <span className="text-xs text-slate-500">
                    Completed: {studyTasks.filter((t) => t.completed).length} / {studyTasks.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {studyTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        task.completed ? 'bg-slate-50 opacity-70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTaskCompleted(task)}
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-indigo-600'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.topicTitle}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-indigo-600">{task.subject}</span>
                            <span>•</span>
                            <span>{task.date} ({task.startTime} - {task.endTime})</span>
                            {task.isSmartScheduled && (
                              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-1.5 py-0.2 rounded">
                                SM-2 Spaced
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. MY SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Data Exploration and Visualization', 'Database Management Systems', 'Artificial Intelligence', 'Mathematics'].map(
                (sub) => (
                  <div key={sub} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        4 Credits • Semester 5
                      </span>
                      <span className="text-xs text-slate-400">Nandha Engg College</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{sub}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Approved syllabus units active for continuous assessment and AI evaluation grading.
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {/* 6. TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Examination & Academic Schedule (Semester 5)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {examinations.map((ex) => (
                  <div key={ex.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{ex.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ex.subject} • {ex.date} ({ex.startTime} - {ex.endTime})
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {ex.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs max-w-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Student Profile Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Roll Number:</span>
                  <span className="font-mono font-bold text-slate-800">{user.rollNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Institutional Email:</span>
                  <span className="font-mono text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-800 font-medium">{user.department}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Account Status:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-xs transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Manual Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Add Study Plan Session</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Subject</label>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value as SubjectName)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Data Exploration and Visualization">Data Exploration and Visualization</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tukey Outliers & IQR Bounds"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={newTaskEnd}
                    onChange={(e) => setNewTaskEnd(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evaluation Rubric Detail Modal */}
      <EvaluationDetailModal
        evaluation={selectedEvaluationDetail}
        onClose={() => setSelectedEvaluationDetail(null)}
      />
    </div>
  );
};
