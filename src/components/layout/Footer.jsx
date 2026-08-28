import React, { useState } from 'react';
import { Shield, FileText, HelpCircle, Building2 } from 'lucide-react';
import Modal from '../common/Modal';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <footer className="sticky bottom-0 z-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-3.5 px-4 sm:px-8 text-xs text-slate-500 dark:text-slate-400 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* Left: Branding info */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Project Lunayve Construction</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400 hidden lg:inline">HRMS Enterprise</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="inline-flex items-center gap-1">
              <span>Developed by</span>
              <span className="font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent tracking-wide">
                VCS Technologies
              </span>
            </span>
          </div>

          {/* Right: Copyright & Links */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <span>
              © 2026 <strong className="font-bold text-emerald-700 dark:text-emerald-400">VCS Technologies</strong>. All rights reserved.
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Privacy</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Terms</span>
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('help')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy & Labor Data Protection"
        subtitle="Project Lunayve Construction HRMS"
      >
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            Project Lunayve Construction and VCS Technologies are committed to protecting the privacy, confidentiality, and security of all employee personal, government, and compensation records in compliance with Republic Act No. 10173 (Data Privacy Act of 2012).
          </p>
          <h4 className="font-bold text-slate-900">1. Data Collected</h4>
          <p>
            The system securely stores employee identifying information, government identifiers (SSS, PhilHealth, Pag-IBIG, TIN), site certifications, biometric time logs, and payroll compensation records exclusively for construction human resource administration.
          </p>
          <h4 className="font-bold text-slate-900">2. Role-Based Access Control</h4>
          <p>
            Compensation and private documents are protected under strict Row-Level Security (RLS). Site supervisors and foremen only access assigned site workforce attendance and competency records.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        subtitle="Project Lunayve Construction HRMS"
      >
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            Access to this system is restricted to authorized personnel of Project Lunayve Construction and licensed affiliates. All audit logs, payroll approvals, and document uploads are immutably tracked.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'help'}
        onClose={() => setActiveModal(null)}
        title="Help & Construction HR Support"
        subtitle="VCS Technologies Technical Desk"
      >
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Corporate Support Line</h4>
            <p className="text-xs text-slate-500">Email: support@vcstechnologies.com | Hotline: +63 2 8123 4567</p>
          </div>
          <h4 className="font-bold text-slate-900">Quick Assistance Guides:</h4>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
            <li><strong>Excel Imports:</strong> Download the pre-formatted Excel template from Attendance or Payroll before importing records.</li>
            <li><strong>Site Document Capture:</strong> On mobile devices, use the camera icon under Employee Documents to directly photograph and upload site safety passes.</li>
            <li><strong>PWA Installation:</strong> Click "Install App" on the navigation bar to enable offline time logs and profile search.</li>
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default Footer;
