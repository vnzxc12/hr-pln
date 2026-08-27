import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Users,
  Building2,
  DollarSign,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  Download
} from 'lucide-react';
import Logo from '../../assets/Logo';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import InstallGuideModal from '../../components/pwa/InstallGuideModal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState('privacy'); // 'privacy' | 'terms' | 'support'
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // If user already authenticated, redirect
  useEffect(() => {
    if (currentUser) {
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your email or username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(cleanIdentifier, password);
      setIsLoading(false);

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    }, 450);
  };

  const openPolicy = (type) => {
    setPolicyType(type);
    setIsPolicyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative selection:bg-emerald-600 selection:text-white">
      {/* Subtle background ambient blur */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar with PWA install button */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-end">
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Install App</span>
        </button>
      </div>

      {/* MAIN TWO-COLUMN CENTERED LOGIN CONTAINER (780px - 900px wide) */}
      <div className="flex-1 flex items-center justify-center my-4 sm:my-8">
        <div className="w-full max-w-[880px] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all">
          
          {/* =========================================================================
              LEFT PANEL: PROJECT LUNAYVE BRANDING & FEATURE HIGHLIGHTS (Col 1-7)
              ========================================================================= */}
          <div className="md:col-span-7 bg-slate-50/70 p-6 sm:p-8 lg:p-10 border-b md:border-b-0 md:border-r border-slate-200/80 flex flex-col justify-between space-y-6">
            
            {/* Top Brand Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <Logo className="w-12 h-12 shrink-0 shadow-md shadow-emerald-950/20" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display leading-none">
                    PROJECT LUNAYVE
                  </h1>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mt-1">
                    Human Resource Management System
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                A centralized workforce management platform designed to manage employees, construction workers, projects, attendance, documents, and payroll.
              </p>
            </div>

            {/* Feature Highlights with Clean Subtle Icons */}
            <div className="space-y-3.5">
              {/* Feature 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Workforce Management</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Manage office employees and skilled construction workers in one centralized system.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Project & Site Assignment</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Track employees by project, construction site, designation, and supervisor.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Payroll & Payslips</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Manage salaries, attendance, deductions, government contributions, and payroll records.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Employee Documents</h4>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Securely manage contracts, IDs, certificates, and other employee documents.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Left Badge Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 text-emerald-200 text-[10px] font-bold tracking-wider uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>PROJECT • PEOPLE • PAYROLL</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT PANEL: LOGIN FORM (Col 8-12)
              ========================================================================= */}
          <div className="md:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            
            {/* Heading & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to your Project Lunayve workspace.
              </p>
            </div>

            {/* Error State Banner */}
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Email / Username */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-medium bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-xs font-medium bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span className="text-xs font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Project Lunayve</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Guarantee Message */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <div className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Secure authentication • Protected employee data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAGE FOOTER (Subtle & Professional)
          ========================================================================= */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-slate-500 space-y-1 pt-2">
        <p className="font-semibold text-slate-700">
          Project Lunayve • Human Resource Management System
        </p>
        <p className="text-[11px]">
          A product by <span className="font-bold text-slate-800">VCS Technologies</span> • © 2026 VCS Technologies. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
          <button
            onClick={() => openPolicy('privacy')}
            className="hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('terms')}
            className="hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            onClick={() => openPolicy('support')}
            className="hover:text-emerald-800 hover:underline cursor-pointer"
          >
            Help & Support
          </button>
        </div>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Account Access"
        subtitle="Self-Service & Admin Password Recovery"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            For corporate security and protection of construction workforce and payroll data, password resets are authorized through your company System Administrator.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">IT Support / HR Administrator Contact:</span>
            <p className="font-mono text-emerald-800 font-semibold">admin@lunayveconstruction.com</p>
            <p className="text-[11px] text-slate-500">Hotline: +63 2 8123 4567 (Ext 104)</p>
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>

      {/* POLICY MODAL */}
      <Modal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        title={
          policyType === 'privacy'
            ? 'Privacy & Data Protection'
            : policyType === 'terms'
            ? 'Terms of Service'
            : 'Technical Support'
        }
        subtitle="Project Lunayve Governance"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          {policyType === 'privacy' && (
            <p>
              Project Lunayve adheres to Philippine Data Privacy Act of 2012 (RA 10173). All employee records, biometric logs, statutory government IDs, and payroll compensation records are protected with restricted role-based access.
            </p>
          )}
          {policyType === 'terms' && (
            <p>
              Use of Project Lunayve Construction HRMS is restricted to authorized personnel. All site assignments, clock-in logs, and payroll approvals are recorded in immutable system audit trails.
            </p>
          )}
          {policyType === 'support' && (
            <p>
              For system inquiries or integration assistance, contact VCS Technologies engineering support team at support@vcstechnologies.com.
            </p>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsPolicyModalOpen(false)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* PWA INSTALL GUIDE MODAL */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
