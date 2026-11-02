import React from 'react';
import {
  LayoutDashboard,
  Award,
  TrendingUp,
  BookOpen,
  BrainCircuit,
  CalendarCheck,
  Calendar,
  Bell,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Sparkles,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types/auth';

export type StudentNavTab =
  | 'dashboard'
  | 'marks'
  | 'analytics'
  | 'subjects'
  | 'mentor'
  | 'planner'
  | 'timetable'
  | 'profile';

interface StudentSidebarProps {
  activeTab: StudentNavTab;
  onSelectTab: (tab: StudentNavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  studentUser: UserProfile;
  onLogout: () => void;
  publishedCount: number;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  studentUser,
  onLogout,
  publishedCount,
}) => {
  const navItems = [
    { id: 'dashboard' as StudentNavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'marks' as StudentNavTab, label: 'My Marks', icon: Award, badge: publishedCount },
    { id: 'analytics' as StudentNavTab, label: 'Performance Analytics', icon: TrendingUp },
    { id: 'subjects' as StudentNavTab, label: 'My Subjects', icon: BookOpen },
    { id: 'mentor' as StudentNavTab, label: 'AI Mentor', icon: BrainCircuit, badge: 'AI' },
    { id: 'planner' as StudentNavTab, label: 'Study Planner', icon: CalendarCheck },
    { id: 'timetable' as StudentNavTab, label: 'My Timetable', icon: Calendar },
    { id: 'profile' as StudentNavTab, label: 'Profile & Settings', icon: User },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white">
                  INTELLIGRADE
                </span>
                <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                  Student Portal
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Status Badge */}
          <div className="mx-3.5 my-3 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{studentUser.name}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Roll: {studentUser.rollNumber} • {studentUser.department}
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Student Navigation
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
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
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

        {/* Bottom Profile Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="p-2 rounded-lg bg-slate-800/60 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{studentUser.name}</div>
              <div className="text-[10px] text-slate-400">{studentUser.email}</div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
