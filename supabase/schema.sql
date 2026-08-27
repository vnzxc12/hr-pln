-- ==============================================================================
-- PROJECT LUNAYVE CONSTRUCTION - HUMAN RESOURCE MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Complete Schema
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DESIGNATIONS (Positions mapped to Workforce Category)
CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    workforce_category VARCHAR(20) NOT NULL CHECK (workforce_category IN ('office', 'site')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    client VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    project_manager_name VARCHAR(100),
    project_manager_id UUID,
    start_date DATE NOT NULL,
    end_date DATE,
    estimated_budget NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Planned', 'Active', 'On Hold', 'Completed', 'Cancelled')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SITES (Under Projects)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    site_supervisor_name VARCHAR(100),
    site_supervisor_id UUID,
    foreman_name VARCHAR(100),
    foreman_id UUID,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed', 'Closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMPLOYEES (Master unified workforce)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(30) UNIQUE NOT NULL, -- e.g. PLN-2026-001
    first_name VARCHAR(60) NOT NULL,
    middle_name VARCHAR(60),
    last_name VARCHAR(60) NOT NULL,
    suffix VARCHAR(15),
    profile_photo TEXT,
    
    -- Workforce classification
    workforce_category VARCHAR(20) NOT NULL CHECK (workforce_category IN ('office', 'site')),
    
    -- Personal details
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Non-Binary', 'Other')),
    civil_status VARCHAR(20) CHECK (civil_status IN ('Single', 'Married', 'Widowed', 'Separated', 'Divorced')),
    nationality VARCHAR(50) DEFAULT 'Filipino',
    contact_number VARCHAR(30) NOT NULL,
    email VARCHAR(100) UNIQUE,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_number VARCHAR(30),
    emergency_contact_relation VARCHAR(50),

    -- Employment details
    employment_type VARCHAR(30) NOT NULL DEFAULT 'Regular' CHECK (employment_type IN ('Regular', 'Contractual', 'Project-Based', 'Probationary', 'Casual')),
    employment_status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (employment_status IN ('Active', 'Inactive', 'On Leave', 'Suspended', 'Resigned', 'Terminated', 'End of Contract')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    date_hired DATE NOT NULL,
    contract_start_date DATE,
    contract_end_date DATE,
    assigned_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assigned_site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    foreman_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    team_crew VARCHAR(100),
    date_assigned DATE,

    -- Government details
    sss_number VARCHAR(30),
    philhealth_number VARCHAR(30),
    pagibig_number VARCHAR(30),
    tin_number VARCHAR(30),
    other_gov_info TEXT,

    -- Compensation details
    rate_type VARCHAR(20) NOT NULL DEFAULT 'Monthly' CHECK (rate_type IN ('Monthly', 'Daily', 'Hourly')),
    base_rate NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    monthly_allowance NUMERIC(12,2) DEFAULT 0.00,
    daily_allowance NUMERIC(12,2) DEFAULT 0.00,

    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SITE ASSIGNMENT HISTORY
CREATE TABLE IF NOT EXISTS employee_site_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    position_title VARCHAR(100),
    supervisor_name VARCHAR(100),
    assignment_start DATE NOT NULL,
    assignment_end DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Transferred')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DOCUMENT CATEGORIES
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    group_type VARCHAR(30) NOT NULL CHECK (group_type IN ('Personal', 'Employment', 'Construction / Site', 'Government', 'Custom')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EMPLOYEE DOCUMENTS
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
    document_name VARCHAR(150) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    expiration_date DATE,
    uploaded_by UUID,
    uploader_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ATTENDANCE & TIME LOGS
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_in TIME,
    time_out TIME,
    regular_hours NUMERIC(5,2) DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    night_diff_hours NUMERIC(5,2) DEFAULT 0,
    holiday_hours NUMERIC(5,2) DEFAULT 0,
    rest_day_hours NUMERIC(5,2) DEFAULT 0,
    late_minutes INT DEFAULT 0,
    undertime_minutes INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'On Leave', 'Rest Day', 'Holiday', 'Half Day')),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- 10. LEAVE TYPES & LEAVE REQUESTS
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    days_allowed_per_year INT DEFAULT 15,
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    approved_by UUID,
    approver_name VARCHAR(100),
    approval_date TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. GOVERNMENT CONTRIBUTION RULES (Configurable tables)
CREATE TABLE IF NOT EXISTS government_contribution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency VARCHAR(30) NOT NULL CHECK (agency IN ('SSS', 'PhilHealth', 'Pag-IBIG', 'BIR_Tax')),
    rule_name VARCHAR(100) NOT NULL,
    effective_date DATE NOT NULL,
    min_base NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_base NUMERIC(12,2),
    employee_share_pct NUMERIC(6,4) DEFAULT 0,
    employer_share_pct NUMERIC(6,4) DEFAULT 0,
    employee_fixed_amount NUMERIC(12,2) DEFAULT 0,
    employer_fixed_amount NUMERIC(12,2) DEFAULT 0,
    tax_base_offset NUMERIC(12,2) DEFAULT 0,
    tax_excess_pct NUMERIC(6,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYROLL PERIODS
CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_code VARCHAR(30) UNIQUE NOT NULL, -- e.g. PR-2026-08A
    period_type VARCHAR(30) NOT NULL DEFAULT 'Semi-Monthly' CHECK (period_type IN ('Monthly', 'Semi-Monthly', 'Weekly', 'Custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payout_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'For Review', 'Approved', 'Paid')),
    total_gross NUMERIC(15,2) DEFAULT 0,
    total_deductions NUMERIC(15,2) DEFAULT 0,
    total_net NUMERIC(15,2) DEFAULT 0,
    approved_by UUID,
    approver_name VARCHAR(100),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PAYROLL RECORDS
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    
    workforce_category VARCHAR(20) NOT NULL,
    rate_type VARCHAR(20) NOT NULL,
    base_rate NUMERIC(12,2) NOT NULL,
    
    -- Attendance breakdown
    days_worked NUMERIC(5,2) DEFAULT 0,
    regular_hours NUMERIC(6,2) DEFAULT 0,
    overtime_hours NUMERIC(6,2) DEFAULT 0,
    night_diff_hours NUMERIC(6,2) DEFAULT 0,
    holiday_hours NUMERIC(6,2) DEFAULT 0,
    rest_day_hours NUMERIC(6,2) DEFAULT 0,
    late_undertime_deduction NUMERIC(12,2) DEFAULT 0,

    -- Earnings breakdown
    basic_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
    overtime_pay NUMERIC(12,2) DEFAULT 0,
    night_diff_pay NUMERIC(12,2) DEFAULT 0,
    holiday_pay NUMERIC(12,2) DEFAULT 0,
    rest_day_pay NUMERIC(12,2) DEFAULT 0,
    allowances NUMERIC(12,2) DEFAULT 0,
    bonuses NUMERIC(12,2) DEFAULT 0,
    other_earnings NUMERIC(12,2) DEFAULT 0,
    gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,

    -- Deductions breakdown
    sss_employee NUMERIC(12,2) DEFAULT 0,
    sss_employer NUMERIC(12,2) DEFAULT 0,
    philhealth_employee NUMERIC(12,2) DEFAULT 0,
    philhealth_employer NUMERIC(12,2) DEFAULT 0,
    pagibig_employee NUMERIC(12,2) DEFAULT 0,
    pagibig_employer NUMERIC(12,2) DEFAULT 0,
    withholding_tax NUMERIC(12,2) DEFAULT 0,
    employee_loans NUMERIC(12,2) DEFAULT 0,
    cash_advances NUMERIC(12,2) DEFAULT 0,
    other_deductions NUMERIC(12,2) DEFAULT 0,
    total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,

    net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(payroll_period_id, employee_id)
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    user_name VARCHAR(100) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g. "Uploaded employee document", "Approved payroll period"
    module VARCHAR(50) NOT NULL, -- e.g. "Employees", "Payroll", "Sites", "Documents"
    record_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('expiring_doc', 'expired_doc', 'contract_expiry', 'missing_doc', 'leave_pending', 'payroll_pending', 'system')),
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(150) NOT NULL DEFAULT 'Project Lunayve Construction',
    company_address TEXT DEFAULT 'Ortigas Center, Pasig City, Metro Manila, Philippines',
    contact_email VARCHAR(100) DEFAULT 'hr@lunayveconstruction.com',
    contact_number VARCHAR(50) DEFAULT '+63 2 8123 4567',
    tax_id VARCHAR(50) DEFAULT '009-876-543-000',
    currency VARCHAR(10) DEFAULT 'PHP',
    currency_symbol VARCHAR(5) DEFAULT '₱',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_employees_workforce ON employees(workforce_category);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_project ON employees(assigned_project_id);
CREATE INDEX IF NOT EXISTS idx_employees_site ON employees(assigned_site_id);
CREATE INDEX IF NOT EXISTS idx_sites_project ON sites(project_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_period ON payroll_records(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_employee_docs_exp ON employee_documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
