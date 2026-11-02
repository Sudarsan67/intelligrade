import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Layers,
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SyllabusDocument, SyllabusTopic, SubjectName } from '../../types';

export const SyllabusManagementView: React.FC = () => {
  const [syllabusDocs, setSyllabusDocs] = useState<SyllabusDocument[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectName>('Data Exploration and Visualization');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Form states for new topic
  const [unitNumber, setUnitNumber] = useState(1);
  const [unitTitle, setUnitTitle] = useState('Descriptive Statistics & Data Distributions');
  const [topicTitle, setTopicTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importanceWeight, setImportanceWeight] = useState(5);
  const [estimatedHours, setEstimatedHours] = useState(4.0);

  const fetchSyllabus = async () => {
    try {
      const res = await fetch('/api/syllabus');
      const data = await res.json();
      if (data.syllabusDocuments) setSyllabusDocs(data.syllabusDocuments);
    } catch (e) {
      console.error('Failed to load syllabus:', e);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const activeDoc = syllabusDocs.find((d) => d.subject === selectedSubject) || syllabusDocs[0];

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;

    const newTopic: SyllabusTopic = {
      id: `TOP-${Date.now()}`,
      unitNumber,
      unitTitle,
      topicTitle: topicTitle.trim(),
      description: description.trim(),
      learningOutcomes: ['Understand theoretical concepts', 'Demonstrate practical application'],
      importanceWeight,
      estimatedHours,
    };

    const updatedDoc: SyllabusDocument = activeDoc
      ? { ...activeDoc, topics: [...activeDoc.topics, newTopic], version: (activeDoc.version || 1) + 1 }
      : {
          id: `SYL-${Date.now()}`,
          subject: selectedSubject,
          semester: 'Sem 5',
          academicYear: '2026-2027',
          version: 1,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Prof. Balaji S.',
          status: 'active',
          topics: [newTopic],
        };

    await fetch('/api/syllabus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDoc),
    });

    setIsTopicModalOpen(false);
    setTopicTitle('');
    setDescription('');
    fetchSyllabus();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Curriculum Syllabus & Knowledge Boundary Management</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              AI Grounding Truth
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            The AI answer evaluator relies on teacher-approved syllabus units as its authoritative boundary.
          </p>
        </div>

        <button
          onClick={() => setIsTopicModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Syllabus Unit / Topic</span>
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2">
        {['Data Exploration and Visualization', 'Database Management Systems', 'Artificial Intelligence', 'Mathematics'].map(
          (sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub as SubjectName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubject === sub
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub}
            </button>
          )
        )}
      </div>

      {/* Topics Ledger */}
      {activeDoc ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">{activeDoc.subject}</span>
              <span className="text-slate-400 ml-2">
                Version {activeDoc.version} • {activeDoc.topics.length} Approved Units
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active Ground Truth
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {activeDoc.topics.map((top) => (
              <div key={top.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600">Unit {top.unitNumber}:</span>
                    <span className="font-semibold text-slate-700">{top.unitTitle}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{top.topicTitle}</h4>
                  <p className="text-slate-600 leading-relaxed max-w-2xl">{top.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Importance: {top.importanceWeight}/5</span>
                    <span>•</span>
                    <span>Estimated Hours: {top.estimatedHours} hrs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    Weight {top.importanceWeight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
          No syllabus units found for this subject. Click "Add Syllabus Unit / Topic" above to establish syllabus grounding.
        </div>
      )}

      {/* Topic Creation Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-3.5 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Add Syllabus Topic</h3>
            <form onSubmit={handleAddTopic} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Unit Number</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={unitNumber}
                    onChange={(e) => setUnitNumber(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Importance (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={importanceWeight}
                    onChange={(e) => setImportanceWeight(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Unit Title</label>
                <input
                  type="text"
                  required
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Topic Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tukey Outlier Rule & Bivariate Correlations"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Description / Concepts</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key concepts, definitions, and learning objectives expected by faculty..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Save Syllabus Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
