import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Sparkles,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Server,
  BookOpen,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SettingsViewProps {
  onResetData: () => void;
  studentCount: number;
  evaluationCount: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetData,
  studentCount,
  evaluationCount,
}) => {
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    hasApiKey: boolean;
    timestamp?: string;
  } | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setServerHealth(data))
      .catch((err) => {
        console.error('Failed to fetch server health:', err);
        setServerHealth({ status: 'offline', hasApiKey: false });
      });
  }, []);

  const handleBackupExport = () => {
    const json = storageService.exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `intelligrade-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotification({ type: 'success', message: 'Full system backup downloaded successfully.' });
  };

  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importBackup(content);
      if (res.success) {
        setNotification({ type: 'success', message: res.message });
        window.location.reload();
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>System Diagnostics & Academic Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage system state, AI evaluation services, and curriculum assessment parameters
        </p>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* AI & Server Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" />
          <span>AI Backend & Infrastructure Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <div className="text-slate-500 font-medium">Evaluation Model</div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>gemini-3.8-flash</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Low-latency structured descriptive answer evaluation
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
            <div className="text-slate-500 font-medium">API Key Status</div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              {serverHealth?.hasApiKey ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Connected via Secrets
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Injected at runtime
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              Accessed server-side through process.env.GEMINI_API_KEY
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Storage & Backup */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Database & State Persistence</span>
        </h3>

        <div className="text-xs text-slate-600 space-y-1">
          <div>Currently Stored Records:</div>
          <div className="font-bold text-slate-900 text-sm">
            {studentCount} Students • {evaluationCount} Verified Evaluations
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onResetData}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo PBL Dataset (160 rows)</span>
          </button>

          <button
            onClick={handleBackupExport}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full JSON Backup</span>
          </button>

          <label className="cursor-pointer px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON Backup</span>
            <input type="file" accept=".json" onChange={handleBackupImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Academic Project Accreditation */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>About Project INTELLIGRADE</span>
        </div>
        <p className="leading-relaxed">
          INTELLIGRADE is developed as a flagship Project-Based Learning (PBL) submission for the
          subject <strong>Data Exploration and Visualization (DEV)</strong>. It integrates modern AI
          descriptive scoring with rigorous exploratory data analysis (EDA), data cleaning suites,
          distribution statistics, correlation matrices, and faculty performance intelligence.
        </p>
      </div>
    </div>
  );
};
