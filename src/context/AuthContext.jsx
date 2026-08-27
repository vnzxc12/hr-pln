import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'lunayve_system_users';
const CURRENT_USER_STORAGE_KEY = 'lunayve_active_session';

// Default 1 Root Admin Account (Distinct from employee records)
const DEFAULT_ROOT_ADMIN = {
  id: 'usr_root_admin_001',
  name: 'System Administrator',
  email: 'admin@lunayveconstruction.com',
  password: 'Admin@123', // In real Supabase Auth, handles password hashing
  role: 'admin', // 'admin' | 'employee'
  title: 'Chief Administrator',
  department: 'Executive Management',
  status: 'active',
  created_at: new Date().toISOString()
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading system users:', e);
    }
    const initial = [DEFAULT_ROOT_ADMIN];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const active = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (active) return JSON.parse(active);
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    // Default active session is the Root Admin
    return DEFAULT_ROOT_ADMIN;
  });

  // Save users when updated
  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  // Login handler
  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated. Please contact an Administrator.' };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title || (user.role === 'admin' ? 'Administrator' : 'Staff Member'),
      department: user.department || 'General'
    };

    setCurrentUser(sessionUser);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  // Create new user account (Admin only action)
  const createUser = (userData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can create new user accounts.');
    }

    const emailExists = users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (emailExists) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password || 'Lunayve@2026',
      role: userData.role || 'employee', // 'admin' | 'employee'
      title: userData.title || (userData.role === 'admin' ? 'Administrator' : 'Employee'),
      department: userData.department || 'Operations',
      status: 'active',
      created_at: new Date().toISOString(),
      created_by: currentUser.name
    };

    const updated = [...users, newUser];
    saveUsers(updated);
    return newUser;
  };

  // Update user account
  const updateUser = (userId, updates) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updates, updated_at: new Date().toISOString() };
      }
      return u;
    });
    saveUsers(updated);

    // If updating currently logged in user, refresh session
    if (currentUser?.id === userId) {
      const refreshed = { ...currentUser, ...updates };
      setCurrentUser(refreshed);
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(refreshed));
    }
  };

  // Delete user account (Root Admin cannot be deleted)
  const deleteUser = (userId) => {
    if (userId === DEFAULT_ROOT_ADMIN.id) {
      throw new Error('The primary root admin account cannot be removed.');
    }
    const updated = users.filter(u => u.id !== userId);
    saveUsers(updated);
  };

  // Granular Role & Permission Access Checks
  const isAdmin = currentUser?.role === 'admin';
  const isEmployee = currentUser?.role === 'employee';

  const permissions = {
    isAdmin,
    isEmployee,
    canManageUsers: isAdmin,
    canManageEmployees: isAdmin,
    canViewSensitivePayroll: isAdmin,
    canEditPayroll: isAdmin,
    canManageProjects: isAdmin,
    canApproveLeave: isAdmin,
    canViewAuditLogs: isAdmin,
    canManageSettings: isAdmin,
    canViewGenericWorkforce: true,
    canViewCommonDocuments: true,
    canRecordAttendance: true,
    canApplyLeave: true
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        ...permissions
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

export default AuthContext;
