import React, { useState } from 'react';
import { Download, Info, Maximize2 } from 'lucide-react';
import { SubjectComparison, BoxPlotData, CorrelationCell } from '../../types';
import { exportSvgToPng } from './ChartExportUtil';

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  chartId: string;
  exportFilename: string;
  extraControls?: React.ReactNode;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  title,
  subtitle,
  chartId,
  exportFilename,
  extraControls,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {extraControls}
        <button
          onClick={() => exportSvgToPng(chartId, exportFilename)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded border border-slate-200 transition-colors"
          title="Export as PNG"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>PNG</span>
        </button>
      </div>
    </div>
  );
};

// 1. SUBJECT-WISE AVERAGE BAR CHART
export const SubjectBarChart: React.FC<{
  data: SubjectComparison[];
  benchmarkPass?: number;
  benchmarkTarget?: number;
}> = ({ data, benchmarkPass = 50, benchmarkTarget = 75 }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartId = 'chart-subject-bar';

  const height = 280;
  const padding = { top: 24, right: 30, bottom: 50, left: 45 };
  const width = 640;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxVal = 100;
  const barWidth = Math.min(52, plotWidth / (data.length * 1.6));

  return (
    <div className="relative">
      <ChartHeader
        title="Subject-wise Average Academic Performance"
        subtitle="Comparative mean percentage score across 5 curriculum subjects"
        chartId={chartId}
        exportFilename="subject-performance-bar.png"
      />
      <div className="overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          {/* Y Axis Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + plotHeight - (val / maxVal) * plotHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={val === 0 ? undefined : '3,3'}
                  strokeWidth={val === 0 ? 1.5 : 1}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Target Benchmark Line (75%) */}
          {benchmarkTarget && (
            <g>
              <line
                x1={padding.left}
                y1={padding.top + plotHeight - (benchmarkTarget / maxVal) * plotHeight}
                x2={width - padding.right}
                y2={padding.top + plotHeight - (benchmarkTarget / maxVal) * plotHeight}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
              <text
                x={width - padding.right - 4}
                y={padding.top + plotHeight - (benchmarkTarget / maxVal) * plotHeight - 5}
                textAnchor="end"
                className="text-[10px] fill-emerald-600 font-semibold"
              >
                Target 75%
              </text>
            </g>
          )}

          {/* Pass Threshold Line (50%) */}
          {benchmarkPass && (
            <g>
              <line
                x1={padding.left}
                y1={padding.top + plotHeight - (benchmarkPass / maxVal) * plotHeight}
                x2={width - padding.right}
                y2={padding.top + plotHeight - (benchmarkPass / maxVal) * plotHeight}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
              <text
                x={width - padding.right - 4}
                y={padding.top + plotHeight - (benchmarkPass / maxVal) * plotHeight - 5}
                textAnchor="end"
                className="text-[10px] fill-amber-600 font-semibold"
              >
                Pass 50%
              </text>
            </g>
          )}

          {/* Bars */}
          {data.map((item, idx) => {
            const barHeight = (item.averagePercentage / maxVal) * plotHeight;
            const x =
              padding.left +
              (idx + 0.5) * (plotWidth / data.length) -
              barWidth / 2;
            const y = padding.top + plotHeight - barHeight;
            const isHovered = hoveredIdx === idx;

            // Shorten subject label for X axis
            const shortLabels: Record<string, string> = {
              'Mathematics': 'Math',
              'Data Structures': 'Data Struct',
              'Database Management Systems': 'DBMS',
              'Artificial Intelligence': 'AI',
              'Data Exploration and Visualization': 'DEV',
            };
            const label = shortLabels[item.subject] || item.subject.slice(0, 8);

            return (
              <g
                key={item.subject}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer transition-all"
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={
                    isHovered
                      ? '#4338ca'
                      : item.averagePercentage >= 75
                      ? '#4f46e5'
                      : item.averagePercentage >= 50
                      ? '#6366f1'
                      : '#f43f5e'
                  }
                  className="transition-colors duration-150"
                />

                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-700"
                >
                  {item.averagePercentage}%
                </text>

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 32}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400"
                >
                  {item.studentCount} tests
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none z-20 flex gap-4">
          <div>
            <div className="font-semibold text-indigo-200">{data[hoveredIdx].subject}</div>
            <div className="text-slate-300 mt-0.5">Mean: {data[hoveredIdx].averagePercentage}%</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div>Pass Rate: <span className="font-semibold text-emerald-400">{data[hoveredIdx].passRate}%</span></div>
            <div>Std Dev: ±{data[hoveredIdx].stdDev}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. PASS VS FAIL DONUT CHART
export const PassFailDonutChart: React.FC<{
  passCount: number;
  failCount: number;
}> = ({ passCount, failCount }) => {
  const chartId = 'chart-pass-fail';
  const total = passCount + failCount || 1;
  const passPercent = Math.round((passCount / total) * 1000) / 10;
  const failPercent = Math.round((failCount / total) * 1000) / 10;

  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const passDash = (passPercent / 100) * circumference;
  const failDash = circumference - passDash;

  return (
    <div>
      <ChartHeader
        title="Pass vs Fail Analysis"
        subtitle="Overall cohort academic progression outcome"
        chartId={chartId}
        exportFilename="pass-fail-distribution.png"
      />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg
            id={chartId}
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full -rotate-90 select-none"
          >
            {/* Background / Fail Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#fee2e2"
              strokeWidth={strokeWidth}
            />
            {/* Fail segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth={strokeWidth}
              strokeDasharray={`${failDash} ${circumference}`}
              strokeDashoffset={-passDash}
              strokeLinecap="round"
            />
            {/* Pass segment */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#4f46e5"
              strokeWidth={strokeWidth}
              strokeDasharray={`${passDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-900">{passPercent}%</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</span>
          </div>
        </div>

        <div className="space-y-3 min-w-[130px]">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="font-medium text-slate-700">Passed</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900">{passCount}</span>
              <span className="text-slate-400 text-[10px] ml-1">({passPercent}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="font-medium text-slate-700">Failed</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900">{failCount}</span>
              <span className="text-slate-400 text-[10px] ml-1">({failPercent}%)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Evaluated:</span>
            <span className="font-semibold text-slate-800">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. GRADE DISTRIBUTION DONUT / BAR CHART
export const GradeDistributionChart: React.FC<{
  gradeCounts: Record<string, number>;
}> = ({ gradeCounts }) => {
  const chartId = 'chart-grade-dist';
  const grades = ['A+', 'A', 'B', 'C', 'D', 'F'];
  const colors: Record<string, string> = {
    'A+': '#10b981', // emerald
    'A': '#4f46e5',  // indigo
    'B': '#3b82f6',  // blue
    'C': '#8b5cf6',  // violet
    'D': '#f59e0b',  // amber
    'F': '#ef4444',  // rose
  };

  const total = Object.values(gradeCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <ChartHeader
        title="Grade Category Distribution"
        subtitle="Standard university classification (A+ through F)"
        chartId={chartId}
        exportFilename="grade-distribution.png"
      />
      <div className="space-y-2.5 py-1" id={chartId}>
        {grades.map((grade) => {
          const count = gradeCounts[grade] || 0;
          const percent = Math.round((count / total) * 1000) / 10;
          return (
            <div key={grade} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: colors[grade] }}
                  ></span>
                  <span className="font-semibold text-slate-800">Grade {grade}</span>
                  <span className="text-[10px] text-slate-400">
                    {grade === 'A+' ? '(>=90%)' : grade === 'A' ? '(80-89%)' : grade === 'B' ? '(70-79%)' : grade === 'C' ? '(60-69%)' : grade === 'D' ? '(50-59%)' : '(<50%)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{count}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">({percent}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: colors[grade],
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 4. HISTOGRAM CHART WITH BIN TOGGLE
export const MarksHistogramChart: React.FC<{
  values: number[];
}> = ({ values }) => {
  const [binWidth, setBinWidth] = useState<number>(10);
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);
  const chartId = 'chart-marks-histogram';

  // Compute bins
  const binCount = 100 / binWidth;
  const bins: { label: string; start: number; end: number; count: number }[] = [];
  for (let i = 0; i < binCount; i++) {
    const start = i * binWidth;
    const end = start + binWidth;
    const count = values.filter((v) => (end === 100 ? v >= start && v <= end : v >= start && v < end)).length;
    bins.push({
      label: `${start}-${end}%`,
      start,
      end,
      count,
    });
  }

  const maxCount = Math.max(...bins.map((b) => b.count), 5);
  const height = 260;
  const padding = { top: 20, right: 25, bottom: 45, left: 40 };
  const width = 600;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const barWidth = plotWidth / bins.length - 4;

  return (
    <div className="relative">
      <ChartHeader
        title="Student Marks Distribution (Histogram)"
        subtitle="Frequency density of marks across percentiles with bin interval control"
        chartId={chartId}
        exportFilename="marks-histogram.png"
        extraControls={
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded text-xs">
            <button
              onClick={() => setBinWidth(5)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                binWidth === 5 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5% Bins
            </button>
            <button
              onClick={() => setBinWidth(10)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                binWidth === 10 ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              10% Bins
            </button>
          </div>
        }
      />

      <div className="overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[280px] select-none"
        >
          {/* Horizontal lines */}
          {[0, Math.round(maxCount / 2), maxCount].map((cnt) => {
            const y = padding.top + plotHeight - (cnt / maxCount) * plotHeight;
            return (
              <g key={cnt}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={cnt === 0 ? undefined : '3,3'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {cnt}
                </text>
              </g>
            );
          })}

          {/* Histogram Bars */}
          {bins.map((bin, idx) => {
            const barH = (bin.count / maxCount) * plotHeight;
            const x = padding.left + idx * (plotWidth / bins.length) + 2;
            const y = padding.top + plotHeight - barH;
            const isHovered = hoveredBin === idx;

            return (
              <g
                key={bin.label}
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill={isHovered ? '#3730a3' : '#6366f1'}
                  className="transition-colors duration-150"
                />
                {bin.count > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 4}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-700"
                  >
                    {bin.count}
                  </text>
                )}
                {/* X axis tick */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className={`text-[9px] ${
                    isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {binWidth === 5 ? (idx % 2 === 0 ? bin.start : '') : bin.start}
                </text>
              </g>
            );
          })}

          {/* X axis title */}
          <text
            x={width / 2}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-500"
          >
            Mark Percentage Intervals (%)
          </text>
        </svg>
      </div>

      {hoveredBin !== null && bins[hoveredBin] && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none z-20">
          <span className="font-semibold text-indigo-200">{bins[hoveredBin].label}: </span>
          <span>{bins[hoveredBin].count} student evaluations</span>
        </div>
      )}
    </div>
  );
};

// 5. PERFORMANCE OVER TIME (LINE CHART)
export const PerformanceTrendLineChart: React.FC<{
  assessmentTrends: { period: string; averageScore: number; count: number }[];
}> = ({ assessmentTrends }) => {
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const chartId = 'chart-performance-trend';

  const height = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const width = 620;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const points = assessmentTrends.map((t, idx) => {
    const x =
      padding.left +
      (idx / Math.max(1, assessmentTrends.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - (t.averageScore / 100) * plotHeight;
    return { x, y, ...t };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${padding.top + plotHeight} L ${
          points[0].x
        } ${padding.top + plotHeight} Z`
      : '';

  return (
    <div className="relative">
      <ChartHeader
        title="Academic Performance Trajectory Over Assessment Periods"
        subtitle="Chronological trend line across continuous and semester exams"
        chartId={chartId}
        exportFilename="academic-performance-trend.png"
      />
      <div className="overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[280px] select-none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + plotHeight - (val / 100) * plotHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={val === 0 ? undefined : '3,3'}
                />
                <text
                  x={padding.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#trendGradient)" />}

          {/* Trend line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#4f46e5"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredDot === idx;
            return (
              <g
                key={p.period}
                onMouseEnter={() => setHoveredDot(idx)}
                onMouseLeave={() => setHoveredDot(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 5}
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-800"
                >
                  {p.averageScore}%
                </text>
                <text
                  x={p.x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-medium ${
                    isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {p.period}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredDot !== null && points[hoveredDot] && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none z-20">
          <span className="font-semibold text-indigo-300">{points[hoveredDot].period}: </span>
          <span>Average {points[hoveredDot].averageScore}% ({points[hoveredDot].count} records)</span>
        </div>
      )}
    </div>
  );
};

// 6. BOX AND WHISKER PLOT
export const SubjectBoxPlotChart: React.FC<{
  data: BoxPlotData[];
}> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const chartId = 'chart-subject-boxplot';

  const height = 300;
  const padding = { top: 25, right: 30, bottom: 50, left: 45 };
  const width = 640;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const boxWidth = Math.min(48, plotWidth / (data.length * 1.8));

  const getY = (val: number) => padding.top + plotHeight - (val / 100) * plotHeight;

  return (
    <div className="relative">
      <ChartHeader
        title="Marks Distribution & Outlier Detection (Box & Whisker Plot)"
        subtitle="Five-number summary (Min, Q1, Median, Q3, Max) with Tukey IQR outlier points"
        chartId={chartId}
        exportFilename="subject-boxplot.png"
      />
      <div className="overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[320px] select-none"
        >
          {/* Y Axis Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={val === 0 ? undefined : '3,3'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Box Plots */}
          {data.map((item, idx) => {
            const centerX =
              padding.left + (idx + 0.5) * (plotWidth / data.length);
            const yMin = getY(item.min);
            const yQ1 = getY(item.q1);
            const yMedian = getY(item.median);
            const yQ3 = getY(item.q3);
            const yMax = getY(item.max);
            const isHovered = hoveredIdx === idx;

            const shortLabels: Record<string, string> = {
              'Mathematics': 'Math',
              'Data Structures': 'Data Struct',
              'Database Management Systems': 'DBMS',
              'Artificial Intelligence': 'AI',
              'Data Exploration and Visualization': 'DEV',
            };
            const label = shortLabels[item.subject] || item.subject.slice(0, 8);

            return (
              <g
                key={item.subject}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Whisker Line (Min to Max) */}
                <line
                  x1={centerX}
                  y1={yMin}
                  x2={centerX}
                  y2={yMax}
                  stroke="#64748b"
                  strokeWidth={1.5}
                />

                {/* Whisker End Caps */}
                <line
                  x1={centerX - boxWidth / 3}
                  y1={yMin}
                  x2={centerX + boxWidth / 3}
                  y2={yMin}
                  stroke="#64748b"
                  strokeWidth={1.5}
                />
                <line
                  x1={centerX - boxWidth / 3}
                  y1={yMax}
                  x2={centerX + boxWidth / 3}
                  y2={yMax}
                  stroke="#64748b"
                  strokeWidth={1.5}
                />

                {/* Central IQR Box (Q1 to Q3) */}
                <rect
                  x={centerX - boxWidth / 2}
                  y={yQ3}
                  width={boxWidth}
                  height={Math.max(2, yQ1 - yQ3)}
                  rx={2}
                  fill={isHovered ? '#e0e7ff' : '#eef2ff'}
                  stroke={isHovered ? '#4338ca' : '#6366f1'}
                  strokeWidth={2}
                  className="transition-colors duration-150"
                />

                {/* Median Line */}
                <line
                  x1={centerX - boxWidth / 2}
                  y1={yMedian}
                  x2={centerX + boxWidth / 2}
                  y2={yMedian}
                  stroke="#312e81"
                  strokeWidth={2.5}
                />

                {/* Outliers */}
                {item.outliers.map((outlierVal, oIdx) => {
                  const outY = getY(outlierVal);
                  return (
                    <circle
                      key={oIdx}
                      cx={centerX}
                      cy={outY}
                      r={3.5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1}
                    >
                      <title>{`Outlier: ${outlierVal}%`}</title>
                    </circle>
                  );
                })}

                {/* Subject label */}
                <text
                  x={centerX}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-600'
                  }`}
                >
                  {label}
                </text>
                <text
                  x={centerX}
                  y={height - padding.bottom + 32}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400"
                >
                  Med: {item.median}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded shadow-lg pointer-events-none z-20 flex gap-4">
          <div>
            <div className="font-semibold text-indigo-200">{data[hoveredIdx].subject}</div>
            <div className="text-slate-300 mt-1">Median (Q2): <span className="font-bold text-white">{data[hoveredIdx].median}%</span></div>
            <div className="text-slate-300">IQR: {Math.round((data[hoveredIdx].q3 - data[hoveredIdx].q1) * 10) / 10}%</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div>Q1 (25th): {data[hoveredIdx].q1}%</div>
            <div>Q3 (75th): {data[hoveredIdx].q3}%</div>
            <div>Range: [{data[hoveredIdx].min}% - {data[hoveredIdx].max}%]</div>
            {data[hoveredIdx].outliers.length > 0 && (
              <div className="text-rose-400 font-medium mt-0.5">
                Outliers: {data[hoveredIdx].outliers.join(', ')}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 7. CORRELATION HEATMAP
export const CorrelationHeatmapChart: React.FC<{
  cells: CorrelationCell[];
}> = ({ cells }) => {
  const [hoveredCell, setHoveredCell] = useState<CorrelationCell | null>(null);
  const chartId = 'chart-correlation-heatmap';

  const shortNames = ['Math', 'Data Struct', 'DBMS', 'AI', 'DEV'];
  const subjects = [
    'Mathematics',
    'Data Structures',
    'Database Management Systems',
    'Artificial Intelligence',
    'Data Exploration and Visualization',
  ];

  const getColor = (r: number) => {
    if (r === 1) return '#312e81'; // dark indigo
    if (r >= 0.7) return '#4338ca'; // strong positive
    if (r >= 0.5) return '#6366f1';
    if (r >= 0.3) return '#818cf8';
    if (r >= 0.1) return '#c7d2fe';
    if (r >= -0.1) return '#f1f5f9'; // neutral
    if (r >= -0.3) return '#fecdd3';
    return '#f43f5e'; // negative
  };

  const getTextColor = (r: number) => {
    if (Math.abs(r) >= 0.5) return '#ffffff';
    return '#1e293b';
  };

  return (
    <div className="relative">
      <ChartHeader
        title="Curriculum Pearson Correlation Matrix"
        subtitle="Linear dependence between scores in paired subjects (-1.00 to +1.00)"
        chartId={chartId}
        exportFilename="correlation-heatmap.png"
      />
      <div className="flex flex-col items-center justify-center py-2 overflow-x-auto">
        <div id={chartId} className="inline-block p-2 bg-white rounded border border-slate-100">
          <div className="grid grid-cols-6 gap-1.5 text-center">
            {/* Top-left corner */}
            <div className="w-16 h-8"></div>
            {/* Column headers */}
            {shortNames.map((name) => (
              <div
                key={name}
                className="w-16 h-8 flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-50 rounded"
              >
                {name}
              </div>
            ))}

            {/* Rows */}
            {subjects.map((subRow, rowIdx) => (
              <React.Fragment key={subRow}>
                {/* Row Header */}
                <div className="w-16 h-12 flex items-center justify-end pr-2 text-[10px] font-bold text-slate-700 bg-slate-50 rounded text-right">
                  {shortNames[rowIdx]}
                </div>

                {/* Matrix cells */}
                {subjects.map((subCol) => {
                  const cell = cells.find(
                    (c) =>
                      (c.subjectA === subRow && c.subjectB === subCol) ||
                      (c.subjectA === subCol && c.subjectB === subRow)
                  ) || { subjectA: subRow as any, subjectB: subCol as any, correlation: 0 };

                  return (
                    <div
                      key={subCol}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{
                        backgroundColor: getColor(cell.correlation),
                        color: getTextColor(cell.correlation),
                      }}
                      className="w-16 h-12 rounded flex flex-col items-center justify-center font-mono text-xs font-semibold cursor-pointer transition-transform hover:scale-105 shadow-2xs"
                    >
                      {cell.correlation.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500">
          <span>Inverse (-1.0)</span>
          <div className="flex h-3 w-36 rounded overflow-hidden">
            <div className="w-1/4 bg-rose-500"></div>
            <div className="w-1/4 bg-slate-200"></div>
            <div className="w-1/4 bg-indigo-400"></div>
            <div className="w-1/4 bg-indigo-800"></div>
          </div>
          <span>Direct Correlation (+1.0)</span>
        </div>
      </div>

      {hoveredCell && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3.5 py-2 rounded shadow-lg pointer-events-none z-20">
          <div className="font-semibold text-indigo-200">
            {hoveredCell.subjectA} ↔ {hoveredCell.subjectB}
          </div>
          <div className="text-slate-300 mt-0.5">
            Pearson r = <span className="font-bold text-white">{hoveredCell.correlation.toFixed(3)}</span>{' '}
            ({hoveredCell.correlation >= 0.6 ? 'Strong positive synergy' : hoveredCell.correlation >= 0.3 ? 'Moderate positive correlation' : 'Low correlation'})
          </div>
        </div>
      )}
    </div>
  );
};

// 8. SCATTER PLOT WITH REGRESSION LINE
export const ScatterPlotChart: React.FC<{
  pairs: { studentName: string; x: number; y: number }[];
  subjectX: string;
  subjectY: string;
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
}> = ({ pairs, subjectX, subjectY, slope, intercept, rSquared, correlation }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ studentName: string; x: number; y: number } | null>(null);
  const chartId = 'chart-scatter-plot';

  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 45 };
  const width = 620;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (val: number) => padding.left + (val / 100) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - (val / 100) * plotHeight;

  // Trendline endpoints
  const lineX1 = 20;
  const lineY1 = slope * lineX1 + intercept;
  const lineX2 = 100;
  const lineY2 = slope * lineX2 + intercept;

  return (
    <div className="relative">
      <ChartHeader
        title={`Cross-Subject Scatter Analysis: ${subjectX} vs ${subjectY}`}
        subtitle={`Linear bivariate regression model: y = ${slope}x + ${intercept} (R² = ${rSquared})`}
        chartId={chartId}
        exportFilename="scatter-plot-analysis.png"
      />
      <div className="overflow-x-auto">
        <svg
          id={chartId}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[300px] select-none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val);
            const x = getX(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                />
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#f1f5f9"
                />
                <text
                  x={padding.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 font-medium"
                >
                  {val}%
                </text>
                <text
                  x={x}
                  y={height - padding.bottom + 14}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-medium"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Regression Line */}
          <line
            x1={getX(lineX1)}
            y1={getY(Math.max(0, Math.min(100, lineY1)))}
            x2={getX(lineX2)}
            y2={getY(Math.max(0, Math.min(100, lineY2)))}
            stroke="#4f46e5"
            strokeWidth={2}
            strokeDasharray="4,4"
          />

          {/* Scatter dots */}
          {pairs.map((p, idx) => {
            const cx = getX(p.x);
            const cy = getY(p.y);
            const isHovered = hoveredPoint?.studentName === p.studentName;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={isHovered ? '#312e81' : '#6366f1'}
                stroke="#ffffff"
                strokeWidth={1.5}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer transition-all duration-150"
              />
            );
          })}

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 6}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-slate-600"
          >
            {subjectX} Marks (%)
          </text>
          <text
            x={-height / 2}
            y={14}
            textAnchor="middle"
            transform="rotate(-90)"
            className="text-[10px] font-semibold fill-slate-600"
          >
            {subjectY} Marks (%)
          </text>
        </svg>
      </div>

      {hoveredPoint && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded shadow-lg pointer-events-none z-20">
          <div className="font-semibold text-indigo-200">{hoveredPoint.studentName}</div>
          <div className="text-slate-300 mt-0.5">
            {subjectX}: <span className="font-bold text-white">{hoveredPoint.x}%</span> | {subjectY}: <span className="font-bold text-white">{hoveredPoint.y}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
