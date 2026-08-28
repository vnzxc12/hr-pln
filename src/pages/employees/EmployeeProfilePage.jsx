import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Clock,
  CalendarCheck,
  Building,
  HardHat,
  ArrowLeft,
  Upload,
  Camera,
  Download,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Edit2,
  History,
  Phone,
  Mail,
  MapPin,
  FileCheck
} from 'lucide-react';
import { WorkforceBadge, StatusBadge } from '../../components/common/Badge';
import PesoIcon from '../../components/common/PesoIcon';
import { dataService } from '../../services/dataService';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../services/payrollEngine';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import EmployeeCreateEditModal from './EmployeeCreateEditModal';
import PayslipModal from '../../components/payslip/PayslipModal';

export const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, canManageEmployees, isAdmin } = useAuth();
  const { showToast } = useNotifications();

  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Related Entities
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteHistory, setSiteHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docCategories, setDocCategories] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);

  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Document Upload Form State
  const [uploadData, setUploadData] = useState({
    category_id: '',
    document_name: '',
    expiration_date: '',
    notes: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const loadData = () => {
    const emp = dataService.getEmployeeById(id);
    if (!emp) {
      navigate('/employees');
      return;
    }
    setEmployee(emp);
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
    setSiteHistory(dataService.getSiteAssignments(id));
    setDocuments(dataService.getDocumentsByEmployee(id));
    setDocCategories(dataService.getDocumentCategories());
    setAttendance(dataService.getAttendanceByEmployee(id));
    setLeaveRequests(dataService.getLeaveRequests(id));
    setPayrollHistory(dataService.getPayrollRecordsByEmployee(id));
    setPayrollPeriods(dataService.getPayrollPeriods());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, [id]);

  if (!employee) return null;

  const currentDesig = designations.find(d => d.id === employee.designation_id);
  const currentDept = departments.find(d => d.id === employee.department_id);
  const currentProject = projects.find(p => p.id === employee.assigned_project_id);
  const currentSite = sites.find(s => s.id === employee.assigned_site_id);

  // Document Upload Handler
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        document_name: prev.document_name || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      alert('Please select or capture a document file.');
      return;
    }

    setIsUploading(true);
    try {
      const storageRes = await storageService.uploadFile(uploadData.file, employee.id, uploadData.category_id);
      dataService.createDocument({
        employee_id: employee.id,
        category_id: uploadData.category_id || docCategories[0]?.id,
        document_name: uploadData.document_name,
        file_name: storageRes.fileName,
        file_path: storageRes.filePath,
        file_type: storageRes.fileType,
        file_size: storageRes.fileSize,
        expiration_date: uploadData.expiration_date || null,
        notes: uploadData.notes || ''
      }, currentUser);

      showToast(`Document "${uploadData.document_name}" uploaded successfully.`, 'success');
      setIsUploadModalOpen(false);
      setUploadData({ category_id: '', document_name: '', expiration_date: '', notes: '', file: null });
      loadData();
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this employee document?')) {
      dataService.deleteDocument(docId, currentUser);
      showToast('Document deleted.', 'info');
      loadData();
    }
  };

  // Quick Photo Change Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        dataService.updateEmployee(employee.id, { profile_photo: base64 }, currentUser);
        showToast('Profile photo updated successfully.', 'success');
        loadData();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate('/employees')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Workforce Directory</span>
      </button>

      {/* MASTER PROFILE HEADER HERO CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group shrink-0">
              <img
                src={employee.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}
                alt={employee.first_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-card"
              />
              {canManageEmployees && (
                <label
                  htmlFor="profile-photo-direct-upload"
                  className="absolute inset-0 bg-slate-950/60 rounded-3xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1 backdrop-blur-xs"
                >
                  <Camera className="w-5 h-5 text-emerald-300" />
                  <span>Change Photo</span>
                </label>
              )}
              <input
                id="profile-photo-direct-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {employee.employee_id}
                </span>
                <WorkforceBadge category={employee.workforce_category} />
                <StatusBadge status={employee.employment_status} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                {employee.first_name} {employee.middle_name ? employee.middle_name + ' ' : ''}{employee.last_name} {employee.suffix || ''}
              </h1>

              <p className="text-sm font-semibold text-emerald-800">
                {currentDesig?.title || 'No Designation'} • {currentDept?.name || 'Central'}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-600" />
                  {currentProject?.name || 'Corporate HQ'}
                </span>
                <span className="flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-teal-600" />
                  {currentSite?.name || 'Office Desk'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Hired: {employee.date_hired}
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Document</span>
            </button>

            {canManageEmployees && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            {employee.contact_number}
          </span>
          {employee.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-600" />
              {employee.email}
            </span>
          )}
          {employee.address && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              {employee.address}
            </span>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE TABS NAVIGATION */}
      <div className="tab-scroll-container flex items-center gap-2.5 pb-2.5 pt-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'employment', label: 'Employment Details', icon: Briefcase },
          ...(isAdmin ? [{ id: 'government', label: 'Government & Tax (Admin)', icon: FileCheck }] : []),
          ...(isAdmin ? [{ id: 'compensation', label: 'Compensation & Salary (Admin)', icon: PesoIcon }] : []),
          { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { id: 'sites', label: `Site Assignment History (${siteHistory.length})`, icon: History },
          { id: 'attendance', label: `Time & Attendance (${attendance.length})`, icon: Clock },
          { id: 'leave', label: `Leave Records (${leaveRequests.length})`, icon: CalendarCheck },
          ...(isAdmin ? [{ id: 'payroll', label: `Payroll & Payslips (${payrollHistory.length})`, icon: PesoIcon }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`tab-nav-btn group transition-all duration-200 ease-in-out cursor-pointer ${
                isActive
                  ? 'bg-emerald-900 dark:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-900/20 font-bold border border-emerald-800 dark:border-emerald-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white shadow-2xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ease-in-out ${isActive ? 'text-emerald-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Personal & Identification Record
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Full Legal Name</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {employee.first_name} {employee.middle_name} {employee.last_name} {employee.suffix}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date of Birth</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.date_of_birth || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gender & Civil Status</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.gender} • {employee.civil_status}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nationality</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.nationality || 'Filipino'}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Primary Contact Phone</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">{employee.contact_number}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Work Email Address</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.email || 'N/A'}</p>
            </div>
            <div className="sm:col-span-3">
              <span className="text-slate-400 block font-medium">Residential / Present Address</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.address || 'N/A'}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Emergency Contact Protocol
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-100 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Contact Person</span>
                <p className="font-bold text-slate-900 mt-0.5">{employee.emergency_contact_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Phone Number</span>
                <p className="font-bold text-slate-900 mt-0.5 font-mono">{employee.emergency_contact_number || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Relationship</span>
                <p className="font-bold text-slate-900 mt-0.5">{employee.emergency_contact_relation || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYMENT INFORMATION */}
      {activeTab === 'employment' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Employment & Construction Role Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Workforce Classification</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {employee.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Construction Worker'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Employment Type</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{employee.employment_type}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Employment Status</span>
              <div className="mt-1"><StatusBadge status={employee.employment_status} /></div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentDept?.name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Designation / Position</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentDesig?.title || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date Hired</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">{employee.date_hired}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Contract Period</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">
                {employee.contract_start_date || employee.date_hired} → {employee.contract_end_date || 'Open (Regular)'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Project</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentProject?.name || 'Corporate HQ'}</p>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Construction Site</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{currentSite?.name || 'Office'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GOVERNMENT INFORMATION */}
      {activeTab === 'government' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Government Statutory Identifiers (Philippine Labor Compliance)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold text-xs block">Social Security System (SSS)</span>
              <p className="font-mono font-bold text-base text-slate-900 mt-1">{employee.sss_number || 'Not Registered'}</p>
              <p className="text-[10px] text-slate-400 mt-1">Automatic 14% contribution deduction</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold text-xs block">PhilHealth (NHIP)</span>
              <p className="font-mono font-bold text-base text-slate-900 mt-1">{employee.philhealth_number || 'Not Registered'}</p>
              <p className="text-[10px] text-slate-400 mt-1">5.0% equal share premium</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold text-xs block">Pag-IBIG Fund (HDMF)</span>
              <p className="font-mono font-bold text-base text-slate-900 mt-1">{employee.pagibig_number || 'Not Registered'}</p>
              <p className="text-[10px] text-slate-400 mt-1">Mandatory ₱200 statutory cap</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-semibold text-xs block">TIN (Tax Identification Number)</span>
              <p className="font-mono font-bold text-base text-slate-900 mt-1">{employee.tin_number || 'Not Registered'}</p>
              <p className="text-[10px] text-slate-400 mt-1">BIR TRAIN Law withholding tax</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPENSATION */}
      {activeTab === 'compensation' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <PesoIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Compensation & Wage Rate Structure (PHP ₱)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1.5">
                <PesoIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Base {employee.rate_type} Rate
              </span>
              <p className="font-mono font-bold text-2xl text-emerald-950 dark:text-emerald-100 mt-1">{formatCurrency(employee.base_rate)}</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Standard rate for {employee.rate_type.toLowerCase()} computation</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs flex items-center gap-1.5">
                <PesoIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Monthly Allowances
              </span>
              <p className="font-mono font-bold text-2xl text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(employee.monthly_allowance)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Fixed monthly non-taxable / per diem</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-xs flex items-center gap-1.5">
                <PesoIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Daily Site Per Diem
              </span>
              <p className="font-mono font-bold text-2xl text-slate-900 dark:text-slate-100 mt-1">{formatCurrency(employee.daily_allowance)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multiplier applied per actual site duty</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCUMENTS & MOBILE CAMERA UPLOAD */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Compliance Documents & Safety Passes</h3>
              <p className="text-xs text-slate-500">Securely stored with automated expiration monitoring</p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload / Capture Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-2 p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>No documents uploaded yet for this employee.</p>
              </div>
            ) : (
              documents.map((doc) => {
                const category = docCategories.find(c => c.id === doc.category_id);
                const isExpiringSoon = doc.expiration_date && new Date(doc.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isExpired = doc.expiration_date && new Date(doc.expiration_date) < new Date();

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{doc.document_name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{doc.file_name} • {(doc.file_size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {category?.group_type || 'Personal'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Expiration Date</span>
                        <p className={`font-mono font-bold text-xs ${
                          isExpired ? 'text-rose-600' : (isExpiringSoon ? 'text-amber-600' : 'text-slate-800')
                        }`}>
                          {doc.expiration_date || 'No Expiration'}
                        </p>
                      </div>
                      {isExpired ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md">
                          EXPIRED
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                          EXPIRING SOON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          VALID
                        </span>
                      )}
                    </div>

                    {doc.notes && (
                      <p className="text-[11px] text-slate-500 italic">"{doc.notes}"</p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">By {doc.uploader_name || 'HR Admin'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SITE ASSIGNMENT HISTORY */}
      {activeTab === 'sites' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Site Assignment Timeline</h3>
              <p className="text-xs text-slate-500">Historical record of project deployments across construction sites</p>
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-600/30">
            {siteHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No past site assignments recorded.</p>
            ) : (
              siteHistory.map((asg) => {
                const proj = projects.find(p => p.id === asg.project_id);
                const site = sites.find(s => s.id === asg.site_id);

                return (
                  <div key={asg.id} className="relative group">
                    <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                      asg.status === 'Active' ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-slate-400'
                    }`} />
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {proj?.name || 'Project'} • <span className="text-emerald-800">{site?.name || 'Site'}</span>
                        </h4>
                        <StatusBadge status={asg.status} />
                      </div>
                      <p className="text-slate-600">
                        Position: <strong className="text-slate-800">{asg.position_title}</strong> • Supervisor: {asg.supervisor_name}
                      </p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Period: {asg.assignment_start} → {asg.assignment_end || 'Present'}
                      </p>
                      {asg.notes && <p className="text-slate-500 italic mt-1">"{asg.notes}"</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 7: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Attendance Log History</h3>
            <span className="text-xs text-slate-500 font-mono">{attendance.length} Total Logs</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time In / Out</th>
                  <th className="p-3">Regular Hours</th>
                  <th className="p-3">Overtime</th>
                  <th className="p-3">Late (Mins)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-900">{att.date}</td>
                    <td className="p-3"><StatusBadge status={att.status} /></td>
                    <td className="p-3 font-mono text-slate-700">{att.time_in} - {att.time_out}</td>
                    <td className="p-3 font-semibold">{att.regular_hours} hrs</td>
                    <td className="p-3 font-semibold text-emerald-700">{att.overtime_hours} hrs</td>
                    <td className="p-3 text-slate-600">{att.late_minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: LEAVE */}
      {activeTab === 'leave' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Leave Requests & Approved Time-Off</h3>
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No leave requests submitted.</p>
            ) : (
              leaveRequests.map((lvr) => (
                <div key={lvr.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Vacation / Sick Leave ({lvr.total_days} Days)</span>
                    <p className="text-slate-500 font-mono mt-0.5">{lvr.start_date} → {lvr.end_date}</p>
                    <p className="text-slate-600 mt-1">Reason: "{lvr.reason}"</p>
                  </div>
                  <StatusBadge status={lvr.status} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 9: PAYROLL & PAYSLIPS */}
      {activeTab === 'payroll' && isAdmin && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Employee Payroll History & Payslips</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{payrollHistory.length} Total Records</span>
          </div>

          {payrollHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <PesoIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No payroll records or payslips generated yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
                Payroll entries and printable PDF payslips will automatically appear here once payroll periods are generated and processed in the Payroll module.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 pl-4">Period</th>
                    <th className="p-3">Days Worked</th>
                    <th className="p-3">Gross Pay</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3">Net Pay</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollHistory.map((rec) => {
                    const period = payrollPeriods.find(p => p.id === rec.payroll_period_id);
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-900">
                          {period?.period_code || 'Period'}
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{rec.days_worked} days</td>
                        <td className="p-3 font-mono text-slate-800">{formatCurrency(rec.gross_pay)}</td>
                        <td className="p-3 font-mono text-slate-600">{formatCurrency(rec.total_deductions)}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{formatCurrency(rec.net_pay)}</td>
                        <td className="p-3"><StatusBadge status={rec.status} /></td>
                        <td className="p-3 pr-4 text-right">
                          <button
                            onClick={() => setSelectedPayslip({ record: rec, period })}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            View Payslip PDF
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Employee Document"
        subtitle={`Uploading for ${employee.first_name} ${employee.last_name} (${employee.employee_id})`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Category *</label>
            <select
              required
              value={uploadData.category_id}
              onChange={(e) => setUploadData({ ...uploadData, category_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            >
              <option value="">-- Select Category --</option>
              {docCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.group_type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Name / Title *</label>
            <input
              type="text"
              required
              value={uploadData.document_name}
              onChange={(e) => setUploadData({ ...uploadData, document_name: e.target.value })}
              placeholder="e.g. BOSH Safety Certificate, SSS E-1 Form"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expiration Date (Optional)</label>
            <input
              type="date"
              value={uploadData.expiration_date}
              onChange={(e) => setUploadData({ ...uploadData, expiration_date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={uploadData.notes}
              onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
              placeholder="e.g. 40-hr DOLE Accredited"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          {/* File Picker & Mobile Camera Capture */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf, .jpg, .jpeg, .png, .docx, .xlsx"
              className="hidden"
            />
            {/* Mobile Direct Camera Input */}
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 shadow-2xs"
              >
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Select File (PDF, DOCX, IMG)</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo (Mobile Camera)</span>
              </button>
            </div>

            {uploadData.file && (
              <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 font-medium text-xs">
                Selected: {uploadData.file.name} ({(uploadData.file.size / 1024).toFixed(0)} KB)
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !uploadData.file}
              className={`px-6 py-2 rounded-xl font-bold text-white shadow-sm transition-all ${
                uploadData.file && !isUploading
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Save Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.document_name || 'Document Preview'}
        subtitle={previewDoc?.file_name}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 max-h-[60vh] overflow-y-auto flex items-center justify-center">
            {previewDoc?.file_type?.startsWith('image/') || previewDoc?.file_path?.startsWith('data:image') || previewDoc?.file_path?.includes('unsplash') ? (
              <img
                src={previewDoc.file_path}
                alt={previewDoc.document_name}
                className="max-w-full max-h-[50vh] rounded-xl object-contain shadow-md"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-slate-900 text-sm">{previewDoc?.document_name}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{previewDoc?.file_name}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setPreviewDoc(null)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>

      {/* PAYSLIP MODAL */}
      {selectedPayslip && (
        <PayslipModal
          isOpen={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          record={selectedPayslip.record}
          employee={employee}
          period={selectedPayslip.period}
        />
      )}

      {/* EMPLOYEE EDIT MODAL */}
      <EmployeeCreateEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employeeToEdit={employee}
        onSaved={loadData}
      />
    </div>
  );
};

export default EmployeeProfilePage;
