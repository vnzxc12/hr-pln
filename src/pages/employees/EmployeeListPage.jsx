import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Building,
  HardHat,
  ChevronRight,
  Briefcase,
  RotateCcw
} from 'lucide-react';
import { WorkforceBadge, StatusBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { excelService } from '../../services/excelService';
import { useAuth } from '../../context/AuthContext';
import EmployeeCreateEditModal from './EmployeeCreateEditModal';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { canManageEmployees, currentUser, isAdmin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);

  // Filter States - Default status is 'Active'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDesignation, setSelectedDesignation] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'Active');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const loadData = () => {
    setEmployees(dataService.getEmployees());
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    dataService.syncWithSupabase().then(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Update query param when filter changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      searchParams.set('category', selectedCategory);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  }, [selectedCategory]);

  const handleDeactivate = (emp) => {
    if (window.confirm(`Are you sure you want to deactivate and terminate ${emp.first_name} ${emp.last_name}? (All past payroll records, documents, and attendance history will remain safely preserved in the database)`)) {
      dataService.softDeleteEmployee(emp.id, currentUser);
      loadData();
    }
  };

  const handleRestore = (emp) => {
    if (window.confirm(`Reactivate ${emp.first_name} ${emp.last_name} back to the Active Workforce directory?`)) {
      dataService.updateEmployee(emp.id, { is_deleted: false, employment_status: 'Active' }, currentUser);
      loadData();
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredEmployees.map(e => ({
      'Employee ID': e.employee_id,
      'Full Name': `${e.first_name} ${e.last_name}`,
      'Category': e.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Worker',
      'Designation': designations.find(d => d.id === e.designation_id)?.title || 'N/A',
      'Department': departments.find(d => d.id === e.department_id)?.name || 'N/A',
      'Project': projects.find(p => p.id === e.assigned_project_id)?.name || 'Central Office',
      'Site': sites.find(s => s.id === e.assigned_site_id)?.name || 'N/A',
      'Status': e.employment_status,
      'Date Hired': e.date_hired,
      'Contact Number': e.contact_number,
      'Rate Type': e.rate_type,
      'Base Rate': e.base_rate
    }));
    excelService.exportToExcel(exportData, 'Lunayve_Employees_Master_List', 'Employees');
  };

  // Filter computation
  const filteredEmployees = employees.filter(emp => {
    // Category
    if (selectedCategory !== 'all' && emp.workforce_category !== selectedCategory) return false;
    // Dept
    if (selectedDept !== 'all' && emp.department_id !== selectedDept) return false;
    // Designation
    if (selectedDesignation !== 'all' && emp.designation_id !== selectedDesignation) return false;
    // Project
    if (selectedProject !== 'all' && emp.assigned_project_id !== selectedProject) return false;
    
    // Status Filter (Default 'Active', or explicit 'Terminated', 'On Leave', 'Suspended', etc.)
    if (selectedStatus === 'Active') {
      if (emp.is_deleted || emp.employment_status !== 'Active') return false;
    } else if (selectedStatus === 'Terminated') {
      if (!emp.is_deleted && emp.employment_status !== 'Terminated') return false;
    } else if (selectedStatus !== 'all') {
      if (emp.employment_status !== selectedStatus) return false;
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fullName = `${emp.first_name || ''} ${emp.middle_name || ''} ${emp.last_name || ''} ${emp.suffix || ''}`.toLowerCase();
      const matchName = fullName.includes(q);
      const matchId = emp.employee_id && emp.employee_id.toLowerCase().includes(q);
      const matchPhone = emp.contact_number && emp.contact_number.includes(q);
      if (!matchName && !matchId && !matchPhone) return false;
    }
    return true;
  });

  // Scope employees based on current status filter (e.g. Active by default, or Terminated, etc.)
  const statusFilteredList = employees.filter(emp => {
    if (selectedStatus === 'Active') {
      return !emp.is_deleted && emp.employment_status === 'Active';
    } else if (selectedStatus === 'Terminated') {
      return emp.is_deleted || emp.employment_status === 'Terminated';
    } else if (selectedStatus !== 'all') {
      return emp.employment_status === selectedStatus;
    }
    return true;
  });

  const totalCount = statusFilteredList.length;
  const officeCount = statusFilteredList.filter(e => e.workforce_category === 'office').length;
  const siteCount = statusFilteredList.filter(e => e.workforce_category === 'site').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Master Workforce Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified management for Office Professionals & Site Construction Workers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {canManageEmployees && (
            <button
              onClick={() => {
                setEditingEmployee(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white shadow-2xs text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Workforce ({totalCount})
            </button>
            <button
              onClick={() => setSelectedCategory('office')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === 'office'
                  ? 'bg-sky-50 shadow-2xs text-sky-800 font-bold border border-sky-200'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Office / Professional ({officeCount})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('site')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedCategory === 'site'
                  ? 'bg-emerald-50 shadow-2xs text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Site / Skilled Worker ({siteCount})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-900">{filteredEmployees.length}</strong> of {totalCount} workers
          </span>
        </div>

        {/* Search & Multi-Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, PLN ID, or mobile number..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* EMPLOYEES DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Employee</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Designation & Dept</th>
                <th className="p-3.5">Project / Site</th>
                <th className="p-3.5">Rate & Compensation</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date Hired</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No workforce members found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const desig = designations.find(d => d.id === emp.designation_id);
                  const dept = departments.find(d => d.id === emp.department_id);
                  const proj = projects.find(p => p.id === emp.assigned_project_id);
                  const site = sites.find(s => s.id === emp.assigned_site_id);

                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      {/* Employee Photo & Name */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={emp.first_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                              {emp.first_name} {emp.middle_name ? emp.middle_name + ' ' : ''}{emp.last_name} {emp.suffix || ''}
                            </p>
                            <span className="font-mono text-[11px] text-slate-500">
                              {emp.employee_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Workforce Category */}
                      <td className="p-3.5">
                        <WorkforceBadge category={emp.workforce_category} />
                      </td>

                      {/* Designation & Dept */}
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-900">{desig?.title || 'Unassigned'}</p>
                        <p className="text-[11px] text-slate-500">{dept?.name || 'Central'}</p>
                      </td>

                      {/* Project & Site */}
                      <td className="p-3.5">
                        <p className="font-medium text-slate-800">{proj?.name || 'Headquarters'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{site?.name || 'Office'}</p>
                      </td>

                      {/* Compensation (Admin Only) */}
                      <td className="p-3.5">
                        {isAdmin ? (
                          <>
                            <p className="font-mono font-bold text-slate-900">₱{Number(emp.base_rate).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">{emp.rate_type} rate</p>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Confidential</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <StatusBadge status={emp.employment_status} />
                      </td>

                      {/* Date Hired */}
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {emp.date_hired}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canManageEmployees && (
                            <>
                              {emp.is_deleted || emp.employment_status === 'Terminated' ? (
                                <button
                                  onClick={() => handleRestore(emp)}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                                  title="Reactivate Employee"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingEmployee(emp);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-colors"
                                    title="Edit Employee"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeactivate(emp)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                    title="Deactivate / Terminate Employee"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Add/Edit Modal */}
      <EmployeeCreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeToEdit={editingEmployee}
        onSaved={loadData}
      />
    </div>
  );
};

export default EmployeeListPage;
