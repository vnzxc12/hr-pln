import React from 'react';
import { Smartphone, Monitor, Apple, CheckCircle2, Share2, PlusSquare, ArrowDownToLine } from 'lucide-react';
import Modal from '../common/Modal';

export const InstallGuideModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install Project Lunayve HRMS"
      subtitle="Fast, offline-ready application for mobile & desktop"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-sm text-slate-600">
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Installing <strong>Project Lunayve</strong> enables faster mobile document uploads, direct site camera capture, and instant offline workforce search without downloading from app stores.
          </p>
        </div>

        {/* Instructions by Platform */}
        <div className="space-y-4">
          {/* iOS Safari */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
              <Apple className="w-4 h-4 text-slate-800" />
              <span>Apple iOS (iPhone / iPad)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Open this website in <strong>Safari</strong> browser.</li>
              <li>Tap the <Share2 className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> <strong>Share</strong> icon at the bottom.</li>
              <li>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-600" /> <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top right corner.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android (Google Chrome / Edge)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Tap the three dots <strong>(⋮)</strong> in the top-right corner of Chrome.</li>
              <li>Select <ArrowDownToLine className="w-3.5 h-3.5 inline mx-1 text-emerald-600" /> <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Confirm prompt to install.</li>
            </ol>
          </div>

          {/* Windows / macOS */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 mb-2">
              <Monitor className="w-4 h-4 text-sky-600" />
              <span>Windows / macOS Desktop</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Click the <strong>Install</strong> icon in the address bar (right side of URL).</li>
              <li>Or click <strong>Menu (⋮) → Save and share → Install Project Lunayve</strong>.</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-all"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InstallGuideModal;
