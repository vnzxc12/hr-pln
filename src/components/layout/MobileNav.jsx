import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, HardHat, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = () => {
  const { canAccessPayroll } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Sites', path: '/sites', icon: HardHat },
    { label: 'Attendance', path: '/attendance', icon: Clock },
    ...(canAccessPayroll ? [{ label: 'Payroll', path: '/payroll', icon: DollarSign }] : []),
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileNav;
