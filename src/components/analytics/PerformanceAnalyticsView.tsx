import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  BrainCircuit,
  Lightbulb,
} from 'lucide-react';
import { Student, EvaluationRecord } from '../../types';
import {
  calculateSubjectComparisons,
  calculateEDAStats,
  ALL_SUBJECTS,
} from '../../services/edaCalculations';

interface PerformanceAnalyticsViewProps {
  students: Student[];
  evaluations: EvaluationRecord[];
  onViewStudent: (studentId: string) => void;
}

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  students,
  evaluations,
  onViewStudent,
}) => {
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<
    { title: string; category: string; description: string; actionableRecommendation: string }[] | null
  >(null);

  // Subject comparisons
  const subjectStats = useMemo(() => calculateSubjectComparisons(evaluations), [evaluations]);

  // Sort subjects by average percentage
  const sortedSubjects = useMemo(() => {
    return [...subjectStats].sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, [subjectStats]);

  const topSubject = sortedSubjects[0];
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1];

  // Student level aggregations
  const studentMetrics = useMemo(() => {
    return students.map((s) => {
      const sEvals = evaluations.filter((e) => e.studentId === s.id);
      const avg =
        sEvals.length > 0
          ? Math.round((sEvals.reduce((sum, e) => sum + e.percentage, 0) / sEvals.length) * 10) / 10
          : 0;
      return {
        student: s,
        averagePercentage: avg,
        testCount: sEvals.length,
        isAtRisk: avg < 50 && sEvals.length > 0,
        isDistinction: avg >= 80,
      };
    });
  }, [students, evaluations]);

  const atRiskStudents = useMemo(() => {
    return studentMetrics
      .filter((s) => s.isAtRisk)
      .sort((a, b) => a.averagePercentage - b.averagePercentage);
  }, [studentMetrics]);

  const distinctionStudents = useMemo(() => {
    return studentMetrics
      .filter((s) => s.isDistinction)
      .sort((a, b) => b.averagePercentage - a.averagePercentage);
  }, [studentMetrics]);

  // Overall cohort stats
  const allPercentages = useMemo(() => evaluations.map((e) => e.percentage), [evaluations]);
  const overallStats = useMemo(() => calculateEDAStats(allPercentages), [allPercentages]);

  // Dynamic Algorithmic Insights (Always computed from current data, never hardcoded)
  const computedInsights = useMemo(() => {
    const list: { type: 'alert' | 'success' | 'info'; title: string; detail: string }[] = [];

    // 1. Lowest performing subject insight
    if (lowestSubject) {
      list.push({
        type: 'alert',
        title: `${lowestSubject.subject} has the lowest average score`,
        detail: `Average score is ${lowestSubject.averagePercentage}% with a pass rate of ${lowestSubject.passRate}%. Consider scheduling remedial concept reviews for core units.`,
      });
    }

    // 2. Highest performing subject
    if (topSubject) {
      list.push({
        type: 'success',
        title: `${topSubject.subject} is the highest-performing subject`,
        detail: `Class average achieved ${topSubject.averagePercentage}% with an outstanding ${topSubject.passRate}% pass rate.`,
      });
    }

    // 3. At-risk proportion
    if (atRiskStudents.length > 0) {
      const atRiskPercent = Math.round((atRiskStudents.length / (students.length || 1)) * 100);
      list.push({
        type: 'alert',
        title: `${atRiskStudents.length} students (${atRiskPercent}% of cohort) require academic support`,
        detail: `Identified based on cumulative average falling below the 50% passing threshold across completed tests.`,
      });
    } else {
      list.push({
        type: 'success',
        title: `100% of students meet passing criteria`,
        detail: `No students are currently flagged as academically at-risk in this cohort.`,
      });
    }

    // 4. Performance spread / variability
    if (overallStats.stdDev > 12) {
      list.push({
        type: 'info',
        title: `High performance variation detected across students`,
        detail: `Standard deviation of ±${overallStats.stdDev}% indicates substantial disparity between high and low scorers. Differentiated mentoring recommended.`,
      });
    } else {
      list.push({
        type: 'info',
        title: `Consistent cohort performance distribution`,
        detail: `Standard deviation is low (±${overallStats.stdDev}%), reflecting uniform comprehension across topics.`,
      });
    }

    return list;
  }, [lowestSubject, topSubject, atRiskStudents, students.length, overallStats]);

  // Generate Gemini Pedagogical Insights
  const handleGenerateAiRecommendations = async () => {
    setAiInsightsLoading(true);
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryData: overallStats,
          subjectStats: subjectStats.map((s) => ({
            subject: s.subject,
            mean: s.averagePercentage,
            passRate: s.passRate,
          })),
          atRiskCount: atRiskStudents.length,
        }),
      });

      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to generate AI insights:', err);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Action */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Academic Performance Analytics & Early Warning System</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic data-driven conclusions on subject mastery, student vulnerabilities, and instructional priorities
          </p>
        </div>

        <button
          onClick={handleGenerateAiRecommendations}
          disabled={aiInsightsLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto disabled:opacity-50"
        >
          {aiInsightsLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Generate AI Faculty Advice</span>
            </>
          )}
        </button>
      </div>

      {/* AI Pedagogical Insights (if triggered) */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-800">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-300" />
              <h3 className="text-sm font-bold">Faculty Action Plan & Pedagogical Interventions</h3>
            </div>
            <span className="text-[10px] font-semibold bg-indigo-800 px-2 py-0.5 rounded text-indigo-200">
              Generated by Gemini 3.8 Flash
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {aiInsights.map((item, idx) => (
              <div key={idx} className="bg-white/10 p-3.5 rounded-lg border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-indigo-200">{item.title}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{item.description}</p>
                <div className="text-[11px] text-amber-300 font-medium pt-1">
                  <strong>Recommendation:</strong> {item.actionableRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Algorithmic Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {computedInsights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex items-start gap-3.5 bg-white shadow-2xs ${
              insight.type === 'alert'
                ? 'border-amber-200'
                : insight.type === 'success'
                ? 'border-emerald-200'
                : 'border-indigo-100'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                insight.type === 'alert'
                  ? 'bg-amber-50 text-amber-600'
                  : insight.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {insight.type === 'alert' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : insight.type === 'success' ? (
                <Award className="w-4 h-4" />
              ) : (
                <Lightbulb className="w-4 h-4" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{insight.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{insight.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: At-Risk Students vs Dean's List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Students Panel */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Students Requiring Academic Support ({atRiskStudents.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              Average &lt; 50%
            </span>
          </div>

          {atRiskStudents.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              All students are maintaining performance above the threshold.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {atRiskStudents.map((item) => (
                <div
                  key={item.student.id}
                  onClick={() => onViewStudent(item.student.id)}
                  className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 hover:text-indigo-600">
                      {item.student.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.student.id} • {item.student.department}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {item.averagePercentage}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dean's List / Top Performers */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dean's List / Distinction Cohort ({distinctionStudents.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Average &ge; 80%
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {distinctionStudents.map((item) => (
              <div
                key={item.student.id}
                onClick={() => onViewStudent(item.student.id)}
                className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 hover:text-indigo-600">
                    {item.student.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {item.student.id} • {item.student.classYear}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {item.averagePercentage}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
