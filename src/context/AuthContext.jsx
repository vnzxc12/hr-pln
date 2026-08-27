import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  HR_ADMIN: 'HR Administrator',
  PAYROLL_ADMIN: 'Payroll Administrator',
  PROJECT_MANAGER: 'Project Manager',
  SUPERVISOR_FOREMAN: 'Supervisor / Foreman'
};

export const DEMO_USERS = [
  {
    id: 'user-superadmin',
    name: 'Engr. Bernardo Alcantara',
    email: 'admin@lunayveconstruction.com',
    role: ROLES.SUPER_ADMIN,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80',
    title: 'Super Administrator / VP Engineering',
    accessibleProjects: ['prj-1', 'prj-2', 'prj-3'],
    accessibleSites: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5']
  },
  {
    id: 'user-hr',
    name: 'Maria Elena Del Rosario',
    email: 'hr@lunayveconstruction.com',
    role: ROLES.HR_ADMIN,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&fit=crop&q=80',
    title: 'HR Manager & Labor Compliance',
    accessibleProjects: ['prj-1', 'prj-2', 'prj-3'],
    accessibleSites: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5']
  },
  {
    id: 'user-payroll',
    name: 'Patricia May Lim',
    email: 'payroll@lunayveconstruction.com',
    role: ROLES.PAYROLL_ADMIN,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&fit=crop&q=80',
    title: 'Senior Payroll Specialist',
    accessibleProjects: ['prj-1', 'prj-2', 'prj-3'],
    accessibleSites: ['site-1', 'site-2', 'site-3', 'site-4', 'site-5']
  },
  {
    id: 'user-pm',
    name: 'Arch. Christine Reyes',
    email: 'pm@lunayveconstruction.com',
    role: ROLES.PROJECT_MANAGER,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&fit=crop&q=80',
    title: 'Project Manager - Bay Horizon',
    accessibleProjects: ['prj-2'],
    accessibleSites: ['site-3', 'site-4']
  },
  {
    id: 'user-foreman',
    name: 'Rolando Mendoza',
    email: 'foreman@lunayveconstruction.com',
    role: ROLES.SUPERVISOR_FOREMAN,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&fit=crop&q=80',
    title: 'General Site Supervisor - Tower Alpha',
    accessibleProjects: ['prj-1'],
    accessibleSites: ['site-1', 'site-2']
  }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lunayve_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEMO_USERS[0]; // Default Super Admin
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lunayve_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lunayve_auth_user');
    }
  }, [currentUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // If connected to live Supabase Auth
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
          const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || 'Authenticated User',
            email: data.user.email,
            role: ROLES.HR_ADMIN,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&fit=crop&q=80',
            title: 'Project Lunayve Staff'
          };
          setCurrentUser(matched);
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo login
      const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USERS[0];
      setCurrentUser(matched);
      setIsLoading(false);
      return { success: true };
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const switchRole = (roleKey) => {
    const target = DEMO_USERS.find(u => u.role === roleKey) || DEMO_USERS[0];
    setCurrentUser(target);
  };

  // Permission checkers
  const canAccessPayroll = currentUser && [ROLES.SUPER_ADMIN, ROLES.PAYROLL_ADMIN, ROLES.HR_ADMIN].includes(currentUser.role);
  const canEditPayroll = currentUser && [ROLES.SUPER_ADMIN, ROLES.PAYROLL_ADMIN].includes(currentUser.role);
  const canManageEmployees = currentUser && [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN].includes(currentUser.role);
  const canManageProjects = currentUser && [ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.PROJECT_MANAGER].includes(currentUser.role);
  const isSiteSupervisor = currentUser?.role === ROLES.SUPERVISOR_FOREMAN;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        logout,
        switchRole,
        canAccessPayroll,
        canEditPayroll,
        canManageEmployees,
        canManageProjects,
        isSiteSupervisor,
        demoUsers: DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
