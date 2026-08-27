-- ==============================================================================
-- PROJECT LUNAYVE CONSTRUCTION HRMS - COMPLETE RESET & CLEAN SEED FOR SUPABASE
-- Run this in the Supabase SQL Editor to wipe old data and seed the 3 employees.
-- ==============================================================================

-- 1. CLEAN RESET: Clear all existing tables
TRUNCATE TABLE 
  audit_logs,
  notifications,
  payroll_records,
  payroll_periods,
  leave_requests,
  attendance,
  employee_documents,
  employee_site_assignments,
  employees,
  sites,
  projects,
  designations,
  departments,
  document_categories,
  leave_types,
  government_contribution_rules,
  company_settings
CASCADE;

-- 2. DEPARTMENTS
INSERT INTO departments (id, code, name, description) VALUES
('a1000000-0000-4000-8000-000000000001', 'EXEC', 'Executive Management', 'Corporate officers and administration'),
('a1000000-0000-4000-8000-000000000002', 'HR', 'Human Resources', 'Workforce relations and talent management'),
('a1000000-0000-4000-8000-000000000003', 'FIN', 'Finance & Accounting', 'Finance, payroll, and taxation'),
('a1000000-0000-4000-8000-000000000004', 'ENG', 'Engineering & Architecture', 'Design, structural, and architectural planning'),
('a1000000-0000-4000-8000-000000000005', 'OPS', 'Construction Operations', 'On-site execution, skilled trades, and superintendents'),
('a1000000-0000-4000-8000-000000000006', 'HSE', 'Safety & HSE', 'DOLE OSH and site health & safety compliance'),
('a1000000-0000-4000-8000-000000000007', 'PROC', 'Procurement & Logistics', 'Material sourcing and heavy equipment dispatch')
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- 3. DESIGNATIONS
INSERT INTO designations (id, code, title, workforce_category, department_id) VALUES
('b1000000-0000-4000-8000-000000000001', 'PROC_OFF', 'Procurement Officer', 'office', 'a1000000-0000-4000-8000-000000000007'),
('b1000000-0000-4000-8000-000000000002', 'HR_OFF', 'HR Officer', 'office', 'a1000000-0000-4000-8000-000000000002'),
('b1000000-0000-4000-8000-000000000003', 'PRJ_ARCH', 'Project Architect', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000004', 'PM', 'Project Manager', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000005', 'SITE_SUP', 'Site Supervisor', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000006', 'GEN_FOREMAN', 'General Site Foreman', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000007', 'CARP_LEAD', 'Master Formwork Carpenter', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000008', 'MASON_LEAD', 'Finishing Mason', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000009', 'ELEC_MASTER', 'Master Construction Electrician', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000010', 'WELD_SMAW', 'SMAW/GTAW Certified Welder', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000011', 'STEELMAN', 'Rebar Steelman', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000012', 'LABOR_GEN', 'General Site Laborer', 'site', 'a1000000-0000-4000-8000-000000000005')
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title;

-- 4. PROJECTS & CONSTRUCTION SITES
INSERT INTO projects (id, project_code, name, client, location, project_manager_name, start_date, end_date, estimated_budget, status, description) VALUES
('c1000000-0000-4000-8000-000000000001', 'PRJ-2026-ALPHA', 'Lunayve Commercial Tower Alpha', 'Megaworld Prime Holdings', 'Ortigas Center, Pasig City', 'Michellen Serrano', '2026-01-15', '2027-12-31', 450000000.00, 'Active', '45-Storey Grade-A Commercial High-Rise Tower with 5-level basement parking.')
ON CONFLICT (project_code) DO NOTHING;

INSERT INTO sites (id, site_code, name, project_id, location, site_supervisor_name, foreman_name, start_date, end_date, status) VALUES
('d1000000-0000-4000-8000-000000000001', 'SITE-ALPHA-01', 'Tower Alpha - Core & Superstructure', 'c1000000-0000-4000-8000-000000000001', 'Ortigas Central Sector, Pasig', 'Rolando Mendoza', 'Danilo Cruz', '2026-01-15', '2027-10-15', 'Active')
ON CONFLICT (site_code) DO NOTHING;

-- 5. DOCUMENT CATEGORIES
INSERT INTO document_categories (id, name, group_type, description) VALUES
('e1000000-0000-4000-8000-000000000001', 'Government Identification (SSS/TIN/PhilHealth/ID)', 'Government', 'Primary government ID cards and registrations'),
('e1000000-0000-4000-8000-000000000002', 'Employment Contracts & Appointment Letters', 'Employment', 'Signed employment contracts and appointment terms'),
('e1000000-0000-4000-8000-000000000003', 'DOLE / OSH Safety & Site Induction Pass', 'Construction / Site', 'BOSH/COSH certificates and site safety passes'),
('e1000000-0000-4000-8000-000000000004', 'PRC Professional License & Board Certifications', 'Personal', 'PRC engineering, architecture, and professional boards'),
('e1000000-0000-4000-8000-000000000005', 'Medical Clearance & Fit to Work', 'Personal', 'Annual medical examination clearance')
ON CONFLICT (name) DO NOTHING;

-- 6. LEAVE TYPES
INSERT INTO leave_types (id, code, name, days_allowed_per_year, is_paid) VALUES
('f1000000-0000-4000-8000-000000000001', 'VL', 'Vacation Leave', 15, true),
('f1000000-0000-4000-8000-000000000002', 'SL', 'Sick Leave', 15, true),
('f1000000-0000-4000-8000-000000000003', 'EL', 'Emergency / Calamity Leave', 5, true)
ON CONFLICT (code) DO NOTHING;

-- 7. GOVERNMENT CONTRIBUTION RULES (SSS, PhilHealth, Pag-IBIG, BIR Tax)
INSERT INTO government_contribution_rules (id, agency, rule_name, effective_date, min_base, max_base, employee_share_pct, employer_share_pct, employee_fixed_amount, employer_fixed_amount, is_active) VALUES
('f2000000-0000-4000-8000-000000000001', 'SSS', 'SSS Standard Contribution Table 2026 (14% Rate)', '2026-01-01', 5000.00, 35000.00, 0.045, 0.095, 0, 30.00, true),
('f2000000-0000-4000-8000-000000000002', 'PhilHealth', 'PhilHealth Premium 2026 (5.0% Equal Share)', '2026-01-01', 10000.00, 100000.00, 0.025, 0.025, 0, 0, true),
('f2000000-0000-4000-8000-000000000003', 'Pag-IBIG', 'Pag-IBIG Mandatory Contribution 2026 (₱200 Cap)', '2026-01-01', 1500.00, 10000.00, 0.02, 0.02, 200.00, 200.00, true)
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL REAL WORKFORCE (The 3 Employees)
INSERT INTO employees (
  id, employee_id, first_name, middle_name, last_name, suffix, profile_photo,
  workforce_category, date_of_birth, gender, civil_status, nationality, contact_number, email, address,
  employment_type, employment_status, department_id, designation_id, date_hired,
  assigned_project_id, assigned_site_id, rate_type, base_rate, monthly_allowance, daily_allowance,
  sss_number, philhealth_number, pagibig_number, tin_number
) VALUES
-- 1. John Marc Guerra | Procurement Officer
(
  'f3000000-0000-4000-8000-000000000001',
  'PLN-2026-001',
  'John Marc',
  '',
  'Guerra',
  '',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80',
  'office',
  '1992-04-18',
  'Male',
  'Single',
  'Filipino',
  '+63 917 842 1093',
  'jm.guerra@lunayveconstruction.com',
  'Ortigas Center, Pasig City, Metro Manila',
  'Regular',
  'Active',
  'a1000000-0000-4000-8000-000000000007', -- Procurement & Logistics Dept
  'b1000000-0000-4000-8000-000000000001', -- Procurement Officer
  '2024-02-01',
  'c1000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001',
  'Monthly',
  55000.00,
  5000.00,
  0,
  '34-8920194-2',
  '19-029481920-1',
  '1210-9842-1092',
  '284-910-482-000'
),

-- 2. Jaquelyn Espina | HR
(
  'f3000000-0000-4000-8000-000000000002',
  'PLN-2026-002',
  'Jaquelyn',
  '',
  'Espina',
  '',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80',
  'office',
  '1994-08-22',
  'Female',
  'Single',
  'Filipino',
  '+63 920 714 8392',
  'j.espina@lunayveconstruction.com',
  'Mandaluyong City, Metro Manila',
  'Regular',
  'Active',
  'a1000000-0000-4000-8000-000000000002', -- Human Resources Dept
  'b1000000-0000-4000-8000-000000000002', -- HR Officer
  '2023-06-15',
  NULL,
  NULL,
  'Monthly',
  60000.00,
  6000.00,
  0,
  '33-7281940-5',
  '12-984019283-4',
  '1210-3849-0193',
  '394-102-948-000'
),

-- 3. Michellen Serrano | Project Architect
(
  'f3000000-0000-4000-8000-000000000003',
  'PLN-2026-003',
  'Michellen',
  '',
  'Serrano',
  '',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&fit=crop&q=80',
  'office',
  '1990-11-14',
  'Female',
  'Single',
  'Filipino',
  '+63 918 392 0184',
  'm.serrano@lunayveconstruction.com',
  'BGC, Taguig City, Metro Manila',
  'Regular',
  'Active',
  'a1000000-0000-4000-8000-000000000004', -- Engineering & Architecture Dept
  'b1000000-0000-4000-8000-000000000003', -- Project Architect
  '2023-01-10',
  'c1000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000001',
  'Monthly',
  75000.00,
  8000.00,
  0,
  '34-1029384-9',
  '18-293840192-7',
  '1210-9382-0199',
  '482-193-840-000'
)
ON CONFLICT (employee_id) DO NOTHING;

-- 9. COMPANY SETTINGS
INSERT INTO company_settings (id, company_name, company_address, contact_email, contact_number, tax_id, currency, currency_symbol) VALUES
('f4000000-0000-4000-8000-000000000001', 'Project Lunayve Construction', 'Ortigas Center, Pasig City, Metro Manila, Philippines', 'hr@lunayveconstruction.com', '+63 2 8123 4567', '009-876-543-000', 'PHP', '₱')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;
