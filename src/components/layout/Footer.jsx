import React, { useState } from 'react';
import { Shield, FileText, HelpCircle, Building2 } from 'lucide-react';
import Modal from '../common/Modal';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <footer className="sticky bottom-0 z-20 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-2.5 px-4 sm:px-6 text-[11px] text-slate-500 dark:text-slate-400 transition-colors shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          {/* Left: Minimalist system title */}
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Project Lunayve HRMS</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">Enterprise Workforce & Payroll v1.0</span>
          </div>

          {/* Right: Copyright & Clean Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <span>
              © 2026 <strong className="font-bold text-emerald-700 dark:text-emerald-400">VCS Technologies</strong>. All rights reserved.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
              >
                Terms
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => setActiveModal('help')}
                className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline transition-colors cursor-pointer"
              >
                Support
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
