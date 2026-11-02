import React, { useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Eye,
  Sparkles,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { Student, EvaluationRecord, SubjectName } from '../../types';
import {
  calculateEDAStats,
  calculateSubjectComparisons,
  ALL_SUBJECTS,
} from '../../services/edaCalculations';
import {
  SubjectBarChart,
  PassFailDonutChart,
  GradeDistributionChart,
  PerformanceTrendLineChart,
} from '../charts/InteractiveCharts';

interface OverviewViewProps {
  students: Student[];
  evaluations: EvaluationRecord[];
  onViewStudent: (studentId: string) => void;
  onNavigateToEvaluation: () => void;
  onSelectEvaluationDetail: (evaluation: EvaluationRecord) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  students,
  evaluations,
  onViewStudent,
  onNavigateToEvaluation,
  onSelectEvaluationDetail,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');

  // Filter evaluations if selected
  const filteredEvaluations =
    selectedSubjectFilter === 'All'
      ? evaluations
      : evaluations.filter((e) => e.subject === selectedSubjectFilter);

  // Compute key metrics
  const percentages = filteredEvaluations.map((e) => e.percentage);
  const stats = calculateEDAStats(percentages, 100);
  const subjectComparisons = calculateSubjectComparisons(evaluations);

  // Compute grade counts
  const gradeCounts: Record<string, number> = {
    'A+': 0,
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0,
  };
  filteredEvaluations.forEach((e) => {
    if (gradeCounts[e.grade] !== undefined) {
      gradeCounts[e.grade]++;
    }
  });

  // Performance progression over assessment milestones
  const assessmentGroups = [
    { period: 'Quiz 1', name: 'Continuous Assessment 1' },
    { period: 'Midterm', name: 'Mid-Term Descriptive Exam' },
    { period: 'Lab Test', name: 'DEV Unit 2 Analytical Test' },
    { period: 'Project', name: 'Project Assessment Paper' },
    { period: 'End Term', name: 'Pre-Semester Comprehensive Test' },
  ];

  const assessmentTrends = assessmentGroups.map((g) => {
    const matches = filteredEvaluations.filter(
      (e) => e.assessmentName === g.name || e.assessmentType.includes(g.period)
    );
    const avg =
      matches.length > 0
        ? Math.round(
            (matches.reduce((sum, item) => sum + item.percentage, 0) /
              matches.length) *
              10
          ) / 10
        : 70;
    return {
      period: g.period,
      averageScore: avg,
      count: matches.length,
    };
  });

  const recentEvaluations = [...filteredEvaluations].slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Department of Computer Science & Data Systems
            </h2>
            <p className="text-xs text-slate-500">
              Academic Cohort 2026 • Semester V • DEV Lab Practical & Descriptive Evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">Filter Subject:</span>
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All 5 Subjects</option>
            {ALL_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{students.length}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4 active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 3 academic departments</p>
        </div>

        {/* Card 2: Total Evaluations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Evaluations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{filteredEvaluations.length}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +100% verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">AI-assisted descriptive grading</p>
        </div>

        {/* Card 3: Average Marks */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Cohort Mean Score</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.mean}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.2% vs midterm
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Median: {stats.median}% • Std Dev: ±{stats.stdDev}</p>
        </div>

        {/* Card 4: Pass Percentage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Overall Pass Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.passPercentage}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +1.8% vs benchmark
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.passCount} pass • {stats.failCount} need support</p>
        </div>
      </div>

      {/* DASHBOARD VISUALIZATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual A: Student Performance Overview (Line Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <PerformanceTrendLineChart assessmentTrends={assessmentTrends} />
        </div>

        {/* Visual B: Subject-wise Performance (Bar Chart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <SubjectBarChart data={subjectComparisons} />
        </div>

        {/* Visual C: Grade Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <GradeDistributionChart gradeCounts={gradeCounts} />
        </div>

        {/* Visual D: Pass vs Fail Analysis */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <PassFailDonutChart
            passCount={stats.passCount}
            failCount={stats.failCount}
          />
        </div>
      </div>

      {/* Visual E: Recent Evaluations Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Descriptive Answer Evaluations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified evaluations with rubric breakdowns and AI feedback
            </p>
          </div>
          <button
            onClick={onNavigateToEvaluation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors w-fit"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Evaluation Studio</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Assessment</th>
                <th className="px-4 py-3 text-center">Marks</th>
                <th className="px-4 py-3 text-center">Score %</th>
                <th className="px-4 py-3 text-center">Grade</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEvaluations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <button
                      onClick={() => onViewStudent(item.studentId)}
                      className="hover:text-indigo-600 hover:underline text-left"
                    >
                      {item.studentName}
                    </button>
                    <div className="text-[10px] font-normal text-slate-400">
                      {item.studentId} • {item.classYear}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{item.subject}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{item.assessmentName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {item.finalMarks} / {item.maxMarks}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block font-semibold px-2 py-0.5 rounded ${
                        item.percentage >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.percentage >= 50
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">
                    {item.grade}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onSelectEvaluationDetail(item)}
                      className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="View Rubric & Feedback"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
