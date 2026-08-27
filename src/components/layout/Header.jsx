import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Download,
  LogOut,
  ChevronDown,
  Shield,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from './GlobalSearchModal';
import InstallGuideModal from '../pwa/InstallGuideModal';

export const Header = ({ onMenuToggle }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 text-slate-500 text-xs font-medium w-48 sm:w-72 transition-all cursor-pointer group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
          <span className="truncate">Search workforce, sites, docs...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-400 border border-slate-200">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Notification Center, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 shadow-2xs"
          title="Install Project Lunayve App"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Install App</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotificationOpen && (
            <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
          )}
        </div>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-1 ring-slate-200">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">
                {isAdmin ? 'Administrator' : 'Employee Access'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-elevated p-2 z-50 animate-scale-in"
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {isAdmin ? 'System Administrator' : 'Staff / Employee'}
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                {isAdmin && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); navigate('/settings'); }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings & Users</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* PWA Install Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </header>
  );
};

export default Header;
