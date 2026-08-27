// Clean Master Seed Data for Project Lunayve Construction HRMS
export const initialDepartments = [
  { id: 'dept-1', code: 'EXEC', name: 'Executive & Management', description: 'Corporate officers and executive team', is_active: true },
  { id: 'dept-2', code: 'HR', name: 'Human Resources', description: 'Talent, payroll, relations, and labor compliance', is_active: true },
  { id: 'dept-3', code: 'FIN', name: 'Finance & Accounting', description: 'Financial planning, accounting, and disbursements', is_active: true },
  { id: 'dept-4', code: 'ENG', name: 'Engineering & Architecture', description: 'Structural, civil, MEP engineering and design', is_active: true },
  { id: 'dept-5', code: 'OPS', name: 'Construction Operations', description: 'Site execution, superintendents, and workforce crews', is_active: true },
  { id: 'dept-6', code: 'HSE', name: 'Safety & HSE', description: 'Health, safety, environment and DOLE OSH compliance', is_active: true },
  { id: 'dept-7', code: 'PROC', name: 'Procurement & Logistics', description: 'Material sourcing, heavy equipment, and warehousing', is_active: true },
  { id: 'dept-8', code: 'QAQC', name: 'Quality Assurance & QC', description: 'Standards testing, inspection, and material compliance', is_active: true }
];

export const initialDesignations = [
  // Office / Professional
  { id: 'desig-proc', code: 'PROC_OFF', title: 'Procurement Officer', workforce_category: 'office', department_id: 'dept-7', is_active: true },
  { id: 'desig-hr', code: 'HR_OFF', title: 'HR Officer', workforce_category: 'office', department_id: 'dept-2', is_active: true },
  { id: 'desig-arch', code: 'PRJ_ARCH', title: 'Project Architect', workforce_category: 'office', department_id: 'dept-4', is_active: true },
  { id: 'desig-pm', code: 'PM', title: 'Project Manager', workforce_category: 'office', department_id: 'dept-4', is_active: true },
  { id: 'desig-ce', code: 'SR_CE', title: 'Senior Civil Engineer', workforce_category: 'office', department_id: 'dept-4', is_active: true },
  { id: 'desig-safety', code: 'SAFETY_OFF', title: 'Safety Officer (SO3/SO4)', workforce_category: 'office', department_id: 'dept-6', is_active: true },
  { id: 'desig-payroll', code: 'PAYROLL_SPEC', title: 'Payroll Specialist', workforce_category: 'office', department_id: 'dept-3', is_active: true },

  // Site / Skilled Construction Workers
  { id: 'desig-foreman', code: 'GEN_FOREMAN', title: 'General Site Foreman', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-sup', code: 'SITE_SUP', title: 'Site Supervisor', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-carp', code: 'CARP_LEAD', title: 'Master Formwork Carpenter', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-mason', code: 'MASON_LEAD', title: 'Finishing Mason', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-elec', code: 'ELEC_MASTER', title: 'Master Construction Electrician', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-weld', code: 'WELD_SMAW', title: 'SMAW/GTAW Certified Welder', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-steel', code: 'STEELMAN', title: 'Rebar Steelman', workforce_category: 'site', department_id: 'dept-5', is_active: true },
  { id: 'desig-labor', code: 'LABOR_GEN', title: 'General Site Laborer', workforce_category: 'site', department_id: 'dept-5', is_active: true }
];

export const initialProjects = [
  {
    id: 'prj-1',
    project_code: 'PRJ-2026-ALPHA',
    name: 'Lunayve Commercial Tower Alpha',
    client: 'Megaworld Prime Holdings',
    location: 'Emerald Ave., Ortigas Center, Pasig City',
    project_manager_name: 'Michellen Serrano',
    project_manager_id: 'emp-3',
    start_date: '2026-01-15',
    end_date: '2027-12-31',
    estimated_budget: 450000000.00,
    status: 'Active',
    description: '45-Storey Grade-A Commercial High-Rise Tower with 5-level basement parking.'
  }
];

export const initialSites = [
  {
    id: 'site-1',
    site_code: 'SITE-ALPHA-01',
    name: 'Tower Alpha - Core & Superstructure',
    project_id: 'prj-1',
    location: 'Zone A - Ortigas Sector, Pasig',
    site_supervisor_name: 'Rolando Mendoza',
    foreman_name: 'Danilo Cruz',
    start_date: '2026-01-15',
    end_date: '2027-10-15',
    status: 'Active'
  }
];

