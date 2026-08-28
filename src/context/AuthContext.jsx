import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'lunayve_system_users';
const CURRENT_USER_STORAGE_KEY = 'lunayve_active_session';

// Default 1 Root Admin Account (Distinct from employee records)
const DEFAULT_ROOT_ADMIN = {
  id: 'usr_root_admin_001',
  name: 'System Administrator',
  username: 'admin',
  email: 'admin@lunayveconstruction.com',
  password: 'Admin@123',
  role: 'admin', // 'admin' | 'employee'
  title: 'Chief Administrator',
  department: 'Executive Management',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z'
};

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(u => (u.id === DEFAULT_ROOT_ADMIN.id ? { ...DEFAULT_ROOT_ADMIN, ...u, username: u.username || 'admin' } : u));
        }
      }
    } catch (e) {
      console.warn('Error reading system users:', e);
    }
    const initial = [DEFAULT_ROOT_ADMIN];
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {}
    return initial;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const active = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      if (active) return JSON.parse(active);
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    return null;
  });

  // Fetch latest users from Supabase Cloud on startup
  useEffect(() => {
    const fetchCloudUsers = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('details')
          .eq('module', 'SystemUsers')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0 && Array.isArray(data[0]?.details?.users)) {
          const cloudUsers = data[0].details.users;
          if (cloudUsers.length > 0) {
            // Merge with default root admin
            const merged = cloudUsers.map(u =>
              u.id === DEFAULT_ROOT_ADMIN.id ? { ...DEFAULT_ROOT_ADMIN, ...u, username: u.username || 'admin' } : u
            );
            // Ensure root admin is present
            if (!merged.some(u => u.id === DEFAULT_ROOT_ADMIN.id)) {
              merged.unshift(DEFAULT_ROOT_ADMIN);
            }
            setUsers(merged);
            try {
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Could not sync system users from Supabase:', err);
      }
    };

    fetchCloudUsers();
  }, []);

  // Save users when updated (dual-write to LocalStorage and Supabase)
  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (e) {
      console.warn('Error writing users to localStorage:', e);
    }

    // Cloud persistence to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_logs').insert([{
        user_name: currentUser?.name || 'System Administrator',
        user_role: currentUser?.role || 'admin',
        action: 'System Users Directory Sync',
        module: 'SystemUsers',
        record_id: 'sync_users',
        details: { users: updatedUsers },
        created_at: new Date().toISOString()
      }]).then(({ error }) => {
        if (error) console.warn('Failed to sync users to Supabase:', error);
      });
    }
  };

  // Login handler with username (or email fallback)
  const login = (identifier, password) => {
    const cleanInput = identifier.trim().toLowerCase();
    const user = users.find(
      u => (u.username?.toLowerCase() === cleanInput || u.email?.toLowerCase() === cleanInput) && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated. Please contact an Administrator.' };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      username: user.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      role: user.role,
      title: user.title || (user.role === 'admin' ? 'Administrator' : 'Staff Member'),
      department: user.department || 'General'
    };

    setCurrentUser(sessionUser);
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch (e) {}
    return { success: true, user: sessionUser };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch (e) {}
  };

  // Create new user account (Admin only action)
  const createUser = (userData) => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can create new user accounts.');
    }

    const rawUsername = (userData.username || userData.email?.split('@')[0] || userData.name.toLowerCase().replace(/\s+/g, '.')).trim().toLowerCase();
    const username = rawUsername.replace(/[^a-z0-9._-]/g, '');

    const usernameExists = users.some(u => u.username?.toLowerCase() === username);
    if (usernameExists) {
      throw new Error(`An account with the username "${username}" already exists.`);
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: userData.name.trim(),
      username,
      email: userData.email?.trim() || `${username}@lunayve.local`,
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

    if (currentUser?.id === userId) {
      const refreshed = { ...currentUser, ...updates };
      setCurrentUser(refreshed);
      try {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(refreshed));
      } catch (e) {}
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
