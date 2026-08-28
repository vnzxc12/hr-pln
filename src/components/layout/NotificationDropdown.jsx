import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, AlertCircle, Calendar, FileText, CheckCircle2, DollarSign } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationDropdown = ({ isOpen = true, onClose }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'expired_doc':
        return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'expiring_doc':
        return <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'payroll_pending':
        return <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'leave_pending':
        return <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden text-slate-900 dark:text-slate-100"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications & Alerts</h3>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
            {unreadCount} New
          </span>
        )}
      </div>

      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
            <p>All compliance alerts and tasks are cleared.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
                onClose?.();
              }}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                !n.is_read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5 shadow-2xs">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
