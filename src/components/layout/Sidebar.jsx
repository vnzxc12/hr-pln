import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building,
  HardHat,
  Clock,
  CalendarCheck,
  DollarSign,
  BarChart3,
  ShieldAlert,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  PieChart
} from 'lucide-react';
import { LunayveLogo } from '../../assets/Logo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const { canAccessPayroll, isSiteSupervisor } = useAuth();

  const navItems = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      ]
    },
    {
      group: 'WORKFORCE',
      items: [
        { label: 'Employees', path: '/employees', icon: Users },
        { label: 'Projects', path: '/projects', icon: Building },
        { label: 'Construction Sites', path: '/sites', icon: HardHat },
      ]
    },
    {
      group: 'SITE OPERATIONS',
      items: [
        { label: 'Attendance & Logs', path: '/attendance', icon: Clock },
        { label: 'Leave Requests', path: '/leave', icon: CalendarCheck },
      ]
    },
    ...(canAccessPayroll ? [{
      group: 'PAYROLL & COSTS',
      items: [
        { label: 'Payroll Periods', path: '/payroll', icon: DollarSign },
        { label: 'Labor Cost Analytics', path: '/payroll/labor-cost', icon: PieChart },
      ]
    }] : []),
    {
      group: 'GOVERNANCE',
      items: [
        { label: 'Reports & Exports', path: '/reports', icon: BarChart3 },
        { label: 'Audit Trail', path: '/audit', icon: ShieldAlert },
        { label: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <LunayveLogo className="w-9 h-9 shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-tight truncate font-display">
                  Project Lunayve
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase truncate">
                  Construction HRMS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                  {group.group}
                </p>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path) && item.path !== '/payroll' ? true : location.pathname === item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-950 text-emerald-300 font-semibold border border-emerald-700/60 shadow-inner'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info badge */}
        {!isCollapsed && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live HR System
              </span>
              <span className="text-[10px] text-slate-500 font-mono">v1.0-prod</span>
            </div>
            <p className="text-[10px] text-slate-500">
              VCS Technologies PWA Engine
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
