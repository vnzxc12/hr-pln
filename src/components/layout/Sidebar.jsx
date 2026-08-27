import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  HardHat,
  Clock,
  CalendarCheck,
  DollarSign,
  PieChart,
  BarChart3,
  ShieldAlert,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import Logo from '../../assets/Logo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { isAdmin, isEmployee, currentUser } = useAuth();

  const navItems = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'employee'] },
      ]
    },
    {
      group: 'WORKFORCE & SITES',
      items: [
        { name: 'Employee Directory', path: '/employees', icon: Users, roles: ['admin', 'employee'] },
        { name: 'Projects', path: '/projects', icon: Building2, roles: ['admin', 'employee'] },
        { name: 'Construction Sites', path: '/sites', icon: HardHat, roles: ['admin', 'employee'] },
        { name: 'Time & Attendance', path: '/attendance', icon: Clock, roles: ['admin', 'employee'] },
        { name: 'Leave Requests', path: '/leave', icon: CalendarCheck, roles: ['admin', 'employee'] },
      ]
    },
    {
      group: 'FINANCE & COMPLIANCE',
      adminOnly: true,
      items: [
        { name: 'Payroll & Wages', path: '/payroll', icon: DollarSign, roles: ['admin'] },
        { name: 'Project Labor Cost', path: '/payroll/labor-cost', icon: PieChart, roles: ['admin'] },
        { name: 'Reports & Compliance', path: '/reports', icon: BarChart3, roles: ['admin'] },
      ]
    },
    {
      group: 'GOVERNANCE',
      adminOnly: true,
      items: [
        { name: 'Audit Trail Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
        { name: 'Settings & Users', path: '/settings', icon: Settings, roles: ['admin'] },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <Logo className="w-9 h-9 shrink-0 shadow-md shadow-emerald-950/50" />
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-sm text-white font-display tracking-tight block">
                  Project Lunayve
                </span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">
                  Construction HRMS
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Pill */}
        {!isCollapsed && (
          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-400' : 'bg-sky-400'} animate-pulse`} />
              <span className="text-[11px] font-bold text-slate-300 truncate">
                {isAdmin ? 'Full Administrator Access' : 'Employee Access'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navItems.map((group, groupIdx) => {
            // Hide group if it's adminOnly and current user is not admin
            if (group.adminOnly && !isAdmin) return null;

            const visibleItems = group.items.filter(item => item.roles.includes(currentUser?.role || 'employee'));
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {group.group}
                  </h3>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-950/40 font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                          } ${isCollapsed ? 'justify-center px-0' : ''}`
                        }
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer info */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-[10px] text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-400">Project Lunayve v1.0</p>
            <p>VCS Technologies</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
