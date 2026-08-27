-- ==============================================================================
-- PROJECT LUNAYVE CONSTRUCTION HRMS - SEED DATA FOR SUPABASE
-- All UUIDs are strictly valid RFC-4122 hexadecimal format [0-9a-f]
-- Run this in the Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, code, name, description) VALUES
('a1000000-0000-4000-8000-000000000001', 'EXEC', 'Executive & Management', 'Corporate officers and executive management'),
('a1000000-0000-4000-8000-000000000002', 'HR', 'Human Resources', 'Workforce management, talent relations, and labor compliance'),
('a1000000-0000-4000-8000-000000000003', 'FIN', 'Finance & Accounting', 'Corporate finance, taxation, disbursements, and audits'),
('a1000000-0000-4000-8000-000000000004', 'ENG', 'Engineering & Architecture', 'Structural, civil, MEP engineering, and architectural design'),
('a1000000-0000-4000-8000-000000000005', 'OPS', 'Construction Operations', 'On-site execution, superintendents, skilled trades, and labor crews'),
('a1000000-0000-4000-8000-000000000006', 'HSE', 'Safety & HSE', 'Health, safety, environmental, and DOLE OSH compliance'),
('a1000000-0000-4000-8000-000000000007', 'PROC', 'Procurement & Logistics', 'Material sourcing, heavy equipment dispatch, and warehousing'),
('a1000000-0000-4000-8000-000000000008', 'QAQC', 'Quality Assurance & QC', 'Material compliance testing and structural inspection')
ON CONFLICT (code) DO NOTHING;

