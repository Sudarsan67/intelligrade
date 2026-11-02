import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Box,
  Flame,
  ScatterChart,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EvaluationRecord, SubjectName } from '../../types';
import {
  calculateSubjectComparisons,
  calculateEDAStats,
  getSubjectBoxPlotData,
  calculateSubjectCorrelationMatrix,
  calculateLinearRegression,
  ALL_SUBJECTS,
} from '../../services/edaCalculations';
import {
  SubjectBarChart,
  PassFailDonutChart,
  GradeDistributionChart,
  MarksHistogramChart,
  PerformanceTrendLineChart,
  SubjectBoxPlotChart,
  CorrelationHeatmapChart,
  ScatterPlotChart,
} from '../charts/InteractiveCharts';

interface VisualizationsViewProps {
  evaluations: EvaluationRecord[];
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({ evaluations }) => {
  // Global filter within visualization workspace
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');

  // Filter evaluations
  const filtered = useMemo(() => {
    return evaluations.filter((e) => {
      const matchDept = departmentFilter === 'All' || e.department === departmentFilter;
      const matchClass = classFilter === 'All' || e.classYear === classFilter;
      return matchDept && matchClass;
    });
  }, [evaluations, departmentFilter, classFilter]);

  // Derived datasets
  const subjectComparisons = useMemo(() => calculateSubjectComparisons(filtered), [filtered]);
  const percentages = useMemo(() => filtered.map((e) => e.percentage), [filtered]);
  const stats = useMemo(() => calculateEDAStats(percentages, 100), [percentages]);

  const gradeCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    filtered.forEach((e) => {
      if (counts[e.grade] !== undefined) counts[e.grade]++;
    });
    return counts;
  }, [filtered]);

  // Progression milestones
  const assessmentTrends = useMemo(() => {
    const periods = [
      { key: 'Quiz 1', label: 'Continuous Assessment 1' },
      { key: 'Midterm', label: 'Mid-Term Descriptive Exam' },
      { key: 'Lab Test', label: 'DEV Unit 2 Analytical Test' },
      { key: 'Project', label: 'Project Assessment Paper' },
      { key: 'End Term', label: 'Pre-Semester Comprehensive Test' },
    ];
    return periods.map((p) => {
      const matches = filtered.filter((e) => e.assessmentName === p.label || e.assessmentType.includes(p.key));
      const avg =
        matches.length > 0
          ? Math.round(
              (matches.reduce((sum, item) => sum + item.percentage, 0) / matches.length) * 10
            ) / 10
          : 70;
      return {
        period: p.key,
        averageScore: avg,
        count: matches.length,
      };
    });
  }, [filtered]);

  // Box plot data
  const boxPlotData = useMemo(() => getSubjectBoxPlotData(filtered), [filtered]);

  // Correlation heatmap
  const correlationCells = useMemo(() => calculateSubjectCorrelationMatrix(filtered), [filtered]);

  // Scatter plot subject selections
  const [scatterSubX, setScatterSubX] = useState<SubjectName>('Mathematics');
  const [scatterSubY, setScatterSubY] = useState<SubjectName>('Data Exploration and Visualization');

  // Scatter points
  const { scatterPairs, regression } = useMemo(() => {
    const map: Record<string, { studentName: string; x?: number; y?: number }> = {};
    filtered.forEach((e) => {
      if (!map[e.studentId]) {
        map[e.studentId] = { studentName: e.studentName };
      }
      if (e.subject === scatterSubX) map[e.studentId].x = e.percentage;
      if (e.subject === scatterSubY) map[e.studentId].y = e.percentage;
    });

    const pairs: { studentName: string; x: number; y: number }[] = [];
    Object.values(map).forEach((m) => {
      if (m.x !== undefined && m.y !== undefined) {
        pairs.push({ studentName: m.studentName, x: m.x, y: m.y });
      }
    });

    const xs = pairs.map((p) => p.x);
    const ys = pairs.map((p) => p.y);
    const reg = calculateLinearRegression(xs, ys);

    return { scatterPairs: pairs, regression: reg };
  }, [filtered, scatterSubX, scatterSubY]);

  return (
    <div className="space-y-6">
      {/* Visualizations Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Academic Data Visualization Studio</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              7 DEV Analytical Charts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Exploratory visual representations reflecting the active academic cohort dataset
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="AI & Data Science">AI & DS</option>
              <option value="Information Technology">IT</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Year 3 - Sec A">Year 3 - Sec A</option>
              <option value="Year 3 - Sec B">Year 3 - Sec B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of the 7 Required DEV Charts */}

      {/* Row 1: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <SubjectBarChart data={subjectComparisons} />
        </div>

        {/* 2. Donut / Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <PassFailDonutChart passCount={stats.passCount} failCount={stats.failCount} />
        </div>
      </div>

      {/* Row 2: Histogram & Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Histogram */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <MarksHistogramChart values={percentages} />
        </div>

        {/* 4. Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <PerformanceTrendLineChart assessmentTrends={assessmentTrends} />
        </div>
      </div>

      {/* Row 3: Box Plot (Full Width for 5 subjects) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* 5. Box Plot */}
        <SubjectBoxPlotChart data={boxPlotData} />
      </div>

      {/* Row 4: Heatmap & Scatter Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6. Heatmap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <CorrelationHeatmapChart cells={correlationCells} />
        </div>

        {/* 7. Scatter Plot with dynamic subject pickers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <span className="text-xs font-bold text-slate-800">Scatter Axis Selection:</span>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={scatterSubX}
                onChange={(e) => setScatterSubX(e.target.value as SubjectName)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-medium"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    X: {s}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">vs</span>
              <select
                value={scatterSubY}
                onChange={(e) => setScatterSubY(e.target.value as SubjectName)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-medium"
              >
                {ALL_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    Y: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ScatterPlotChart
            pairs={scatterPairs}
            subjectX={scatterSubX}
            subjectY={scatterSubY}
            slope={regression.slope}
            intercept={regression.intercept}
            rSquared={regression.rSquared}
            correlation={regression.correlation}
          />
        </div>
      </div>
    </div>
  );
};
