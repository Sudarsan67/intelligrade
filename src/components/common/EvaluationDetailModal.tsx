import React from 'react';
import { X, CheckCircle2, AlertCircle, FileText, Calendar, Sparkles } from 'lucide-react';
import { EvaluationRecord } from '../../types';

interface EvaluationDetailModalProps {
  evaluation: EvaluationRecord | null;
  onClose: () => void;
}

export const EvaluationDetailModal: React.FC<EvaluationDetailModalProps> = ({
  evaluation,
  onClose,
}) => {
  if (!evaluation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded text-white">
                {evaluation.id}
              </span>
              <span className="text-xs font-semibold text-indigo-300">
                {evaluation.subject}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              {evaluation.studentName} — {evaluation.assessmentName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Marks summary row */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Marks Awarded</div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {evaluation.finalMarks} / {evaluation.maxMarks}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Score %</div>
              <div className="text-base font-black text-indigo-600 mt-0.5">
                {evaluation.percentage}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Grade</div>
              <div className="text-base font-black text-slate-900 mt-0.5">{evaluation.grade}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Status</div>
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 py-0.5 rounded mt-0.5">
                {evaluation.status}
              </div>
            </div>
          </div>

          {/* Rubric Breakdown (if available) */}
          {evaluation.rubricBreakdown && (
            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
              <span className="font-bold text-slate-900 text-xs">
                Evaluator Rubric Dimensions (Out of 10):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-500">Conceptual Depth</div>
                  <div className="font-bold text-indigo-700 text-sm mt-0.5">
                    {evaluation.rubricBreakdown.conceptualUnderstanding} / 10
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-500">Technical Accuracy</div>
                  <div className="font-bold text-indigo-700 text-sm mt-0.5">
                    {evaluation.rubricBreakdown.technicalAccuracy} / 10
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-500">Completeness</div>
                  <div className="font-bold text-indigo-700 text-sm mt-0.5">
                    {evaluation.rubricBreakdown.completeness} / 10
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-500">Logical Structure</div>
                  <div className="font-bold text-indigo-700 text-sm mt-0.5">
                    {evaluation.rubricBreakdown.structureAndClarity} / 10
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question & Student Answer */}
          {evaluation.question && (
            <div className="space-y-1">
              <span className="font-bold text-slate-800">Examination Question:</span>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
                {evaluation.question}
              </div>
            </div>
          )}

          {evaluation.studentAnswer && (
            <div className="space-y-1">
              <span className="font-bold text-slate-800">Student Submitted Answer:</span>
              <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-800 text-[11px] leading-relaxed">
                {evaluation.studentAnswer}
              </div>
            </div>
          )}

          {/* Strengths & Gaps */}
          {evaluation.strengths && evaluation.strengths.length > 0 && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identified Strengths</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Feedback */}
          {evaluation.feedback && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-800">Comprehensive Feedback:</span>
              <p className="text-slate-600 leading-relaxed text-[11px]">{evaluation.feedback}</p>
            </div>
          )}

          {evaluation.teacherNotes && (
            <div className="text-[11px] text-slate-500 italic">
              Teacher Assessor Notes: {evaluation.teacherNotes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
