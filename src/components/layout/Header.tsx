import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobile: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onNavigate: (tab: NavTab) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobile,
  onSearchChange,
  searchQuery,
  onNavigate,
  hasApiKey,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Academic Performance Overview',
      subtitle: 'Real-time cohort metrics, assessment pass rates, and grade distribution',
    },
    students: {
      title: 'Student Management Directory',
      subtitle: 'Student profiles, enrollments, and academic assessment histories',
    },
    exams: {
      title: 'Examination & Question Paper Management',
      subtitle: 'CAT 1, CAT 2, and Semester Examinations with question-level scoring rubrics',
    },
    syllabus: {
      title: 'Curriculum Syllabus & Knowledge Boundaries',
      subtitle: 'Approved units, topics, and learning outcomes grounding AI evaluation',
    },
    evaluation: {
      title: 'AI Descriptive Answer Evaluation',
      subtitle: 'Gemini-assisted conceptual grading, keyword coverage, and rubric scoring',
    },
    marks: {
      title: 'Teacher Marks Ledger & Controlled Publication',
      subtitle: 'Review AI marks, adjust final scores, and publish results to students',
    },
    explorer: {
      title: 'Data Explorer & DEV Workspace',
      subtitle: 'Interactive dataset preview, automated data cleaning, and statistical EDA',
    },
    visualizations: {
      title: 'Interactive Data Visualizations',
      subtitle: '7 DEV analytical charts: Bar, Donut, Histogram, Line, Box Plot, Heatmap, and Scatter Plot',
    },
    analytics: {
      title: 'Performance Analytics & Insights',
      subtitle: 'Cross-subject correlations, outlier identification, and pedagogical recommendations',
    },
    reports: {
      title: 'Academic Grade Reports & Transcripts',
      subtitle: 'Comprehensive performance summaries, CSV export, and printable grade cards',
    },
    admin: {
      title: 'Administrator Control Center',
      subtitle: 'Staff onboarding approvals, student roster management, and security audit logs',
    },
    settings: {
      title: 'System Settings & Configuration',
      subtitle: 'Grading scale boundaries, dataset management, and Gemini API diagnostics',
    },
  };

  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Mathematics Pass Rate Dip',
      desc: 'Mid-term results indicate 4 students scored below the 50% benchmark in Mathematics.',
      time: '10m ago',
    },
    {
      id: 2,
      type: 'info',
      title: 'DEV Module Updated',
      desc: 'Dataset exploration now includes Pearson correlation matrix and box plot outlier detection.',
      time: '1h ago',
    },
    {
      id: 3,
      type: 'success',
      title: 'AI Evaluator Ready',
      desc: 'Gemini 3.8 Flash evaluation pipeline is online and connected.',
      time: '2h ago',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-slate-400">INTELLIGRADE</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-indigo-600 font-semibold capitalize">
                {activeTab}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              {tabTitles[activeTab]?.title || 'Dashboard'}
            </h1>
          </div>
        </div>

        {/* Right: Search, Notifications, Quick Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Universal Search */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, subject..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* New Evaluation CTA */}
          <button
            onClick={() => onNavigate('evaluation')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Evaluate Answer</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) setUnreadCount(0);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/90 py-2 z-40">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Academic Alerts & Activity
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                      Live
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 hover:bg-slate-50 transition-colors flex gap-2.5"
                      >
                        {n.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : n.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-slate-800">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('analytics');
                      }}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      View Academic Analytics →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
