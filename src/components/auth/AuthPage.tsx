import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Info,
  Clock,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, studentRegister, staffRegister, changePassword, user } = useAuth();

  // Tab: 'signin' | 'student-register' | 'staff-register'
  const [activeMode, setActiveMode] = useState<'signin' | 'student-register' | 'staff-register'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('AI & Data Science');
  const [year, setYear] = useState('Year 3');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password change modal (for mandatory first-time admin password reset)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');

  // Status and feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick fill helper
  const handleQuickFill = (role: 'admin' | 'teacher' | 'student') => {
    setActiveMode('signin');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === 'admin') {
      setEmail('admin@nandhaengg.org');
      setPassword('sudarsan');
    } else if (role === 'teacher') {
      setEmail('prof.balaji@nandhaengg.org');
      setPassword('teacher123');
    } else if (role === 'student') {
      setEmail('732225AI104@nandhaengg.org');
      setPassword('student123');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      } else if (res.mustChangePassword) {
        // Force password change modal as per specification 2.5
        setCurrentPasswordInput(password);
        setShowPasswordResetModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await studentRegister({
        institutionalEmail: email,
        name,
        rollNumber,
        department,
        year,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      } else {
        setSuccessMsg(res.message || 'Registration successful! You may now sign in.');
        setActiveMode('signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStaffRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await staffRegister({
        name,
        email,
        department,
        designation,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Staff onboarding request failed');
      } else {
        setSuccessMsg(res.message || 'Staff access request submitted for administrative review.');
        setActiveMode('signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForcePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput !== confirmNewPasswordInput) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPasswordInput, newPasswordInput);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update password');
    } else {
      setShowPasswordResetModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Accent Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/20 mb-1">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            INTELLIGRADE
          </h1>
          <p className="text-xs text-indigo-300 font-medium">
            AI-Based Answer Evaluation & Academic Analytics Platform
          </p>
          <div className="inline-block text-[10px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
            Nandha Engineering College • DEV Curriculum
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500">
            <button
              onClick={() => {
                setActiveMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                activeMode === 'signin'
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveMode('student-register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                activeMode === 'student-register'
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Student Setup
            </button>
            <button
              onClick={() => {
                setActiveMode('staff-register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 text-center transition-colors ${
                activeMode === 'staff-register'
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600 font-bold'
                  : 'hover:text-slate-800'
              }`}
            >
              Staff Onboarding
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Feedback Messages */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Email / Institutional Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 732225AI104@nandhaengg.org or admin@nandhaengg.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-medium">Password</label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'For demonstration test accounts:\n- Administrator: sudarsan\n- Teacher: teacher123\n- Student: student123\n\nOr click the fast credential buttons below!'
                        )
                      }
                      className="text-[11px] text-indigo-600 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to IntelliGrade</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: STUDENT FIRST-TIME ACCOUNT SETUP */}
            {activeMode === 'student-register' && (
              <form onSubmit={handleStudentRegister} className="space-y-3 text-xs">
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    Student accounts are automatically validated against the official faculty-managed
                    Student Roster. Use your assigned college roll number and college email.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. 732225AI105@nandhaengg.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 732225AI105"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 uppercase font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Iyer"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Information Technology">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Year / Semester
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Year 3">Year 3 (Sem 5)</option>
                      <option value="Year 4">Year 4 (Sem 7)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Verifying with Roster...' : 'Verify & Activate Student Account'}
                </button>
              </form>
            )}

            {/* TAB 3: STAFF REGISTRATION (PENDING APPROVAL) */}
            {activeMode === 'staff-register' && (
              <form onSubmit={handleStaffRegister} className="space-y-3 text-xs">
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Faculty registrations receive a <strong>PENDING_APPROVAL</strong> status. An administrator
                    must verify credentials before full teacher access is activated.
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Faculty Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Rajan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Professional / Faculty Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="priya.rajan@nandhaengg.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="AI & Data Science">AI & Data Science</option>
                      <option value="Information Technology">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Associate Professor"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
                >
                  {loading ? 'Submitting Request...' : 'Submit Faculty Access Request'}
                </button>
              </form>
            )}
          </div>

          {/* Quick 1-Click Demonstration Credential Helpers */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Quick Test Credentials:</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
              >
                <div className="font-bold text-[11px] text-slate-800">Admin</div>
                <div className="text-[10px] text-slate-400">admin@nandhaengg.org</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('teacher')}
                className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
              >
                <div className="font-bold text-[11px] text-slate-800">Teacher</div>
                <div className="text-[10px] text-slate-400">prof.balaji@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-left transition-colors"
              >
                <div className="font-bold text-[11px] text-slate-800">Student</div>
                <div className="text-[10px] text-slate-400">732225AI104@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MANDATORY PASSWORD CHANGE MODAL (Specification 2.5) */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mandatory Password Change Required
                </h3>
                <p className="text-xs text-slate-500">
                  Initial bootstrap administrator password must be updated before accessing the dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleForcePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  New Secure Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min 6 chars)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
