import React from 'react';
import { Smartphone, Monitor, Apple, CheckCircle2, Share2, PlusSquare, ArrowDownToLine, Download, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';

export const InstallGuideModal = ({ isOpen, onClose, onDirectInstall, isInstallable = true }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Install Project Lunayve HRMS"
      subtitle="Fast, standalone application for desktop & mobile devices"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
        
        {/* Direct Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Direct Browser Installation</p>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                Launch the official install dialog in your current browser
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onDirectInstall) onDirectInstall();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Install App Now</span>
          </button>
        </div>

        {/* Benefits notice */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Installing <strong>Project Lunayve</strong> allows offline access, high-speed document caching, direct camera capture on mobile, and a distraction-free window.
          </p>
        </div>

        {/* Instructions by Platform */}
        <div className="space-y-3">
          {/* Windows / macOS */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-1.5 text-xs">
              <Monitor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Google Chrome & Microsoft Edge (Desktop)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>Click the <strong>Install icon</strong> (<ArrowDownToLine className="w-3 h-3 inline mx-0.5 text-emerald-600" />) located on the right side of the <strong>URL Address Bar</strong>.</li>
              <li>Or click the <strong>Three dots menu (⋮)</strong> → <strong>Save and share</strong> → <strong>Install Project Lunayve</strong>.</li>
              <li>Click <strong>Install</strong> on the confirmation popup.</li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-1.5 text-xs">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Android (Google Chrome / Samsung Internet)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>Tap the three dots <strong>(⋮)</strong> in the top-right corner of Chrome.</li>
              <li>Select <ArrowDownToLine className="w-3 h-3 inline mx-0.5 text-emerald-600" /> <strong>Install App</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Tap <strong>Install</strong> to add the icon to your home screen.</li>
            </ol>
          </div>

          {/* iOS Safari */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
            <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white mb-1.5 text-xs">
              <Apple className="w-4 h-4 text-slate-800 dark:text-slate-200" />
              <span>Apple iOS (iPhone & iPad Safari)</span>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>Open this website in <strong>Safari</strong>.</li>
              <li>Tap the <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-sky-600" /> <strong>Share</strong> button at the bottom of the screen.</li>
              <li>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-600" /> <strong>Add to Home Screen</strong>.</li>
              <li>Tap <strong>Add</strong> in the top-right corner.</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InstallGuideModal;
