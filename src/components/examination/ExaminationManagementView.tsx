import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  Clock,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  BookOpen,
  Camera,
  Upload,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Examination, ExamQuestion, SubjectName, ExaminationType, DepartmentName } from '../../types';
import { CameraScanModal } from '../camera/CameraScanModal';

export const ExaminationManagementView: React.FC<{
  onNavigateToEvaluationWithExam?: (exam: Examination) => void;
}> = ({ onNavigateToEvaluationWithExam }) => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal for creating/editing examination
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);

  // Camera scan modal state
  const [isCameraScanOpen, setIsCameraScanOpen] = useState(false);
  const [targetExamForScan, setTargetExamForScan] = useState<Examination | null>(null);

  // Form fields
  const [examName, setExamName] = useState('CAT 1 — Continuous Assessment Test I');
  const [examType, setExamType] = useState<ExaminationType>('CAT 1');
  const [subject, setSubject] = useState<SubjectName>('Data Exploration and Visualization');
  const [department, setDepartment] = useState<DepartmentName>('AI & Data Science');
  const [semester, setSemester] = useState('Sem 5');
  const [date, setDate] = useState('2026-09-15');
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('11:00');
  const [maxMarks, setMaxMarks] = useState(50);
  const [passingMarks, setPassingMarks] = useState(25);
  const [instructions, setInstructions] = useState('Answer all questions. Show detailed derivations.');

  // Questions editor
  const [questions, setQuestions] = useState<ExamQuestion[]>([
    {
      id: 'Q-01',
      questionNumber: '1',
      questionText: 'Explain the purpose and mathematical construction of a Box and Whisker Plot. Discuss how it identifies potential outliers using the Interquartile Range (IQR) rule.',
      maxMarks: 20,
      unitNumber: 1,
      modelAnswer: 'A Box Plot provides five-number summary: Min, Q1, Median, Q3, and Max. The central box represents IQR = Q3 - Q1. Outliers are points beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR.',
      rubricCriteria: [
        { criterionName: 'Five-Number Summary', maxMarks: 5, description: 'Min, Q1, Median, Q3, Max' },
        { criterionName: 'IQR Formula', maxMarks: 5, description: 'Q3 - Q1' },
        { criterionName: 'Tukey Fences', maxMarks: 10, description: 'Q1 - 1.5*IQR & Q3 + 1.5*IQR' },
      ],
    },
  ]);

  const fetchExaminations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/examinations');
      const data = await res.json();
      if (data.examinations) setExaminations(data.examinations);
    } catch (e) {
      console.error('Failed to load examinations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExaminations();
  }, []);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setExamName('CAT 2 — Continuous Assessment Test II');
    setExamType('CAT 2');
    setSubject('Database Management Systems');
    setDate('2026-10-22');
    setMaxMarks(50);
    setPassingMarks(25);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Examination) => {
    setEditingExam(exam);
    setExamName(exam.name);
    setExamType(exam.type);
    setSubject(exam.subject);
    setDepartment(exam.department);
    setSemester(exam.semester);
    setDate(exam.date);
    setStartTime(exam.startTime);
    setEndTime(exam.endTime);
    setMaxMarks(exam.maxMarks);
    setPassingMarks(exam.passingMarks);
    setInstructions(exam.instructions);
    setQuestions(exam.questions || []);
    setIsModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const examPayload: Examination = {
      id: editingExam?.id || `EXAM-${Date.now()}`,
      name: examName,
      type: examType,
      subject,
      department,
      semester,
      academicYear: '2026-2027',
      date,
      startTime,
      endTime,
      maxMarks,
      passingMarks,
      instructions,
      questions,
      createdAt: editingExam?.createdAt || new Date().toISOString(),
      createdBy: 'Prof. Balaji S.',
    };

    await fetch('/api/examinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examPayload),
    });

    setIsModalOpen(false);
    fetchExaminations();
  };

  const handleAddQuestion = () => {
    const nextNum = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: `Q-${Date.now()}-${nextNum}`,
        questionNumber: String(nextNum),
        questionText: '',
        maxMarks: 15,
        unitNumber: 1,
        rubricCriteria: [
          { criterionName: 'Core Concept', maxMarks: 10, description: 'Accurate technical explanation' },
          { criterionName: 'Clarity & Logic', maxMarks: 5, description: 'Structured presentation' },
        ],
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Examination & Question Paper Management</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Independent Exam Pipelines
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure CAT 1, CAT 2, and Semester Examinations with question-level scoring rubrics
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Examination</span>
        </button>
      </div>

      {/* Examinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examinations.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {exam.type} • {exam.semester}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {exam.date}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{exam.name}</h3>
              <div className="text-xs font-semibold text-slate-700">{exam.subject}</div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {exam.instructions || 'No special instructions recorded.'}
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs text-slate-600">
                <span>Max: <strong className="text-slate-800">{exam.maxMarks} marks</strong></span>
                <span>•</span>
                <span>Pass: <strong className="text-slate-800">{exam.passingMarks} marks</strong></span>
                <span>•</span>
                <span>Questions: <strong className="text-indigo-600">{exam.questions?.length || 0}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setTargetExamForScan(exam);
                    setIsCameraScanOpen(true);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Scan Scripts</span>
                </button>

                {onNavigateToEvaluationWithExam && (
                  <button
                    onClick={() => onNavigateToEvaluationWithExam(exam)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evaluate</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => handleOpenEdit(exam)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded transition-colors"
                title="Edit Exam & Questions"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT EXAMINATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-xs">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {editingExam ? 'Edit Examination & Question Paper' : 'Create New Examination'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveExam} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Examination Title</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExaminationType)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="CAT 1">CAT 1</option>
                    <option value="CAT 2">CAT 2</option>
                    <option value="Model Examination">Model Examination</option>
                    <option value="Semester Examination">Semester Examination</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as SubjectName)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="Data Exploration and Visualization">Data Exploration and Visualization</option>
                    <option value="Database Management Systems">Database Management Systems</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Data Structures">Data Structures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Examination Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Max Marks</label>
                    <input
                      type="number"
                      required
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Passing Marks</label>
                    <input
                      type="number"
                      required
                      value={passingMarks}
                      onChange={(e) => setPassingMarks(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Question Paper Specifications ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">Question #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-semibold">Marks:</span>
                          <input
                            type="number"
                            value={q.maxMarks}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].maxMarks = Number(e.target.value);
                              setQuestions(updated);
                            }}
                            className="w-16 px-2 py-0.5 bg-white border border-slate-300 rounded text-center font-bold"
                          />
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Enter question statement..."
                        value={q.questionText}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].questionText = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-slate-900"
                      />

                      <textarea
                        rows={2}
                        placeholder="Reference model answer or key rubric points..."
                        value={q.modelAnswer || ''}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].modelAnswer = e.target.value;
                          setQuestions(updated);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded text-slate-900 font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs"
                >
                  {editingExam ? 'Save Changes' : 'Publish Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Scan Modal */}
      <CameraScanModal
        isOpen={isCameraScanOpen}
        onClose={() => setIsCameraScanOpen(false)}
        onSavePages={(pages) => {
          alert(`Successfully attached ${pages.length} answer sheets to ${targetExamForScan?.name}. Ready for evaluation!`);
        }}
      />
    </div>
  );
};
