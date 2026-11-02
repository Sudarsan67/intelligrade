import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Mail,
  GraduationCap,
  Award,
  ChevronDown,
  ArrowUpDown,
  BookOpen,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Student, EvaluationRecord, DepartmentName } from '../../types';
import { calculateEDAStats, ALL_SUBJECTS } from '../../services/edaCalculations';
import { PerformanceTrendLineChart } from '../charts/InteractiveCharts';

interface StudentManagementViewProps {
  students: Student[];
  evaluations: EvaluationRecord[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  selectedStudentIdForProfile?: string | null;
  onCloseStudentProfile?: () => void;
  onSelectEvaluationDetail: (evaluation: EvaluationRecord) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  evaluations,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  selectedStudentIdForProfile,
  onCloseStudentProfile,
  onSelectEvaluationDetail,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [sortField, setSortField] = useState<'id' | 'name' | 'department' | 'classYear'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [activeProfileStudent, setActiveProfileStudent] = useState<Student | null>(() => {
    if (selectedStudentIdForProfile) {
      return students.find((s) => s.id === selectedStudentIdForProfile) || null;
    }
    return null;
  });

  // Sync if prop changes
  React.useEffect(() => {
    if (selectedStudentIdForProfile) {
      const match = students.find((s) => s.id === selectedStudentIdForProfile);
      if (match) setActiveProfileStudent(match);
    }
  }, [selectedStudentIdForProfile, students]);

  // Form input fields
  const [formData, setFormData] = useState({
    id: '',
    rollNumber: '',
    name: '',
    email: '',
    department: 'Computer Science & Engineering' as DepartmentName,
    classYear: 'Year 3 - Sec A',
    semester: 'Sem 5',
    enrollmentDate: new Date().toISOString().split('T')[0],
    phone: '',
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesClass = classFilter === 'All' || s.classYear === classFilter;
    return matchesSearch && matchesDept && matchesClass;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const valA = a[sortField].toLowerCase();
    const valB = b[sortField].toLowerCase();
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextNum = students.length + 1;
    const genId = `STU-2026-${String(nextNum).padStart(3, '0')}`;
    setFormData({
      id: genId,
      rollNumber: `732225AI${String(100 + nextNum)}`,
      name: '',
      email: '',
      department: 'Computer Science & Engineering',
      classYear: 'Year 3 - Sec A',
      semester: 'Sem 5',
      enrollmentDate: new Date().toISOString().split('T')[0],
      phone: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      id: student.id,
      rollNumber: student.rollNumber || student.id,
      name: student.name,
      email: student.email,
      department: student.department,
      classYear: student.classYear,
      semester: student.semester || 'Sem 5',
      enrollmentDate: student.enrollmentDate,
      phone: student.phone || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        rollNumber: formData.rollNumber || editingStudent.rollNumber || formData.id,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        classYear: formData.classYear,
        semester: formData.semester || editingStudent.semester || 'Sem 5',
        enrollmentDate: formData.enrollmentDate,
        phone: formData.phone,
      });
    } else {
      onAddStudent({
        id: formData.id,
        rollNumber: formData.rollNumber || formData.id,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        classYear: formData.classYear,
        semester: formData.semester || 'Sem 5',
        enrollmentDate: formData.enrollmentDate,
        phone: formData.phone,
        accountStatus: 'active',
      });
    }
    setIsFormModalOpen(false);
  };

  // Student Profile details calculation
  const profileEvaluations = activeProfileStudent
    ? evaluations.filter((e) => e.studentId === activeProfileStudent.id)
    : [];
  const profilePercentages = profileEvaluations.map((e) => e.percentage);
  const profileStats = calculateEDAStats(profilePercentages);

  const profileTrends = profileEvaluations.map((e, idx) => ({
    period: e.assessmentType.replace(' Exam', '').replace('Practical', 'Lab'),
    averageScore: e.percentage,
    count: 1,
  }));

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="AI & Data Science">AI & DS</option>
            <option value="Information Technology">IT</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Classes / Sections</option>
            <option value="Year 3 - Sec A">Year 3 - Sec A</option>
            <option value="Year 3 - Sec B">Year 3 - Sec B</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Student Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-900">{sortedStudents.length}</span> of {students.length} students
          </div>
          <div className="text-[11px] text-slate-400">Click student row or view icon to open academic profile</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th
                  onClick={() => {
                    if (sortField === 'id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('id'); setSortOrder('asc'); }
                  }}
                  className="px-4 py-3 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('name'); setSortOrder('asc'); }
                  }}
                  className="px-4 py-3 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Full Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'department') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('department'); setSortOrder('asc'); }
                  }}
                  className="px-4 py-3 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'classYear') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('classYear'); setSortOrder('asc'); }
                  }}
                  className="px-4 py-3 cursor-pointer hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Class / Cohort</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3">Enrollment Date</th>
                <th className="px-4 py-3 text-center">Evaluations</th>
                <th className="px-4 py-3 text-center">Avg Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedStudents.map((student) => {
                const sEvals = evaluations.filter((e) => e.studentId === student.id);
                const avgScore =
                  sEvals.length > 0
                    ? Math.round(
                        (sEvals.reduce((acc, curr) => acc + curr.percentage, 0) / sEvals.length) * 10
                      ) / 10
                    : null;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => setActiveProfileStudent(student)}
                  >
                    <td className="px-4 py-3 font-mono font-medium text-slate-600">
                      {student.id}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[11px] font-bold text-indigo-700">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div>{student.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{student.department}</td>
                    <td className="px-4 py-3 text-slate-600">{student.classYear}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {student.enrollmentDate}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">
                      {sEvals.length}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {avgScore !== null ? (
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            avgScore >= 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : avgScore >= 50
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {avgScore}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">No records</span>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveProfileStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="View Student Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT PROFILE MODAL / DRAWER */}
      {activeProfileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-lg font-bold text-white">
                  {activeProfileStudent.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">{activeProfileStudent.name}</h2>
                    <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded">
                      {activeProfileStudent.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {activeProfileStudent.department} • {activeProfileStudent.classYear}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveProfileStudent(null);
                  if (onCloseStudentProfile) onCloseStudentProfile();
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Quick stats cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Overall Average</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{profileStats.mean}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Total Tests</div>
                  <div className="text-xl font-black text-slate-900 mt-1">{profileEvaluations.length}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Highest Score</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">{profileStats.max}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium uppercase">Pass Status</div>
                  <div className="text-sm font-bold text-indigo-700 mt-1">
                    {profileStats.passPercentage}% ({profileStats.passCount}/{profileStats.count})
                  </div>
                </div>
              </div>

              {/* Individual Student Performance Trajectory */}
              {profileTrends.length > 1 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <PerformanceTrendLineChart assessmentTrends={profileTrends} />
                </div>
              )}

              {/* Assessment Records History */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Academic Assessment History
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Subject</th>
                        <th className="px-3 py-2">Assessment Name</th>
                        <th className="px-3 py-2 text-center">Marks</th>
                        <th className="px-3 py-2 text-center">Score %</th>
                        <th className="px-3 py-2 text-center">Grade</th>
                        <th className="px-3 py-2 text-right">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profileEvaluations.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-medium text-slate-800">{e.subject}</td>
                          <td className="px-3 py-2 text-slate-600">{e.assessmentName}</td>
                          <td className="px-3 py-2 text-center font-bold text-slate-800">
                            {e.finalMarks} / {e.maxMarks}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                                e.percentage >= 75
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : e.percentage >= 50
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {e.percentage}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-800">{e.grade}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => onSelectEvaluationDetail(e)}
                              className="text-xs text-indigo-600 hover:underline font-semibold"
                            >
                              View Rubric
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT STUDENT MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingStudent ? 'Edit Student Details' : 'Add New Student'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={formData.id}
                  disabled={!!editingStudent}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 disabled:opacity-75 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">University Email</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh.k@uni.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value as DepartmentName })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="AI & Data Science">AI & DS</option>
                    <option value="Information Technology">IT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Class / Cohort</label>
                  <input
                    type="text"
                    value={formData.classYear}
                    onChange={(e) => setFormData({ ...formData, classYear: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Enrollment Date</label>
                <input
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
