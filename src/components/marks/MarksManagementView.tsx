import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Filter,
  Search,
  Sparkles,
  Send,
  AlertTriangle,
  X,
  Check,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { EvaluationRecord, MarkStatus, SubjectName, ExaminationType } from '../../types';
import { EvaluationDetailModal } from '../common/EvaluationDetailModal';

interface MarksManagementViewProps {
  evaluations: EvaluationRecord[];
  onUpdateEvaluation: (evaluation: EvaluationRecord) => void;
  onPublishMarks: (ids: string[]) => void;
}

export const MarksManagementView: React.FC<MarksManagementViewProps> = ({
  evaluations,
  onUpdateEvaluation,
  onPublishMarks,
}) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [selectedDetail, setSelectedDetail] = useState<EvaluationRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<EvaluationRecord | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Edit fields
  const [editMarks, setEditMarks] = useState(0);
  const [editFeedback, setEditFeedback] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filter evaluations
  const filtered = useMemo(() => {
    return evaluations.filter((item) => {
      const matchSearch =
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.studentId.toLowerCase().includes(search.toLowerCase()) ||
        (item.studentRollNumber || '').toLowerCase().includes(search.toLowerCase());
      const matchSubject = subjectFilter === 'All' || item.subject === subjectFilter;
      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'PUBLISHED' ? item.isPublishedToStudent : !item.isPublishedToStudent);
      return matchSearch && matchSubject && matchStatus;
    });
  }, [evaluations, search, subjectFilter, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenEdit = (evl: EvaluationRecord) => {
    setEditingRecord(evl);
    setEditMarks(evl.finalMarks);
    setEditFeedback(evl.feedback || '');
    setEditNotes(evl.teacherNotes || 'Verified by faculty assessor.');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const finalMarks = Number(editMarks);
    const percentage = Math.round((finalMarks / editingRecord.maxMarks) * 1000) / 10;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const updated: EvaluationRecord = {
      ...editingRecord,
      adjustedMarks: finalMarks,
      finalMarks,
      percentage,
      grade,
      status: 'TEACHER_APPROVED',
      feedback: editFeedback,
      teacherNotes: editNotes,
    };

    onUpdateEvaluation(updated);
    setEditingRecord(null);
  };

  const handleConfirmPublish = () => {
    onPublishMarks(selectedIds.length > 0 ? selectedIds : filtered.map((e) => e.id));
    setIsPublishModalOpen(false);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Teacher Marks Management & Controlled Publication</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Role-Enforced RLS
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review AI scores, override marks, and explicitly publish results to student dashboards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish {selectedIds.length > 0 ? `${selectedIds.length} Selected` : 'All Filtered'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
        >
          <option value="All">All Subjects</option>
          <option value="Data Exploration and Visualization">Data Exploration and Visualization</option>
          <option value="Database Management Systems">Database Management Systems</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Mathematics">Mathematics</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
        >
          <option value="All">All Publication Statuses</option>
          <option value="PUBLISHED">Published Only (Student Visible)</option>
          <option value="DRAFT">Unpublished Drafts / Approved (Hidden)</option>
        </select>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3.5 py-2.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-3.5 py-2.5">Student</th>
                <th className="px-3.5 py-2.5">Subject</th>
                <th className="px-3.5 py-2.5">Examination</th>
                <th className="px-3.5 py-2.5 text-center">AI Marks</th>
                <th className="px-3.5 py-2.5 text-center">Final Marks</th>
                <th className="px-3.5 py-2.5 text-center">Score %</th>
                <th className="px-3.5 py-2.5 text-center">Grade</th>
                <th className="px-3.5 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  <td className="px-3.5 py-2.5 font-bold text-slate-900">
                    <div>{item.studentName}</div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal">
                      {item.studentRollNumber || item.studentId}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-700">{item.subject}</td>
                  <td className="px-3.5 py-2.5 text-slate-600">{item.assessmentName}</td>
                  <td className="px-3.5 py-2.5 text-center text-slate-500 font-mono">
                    {item.aiMarks} / {item.maxMarks}
                  </td>
                  <td className="px-3.5 py-2.5 text-center font-black text-slate-900">
                    {item.finalMarks} / {item.maxMarks}
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    <span
                      className={`px-1.5 py-0.5 rounded font-bold ${
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
                  <td className="px-3.5 py-2.5 text-center font-bold text-slate-800">{item.grade}</td>
                  <td className="px-3.5 py-2.5 text-center">
                    {item.isPublishedToStudent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Unpublished Draft
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDetail(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="View Rubric & Evidence"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded"
                        title="Adjust Marks"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MARKS MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Adjust & Approve Marks</h3>
                <p className="text-[11px] text-slate-500">
                  {editingRecord.studentName} — {editingRecord.assessmentName}
                </p>
              </div>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 font-medium">AI Suggested</span>
                  <div className="font-bold text-slate-700 text-sm mt-0.5">
                    {editingRecord.aiMarks} / {editingRecord.maxMarks}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Teacher Final Marks</label>
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={editingRecord.maxMarks}
                    value={editMarks}
                    onChange={(e) => setEditMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border-2 border-indigo-600 rounded-lg text-slate-900 font-black text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Qualitative Feedback</label>
                <textarea
                  rows={3}
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Teacher Verification Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Save & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION PUBLICATION WORKFLOW MODAL (Phase 13 Mandatory Requirement) */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Do you want to publish these marks to students?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Publishing releases verified grades and rubric feedback to students' personal portals.
                  Unpublished marks remain strictly confidential and hidden from students.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-800">
                Affected Student Records: {selectedIds.length > 0 ? selectedIds.length : filtered.length} evaluations
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Students will immediately gain read access to their individual score reports.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Publish Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <EvaluationDetailModal
        evaluation={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
};