export const initialDocumentCategories = [
  { id: 'cat-1', name: 'Government Identification (SSS/TIN/PhilHealth/ID)', group_type: 'Government' },
  { id: 'cat-2', name: 'Employment Contracts & Appointment Letters', group_type: 'Employment' },
  { id: 'cat-3', name: 'DOLE / OSH Safety & Site Induction Pass', group_type: 'Construction / Site' },
  { id: 'cat-4', name: 'PRC Professional License & Board Certifications', group_type: 'Personal' },
  { id: 'cat-5', name: 'Medical Clearance & Fit to Work', group_type: 'Personal' }
];

export const initialEmployees = [
  // 1. John Marc Guerra | Procurement Officer
  {
    id: 'emp-1',
    employee_id: 'PLN-2026-001',
    first_name: 'John Marc',
    middle_name: '',
    last_name: 'Guerra',
    suffix: '',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80',
    workforce_category: 'office',
    date_of_birth: '1992-04-18',
    gender: 'Male',
    civil_status: 'Single',
    nationality: 'Filipino',
    contact_number: '+63 917 842 1093',
    email: 'jm.guerra@lunayveconstruction.com',
    address: 'Ortigas Center, Pasig City, Metro Manila',
    emergency_contact_name: 'Elena Guerra',
    emergency_contact_number: '+63 917 223 9940',
    emergency_contact_relation: 'Parent',
    employment_type: 'Regular',
    employment_status: 'Active',
    department_id: 'dept-7', // Procurement
    designation_id: 'desig-proc', // Procurement Officer
    date_hired: '2024-02-01',
    assigned_project_id: 'prj-1',
    assigned_site_id: 'site-1',
    supervisor_name: 'Bernardo Alcantara',
    rate_type: 'Monthly',
    base_rate: 55000.00,
    monthly_allowance: 5000.00,
    daily_allowance: 0,
    sss_number: '34-8920194-2',
    philhealth_number: '19-029481920-1',
    pagibig_number: '1210-9842-1092',
    tin_number: '284-910-482-000'
  },

  // 2. Jaquelyn Espina | HR
  {
    id: 'emp-2',
    employee_id: 'PLN-2026-002',
    first_name: 'Jaquelyn',
    middle_name: '',
    last_name: 'Espina',
    suffix: '',
    profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80',
    workforce_category: 'office',
    date_of_birth: '1994-08-22',
    gender: 'Female',
    civil_status: 'Single',
    nationality: 'Filipino',
    contact_number: '+63 920 714 8392',
    email: 'j.espina@lunayveconstruction.com',
    address: 'Mandaluyong City, Metro Manila',
    emergency_contact_name: 'Marites Espina',
    emergency_contact_number: '+63 920 119 4820',
    emergency_contact_relation: 'Parent',
    employment_type: 'Regular',
    employment_status: 'Active',
    department_id: 'dept-2', // HR
    designation_id: 'desig-hr', // HR Officer
    date_hired: '2023-06-15',
    assigned_project_id: '',
    assigned_site_id: '',
    supervisor_name: 'Executive Management',
    rate_type: 'Monthly',
    base_rate: 60000.00,
    monthly_allowance: 6000.00,
    daily_allowance: 0,
    sss_number: '33-7281940-5',
    philhealth_number: '12-984019283-4',
    pagibig_number: '1210-3849-0193',
    tin_number: '394-102-948-000'
  },

  // 3. Michellen Serrano | Project Architect
  {
    id: 'emp-3',
    employee_id: 'PLN-2026-003',
    first_name: 'Michellen',
    middle_name: '',
    last_name: 'Serrano',
    suffix: '',
    profile_photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&fit=crop&q=80',
    workforce_category: 'office',
    date_of_birth: '1990-11-14',
    gender: 'Female',
    civil_status: 'Single',
    nationality: 'Filipino',
    contact_number: '+63 918 392 0184',
    email: 'm.serrano@lunayveconstruction.com',
    address: 'BGC, Taguig City, Metro Manila',
    emergency_contact_name: 'Rodrigo Serrano',
    emergency_contact_number: '+63 918 440 9182',
    emergency_contact_relation: 'Parent',
    employment_type: 'Regular',
    employment_status: 'Active',
    department_id: 'dept-4', // Engineering & Architecture
    designation_id: 'desig-arch', // Project Architect
    date_hired: '2023-01-10',
    assigned_project_id: 'prj-1',
    assigned_site_id: 'site-1',
    supervisor_name: 'Executive Management',
    rate_type: 'Monthly',
    base_rate: 75000.00,
    monthly_allowance: 8000.00,
    daily_allowance: 0,
    sss_number: '34-1029384-9',
    philhealth_number: '18-293840192-7',
    pagibig_number: '1210-9382-0199',
    tin_number: '482-193-840-000'
  }
];