-- 2. DESIGNATIONS (Positions mapped to Workforce Category)
INSERT INTO designations (id, code, title, workforce_category, department_id) VALUES
-- Office / Professional
('b1000000-0000-4000-8000-000000000001', 'PM', 'Project Manager', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000002', 'SR_CE', 'Senior Civil Engineer', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000003', 'STRUCT_ENG', 'Structural Engineer', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000004', 'ARCH', 'Senior Architect', 'office', 'a1000000-0000-4000-8000-000000000004'),
('b1000000-0000-4000-8000-000000000005', 'HR_MGR', 'HR Manager', 'office', 'a1000000-0000-4000-8000-000000000002'),
('b1000000-0000-4000-8000-000000000006', 'HR_OFFICER', 'HR & Labor Relations Officer', 'office', 'a1000000-0000-4000-8000-000000000002'),
('b1000000-0000-4000-8000-000000000007', 'PAYROLL_SPEC', 'Payroll Specialist', 'office', 'a1000000-0000-4000-8000-000000000003'),
('b1000000-0000-4000-8000-000000000008', 'SAFETY_OFF', 'Safety Officer (SO3/SO4)', 'office', 'a1000000-0000-4000-8000-000000000006'),

-- Site / Skilled Construction Workers
('b1000000-0000-4000-8000-000000000009', 'GEN_FOREMAN', 'General Site Foreman', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000010', 'SITE_SUP', 'Site Supervisor', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000011', 'CARP_LEAD', 'Master Formwork Carpenter', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000012', 'MASON_LEAD', 'Finishing Mason', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000013', 'ELEC_MASTER', 'Master Construction Electrician', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000014', 'WELD_SMAW', 'SMAW/GTAW Certified Welder', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000015', 'STEELMAN', 'Rebar Steelman', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000016', 'EQ_OP_TOWER', 'Tower Crane Operator', 'site', 'a1000000-0000-4000-8000-000000000005'),
('b1000000-0000-4000-8000-000000000017', 'LABOR_GEN', 'General Site Laborer', 'site', 'a1000000-0000-4000-8000-000000000005')
ON CONFLICT (code) DO NOTHING;

-- 3. PROJECTS
INSERT INTO projects (id, project_code, name, client, location, project_manager_name, start_date, end_date, estimated_budget, status, description) VALUES
('c1000000-0000-4000-8000-000000000001', 'PRJ-2026-ALPHA', 'Lunayve Tower Alpha', 'Megaworld Prime Holdings', 'Emerald Ave., Ortigas Center, Pasig City', 'Engr. Bernardo Alcantara', '2025-06-01', '2027-12-31', 450000000.00, 'Active', '45-Storey Grade-A Commercial High-Rise Tower with 5-level basement parking.'),
('c1000000-0000-4000-8000-000000000002', 'PRJ-2026-BAY', 'Bay Horizon Residences', 'Anchor Land Development', 'Aseana Business Park, Parañaque City', 'Arch. Christine Reyes', '2025-09-15', '2028-03-30', 680000000.00, 'Active', 'Triple-tower luxury residential seaside condominium with resort-style podium amenities.'),
('c1000000-0000-4000-8000-000000000003', 'PRJ-2026-HUB', 'Lunayve East Logistics Hub', 'Eastern Express Logistics Inc.', 'Felix Ave., Cainta, Rizal', 'Engr. Daniel Villanueva', '2026-01-10', '2026-11-20', 185000000.00, 'Active', '120,000 sqm high-clearance smart distribution logistics facility and cold storage center.')
ON CONFLICT (project_code) DO NOTHING;

-- 4. SITES
INSERT INTO sites (id, site_code, name, project_id, location, site_supervisor_name, foreman_name, start_date, end_date, status) VALUES
('d1000000-0000-4000-8000-000000000001', 'SITE-ALPHA-01', 'Tower Alpha - Substructure & Basements', 'c1000000-0000-4000-8000-000000000001', 'Zone A - Excavation & Mat Foundation, Ortigas', 'Rolando Mendoza', 'Danilo Cruz', '2025-06-01', '2026-06-30', 'Active'),
('d1000000-0000-4000-8000-000000000002', 'SITE-ALPHA-02', 'Tower Alpha - Superstructure & Core', 'c1000000-0000-4000-8000-000000000001', 'Zone B - Shear Wall & Concrete Decking, Ortigas', 'Rolando Mendoza', 'Arturo Santos', '2026-02-01', '2027-10-15', 'Active'),
('d1000000-0000-4000-8000-000000000003', 'SITE-BAY-01', 'Bay Horizon - Tower 1 Main Structure', 'c1000000-0000-4000-8000-000000000002', 'Seaside Wing, Aseana Park', 'Efren Bautista', 'Nestor Ramos', '2025-09-15', '2027-08-30', 'Active'),
('d1000000-0000-4000-8000-000000000004', 'SITE-BAY-02', 'Bay Horizon - Podium & Deep Foundation', 'c1000000-0000-4000-8000-000000000002', 'Central Plaza & Podium Deck, Aseana', 'Efren Bautista', 'Jose Valenzuela', '2025-10-01', '2026-12-15', 'Active'),
('d1000000-0000-4000-8000-000000000005', 'SITE-HUB-01', 'Logistics Hub - Precast Bays & Slab', 'c1000000-0000-4000-8000-000000000003', 'Main Logistics Bay 1-4, Cainta', 'Fernando Gutierrez', 'Rodrigo Morales', '2026-01-10', '2026-11-20', 'Active')
ON CONFLICT (site_code) DO NOTHING;

-- 5. DOCUMENT CATEGORIES
INSERT INTO document_categories (id, name, group_type, description) VALUES
('e1000000-0000-4000-8000-000000000001', 'Government Identification (SSS/TIN/PhilHealth/ID)', 'Government', 'Primary government ID cards and registrations'),
('e1000000-0000-4000-8000-000000000002', 'Employment Contracts & Offer Letters', 'Employment', 'Signed contracts, project agreements, and terms'),
('e1000000-0000-4000-8000-000000000003', 'DOLE / OSH Safety & Site Induction Pass', 'Construction / Site', '40-hr BOSH/COSH certificates and safety passes'),
('e1000000-0000-4000-8000-000000000004', 'TESDA National Competency (NC II / NC III)', 'Construction / Site', 'Trade competency and skills assessment certifications'),
('e1000000-0000-4000-8000-000000000005', 'Heavy Equipment / Crane Operator License', 'Construction / Site', 'Specialized crane and machinery operation licenses'),
('e1000000-0000-4000-8000-000000000006', 'PRC Professional License & Certifications', 'Personal', 'Civil engineering, architecture, and accounting boards'),
('e1000000-0000-4000-8000-000000000007', 'Medical Clearance & Drug Test', 'Personal', 'Annual fit-to-work and site medical screening')
ON CONFLICT (name) DO NOTHING;

-- 6. LEAVE TYPES
INSERT INTO leave_types (id, code, name, days_allowed_per_year, is_paid) VALUES
('f1000000-0000-4000-8000-000000000001', 'VL', 'Vacation Leave', 15, true),
('f1000000-0000-4000-8000-000000000002', 'SL', 'Sick Leave', 15, true),
('f1000000-0000-4000-8000-000000000003', 'EL', 'Emergency / Calamity Leave', 5, true),
('f1000000-0000-4000-8000-000000000004', 'SPL', 'Solo Parent Leave', 7, true)
ON CONFLICT (code) DO NOTHING;

-- 7. GOVERNMENT CONTRIBUTION RULES (SSS, PhilHealth, Pag-IBIG, BIR Tax)
INSERT INTO government_contribution_rules (id, agency, rule_name, effective_date, min_base, max_base, employee_share_pct, employer_share_pct, employee_fixed_amount, employer_fixed_amount, is_active) VALUES
('f2000000-0000-4000-8000-000000000001', 'SSS', 'SSS Standard Contribution Table 2026 (14% Rate)', '2026-01-01', 5000.00, 35000.00, 0.045, 0.095, 0, 30.00, true),
('f2000000-0000-4000-8000-000000000002', 'PhilHealth', 'PhilHealth Premium 2026 (5.0% Equal Share)', '2026-01-01', 10000.00, 100000.00, 0.025, 0.025, 0, 0, true),
('f2000000-0000-4000-8000-000000000003', 'Pag-IBIG', 'Pag-IBIG Mandatory Contribution 2026 (₱200 Cap)', '2026-01-01', 1500.00, 10000.00, 0.02, 0.02, 200.00, 200.00, true)
ON CONFLICT (id) DO NOTHING;

-- 8. SAMPLE EMPLOYEES (Master Workforce)
INSERT INTO employees (
  id, employee_id, first_name, middle_name, last_name, suffix, profile_photo,
  workforce_category, date_of_birth, gender, civil_status, nationality, contact_number, email, address,
  employment_type, employment_status, department_id, designation_id, date_hired,
  assigned_project_id, assigned_site_id, rate_type, base_rate, monthly_allowance, daily_allowance,
  sss_number, philhealth_number, pagibig_number, tin_number
) VALUES
-- 1. Engr. Bernardo Alcantara (Office / PM)
('f3000000-0000-4000-8000-000000000001', 'PLN-2026-001', 'Bernardo', 'Cruz', 'Alcantara', 'Jr.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'office', '1984-05-12', 'Male', 'Married', 'Filipino', '+63 917 882 1941', 'b.alcantara@lunayveconstruction.com', '14 Jade St., Pasig City', 'Regular', 'Active', 'a1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000001', '2021-03-15', 'c1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Monthly', 95000.00, 12000.00, 0, '34-8921045-1', '19-029481940-3', '1210-9842-1940', '284-910-482-000'),

-- 2. Maria Elena Del Rosario (Office / HR Manager)
('f3000000-0000-4000-8000-000000000002', 'PLN-2026-002', 'Maria Elena', 'Santos', 'Del Rosario', '', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300', 'office', '1989-11-24', 'Female', 'Single', 'Filipino', '+63 920 914 3829', 'm.delrosario@lunayveconstruction.com', 'Pioneer Woodlands, Mandaluyong City', 'Regular', 'Active', 'a1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000005', '2022-01-10', NULL, NULL, 'Monthly', 75000.00, 8000.00, 0, '33-7281940-8', '12-984019283-1', '1210-3849-0192', '394-102-948-000'),

-- 3. Arch. Christine Reyes (Office / PM)
('f3000000-0000-4000-8000-000000000003', 'PLN-2026-003', 'Christine', 'Aquino', 'Reyes', '', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300', 'office', '1987-08-19', 'Female', 'Married', 'Filipino', '+63 918 732 1092', 'c.reyes@lunayveconstruction.com', 'BF Homes, Parañaque City', 'Regular', 'Active', 'a1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000004', '2021-08-01', 'c1000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000003', 'Monthly', 88000.00, 10000.00, 0, '34-1029384-2', '18-293840192-5', '1210-9382-0193', '482-193-840-000'),

-- 4. Rolando Mendoza (Site / Site Supervisor)
('f3000000-0000-4000-8000-000000000004', 'PLN-2026-007', 'Rolando', 'Dela Rosa', 'Mendoza', '', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300', 'site', '1978-03-10', 'Male', 'Married', 'Filipino', '+63 928 394 0192', 'r.mendoza@lunayveconstruction.com', 'Bgy. Rosario, Pasig City', 'Regular', 'Active', 'a1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000010', '2019-05-15', 'c1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Daily', 1350.00, 0, 200.00, '03-9182740-1', '12-094819283-0', '1210-4820-1928', '293-849-102-000'),

-- 5. Juan Dela Cruz (Site / Formwork Carpenter)
('f3000000-0000-4000-8000-000000000005', 'PLN-2026-009', 'Juan', 'Bautista', 'Dela Cruz', '', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300', 'site', '1990-06-25', 'Male', 'Married', 'Filipino', '+63 945 829 1048', 'j.delacruz@lunayveconstruction.com', 'Taguig City', 'Project-Based', 'Active', 'a1000000-0000-4000-8000-000000000005', 'b1000000-0000-4000-8000-000000000011', '2023-02-15', 'c1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Daily', 850.00, 0, 100.00, '03-7482910-3', '16-928401928-8', '1210-8492-1092', '482-910-482-000')
ON CONFLICT (employee_id) DO NOTHING;

-- 9. COMPANY SETTINGS
INSERT INTO company_settings (id, company_name, company_address, contact_email, contact_number, tax_id, currency, currency_symbol) VALUES
('f4000000-0000-4000-8000-000000000001', 'Project Lunayve Construction', 'Ortigas Center, Pasig City, Metro Manila, Philippines', 'hr@lunayveconstruction.com', '+63 2 8123 4567', '009-876-543-000', 'PHP', '₱')
ON CONFLICT (id) DO NOTHING;
