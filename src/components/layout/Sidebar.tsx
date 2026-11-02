import React from 'react';
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  Database,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  GraduationCap,
  Sparkles,
  LogOut,
  Calendar,
  BookOpen,
  Award,
  ShieldCheck,
  X,
  Camera,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';

export type NavTab =
  | 'overview'
  | 'students'
  | 'exams'
  | 'syllabus'
  | 'evaluation'
  | 'marks'
  | 'explorer'
  | 'visualizations'
  | 'analytics'
  | 'reports'
  | 'admin'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  studentCount: number;
  evaluationCount: number;
  onLogoutClick: () => void;
  currentUser?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  studentCount,
  evaluationCount,
  onLogoutClick,
  currentUser,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'students' as NavTab,
      label: 'Student Directory',
      icon: Users,
      badge: studentCount,
    },
    {
      id: 'exams' as NavTab,
      label: 'Exam Management',
      icon: Calendar,
      badge: 'CAT 1/2',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'syllabus' as NavTab,
      label: 'Syllabus Management',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'evaluation' as NavTab,
      label: 'Evaluation Centre',
      icon: BrainCircuit,
      badge: 'AI',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'marks' as NavTab,
      label: 'Marks & Publication',
      icon: Award,
      badge: evaluationCount,
    },
    {
      id: 'explorer' as NavTab,
      label: 'Data Explorer',
      icon: Database,
      badge: 'DEV',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'visualizations' as NavTab,
      label: 'Data Visualizations',
      icon: TrendingUp,
      badge: '7 Charts',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Performance Analytics',
      icon: Sparkles,
      badge: null,
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports & Transcripts',
      icon: FileSpreadsheet,
      badge: null,
    },
    ...(currentUser?.role === 'admin'
      ? [
          {
            id: 'admin' as NavTab,
            label: 'Admin Control Center',
            icon: ShieldCheck,
            badge: 'Admin',
            badgeColor: 'bg-amber-100 text-amber-800',
          },
        ]
      : []),
    {
      id: 'settings' as NavTab,
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  INTELLIGRADE
                </span>
                <div className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Academic Portal
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Academic Role Badge */}
          <div className="mx-3.5 my-3 px-3 py-2 bg-indigo-50/70 border border-indigo-100/90 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentUser?.role === 'admin' ? 'University Administrator' : 'Faculty Assessor'}</span>
            </div>
            <p className="text-[11px] text-indigo-700/80 mt-0.5 leading-tight">
              Nandha Engineering College • DEV
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Management Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Role Indicator at bottom */}
        <div className="p-3 border-t border-slate-200/90 bg-white">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.name || 'Faculty User'}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span className="capitalize">{currentUser?.role || 'Staff'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogoutClick}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
