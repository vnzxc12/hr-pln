import React, { useState, useEffect } from 'react';
import { User, Briefcase, DollarSign, FileText, Check, AlertCircle, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export const EmployeeCreateEditModal = ({ isOpen, onClose, employeeToEdit, onSaved }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    profile_photo: '',
    workforce_category: 'site', // 'office' | 'site'
    date_of_birth: '',
    gender: 'Male',
    civil_status: 'Single',
    nationality: 'Filipino',
    contact_number: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relation: '',
    employment_type: 'Project-Based',
    employment_status: 'Active',
    department_id: '',
    designation_id: '',
    date_hired: new Date().toISOString().split('T')[0],
    contract_start_date: new Date().toISOString().split('T')[0],
    contract_end_date: '',
    assigned_project_id: '',
    assigned_site_id: '',
    supervisor_id: '',
    foreman_id: '',
    team_crew: '',
    sss_number: '',
    philhealth_number: '',
    pagibig_number: '',
    tin_number: '',
    rate_type: 'Daily', // 'Monthly' | 'Daily' | 'Hourly'
    base_rate: 850,
    monthly_allowance: 0,
    daily_allowance: 100
  });

  useEffect(() => {
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
  }, []);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...employeeToEdit,
        base_rate: Number(employeeToEdit.base_rate) || 0,
        monthly_allowance: Number(employeeToEdit.monthly_allowance) || 0,
        daily_allowance: Number(employeeToEdit.daily_allowance) || 0
      });
    } else {
      // Generate Next Employee ID
      const count = dataService.getEmployees().length + 1;
      const nextCode = `PLN-2026-${String(count).padStart(3, '0')}`;
      setFormData(prev => ({
        ...prev,
        employee_id: nextCode,
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
        workforce_category: 'site',
        rate_type: 'Daily',
        base_rate: 850
      }));
    }
  }, [employeeToEdit, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // If workforce category toggled, update smart defaults
      if (field === 'workforce_category') {
        if (value === 'office') {
          updated.rate_type = 'Monthly';
          updated.base_rate = 45000;
          updated.employment_type = 'Regular';
        } else {
          updated.rate_type = 'Daily';
          updated.base_rate = 850;
          updated.employment_type = 'Project-Based';
        }
      }
      return updated;
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBase64 = event.target?.result;
        if (!rawBase64) return;
        const img = new Image();
        img.onload = () => {
          const maxDim = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          handleChange('profile_photo', compressed);
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.employee_id) {
      alert('Please fill in Employee ID, First Name, and Last Name.');
      return;
    }

    if (employeeToEdit) {
      dataService.updateEmployee(employeeToEdit.id, formData, currentUser);
    } else {
      dataService.createEmployee(formData, currentUser);
    }

    onSaved && onSaved();
    onClose && onClose();
  };

  const filteredDesignations = designations.filter(
    d => d.workforce_category === formData.workforce_category
  );

  const availableSites = sites.filter(
    s => !formData.assigned_project_id || s.project_id === formData.assigned_project_id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? `Edit Employee: ${employeeToEdit.first_name} ${employeeToEdit.last_name}` : 'New Employee Onboarding'}
      subtitle="Unified Master Workforce Management"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB HEADERS */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'personal'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Personal Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'employment'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>2. Position & Site Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compensation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compensation'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Wage & Rate Structure</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('government')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'government'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>4. Government IDs</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {/* Workforce Category Switcher */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Workforce Classification <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('workforce_category', 'office')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.workforce_category === 'office'
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold ring-2 ring-sky-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs">Office / Professional</p>
                  <p className="text-[10px] text-slate-500 font-normal">Engineers, Architects, PMs, HR, Finance</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('workforce_category', 'site')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    formData.workforce_category === 'site'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs">Site / Skilled Worker</p>
                  <p className="text-[10px] text-slate-500 font-normal">Carpenters, Masons, Plumbers, Foremen</p>
                </button>
              </div>
            </div>

            {/* Profile Photo Upload Widget */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="relative shrink-0">
                <img
                  src={formData.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                  alt="Avatar Preview"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                />
              </div>
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <label className="block font-bold text-slate-800">
                  Profile Photo & ID Picture
                </label>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  value={formData.profile_photo}
                  onChange={(e) => handleChange('profile_photo', e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full p-2 rounded-lg border border-slate-200 text-[11px] bg-white text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
                <input
                  type="text"
                  required
                  value={formData.employee_id}
                  onChange={(e) => handleChange('employee_id', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name || ''}
                  onChange={(e) => handleChange('middle_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Suffix (Jr, III, CPA, etc.)</label>
                <input
                  type="text"
                  value={formData.suffix || ''}
                  onChange={(e) => handleChange('suffix', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo URL / Avatar</label>
                <input
                  type="text"
                  value={formData.profile_photo || ''}
                  onChange={(e) => handleChange('profile_photo', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender || 'Male'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Civil Status</label>
                <select
                  value={formData.civil_status || 'Single'}
                  onChange={(e) => handleChange('civil_status', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="name@lunayveconstruction.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="House / Street, Barangay, City, Province"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            {/* Emergency Contact Block */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Emergency Contact Person</label>
                <input
                  type="text"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergency_contact_number || ''}
                  onChange={(e) => handleChange('emergency_contact_number', e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) => handleChange('emergency_contact_relation', e.target.value)}
                  placeholder="Spouse / Parent / Sibling"
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYMENT & SITE ASSIGNMENT */}
        {activeTab === 'employment' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department_id || ''}
                  onChange={(e) => handleChange('department_id', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Position *</label>
                <select
                  required
                  value={formData.designation_id || ''}
                  onChange={(e) => handleChange('designation_id', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-semibold"
                >
                  <option value="">-- Select Position --</option>
                  {filteredDesignations.map(des => (
                    <option key={des.id} value={des.id}>{des.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                >
                  <option value="Regular">Regular</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Project-Based">Project-Based</option>
                  <option value="Probationary">Probationary</option>
                  <option value="Casual">Casual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Status</label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => handleChange('employment_status', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                  <option value="End of Contract">End of Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date Hired *</label>
                <input
                  type="date"
                  required
                  value={formData.date_hired}
                  onChange={(e) => handleChange('date_hired', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contract End Date</label>
                <input
                  type="date"
                  value={formData.contract_end_date || ''}
                  onChange={(e) => handleChange('contract_end_date', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Construction Project & Site Assignment */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                Construction Hierarchy: Project & Site Assignment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Project</label>
                  <select
                    value={formData.assigned_project_id || ''}
                    onChange={(e) => handleChange('assigned_project_id', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- No Project (HQ Office) --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.project_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Site</label>
                  <select
                    value={formData.assigned_site_id || ''}
                    onChange={(e) => handleChange('assigned_site_id', e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="">-- No Site (Office) --</option>
                    {availableSites.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.site_code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Team / Crew Name</label>
                  <input
                    type="text"
                    value={formData.team_crew || ''}
                    onChange={(e) => handleChange('team_crew', e.target.value)}
                    placeholder="e.g. Formwork Unit 1"
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPENSATION */}
        {activeTab === 'compensation' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Rate Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Monthly', 'Daily', 'Hourly'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleChange('rate_type', type)}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      formData.rate_type === type
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {type} Rate
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Rate (₱) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.base_rate}
                  onChange={(e) => handleChange('base_rate', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {formData.rate_type === 'Monthly' ? 'Monthly basic salary' : (formData.rate_type === 'Daily' ? 'Per 8-hour shift rate' : 'Per hour rate')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Allowance (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_allowance}
                  onChange={(e) => handleChange('monthly_allowance', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Site Per Diem (₱)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.daily_allowance}
                  onChange={(e) => handleChange('daily_allowance', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNMENT STATUTORY DETAILS */}
        {activeTab === 'government' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Government statutory registration numbers for automatic SSS, PhilHealth, Pag-IBIG, and BIR tax calculation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SSS Number</label>
                <input
                  type="text"
                  value={formData.sss_number || ''}
                  onChange={(e) => handleChange('sss_number', e.target.value)}
                  placeholder="34-1234567-8"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">PhilHealth Number</label>
                <input
                  type="text"
                  value={formData.philhealth_number || ''}
                  onChange={(e) => handleChange('philhealth_number', e.target.value)}
                  placeholder="12-345678901-2"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pag-IBIG (HDMF) Number</label>
                <input
                  type="text"
                  value={formData.pagibig_number || ''}
                  onChange={(e) => handleChange('pagibig_number', e.target.value)}
                  placeholder="1210-3849-0192"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">TIN (Bureau of Internal Revenue)</label>
                <input
                  type="text"
                  value={formData.tin_number || ''}
                  onChange={(e) => handleChange('tin_number', e.target.value)}
                  placeholder="000-123-456-000"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{employeeToEdit ? 'Save Changes' : 'Complete Onboarding'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeCreateEditModal;
