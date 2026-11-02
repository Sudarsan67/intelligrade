import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';
import { StaffAccessRequest, StudentRosterEntry } from '../../types';

export const AdminApprovalView: React.FC = () => {
  const [staffRequests, setStaffRequests] = useState<StaffAccessRequest[]>([]);
  const [roster, setRoster] = useState<StudentRosterEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'staff' | 'roster' | 'audit'>('staff');
  const [searchRoster, setSearchRoster] = useState('');

  const fetchAdminData = async () => {
    try {
      const staffRes = await fetch('/api/admin/staff-requests');
      const staffData = await staffRes.json();
      if (staffData.requests) setStaffRequests(staffData.requests);

      const rosRes = await fetch('/api/roster');
      const rosData = await rosRes.json();
      if (rosData.roster) setRoster(rosData.roster);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    await fetch('/api/admin/approve-staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, decision }),
    });
    fetchAdminData();
  };

  const handleRosterCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const entries: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/"/g, '').trim());
        if (cols.length >= 3) {
          entries.push({
            rollNumber: cols[0],
            name: cols[1],
            institutionalEmail: cols[2],
            department: cols[3] || 'AI & Data Science',
            year: cols[4] || 'Year 3',
            semester: cols[5] || 'Sem 5',
          });
        }
      }

      await fetch('/api/roster/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });

      alert(`Successfully imported ${entries.length} roster entries!`);
      fetchAdminData();
    };
    reader.readAsText(file);
  };

  const filteredRoster = roster.filter(
    (r) =>
      r.name.toLowerCase().includes(searchRoster.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchRoster.toLowerCase()) ||
      r.institutionalEmail.toLowerCase().includes(searchRoster.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Administrator Control Center</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Admin Role Only
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve onboarding faculty, manage pre-verified student roster, and inspect audit trails
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'staff' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Staff Requests ({staffRequests.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'roster' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Student Roster ({roster.length})
          </button>
        </div>
      </div>

      {/* SUB-PANEL 1: STAFF ACCESS REQUESTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pending Faculty Onboarding Requests
            </h3>
          </div>

          {staffRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending staff requests. All faculty applications have been reviewed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {staffRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{req.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {req.email} • {req.department} ({req.designation})
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">Requested: {req.requestedAt}</div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecision(req.id, 'rejected')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDecision(req.id, 'approved')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                      >
                        Approve Faculty
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded capitalize ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {req.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-PANEL 2: STUDENT ROSTER (CSV IMPORT & INSPECT) */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roll number or name..."
                value={searchRoster}
                onChange={(e) => setSearchRoster(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Roster CSV</span>
              <input type="file" accept=".csv" onChange={handleRosterCSV} className="hidden" />
            </label>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Roll Number</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Institutional Email</th>
                  <th className="px-4 py-2.5">Department</th>
                  <th className="px-4 py-2.5 text-center">Year / Sem</th>
                  <th className="px-4 py-2.5 text-center">Registration Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredRoster.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{r.rollNumber}</td>
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.institutionalEmail}</td>
                    <td className="px-4 py-2.5 font-sans text-slate-700">{r.department}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{r.year} ({r.semester})</td>
                    <td className="px-4 py-2.5 text-center font-sans">
                      {r.isRegistered ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Activated
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Unregistered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
