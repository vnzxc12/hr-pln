import React, { useState } from 'react';
import { Shield, FileText, HelpCircle, Building2 } from 'lucide-react';
import Modal from '../common/Modal';

export const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-6 px-6 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Branding info */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Project Lunayve Construction</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-500">Human Resource Management System</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-600 font-medium">A product by VCS Technologies</span>
          </div>

          {/* Right: Copyright & Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
            <span>© 2026 VCS Technologies. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms</span>
              </button>
              <span className="text-slate-300">•</span>
              <button
                onClick={() => setActiveModal('help')}
                className="hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help & Support</span>
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
