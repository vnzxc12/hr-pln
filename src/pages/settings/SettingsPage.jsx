import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';

export const SettingsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('company');

  const [companySettings, setCompanySettings] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [documentCategories, setDocumentCategories] = useState([]);
  const [govRules, setGovRules] = useState([]);

  // Modals
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  const [newDesig, setNewDesig] = useState({
    code: '',
    title: '',
    workforce_category: 'site',
    department_id: '',
    is_active: true
  });

  const [newDept, setNewDept] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true
  });

  const loadData = () => {
    setCompanySettings(dataService.getCompanySettings());
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setDocumentCategories(dataService.getDocumentCategories());
    setGovRules(dataService.getGovernmentRules());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCompany = (e) => {
    e.preventDefault();
    dataService.updateCompanySettings(companySettings, currentUser);
    showToast('Company profile settings saved.', 'success');
  };

  const handleCreateDesignation = (e) => {
    e.preventDefault();
    if (!newDesig.title || !newDesig.code) {
      alert('Code and Title are required.');
      return;
    }
    dataService.createDesignation(newDesig, currentUser);
    setIsDesigModalOpen(false);
    setNewDesig({ code: '', title: '', workforce_category: 'site', department_id: '', is_active: true });
    showToast('New Designation created.', 'success');
    loadData();
  };

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) {
      alert('Department Code and Name are required.');
      return;
    }
    dataService.createDepartment(newDept, currentUser);
    setIsDeptModalOpen(false);
    setNewDept({ code: '', name: '', description: '', is_active: true });
    showToast('New Department created.', 'success');
    loadData();
  };

  const handleResetFactoryDemo = () => {
    if (window.confirm('Reset all databases, employees, payroll, and logs back to the clean Project Lunayve Demo state?')) {
      dataService.resetToDemoFactory();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-700" />
            System & HR Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company profile, custom designations, departments, statutory contribution tables, and security
          </p>
        </div>

        <button
          onClick={handleResetFactoryDemo}
          className="px-3.5 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'company', label: 'Company Profile', icon: Building },
          { id: 'designations', label: `Designations (${designations.length})`, icon: Briefcase },
          { id: 'departments', label: `Departments (${departments.length})`, icon: Building },
          { id: 'payroll_rules', label: 'Government Contribution Tables', icon: DollarSign },
          { id: 'users', label: 'User Roles & RBAC', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-card'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPANY PROFILE */}
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

      {/* TAB 2: DESIGNATIONS */}
      {activeTab === 'designations' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configurable Trade & Professional Positions</h3>
              <p className="text-xs text-slate-500">Unlimited designations mapped to Office vs Site</p>
            </div>
            <button
              onClick={() => setIsDesigModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
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
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map((d) => {
                  const dept = departments.find(item => item.id === d.department_id);
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
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
                      <td className="p-3 pr-4">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-md">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Organizational Departments</h3>
              <p className="text-xs text-slate-500">Corporate units and site operations divisions</p>
            </div>
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    {dept.code}
                  </span>
                  <span className="text-emerald-700 font-bold text-[10px]">Active</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                <p className="text-slate-500">{dept.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GOVERNMENT CONTRIBUTION TABLES */}
      {activeTab === 'payroll_rules' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Configurable Government Contribution Tables</h3>
            <p className="text-xs text-slate-500">Rules applied in real-time to payroll computations without modifying core code</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {govRules.map((rule) => (
              <div key={rule.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {rule.agency}
                    </span>
                    <h4 className="font-bold text-slate-900 mt-1">{rule.rule_name}</h4>
                  </div>
                  <span className="text-emerald-700 font-bold text-[10px]">Active Rule</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 font-mono text-slate-700">
                  <div className="flex justify-between">
                    <span>Effective Date:</span>
                    <span className="font-bold">{rule.effective_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Range:</span>
                    <span>₱{rule.min_base?.toLocaleString()} → {rule.max_base ? `₱${rule.max_base.toLocaleString()}` : 'No Cap'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee Share:</span>
                    <span className="font-bold text-emerald-700">
                      {rule.employee_share_pct ? `${(rule.employee_share_pct * 100).toFixed(1)}%` : `Fixed ₱${rule.employee_fixed_amount}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employer Share:</span>
                    <span className="font-bold text-slate-800">
                      {rule.employer_share_pct ? `${(rule.employer_share_pct * 100).toFixed(1)}%` : `Fixed ₱${rule.employer_fixed_amount}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Roles & Access Control (RBAC)</h3>
            <p className="text-xs text-slate-500">Configured persona credentials and system permissions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEMO_USERS.map((user) => (
              <div key={user.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 text-xs">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-300" />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-slate-500">{user.email}</p>
                  <p className="text-[11px] text-slate-600 font-semibold">{user.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE DESIGNATION MODAL */}
      <Modal
        isOpen={isDesigModalOpen}
        onClose={() => setIsDesigModalOpen(false)}
        title="Create Custom Designation"
        subtitle="Add unlimited trade or office positions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDesignation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Designation Code *</label>
            <input
              type="text"
              required
              value={newDesig.code}
              onChange={(e) => setNewDesig({ ...newDesig, code: e.target.value })}
              placeholder="e.g. TOWER_OP"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={newDesig.title}
              onChange={(e) => setNewDesig({ ...newDesig, title: e.target.value })}
              placeholder="e.g. Tower Crane Lead Operator"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Workforce Category</label>
            <select
              value={newDesig.workforce_category}
              onChange={(e) => setNewDesig({ ...newDesig, workforce_category: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
            >
              <option value="site">Site / Skilled Worker</option>
              <option value="office">Office / Professional</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department</label>
            <select
              value={newDesig.department_id}
              onChange={(e) => setNewDesig({ ...newDesig, department_id: e.target.value })}
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
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
            >
              Save Designation
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE DEPT MODAL */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Create Department"
        subtitle="Add new organization unit"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
            <input
              type="text"
              required
              value={newDept.code}
              onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
              placeholder="e.g. LOG"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={newDept.name}
              onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
              placeholder="e.g. Heavy Logistics & Rigging"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newDept.description}
              onChange={(e) => setNewDept({ ...newDept, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
