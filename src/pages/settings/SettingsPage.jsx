import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Users,
  Briefcase,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  ShieldCheck,
  Shield,
  UserCheck,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import PesoIcon from '../../components/common/PesoIcon';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';

export const SettingsPage = () => {
  const { currentUser, users, createUser, updateUser, deleteUser, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('users');

  const [companySettings, setCompanySettings] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [govRules, setGovRules] = useState([]);

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [editingDesig, setEditingDesig] = useState(null);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [isGovRuleModalOpen, setIsGovRuleModalOpen] = useState(false);
  const [editingGovRule, setEditingGovRule] = useState(null);

  // Form States
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    title: '',
    department: 'Operations'
  });

  const [desigFormData, setDesigFormData] = useState({
    code: '',
    title: '',
    workforce_category: 'site',
    department_id: '',
    is_active: true
  });

  const [deptFormData, setDeptFormData] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true
  });

  const [govRuleFormData, setGovRuleFormData] = useState({
    agency: 'SSS',
    rule_name: '',
    effective_date: '2026-01-01',
    min_base: 5000,
    max_base: 35000,
    employee_share_pct: 0.045,
    employer_share_pct: 0.095,
    employee_fixed_amount: 0,
    employer_fixed_amount: 0,
    is_active: true
  });

  const loadData = () => {
    setCompanySettings(dataService.getCompanySettings());
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setGovRules(dataService.getGovernmentRules());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // --- USER ACCOUNTS ---
  const handleCreateUser = (e) => {
    e.preventDefault();
    try {
      const usernameVal = newUserData.username?.trim() || newUserData.name.trim().toLowerCase().replace(/\s+/g, '.');
      if (!newUserData.name.trim() || !usernameVal || !newUserData.password) {
        alert('Please fill out Name, Username, and Password.');
        return;
      }
      const emailVal = newUserData.email?.trim() || `${usernameVal}@lunayveconstruction.com`;
      createUser({
        ...newUserData,
        username: usernameVal,
        email: emailVal
      });
      showToast(`User account for ${newUserData.name} (@${usernameVal}) created successfully.`, 'success');
      setIsUserModalOpen(false);
      setNewUserData({ name: '', username: '', email: '', password: '', role: 'employee', title: '', department: 'Operations' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: nextStatus });
    showToast(`Account status updated to ${nextStatus}.`, 'info');
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to remove the account for ${user.name}?`)) {
      try {
        deleteUser(user.id);
        showToast(`User ${user.name} removed.`, 'info');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- DESIGNATIONS ---
  const handleOpenCreateDesig = () => {
    setEditingDesig(null);
    setDesigFormData({ code: '', title: '', workforce_category: 'site', department_id: departments[0]?.id || '', is_active: true });
    setIsDesigModalOpen(true);
  };

  const handleOpenEditDesig = (desig) => {
    setEditingDesig(desig);
    setDesigFormData({
      code: desig.code,
      title: desig.title,
      workforce_category: desig.workforce_category,
      department_id: desig.department_id || '',
      is_active: desig.is_active ?? true
    });
    setIsDesigModalOpen(true);
  };

  const handleSaveDesignation = (e) => {
    e.preventDefault();
    if (!desigFormData.title || !desigFormData.code) {
      alert('Code and Title are required.');
      return;
    }

    if (editingDesig) {
      dataService.updateDesignation(editingDesig.id, desigFormData, currentUser);
      showToast(`Designation "${desigFormData.title}" updated.`, 'success');
    } else {
      dataService.createDesignation(desigFormData, currentUser);
      showToast(`Designation "${desigFormData.title}" created.`, 'success');
    }

    setIsDesigModalOpen(false);
    loadData();
  };

  const handleDeleteDesignation = (desig) => {
    if (window.confirm(`Are you sure you want to delete designation "${desig.title}"?`)) {
      dataService.deleteDesignation(desig.id, currentUser);
      showToast(`Designation "${desig.title}" deleted.`, 'info');
      loadData();
    }
  };

  // --- DEPARTMENTS ---
  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setDeptFormData({ code: '', name: '', description: '', is_active: true });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      is_active: dept.is_active ?? true
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e) => {
    e.preventDefault();
    if (!deptFormData.name || !deptFormData.code) {
      alert('Department Code and Name are required.');
      return;
    }

    if (editingDept) {
      dataService.updateDepartment(editingDept.id, deptFormData, currentUser);
      showToast(`Department "${deptFormData.name}" updated.`, 'success');
    } else {
      dataService.createDepartment(deptFormData, currentUser);
      showToast(`Department "${deptFormData.name}" created.`, 'success');
    }

    setIsDeptModalOpen(false);
    loadData();
  };

  const handleDeleteDept = (dept) => {
    if (window.confirm(`Are you sure you want to delete department "${dept.name}"?`)) {
      dataService.deleteDepartment(dept.id, currentUser);
      showToast(`Department "${dept.name}" deleted.`, 'info');
      loadData();
    }
  };

  // --- GOVERNMENT CONTRIBUTION RULES ---
  const handleOpenCreateGovRule = () => {
    setEditingGovRule(null);
    setGovRuleFormData({
      agency: 'SSS',
      rule_name: '',
      effective_date: '2026-01-01',
      min_base: 5000,
      max_base: 35000,
      employee_share_pct: 0.045,
      employer_share_pct: 0.095,
      employee_fixed_amount: 0,
      employer_fixed_amount: 0,
      is_active: true
    });
    setIsGovRuleModalOpen(true);
  };

  const handleOpenEditGovRule = (rule) => {
    setEditingGovRule(rule);
    setGovRuleFormData({
      agency: rule.agency,
      rule_name: rule.rule_name,
      effective_date: rule.effective_date,
      min_base: rule.min_base || 0,
      max_base: rule.max_base || 0,
      employee_share_pct: rule.employee_share_pct || 0,
      employer_share_pct: rule.employer_share_pct || 0,
      employee_fixed_amount: rule.employee_fixed_amount || 0,
      employer_fixed_amount: rule.employer_fixed_amount || 0,
      is_active: rule.is_active ?? true
    });
    setIsGovRuleModalOpen(true);
  };

  const handleSaveGovRule = (e) => {
    e.preventDefault();
    if (!govRuleFormData.rule_name) {
      alert('Rule Name is required.');
      return;
    }

    if (editingGovRule) {
      dataService.updateGovernmentRule(editingGovRule.id, govRuleFormData, currentUser);
      showToast(`Contribution rule "${govRuleFormData.rule_name}" updated.`, 'success');
    } else {
      dataService.createGovernmentRule(govRuleFormData, currentUser);
      showToast(`Contribution rule "${govRuleFormData.rule_name}" created.`, 'success');
    }

    setIsGovRuleModalOpen(false);
    loadData();
  };

  const handleDeleteGovRule = (rule) => {
    if (window.confirm(`Are you sure you want to delete contribution rule "${rule.rule_name}"?`)) {
      dataService.deleteGovernmentRule(rule.id, currentUser);
      showToast(`Contribution rule "${rule.rule_name}" deleted.`, 'info');
      loadData();
    }
  };

  // --- COMPANY SETTINGS ---
  const handleSaveCompany = (e) => {
    e.preventDefault();
    dataService.updateCompanySettings(companySettings, currentUser);
    showToast('Company profile settings saved.', 'success');
  };

  const handleClearAllData = () => {
    if (window.confirm('Clear all demo workforce, attendance, and payroll data? (The system will be completely clean with 0 employees, ready for live entries).')) {
      dataService.clearAllWorkforceData();
      showToast('All workforce records cleared for clean live deployment.', 'success');
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-700" />
            System Governance & User Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage user accounts, edit designations & departments, and configure statutory contribution rules
          </p>
        </div>

        <button
          onClick={handleClearAllData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear All Data (Clean Slate)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'users', label: `User Accounts & Access (${users.length})`, icon: Users },
          { id: 'designations', label: `Designations (${designations.length})`, icon: Briefcase },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building },
          { id: 'payroll_rules', label: `Government Tables (${govRules.length})`, icon: PesoIcon },
          { id: 'company', label: 'Company Profile', icon: Building }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-emerald-900 dark:bg-emerald-700 text-white shadow-md border border-emerald-900 dark:border-emerald-700 ring-2 ring-emerald-900/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 hover:text-emerald-950 dark:hover:text-emerald-300 hover:border-emerald-500 dark:hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5 active:scale-95'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER ACCOUNTS & RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System User Accounts</h3>
              <p className="text-xs text-slate-500">
                Create and manage login access. Admin accounts have full access; Employee accounts can only access generic info and common files.
              </p>
            </div>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User Account</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Username (Login ID)</th>
                  <th className="p-3.5">Role Access</th>
                  <th className="p-3.5">Title / Department</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isRootAdmin = u.id === 'usr_root_admin_001';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-300 font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            {isRootAdmin && (
                              <span className="text-[10px] text-emerald-600 font-bold">Primary Root Admin</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-900 font-bold">
                        @{u.username || 'admin'}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.role === 'admin' ? 'Administrator (Full Access)' : 'Employee (Restricted Access)'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <p className="font-semibold text-slate-800">{u.title || '-'}</p>
                        <p className="text-[11px] text-slate-500">{u.department || 'Operations'}</p>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {u.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        {!isRootAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                            >
                              {u.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DESIGNATIONS (WITH EDIT & DELETE) */}
      {activeTab === 'designations' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configurable Trade & Professional Positions</h3>
              <p className="text-xs text-slate-500">Create, edit, or remove designations mapped to Office vs Site</p>
            </div>
            <button
              onClick={handleOpenCreateDesig}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Code</th>
                  <th className="p-3">Position Title</th>
                  <th className="p-3">Workforce Category</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map((d) => {
                  const dept = departments.find(item => item.id === d.department_id);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 pl-4 font-mono font-bold text-slate-700">{d.code}</td>
                      <td className="p-3 font-bold text-slate-900">{d.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.workforce_category === 'office' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {d.workforce_category === 'office' ? 'Office' : 'Site'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{dept?.name || 'General Operations'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                          Active
                        </span>
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditDesig(d)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Edit Designation"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Designation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS (WITH EDIT & DELETE) */}
      {activeTab === 'departments' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organizational Departments</h3>
              <p className="text-xs text-slate-500">Corporate units and site operations divisions</p>
            </div>
            <button
              onClick={handleOpenCreateDept}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {dept.code}
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px]">Active</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  <p className="text-slate-500">{dept.description || 'No description provided.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditDept(dept)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-slate-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDept(dept)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GOVERNMENT CONTRIBUTION TABLES (WITH EDIT & DELETE & ADD) */}
      {activeTab === 'payroll_rules' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configurable Government Contribution Tables</h3>
              <p className="text-xs text-slate-500">Edit statutory deduction rates, caps, and bracket ranges applied to payroll</p>
            </div>
            <button
              onClick={handleOpenCreateGovRule}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contribution Rule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {govRules.map((rule) => (
              <div key={rule.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {rule.agency}
                      </span>
                      <h4 className="font-bold text-slate-900 mt-1 text-sm">{rule.rule_name}</h4>
                    </div>
                    <span className="text-emerald-700 font-bold text-[10px]">Active Rule</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Effective Date:</span>
                      <span className="font-bold">{rule.effective_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Salary Base Range:</span>
                      <span className="font-bold">₱{Number(rule.min_base || 0).toLocaleString()} → {rule.max_base ? `₱${Number(rule.max_base).toLocaleString()}` : 'No Cap'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Employee Share:</span>
                      <span className="font-bold text-emerald-700">
                        {rule.employee_share_pct ? `${(Number(rule.employee_share_pct) * 100).toFixed(2)}%` : `Fixed ₱${Number(rule.employee_fixed_amount || 0).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Employer Share:</span>
                      <span className="font-bold text-slate-800">
                        {rule.employer_share_pct ? `${(Number(rule.employer_share_pct) * 100).toFixed(2)}%` : `Fixed ₱${Number(rule.employer_fixed_amount || 0).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditGovRule(rule)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Rule</span>
                  </button>
                  <button
                    onClick={() => handleDeleteGovRule(rule)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPANY PROFILE */}
      {activeTab === 'company' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6 max-w-3xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Corporate Identity & Header Information
          </h3>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Product Name</label>
              <input
                type="text"
                value={companySettings.company_name || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={companySettings.company_address || ''}
                onChange={(e) => setCompanySettings({ ...companySettings, company_address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">HR Contact Email</label>
                <input
                  type="email"
                  value={companySettings.contact_email || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, contact_email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Hotline</label>
                <input
                  type="text"
                  value={companySettings.contact_number || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, contact_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  value={companySettings.tax_id || ''}
                  onChange={(e) => setCompanySettings({ ...companySettings, tax_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Operating Currency</label>
                <input
                  type="text"
                  value={`${companySettings.currency || 'PHP'} (${companySettings.currency_symbol || '₱'})`}
                  disabled
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-500 bg-slate-50 font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE USER ACCOUNT MODAL */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Create New User Account"
        subtitle="Provide system access credentials with Admin or Employee role"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              placeholder="e.g. Maria Del Rosario"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Username (Login ID) *</label>
            <input
              type="text"
              required
              value={newUserData.username || ''}
              onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
              placeholder="e.g. maria.delrosario or eng.bernardo"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Work Email Address</label>
            <input
              type="email"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              placeholder="name@lunayveconstruction.com (Optional)"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={newUserData.password}
              onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              placeholder="••••••••••••"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Access Role *</label>
            <select
              value={newUserData.role}
              onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
            >
              <option value="employee">Employee (Generic Directory & Common Files Only)</option>
              <option value="admin">Administrator (Full System Access & User Creation)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              {newUserData.role === 'admin'
                ? '⭐ Admin can create user accounts, approve payroll, view all compensations and government IDs.'
                : '🔒 Employee can only view general staff directory and submit attendance/leave. Salaries and government IDs are hidden.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={newUserData.title}
                onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                placeholder="e.g. Civil Engineer"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={newUserData.department}
                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT DESIGNATION MODAL */}
      <Modal
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title={editingDesig ? `Edit Designation: ${editingDesig.title}` : 'Create Custom Designation'}
        subtitle="Configure trade or office positions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDesignation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation Code *</label>
            <input
              type="text"
              required
              value={desigFormData.code}
              onChange={(e) => setDesigFormData({ ...desigFormData, code: e.target.value })}
              placeholder="e.g. TOWER_OP"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={desigFormData.title}
              onChange={(e) => setDesigFormData({ ...desigFormData, title: e.target.value })}
              placeholder="e.g. Tower Crane Lead Operator"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Workforce Category</label>
            <select
              value={desigFormData.workforce_category}
              onChange={(e) => setDesigFormData({ ...desigFormData, workforce_category: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
            >
              <option value="site">Site / Skilled Worker</option>
              <option value="office">Office / Professional</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department</label>
            <select
              value={desigFormData.department_id}
              onChange={(e) => setDesigFormData({ ...desigFormData, department_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            >
              <option value="">-- Select Department --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDesigModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              {editingDesig ? 'Save Changes' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT DEPT MODAL */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create Department'}
        subtitle="Configure organization division"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
            <input
              type="text"
              required
              value={deptFormData.code}
              onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
              placeholder="e.g. LOG"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={deptFormData.name}
              onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
              placeholder="e.g. Heavy Logistics & Rigging"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={deptFormData.description}
              onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE / EDIT GOVERNMENT CONTRIBUTION RULE MODAL */}
      <Modal
        isOpen={isGovRuleModalOpen}
        onClose={() => setIsGovRuleModalOpen(false)}
        title={editingGovRule ? `Edit Rule: ${editingGovRule.rule_name}` : 'Create Government Contribution Rule'}
        subtitle="Applied in real-time to statutory payroll calculations"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveGovRule} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Statutory Agency *</label>
              <select
                value={govRuleFormData.agency}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, agency: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
              >
                <option value="SSS">SSS</option>
                <option value="PhilHealth">PhilHealth</option>
                <option value="Pag-IBIG">Pag-IBIG (HDMF)</option>
                <option value="BIR_Tax">BIR Tax</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Effective Date *</label>
              <input
                type="date"
                required
                value={govRuleFormData.effective_date}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, effective_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rule Name / Description *</label>
            <input
              type="text"
              required
              value={govRuleFormData.rule_name}
              onChange={(e) => setGovRuleFormData({ ...govRuleFormData, rule_name: e.target.value })}
              placeholder="e.g. SSS Standard Contribution Table 2026 (14% Rate)"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Min Salary Base (₱)</label>
              <input
                type="number"
                value={govRuleFormData.min_base}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, min_base: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Salary Base (₱ - 0 for none)</label>
              <input
                type="number"
                value={govRuleFormData.max_base}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, max_base: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee Share Rate (e.g. 0.045 for 4.5%)</label>
              <input
                type="number"
                step="0.001"
                value={govRuleFormData.employee_share_pct}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, employee_share_pct: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employer Share Rate (e.g. 0.095 for 9.5%)</label>
              <input
                type="number"
                step="0.001"
                value={govRuleFormData.employer_share_pct}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, employer_share_pct: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employee Fixed Amount (₱ - if fixed)</label>
              <input
                type="number"
                value={govRuleFormData.employee_fixed_amount}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, employee_fixed_amount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Employer Fixed Amount (₱ - if fixed)</label>
              <input
                type="number"
                value={govRuleFormData.employer_fixed_amount}
                onChange={(e) => setGovRuleFormData({ ...govRuleFormData, employer_fixed_amount: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsGovRuleModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              {editingGovRule ? 'Save Rule Changes' : 'Create Contribution Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