export const initialSiteAssignments = [
  {
    id: 'assign-1',
    employee_id: 'emp-1',
    project_id: 'prj-1',
    site_id: 'site-1',
    role_in_site: 'Procurement Officer',
    assigned_by_name: 'System Admin',
    start_date: '2024-02-01',
    end_date: null,
    status: 'Active',
    transfer_reason: 'Initial assignment to Tower Alpha'
  },
  {
    id: 'assign-2',
    employee_id: 'emp-3',
    project_id: 'prj-1',
    site_id: 'site-1',
    role_in_site: 'Project Architect',
    assigned_by_name: 'System Admin',
    start_date: '2023-01-10',
    end_date: null,
    status: 'Active',
    transfer_reason: 'Lead architectural supervision'
  }
];

export const initialDocuments = [
  {
    id: 'doc-1',
    employee_id: 'emp-1',
    category_id: 'cat-2',
    document_name: 'Employment Contract - Procurement Officer',
    file_name: 'John_Marc_Guerra_Contract.pdf',
    file_path: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600',
    file_type: 'application/pdf',
    file_size: 420000,
    upload_date: '2024-02-01',
    expiration_date: null,
    uploader_name: 'System Administrator'
  },
  {
    id: 'doc-2',
    employee_id: 'emp-3',
    category_id: 'cat-4',
    document_name: 'PRC Board Certificate in Architecture',
    file_name: 'PRC_Board_Michellen_Serrano.pdf',
    file_path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    file_type: 'application/pdf',
    file_size: 380000,
    upload_date: '2023-01-10',
    expiration_date: '2027-11-14',
    uploader_name: 'System Administrator'
  }
];

export const initialLeaveTypes = [
  { id: 'leave-1', code: 'VL', name: 'Vacation Leave', days_allowed_per_year: 15, is_paid: true },
  { id: 'leave-2', code: 'SL', name: 'Sick Leave', days_allowed_per_year: 15, is_paid: true },
  { id: 'leave-3', code: 'EL', name: 'Emergency / Calamity Leave', days_allowed_per_year: 5, is_paid: true }
];

export const initialLeaveRequests = [];

export const initialGovernmentRules = [
  {
    id: 'gov-1',
    agency: 'SSS',
    rule_name: 'SSS Standard Contribution Table 2026 (14% Rate)',
    effective_date: '2026-01-01',
    min_base: 5000,
    max_base: 35000,
    employee_share_pct: 0.045,
    employer_share_pct: 0.095,
    employee_fixed_amount: 0,
    employer_fixed_amount: 30,
    is_active: true
  },
  {
    id: 'gov-2',
    agency: 'PhilHealth',
    rule_name: 'PhilHealth Premium 2026 (5.0% Equal Share)',
    effective_date: '2026-01-01',
    min_base: 10000,
    max_base: 100000,
    employee_share_pct: 0.025,
    employer_share_pct: 0.025,
    employee_fixed_amount: 0,
    employer_fixed_amount: 0,
    is_active: true
  },
  {
    id: 'gov-3',
    agency: 'Pag-IBIG',
    rule_name: 'Pag-IBIG Mandatory Contribution 2026 (₱200 Cap)',
    effective_date: '2026-01-01',
    min_base: 1500,
    max_base: 10000,
    employee_share_pct: 0.02,
    employer_share_pct: 0.02,
    employee_fixed_amount: 200,
    employer_fixed_amount: 200,
    is_active: true
  }
];

export const initialPayrollPeriods = [];
export const initialAuditLogs = [
  {
    id: 'log-1',
    user_name: 'System Administrator',
    user_role: 'admin',
    action: 'Database initialized for live operations',
    module: 'System',
    record_id: 'SYS-INIT',
    created_at: new Date().toISOString()
  }
];

export const initialNotifications = [];
