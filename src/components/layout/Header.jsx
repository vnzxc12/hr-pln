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
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from './GlobalSearchModal';
import InstallGuideModal from '../pwa/InstallGuideModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const Header = ({ onMenuToggle }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isInstalled, isGuideOpen, setIsGuideOpen, triggerInstall } = usePWAInstall();
  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-medium w-48 sm:w-72 transition-all cursor-pointer group shadow-2xs"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
          <span className="truncate">Search workforce, sites, docs...</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Dark Mode Switch, Notification Center, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:text-emerald-700" />
          )}
        </button>

        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            onClick={triggerInstall}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-800 shadow-2xs cursor-pointer"
            title="Install Project Lunayve App"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Install App</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
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
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-1 ring-slate-200 dark:ring-slate-700">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                {currentUser?.name || 'User'}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block tracking-wider">
                {isAdmin ? 'Administrator' : 'Employee Access'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-elevated p-2 z-50 animate-scale-in"
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser?.email}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
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
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings & Users</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
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
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onDirectInstall={triggerInstall}
      />
    </header>
  );
};

export default Header;
