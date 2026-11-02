import React, { useState, useMemo } from 'react';
import {
  Database,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Wand2,
  Trash2,
  Table as TableIcon,
  BarChart3,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { EvaluationRecord, EDAStats, SubjectName, DataCleaningIssue } from '../../types';
import {
  calculateEDAStats,
  calculateSubjectComparisons,
  ALL_SUBJECTS,
} from '../../services/edaCalculations';

interface DataExplorerViewProps {
  evaluations: EvaluationRecord[];
  onApplyCleanedEvaluations: (cleaned: EvaluationRecord[]) => void;
  onResetSampleData: () => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  evaluations,
  onApplyCleanedEvaluations,
  onResetSampleData,
}) => {
  // Active working dataset (allows cleaning operations and resets)
  const [dataset, setDataset] = useState<EvaluationRecord[]>(evaluations);

  // Sync when parent changes unless user modified
  React.useEffect(() => {
    setDataset(evaluations);
  }, [evaluations]);

  // Tab: Preview vs Cleaning vs EDA Statistics
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'cleaning' | 'eda'>('preview');

  // Filters
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [assessmentFilter, setAssessmentFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered dataset
  const filteredDataset = useMemo(() => {
    return dataset.filter((row) => {
      const matchSearch =
        row.studentName.toLowerCase().includes(search.toLowerCase()) ||
        row.studentId.toLowerCase().includes(search.toLowerCase()) ||
        row.assessmentName.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subjectFilter === 'All' || row.subject === subjectFilter;
      const matchDept = deptFilter === 'All' || row.department === deptFilter;
      const matchAssessment = assessmentFilter === 'All' || row.assessmentName === assessmentFilter;
      return matchSearch && matchSubject && matchDept && matchAssessment;
    });
  }, [dataset, search, subjectFilter, deptFilter, assessmentFilter]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredDataset.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDataset.slice(start, start + pageSize);
  }, [filteredDataset, currentPage, pageSize]);

  // EDA Computations
  const numericMarks = useMemo(() => filteredDataset.map((r) => r.percentage), [filteredDataset]);
  const stats: EDAStats = useMemo(() => calculateEDAStats(numericMarks, 100), [numericMarks]);
  const subjectAverages = useMemo(() => calculateSubjectComparisons(filteredDataset), [filteredDataset]);

  // DATA CLEANING INSPECTOR
  const cleaningReport = useMemo(() => {
    const issues: DataCleaningIssue[] = [];
    const seenIds = new Set<string>();
    const seenStudentSubject = new Set<string>();

    dataset.forEach((row, idx) => {
      // 1. Missing values
      if (!row.studentName || row.studentName.trim() === '') {
        issues.push({
          type: 'missing',
          rowId: row.id,
          field: 'studentName',
          description: `Missing student name in record #${idx + 1}`,
        });
      }
      if (row.finalMarks === undefined || row.finalMarks === null || isNaN(row.finalMarks)) {
        issues.push({
          type: 'missing',
          rowId: row.id,
          field: 'finalMarks',
          description: `Unrecorded/Null marks in record for ${row.studentName}`,
          suggestedFix: 'Impute with subject median',
        });
      }

      // 2. Duplicate records
      if (seenIds.has(row.id)) {
        issues.push({
          type: 'duplicate',
          rowId: row.id,
          field: 'id',
          description: `Duplicate evaluation identifier: ${row.id}`,
          suggestedFix: 'Deduplicate record',
        });
      } else {
        seenIds.add(row.id);
      }

      const key = `${row.studentId}_${row.subject}_${row.assessmentName}`;
      if (seenStudentSubject.has(key)) {
        issues.push({
          type: 'duplicate',
          rowId: row.id,
          field: 'studentId_subject',
          description: `Duplicate assessment entry for ${row.studentName} in ${row.subject}`,
          suggestedFix: 'Keep latest submission',
        });
      } else {
        seenStudentSubject.add(key);
      }

      // 3. Out of bounds
      if (row.finalMarks > row.maxMarks || row.finalMarks < 0) {
        issues.push({
          type: 'out_of_bounds',
          rowId: row.id,
          field: 'finalMarks',
          description: `Marks (${row.finalMarks}) exceed maximum limit (${row.maxMarks}) or are negative`,
          suggestedFix: 'Clamp to valid range [0, maxMarks]',
        });
      }
    });

    return issues;
  }, [dataset]);

  // Clean actions
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);

  const handleRemoveDuplicates = () => {
    const seen = new Set<string>();
    const cleaned = dataset.filter((r) => {
      const key = `${r.studentId}_${r.subject}_${r.assessmentName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setDataset(cleaned);
    onApplyCleanedEvaluations(cleaned);
    setCleaningStatus(`Removed duplicate records. Dataset now contains ${cleaned.length} clean entries.`);
  };

  const handleFixOutOfBounds = () => {
    const cleaned = dataset.map((r) => {
      let marks = r.finalMarks;
      if (marks > r.maxMarks) marks = r.maxMarks;
      if (marks < 0) marks = 0;
      const percent = Math.round((marks / r.maxMarks) * 1000) / 10;
      return {
        ...r,
        finalMarks: marks,
        percentage: percent,
      };
    });
    setDataset(cleaned);
    onApplyCleanedEvaluations(cleaned);
    setCleaningStatus(`Clamped all out-of-boundary marks to valid scale.`);
  };

  const handleImputeMissing = () => {
    const medianScore = stats.median || 70;
    const cleaned = dataset.map((r) => {
      if (r.finalMarks === undefined || r.finalMarks === null || isNaN(r.finalMarks)) {
        const imputed = Math.round((medianScore / 100) * r.maxMarks);
        return {
          ...r,
          finalMarks: imputed,
          percentage: medianScore,
        };
      }
      return r;
    });
    setDataset(cleaned);
    onApplyCleanedEvaluations(cleaned);
    setCleaningStatus(`Imputed missing mark values using cohort median (${medianScore}%).`);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'EvaluationID',
      'StudentID',
      'StudentName',
      'Department',
      'Class',
      'Subject',
      'AssessmentName',
      'Date',
      'MaxMarks',
      'MarksAwarded',
      'Percentage',
      'Grade',
      'Status',
    ];

    const rows = filteredDataset.map((r) => [
      `"${r.id}"`,
      `"${r.studentId}"`,
      `"${r.studentName}"`,
      `"${r.department}"`,
      `"${r.classYear}"`,
      `"${r.subject}"`,
      `"${r.assessmentName}"`,
      `"${r.date}"`,
      r.maxMarks,
      r.finalMarks,
      r.percentage,
      `"${r.grade}"`,
      `"${r.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intelligrade-academic-dataset-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Import
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
        const imported: EvaluationRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/"/g, '').trim());
          if (cols.length < 5) continue;

          // Attempt mapping
          const getCol = (name: string, fallbackIdx: number) => {
            const idx = headers.findIndex((h) => h.includes(name));
            return idx !== -1 ? cols[idx] : cols[fallbackIdx];
          };

          const sName = getCol('studentname', 2) || `Imported Student ${i}`;
          const sId = getCol('studentid', 1) || `STU-IMP-${String(i).padStart(3, '0')}`;
          const sub = (getCol('subject', 5) || 'Data Exploration and Visualization') as SubjectName;
          const marks = parseFloat(getCol('marks', 9) || cols[cols.length - 4]) || 15;
          const max = parseFloat(getCol('maxmarks', 8) || cols[cols.length - 5]) || 20;
          const percent = Math.round((marks / max) * 1000) / 10;

          imported.push({
            id: `EVL-IMP-${Date.now().toString().slice(-4)}-${i}`,
            studentId: sId,
            studentName: sName,
            department: 'Computer Science & Engineering',
            classYear: 'Year 3 - Sec A',
            subject: sub,
            assessmentName: getCol('assessment', 6) || 'Imported Assessment',
            assessmentType: 'CAT 1',
            date: new Date().toISOString().split('T')[0],
            maxMarks: max,
            aiMarks: marks,
            adjustedMarks: marks,
            finalMarks: marks,
            percentage: percent,
            grade: percent >= 80 ? 'A' : percent >= 60 ? 'B' : percent >= 50 ? 'C' : 'F',
            status: 'PUBLISHED',
            isPublishedToStudent: true,
          });
        }

        if (imported.length > 0) {
          const merged = [...imported, ...dataset];
          setDataset(merged);
          onApplyCleanedEvaluations(merged);
          setCleaningStatus(`Successfully imported ${imported.length} assessment records from CSV!`);
        }
      } catch (err) {
        console.error('Failed to parse uploaded CSV:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Navigation Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'preview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Dataset Preview ({filteredDataset.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('eda')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'eda'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Statistical EDA Summary</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cleaning')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'cleaning'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Data Cleaning Suite</span>
            {cleaningReport.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Import & Export CTAs */}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onResetSampleData}
            title="Reset to 160-row default PBL demonstration dataset"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {cleaningStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{cleaningStatus}</span>
          </div>
          <button
            onClick={() => setCleaningStatus(null)}
            className="text-emerald-700 hover:underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SUB-TAB 1: TABULAR DATASET PREVIEW */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rows..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Subject */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Subjects</option>
              {ALL_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Department */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science & Engineering">CSE</option>
              <option value="AI & Data Science">AI & DS</option>
              <option value="Information Technology">IT</option>
            </select>

            {/* Assessment */}
            <select
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Assessment Names</option>
              <option value="Mid-Term Descriptive Exam">Mid-Term Descriptive Exam</option>
              <option value="DEV Unit 2 Analytical Test">DEV Unit 2 Analytical Test</option>
              <option value="Continuous Assessment 1">Continuous Assessment 1</option>
              <option value="Project Assessment Paper">Project Assessment Paper</option>
              <option value="Pre-Semester Comprehensive Test">Pre-Semester Comprehensive Test</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Record ID</th>
                    <th className="px-3.5 py-2.5">Student ID</th>
                    <th className="px-3.5 py-2.5">Student Name</th>
                    <th className="px-3.5 py-2.5">Subject</th>
                    <th className="px-3.5 py-2.5">Assessment</th>
                    <th className="px-3.5 py-2.5 text-center">Marks</th>
                    <th className="px-3.5 py-2.5 text-center">Percentage</th>
                    <th className="px-3.5 py-2.5 text-center">Grade</th>
                    <th className="px-3.5 py-2.5 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3.5 py-2.5 text-slate-500">{row.id}</td>
                      <td className="px-3.5 py-2.5 text-slate-700 font-bold">{row.studentId}</td>
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-900">
                        {row.studentName}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-700">{row.subject}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-600">{row.assessmentName}</td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-800">
                        {row.finalMarks} / {row.maxMarks}
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-sans font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            row.percentage >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : row.percentage >= 50
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-900">
                        {row.grade}
                      </td>
                      <td className="px-3.5 py-2.5 text-center text-slate-400">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, filteredDataset.length)} of{' '}
                {filteredDataset.length} rows
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold px-2 text-slate-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 border border-slate-200 rounded disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXPLORATORY DATA ANALYSIS (EDA) */}
      {activeSubTab === 'eda' && (
        <div className="space-y-6">
          {/* Top EDA Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mean (μ)</div>
              <div className="text-xl font-black text-indigo-600 mt-1">{stats.mean}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Average score</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Median (Q2)</div>
              <div className="text-xl font-black text-slate-800 mt-1">{stats.median}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">50th percentile</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Std Deviation (σ)</div>
              <div className="text-xl font-black text-slate-800 mt-1">±{stats.stdDev}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Spread / Dispersion</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variance (σ²)</div>
              <div className="text-xl font-black text-slate-800 mt-1">{stats.variance}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Quadratic spread</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IQR (Q3 - Q1)</div>
              <div className="text-xl font-black text-slate-800 mt-1">{stats.iqr}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Middle 50% span</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Percentage</div>
              <div className="text-xl font-black text-emerald-600 mt-1">{stats.passPercentage}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{stats.passCount} pass / {stats.failCount} fail</div>
            </div>
          </div>

          {/* Detailed Five-Number Summary & Distribution Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Tukey Five-Number Summary</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  N = {stats.count} observations
                </span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">Minimum Value (Min)</span>
                  <span className="font-mono font-bold text-slate-900">{stats.min}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">First Quartile (Q1 - 25th percentile)</span>
                  <span className="font-mono font-bold text-slate-900">{stats.q1}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">Median (Q2 - 50th percentile)</span>
                  <span className="font-mono font-bold text-indigo-600">{stats.median}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">Third Quartile (Q3 - 75th percentile)</span>
                  <span className="font-mono font-bold text-slate-900">{stats.q3}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-600 font-medium">Maximum Value (Max)</span>
                  <span className="font-mono font-bold text-slate-900">{stats.max}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-600 font-medium">Data Range (Max - Min)</span>
                  <span className="font-mono font-bold text-slate-900">{stats.range}%</span>
                </div>
              </div>
            </div>

            {/* Subject-Wise Exploratory Table */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Subject-wise Statistical Comparisons
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2 text-center">Mean Score</th>
                      <th className="px-3 py-2 text-center">Std Dev</th>
                      <th className="px-3 py-2 text-center">Pass Rate</th>
                      <th className="px-3 py-2 text-center">Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjectAverages.map((sub) => (
                      <tr key={sub.subject} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-800">{sub.subject}</td>
                        <td className="px-3 py-2 text-center font-bold text-indigo-700">
                          {sub.averagePercentage}%
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-600">
                          ±{sub.stdDev}
                        </td>
                        <td className="px-3 py-2 text-center font-bold text-emerald-600">
                          {sub.passRate}%
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500 text-[11px]">
                          [{sub.lowestMarks} - {sub.highestMarks}]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA CLEANING SUITE */}
      {activeSubTab === 'cleaning' && (
        <div className="space-y-6">
          {/* Cleaning overview card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Data Quality Inspection & Sanitation Suite
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated checks for missing values, duplicates, and range constraints
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemoveDuplicates}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Deduplicate Records
                </button>
                <button
                  onClick={handleFixOutOfBounds}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Clamp Range [0, Max]
                </button>
                <button
                  onClick={handleImputeMissing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Impute Missing with Median
                </button>
              </div>
            </div>

            {/* Quality Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-slate-500 font-medium">Duplicate Records</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {cleaningReport.filter((i) => i.type === 'duplicate').length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Based on Student ID + Subject key</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-slate-500 font-medium">Missing or Null Values</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {cleaningReport.filter((i) => i.type === 'missing').length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Incomplete field values</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="text-slate-500 font-medium">Out-of-Bounds Scores</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {cleaningReport.filter((i) => i.type === 'out_of_bounds').length}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Marks &gt; maxMarks or &lt; 0</div>
              </div>
            </div>

            {/* Issues Log */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Identified Data Quality Anomalies
              </h4>

              {cleaningReport.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>All data quality checks passed! Dataset is clean, consistent, and validated.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                  {cleaningReport.map((issue, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{issue.description}</div>
                          <div className="text-[11px] text-slate-400">Field: {issue.field} • Row ID: {issue.rowId}</div>
                        </div>
                      </div>
                      {issue.suggestedFix && (
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Fix: {issue.suggestedFix}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
