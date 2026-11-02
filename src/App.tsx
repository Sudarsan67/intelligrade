/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/auth/AuthPage';
import { StudentDashboardView } from './components/student/StudentDashboardView';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewView } from './components/overview/OverviewView';
import { StudentManagementView } from './components/students/StudentManagementView';
import { ExaminationManagementView } from './components/examination/ExaminationManagementView';
import { SyllabusManagementView } from './components/syllabus/SyllabusManagementView';
import { AnswerEvaluationView } from './components/evaluation/AnswerEvaluationView';
import { MarksManagementView } from './components/marks/MarksManagementView';
import { DataExplorerView } from './components/dataExplorer/DataExplorerView';
import { VisualizationsView } from './components/visualizations/VisualizationsView';
import { PerformanceAnalyticsView } from './components/analytics/PerformanceAnalyticsView';
import { ReportsView } from './components/reports/ReportsView';
import { AdminApprovalView } from './components/admin/AdminApprovalView';
import { SettingsView } from './components/settings/SettingsView';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { EvaluationDetailModal } from './components/common/EvaluationDetailModal';
import { Student, EvaluationRecord, Examination } from './types';
import { storageService } from './services/storageService';

function MainAppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent State
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() =>
    storageService.getEvaluations()
  );

  // Cross navigation & modal states
  const [selectedStudentProfileId, setSelectedStudentProfileId] = useState<string | null>(null);
  const [activeEvaluationDetail, setActiveEvaluationDetail] = useState<EvaluationRecord | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Sync evaluations from server database
  useEffect(() => {
    fetch('/api/evaluations')
      .then((res) => res.json())
      .then((data) => {
        if (data.evaluations && data.evaluations.length > 0) {
          setEvaluations(data.evaluations);
          storageService.saveEvaluations(data.evaluations);
        }
      })
      .catch((e) => console.error(e));

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasApiKey(data.hasApiKey))
      .catch(() => {});
  }, []);

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Mandatory Authentication Boundary (Phase 2):
  // Never open dashboard without authentication!
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Role Separation: Student Portal (Phase 4, 5, 6)
  if (user.role === 'student') {
    return <StudentDashboardView user={user} onLogout={logout} />;
  }

  // Teacher / Admin Management Suite (Phase 7 through 16)
  const handleAddStudent = (student: Student) => {
    const updated = storageService.addStudent(student);
    setStudents(updated);
  };

  const handleUpdateStudent = (student: Student) => {
    const updated = storageService.updateStudent(student);
    setStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Student Record?',
      message: `Are you sure you want to delete ${student?.name || studentId}? All associated evaluation records will also be purged.`,
      confirmLabel: 'Delete Student',
      isDestructive: true,
      onConfirm: () => {
        const { students: updatedStudents, evaluations: updatedEvaluations } =
          storageService.deleteStudent(studentId);
        setStudents(updatedStudents);
        setEvaluations(updatedEvaluations);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSaveEvaluation = (record: EvaluationRecord) => {
    const updated = storageService.addEvaluation(record);
    setEvaluations(updated);
    fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(console.error);
  };

  const handleUpdateEvaluation = (record: EvaluationRecord) => {
    const updated = storageService.updateEvaluation(record);
    setEvaluations(updated);
    fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(console.error);
  };

  const handlePublishMarks = async (ids: string[]) => {
    try {
      const res = await fetch('/api/marks/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluationIds: ids,
          publishedBy: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local evaluations
        const updated = evaluations.map((e) =>
          ids.includes(e.id) ? { ...e, isPublishedToStudent: true, status: 'PUBLISHED' as const } : e
        );
        setEvaluations(updated);
        storageService.saveEvaluations(updated);
        alert(data.message || 'Marks published to student portals successfully!');
      }
    } catch (e) {
      console.error('Failed to publish marks:', e);
    }
  };

  const handleApplyCleanedEvaluations = (cleaned: EvaluationRecord[]) => {
    storageService.saveEvaluations(cleaned);
    setEvaluations(cleaned);
  };

  const handleResetToDefault = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Initial Demonstration Dataset?',
      message:
        'This will reset all students and evaluations back to the standard 32-student, 160-evaluation university PBL benchmark dataset.',
      confirmLabel: 'Reset Dataset',
      isDestructive: true,
      onConfirm: () => {
        const result = storageService.resetToDefaultData();
        setStudents(result.students);
        setEvaluations(result.evaluations);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentProfileId(studentId);
    setActiveTab('students');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'students') setSelectedStudentProfileId(null);
        }}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        studentCount={students.length}
        evaluationCount={evaluations.length}
        onLogoutClick={logout}
        currentUser={user}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenMobile={() => setMobileOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          onNavigate={(tab) => {
            setActiveTab(tab);
            if (tab !== 'students') setSelectedStudentProfileId(null);
          }}
          hasApiKey={hasApiKey}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView
              students={students}
              evaluations={evaluations}
              onViewStudent={handleViewStudentProfile}
              onNavigateToEvaluation={() => setActiveTab('evaluation')}
              onSelectEvaluationDetail={(evl) => setActiveEvaluationDetail(evl)}
            />
          )}

          {activeTab === 'students' && (
            <StudentManagementView
              students={students}
              evaluations={evaluations}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              selectedStudentIdForProfile={selectedStudentProfileId}
              onCloseStudentProfile={() => setSelectedStudentProfileId(null)}
              onSelectEvaluationDetail={(evl) => setActiveEvaluationDetail(evl)}
            />
          )}

          {activeTab === 'exams' && (
            <ExaminationManagementView
              onNavigateToEvaluationWithExam={(exam) => {
                setActiveTab('evaluation');
              }}
            />
          )}

          {activeTab === 'syllabus' && <SyllabusManagementView />}

          {activeTab === 'evaluation' && (
            <AnswerEvaluationView
              students={students}
              onSaveEvaluation={handleSaveEvaluation}
              hasApiKey={hasApiKey}
            />
          )}

          {activeTab === 'marks' && (
            <MarksManagementView
              evaluations={evaluations}
              onUpdateEvaluation={handleUpdateEvaluation}
              onPublishMarks={handlePublishMarks}
            />
          )}

          {activeTab === 'explorer' && (
            <DataExplorerView
              evaluations={evaluations}
              onApplyCleanedEvaluations={handleApplyCleanedEvaluations}
              onResetSampleData={handleResetToDefault}
            />
          )}

          {activeTab === 'visualizations' && (
            <VisualizationsView evaluations={evaluations} />
          )}

          {activeTab === 'analytics' && (
            <PerformanceAnalyticsView
              students={students}
              evaluations={evaluations}
              onViewStudent={handleViewStudentProfile}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView students={students} evaluations={evaluations} />
          )}

          {activeTab === 'admin' && <AdminApprovalView />}

          {activeTab === 'settings' && (
            <SettingsView
              onResetData={handleResetToDefault}
              studentCount={students.length}
              evaluationCount={evaluations.length}
            />
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Evaluation Rubric Detail Modal */}
      <EvaluationDetailModal
        evaluation={activeEvaluationDetail}
        onClose={() => setActiveEvaluationDetail(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
