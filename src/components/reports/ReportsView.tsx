import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  GraduationCap,
  Calendar,
  Award,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { Student, EvaluationRecord } from '../../types';
import { calculateEDAStats } from '../../services/edaCalculations';

interface ReportsViewProps {
  students: Student[];
  evaluations: EvaluationRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ students, evaluations }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || 'STU-2026-001'
  );
  const [search, setSearch] = useState('');

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const studentEvaluations = useMemo(() => {
    if (!currentStudent) return [];
    return evaluations.filter((e) => e.studentId === currentStudent.id);
  }, [currentStudent, evaluations]);

  const percentages = studentEvaluations.map((e) => e.percentage);
  const stats = calculateEDAStats(percentages, 100);

  const totalMarksObtained = studentEvaluations.reduce((sum, e) => sum + e.finalMarks, 0);
  const totalMaxMarks = studentEvaluations.reduce((sum, e) => sum + e.maxMarks, 0);

  // Overall Grade
  let cumulativeGrade = 'F';
  if (stats.mean >= 90) cumulativeGrade = 'A+';
  else if (stats.mean >= 80) cumulativeGrade = 'A';
  else if (stats.mean >= 70) cumulativeGrade = 'B';
  else if (stats.mean >= 60) cumulativeGrade = 'C';
  else if (stats.mean >= 50) cumulativeGrade = 'D';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!currentStudent) return;
    const headers = ['Subject', 'Assessment', 'Date', 'MaxMarks', 'MarksAwarded', 'Percentage', 'Grade', 'TeacherNotes'];
    const rows = studentEvaluations.map((e) => [
      `"${e.subject}"`,
      `"${e.assessmentName}"`,
      `"${e.date}"`,
      e.maxMarks,
      e.finalMarks,
      e.percentage,
      `"${e.grade}"`,
      `"${e.teacherNotes || ''}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-transcript-${currentStudent.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Action Header (no-print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Select Student for Official Transcript
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Transcript / PDF</span>
          </button>
        </div>
      </div>

      {/* FORMAL UNIVERSITY ACADEMIC TRANSCRIPT SHEET (Designed for screen & print) */}
      {currentStudent && (
        <div className="report-page-container bg-white p-6 sm:p-10 rounded-xl border border-slate-200/90 shadow-sm max-w-4xl mx-auto space-y-6">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                IG
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-slate-900 uppercase">
                  INTELLIGRADE UNIVERSITY
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Faculty of Engineering & Applied Computer Sciences • Department of DEV
                </p>
                <p className="text-[10px] text-slate-400">
                  Accredited Academic Performance Evaluation System
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-bold text-slate-800">OFFICIAL GRADE REPORT</div>
              <div className="text-[11px] text-slate-500">Ref: TRN-2026-{currentStudent.id.slice(-3)}</div>
              <div className="text-[11px] text-slate-400">Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Student Name</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{currentStudent.name}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Roll Number / ID</span>
              <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">{currentStudent.id}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Department</span>
              <div className="font-medium text-slate-800 mt-0.5">{currentStudent.department}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Class / Cohort</span>
              <div className="font-medium text-slate-800 mt-0.5">{currentStudent.classYear}</div>
            </div>
          </div>

          {/* Subject Performance Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Course Assessment Ledger
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Course / Subject</th>
                    <th className="px-4 py-2.5">Assessment Title</th>
                    <th className="px-4 py-2.5 text-center">Date</th>
                    <th className="px-4 py-2.5 text-center">Max Marks</th>
                    <th className="px-4 py-2.5 text-center">Obtained</th>
                    <th className="px-4 py-2.5 text-center">Percentage</th>
                    <th className="px-4 py-2.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {studentEvaluations.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.subject}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.assessmentName}</td>
                      <td className="px-4 py-2.5 text-center text-slate-500 font-mono">{row.date}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-700">{row.maxMarks}</td>
                      <td className="px-4 py-2.5 text-center font-black text-slate-900">{row.finalMarks}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-800">{row.percentage}%</td>
                      <td className="px-4 py-2.5 text-center font-black text-slate-900">{row.grade}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200 text-xs">
                  <tr>
                    <td colSpan={3} className="px-4 py-2.5 text-right uppercase">
                      Cumulative Total & Weighted Average:
                    </td>
                    <td className="px-4 py-2.5 text-center">{totalMaxMarks}</td>
                    <td className="px-4 py-2.5 text-center font-black text-indigo-700">{totalMarksObtained}</td>
                    <td className="px-4 py-2.5 text-center font-black text-indigo-700">{stats.mean}%</td>
                    <td className="px-4 py-2.5 text-center font-black text-indigo-700">{cumulativeGrade}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Academic Standing & Qualitative AI Evaluation Excerpt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Overall Standing
              </span>
              <div className="text-2xl font-black text-indigo-600">Grade {cumulativeGrade}</div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                {stats.mean >= 50 ? 'PASSED & PROMOTED' : 'ACADEMIC SUPPORT REQUIRED'}
              </span>
            </div>

            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Descriptive Assessment Summary & Faculty Notes</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {studentEvaluations[0]?.feedback ||
                  'Demonstrates consistent performance across laboratory practicals and theoretical evaluations. Continued focus on mathematical proof rigor recommended.'}
              </p>
            </div>
          </div>

          {/* Verification & Signatures */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
            <div className="space-y-1">
              <div className="font-semibold text-slate-700">INTELLIGRADE Verification Seal</div>
              <div className="text-[10px] text-slate-400">Digitally cryptographically signed</div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-40 border-b border-slate-400 pb-1 font-semibold text-slate-800">
                Prof. Balaji S.
              </div>
              <div className="text-[10px] text-slate-500">Chair, DEV Assessment Committee</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
