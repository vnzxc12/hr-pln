import {
  initialDepartments,
  initialDesignations,
  initialProjects,
  initialSites,
  initialDocumentCategories,
  initialEmployees,
  initialSiteAssignments,
  initialDocuments,
  initialLeaveTypes,
  initialLeaveRequests,
  initialGovernmentRules,
  initialPayrollPeriods,
  initialAuditLogs,
  initialNotifications
} from './seedData';
import { computeEmployeePayroll } from './payrollEngine';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_PREFIX = 'lunayve_hrms_';

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Robust UUID Sanitizer for PostgreSQL foreign keys
const sanitizeUUID = (val) => {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed === '' || trimmed === 'none' || trimmed === 'null' || trimmed === 'undefined') return null;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(trimmed) ? trimmed : null;
};

// PostgreSQL Schema Sanitizer for Employee Records
const sanitizeEmployeeForDB = (data) => {
  const sanitized = { ...data };

  // Foreign keys / UUID fields
  if ('department_id' in sanitized) sanitized.department_id = sanitizeUUID(sanitized.department_id);
  if ('designation_id' in sanitized) sanitized.designation_id = sanitizeUUID(sanitized.designation_id);
  if ('assigned_project_id' in sanitized) sanitized.assigned_project_id = sanitizeUUID(sanitized.assigned_project_id);
  if ('assigned_site_id' in sanitized) sanitized.assigned_site_id = sanitizeUUID(sanitized.assigned_site_id);
  if ('supervisor_id' in sanitized) sanitized.supervisor_id = sanitizeUUID(sanitized.supervisor_id);
  if ('foreman_id' in sanitized) sanitized.foreman_id = sanitizeUUID(sanitized.foreman_id);

  // String fields: convert empty strings to null or defaults
  if (sanitized.first_name !== undefined) sanitized.first_name = sanitized.first_name?.trim() || '';
  if (sanitized.last_name !== undefined) sanitized.last_name = sanitized.last_name?.trim() || '';
  if (sanitized.middle_name !== undefined) sanitized.middle_name = sanitized.middle_name?.trim() || null;
  if (sanitized.suffix !== undefined) sanitized.suffix = sanitized.suffix?.trim() || null;
  if (sanitized.email !== undefined) sanitized.email = sanitized.email?.trim() || null;
  if (sanitized.address !== undefined) sanitized.address = sanitized.address?.trim() || null;
  if (sanitized.date_of_birth !== undefined) sanitized.date_of_birth = sanitized.date_of_birth?.trim() || null;
  if (sanitized.date_hired !== undefined) sanitized.date_hired = sanitized.date_hired?.trim() || new Date().toISOString().split('T')[0];
  if (sanitized.contract_start_date !== undefined) sanitized.contract_start_date = sanitized.contract_start_date?.trim() || null;
  if (sanitized.contract_end_date !== undefined) sanitized.contract_end_date = sanitized.contract_end_date?.trim() || null;
  if (sanitized.date_assigned !== undefined) sanitized.date_assigned = sanitized.date_assigned?.trim() || null;
  if (sanitized.emergency_contact_name !== undefined) sanitized.emergency_contact_name = sanitized.emergency_contact_name?.trim() || null;
  if (sanitized.emergency_contact_number !== undefined) sanitized.emergency_contact_number = sanitized.emergency_contact_number?.trim() || null;
  if (sanitized.emergency_contact_relation !== undefined) sanitized.emergency_contact_relation = sanitized.emergency_contact_relation?.trim() || null;

  // Statutory numbers
  if (sanitized.sss_number !== undefined) sanitized.sss_number = sanitized.sss_number?.trim() || null;
  if (sanitized.philhealth_number !== undefined) sanitized.philhealth_number = sanitized.philhealth_number?.trim() || null;
  if (sanitized.pagibig_number !== undefined) sanitized.pagibig_number = sanitized.pagibig_number?.trim() || null;
  if (sanitized.tin_number !== undefined) sanitized.tin_number = sanitized.tin_number?.trim() || null;

  // Defaults
  if (sanitized.gender !== undefined) sanitized.gender = sanitized.gender?.trim() || 'Male';
  if (sanitized.civil_status !== undefined) sanitized.civil_status = sanitized.civil_status?.trim() || 'Single';
  if (sanitized.nationality !== undefined) sanitized.nationality = sanitized.nationality?.trim() || 'Filipino';
  if (sanitized.employment_type !== undefined) sanitized.employment_type = sanitized.employment_type?.trim() || 'Regular';
  if (sanitized.employment_status !== undefined) sanitized.employment_status = sanitized.employment_status?.trim() || 'Active';
  if (sanitized.workforce_category !== undefined) sanitized.workforce_category = sanitized.workforce_category || 'site';
  if (sanitized.rate_type !== undefined) sanitized.rate_type = sanitized.rate_type || 'Daily';

  // Numbers
  if (sanitized.base_rate !== undefined) sanitized.base_rate = Number(sanitized.base_rate) || 0;
  if (sanitized.monthly_allowance !== undefined) sanitized.monthly_allowance = Number(sanitized.monthly_allowance) || 0;
  if (sanitized.daily_allowance !== undefined) sanitized.daily_allowance = Number(sanitized.daily_allowance) || 0;

  return sanitized;
};

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback) && Array.isArray(parsed)) return parsed;
      if (!Array.isArray(fallback) && typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (err) {
    console.warn(`Could not load ${key} from storage:`, err);
  }
  return fallback;
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Could not save ${key} to storage:`, err);
  }
};

// In-Memory & LocalStorage Data Stores
let departments = loadFromStorage('departments', initialDepartments);
let designations = loadFromStorage('designations', initialDesignations);
let projects = loadFromStorage('projects', initialProjects);
let sites = loadFromStorage('sites', initialSites);
let documentCategories = loadFromStorage('doc_categories', initialDocumentCategories);
let employees = loadFromStorage('employees', initialEmployees);
let siteAssignments = loadFromStorage('site_assignments', initialSiteAssignments);
let documents = loadFromStorage('documents', initialDocuments);
let leaveTypes = loadFromStorage('leave_types', initialLeaveTypes);
let leaveRequests = loadFromStorage('leave_requests', initialLeaveRequests);
let governmentRules = loadFromStorage('gov_rules', initialGovernmentRules);
let payrollPeriods = loadFromStorage('payroll_periods', initialPayrollPeriods);
let payrollRecords = loadFromStorage('payroll_records', []);
let attendanceLogs = loadFromStorage('attendance', []);
let auditLogs = loadFromStorage('audit_logs', initialAuditLogs);
let notifications = loadFromStorage('notifications', initialNotifications);
let companySettings = loadFromStorage('company_settings', {
  company_name: 'Project Lunayve Construction',
  tagline: 'Building the Future with Precision and Integrity',
  company_address: 'Ortigas Center, Pasig City, Metro Manila, Philippines',
  contact_email: 'hr@lunayveconstruction.com',
  contact_number: '+63 2 8123 4567',
  tax_id: '009-876-543-000',
  currency: 'PHP',
  currency_symbol: '₱'
});

// Generate initial sample payroll records if empty
if (payrollRecords.length === 0) {
  const p1 = payrollPeriods[0];
  if (p1) {
    payrollRecords = employees.map(emp => {
      const rec = computeEmployeePayroll(
        emp,
        {
          days_worked: emp.workforce_category === 'office' ? 13 : 12,
          overtime_hours: emp.workforce_category === 'site' ? 8 : 0
        },
        governmentRules,
        'Semi-Monthly'
      );
      return {
        ...rec,
        id: `pr-rec-${p1.id}-${emp.id}`,
        payroll_period_id: p1.id,
        status: 'Approved'
      };
    });
    saveToStorage('payroll_records', payrollRecords);
  }
}

// Generate initial attendance logs if empty
if (attendanceLogs.length === 0) {
  const today = new Date().toISOString().split('T')[0];
  attendanceLogs = employees.map((emp, idx) => ({
    id: `att-${emp.id}-${today}`,
    employee_id: emp.id,
    date: today,
    time_in: emp.workforce_category === 'site' ? '06:55:00' : '07:50:00',
    time_out: emp.workforce_category === 'site' ? '17:00:00' : '17:00:00',
    regular_hours: 8,
    overtime_hours: idx % 3 === 0 ? 2 : 0,
    night_diff_hours: 0,
    holiday_hours: 0,
    rest_day_hours: 0,
    late_minutes: idx % 7 === 0 ? 15 : 0,
    undertime_minutes: 0,
    status: idx === 19 ? 'Late' : idx === 14 ? 'On Leave' : 'Present',
    project_id: emp.assigned_project_id,
    site_id: emp.assigned_site_id,
    notes: 'Regular site/office duty'
  }));
  saveToStorage('attendance', attendanceLogs);
}

// Event Subscribers for real-time state sync across React components
const subscribers = new Set();
const notifySubscribers = (event = 'update') => {
  subscribers.forEach(cb => {
    try {
      cb(event);
    } catch (e) {
      console.warn('Subscriber notification failed:', e);
    }
  });
};

// Data Service API
export const dataService = {
  subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  },

  // --- SUPABASE CLOUD SYNC ---
  async syncWithSupabase() {
    if (!isSupabaseConfigured || !supabase) return false;

    try {
      // Parallel fetch from all primary Supabase tables
      const [
        { data: sbDepts, error: errDepts },
        { data: sbDesigs, error: errDesigs },
        { data: sbProjects, error: errProjects },
        { data: sbSites, error: errSites },
        { data: sbEmployees, error: errEmps },
        { data: sbSiteAsgs, error: errSiteAsgs },
        { data: sbDocCats, error: errDocCats },
        { data: sbDocs, error: errDocs },
        { data: sbAttendance, error: errAtt },
        { data: sbLeaveTypes, error: errLeaveTypes },
        { data: sbLeaveReqs, error: errLeaveReqs },
        { data: sbGovRules, error: errGovRules },
        { data: sbPeriods, error: errPeriods },
        { data: sbRecords, error: errRecords },
        { data: sbSettings, error: errSettings },
        { data: sbAuditLogs, error: errAuditLogs },
        { data: sbNotifs, error: errNotifs }
      ] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('designations').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('sites').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('employee_site_assignments').select('*'),
        supabase.from('document_categories').select('*'),
        supabase.from('employee_documents').select('*'),
        supabase.from('attendance').select('*'),
        supabase.from('leave_types').select('*'),
        supabase.from('leave_requests').select('*'),
        supabase.from('government_contribution_rules').select('*'),
        supabase.from('payroll_periods').select('*'),
        supabase.from('payroll_records').select('*'),
        supabase.from('company_settings').select('*').limit(1),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (!errDepts && sbDepts?.length > 0) {
        departments = sbDepts;
        saveToStorage('departments', departments);
      }
      if (!errDesigs && sbDesigs?.length > 0) {
        designations = sbDesigs;
        saveToStorage('designations', designations);
      }
      if (!errProjects && sbProjects?.length > 0) {
        projects = sbProjects;
        saveToStorage('projects', projects);
      }
      if (!errSites && sbSites?.length > 0) {
        sites = sbSites;
        saveToStorage('sites', sites);
      }
      if (!errEmps && sbEmps?.length > 0) {
        employees = sbEmps;
        saveToStorage('employees', employees);
      }
      if (!errSiteAsgs && sbSiteAsgs) {
        siteAssignments = sbSiteAsgs;
        saveToStorage('site_assignments', siteAssignments);
      }
      if (!errDocCats && sbDocCats?.length > 0) {
        documentCategories = sbDocCats;
        saveToStorage('doc_categories', documentCategories);
      }
      if (!errDocs && sbDocs) {
        documents = sbDocs;
        saveToStorage('documents', documents);
      }
      if (!errAtt && sbAtt?.length > 0) {
        attendanceLogs = sbAtt;
        saveToStorage('attendance', attendanceLogs);
      }
      if (!errLeaveTypes && sbLeaveTypes?.length > 0) {
        leaveTypes = sbLeaveTypes;
        saveToStorage('leave_types', leaveTypes);
      }
      if (!errLeaveReqs && sbLeaveReqs) {
        leaveRequests = sbLeaveReqs;
        saveToStorage('leave_requests', leaveRequests);
      }
      if (!errGovRules && sbGovRules?.length > 0) {
        governmentRules = sbGovRules;
        saveToStorage('gov_rules', governmentRules);
      }
      if (!errPeriods && sbPeriods?.length > 0) {
        payrollPeriods = sbPeriods;
        saveToStorage('payroll_periods', payrollPeriods);
      }
      if (!errRecords && sbRecords?.length > 0) {
        payrollRecords = sbRecords;
        saveToStorage('payroll_records', payrollRecords);
      }
      if (!errSettings && sbSettings?.length > 0) {
        companySettings = { ...companySettings, ...sbSettings[0] };
        saveToStorage('company_settings', companySettings);
      }
      if (!errAuditLogs && sbAuditLogs?.length > 0) {
        auditLogs = sbAuditLogs;
        saveToStorage('audit_logs', auditLogs);
      }
      if (!errNotifs && sbNotifs?.length > 0) {
        notifications = sbNotifs;
        saveToStorage('notifications', notifications);
      }

      notifySubscribers('sync_complete');
      return true;
    } catch (err) {
      console.warn('Supabase sync error (running offline fallback):', err);
      return false;
    }
  },

  // --- AUDIT LOGGING ---
  logAudit(userName, userRole, action, module, recordId = null, details = {}) {
    const newLog = {
      id: generateUUID(),
      user_name: userName || 'HR Administrator',
      user_role: userRole || 'HR Administrator',
      action,
      module,
      record_id: recordId ? String(recordId) : null,
      details,
      created_at: new Date().toISOString()
    };
    auditLogs = [newLog, ...auditLogs];
    saveToStorage('audit_logs', auditLogs);
    notifySubscribers('audit');

    // Async write to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_logs').insert([newLog]).then(({ error }) => {
        if (error) console.warn('Supabase audit log insert error:', error);
      });
    }

    return newLog;
  },

  getAuditLogs() {
    return [...auditLogs];
  },

  // --- NOTIFICATIONS & ALERTS ---
  getNotifications() {
    const today = new Date();
    const dynamicNotifs = [];

    // Expiring Documents (< 30 days)
    documents.forEach(doc => {
      if (doc.expiration_date) {
        const expDate = new Date(doc.expiration_date);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        const emp = employees.find(e => e.id === doc.employee_id);
        const empName = emp ? `${emp.first_name} ${emp.last_name}` : 'Employee';

        if (diffDays < 0) {
          dynamicNotifs.push({
            id: `notif-exp-${doc.id}`,
            title: `Expired Document: ${doc.document_name}`,
            message: `${empName}'s ${doc.document_name} expired on ${doc.expiration_date}. Immediate renewal required.`,
            type: 'expired_doc',
            link: `/employees/${doc.employee_id}`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        } else if (diffDays <= 30) {
          dynamicNotifs.push({
            id: `notif-soon-${doc.id}`,
            title: `Document Expiring Soon (${diffDays} days left)`,
            message: `${empName}'s ${doc.document_name} will expire on ${doc.expiration_date}.`,
            type: 'expiring_doc',
            link: `/employees/${doc.employee_id}`,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    });

    const combined = [...dynamicNotifs, ...notifications];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique;
  },

  markNotificationAsRead(id) {
    notifications = notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
    saveToStorage('notifications', notifications);
    notifySubscribers('notifications');

    if (isSupabaseConfigured && supabase && !id.startsWith('notif-exp-') && !id.startsWith('notif-soon-')) {
      supabase.from('notifications').update({ is_read: true }).eq('id', id).then();
    }
  },

  // --- EMPLOYEES ---
  getEmployees() {
    return employees.filter(e => !e.is_deleted);
  },

  getEmployeeById(id) {
    return employees.find(e => (e.id === id || e.employee_id === id) && !e.is_deleted);
  },

  createEmployee(employeeData, user) {
    const newId = employeeData.id && employeeData.id.includes('-') && employeeData.id.length === 36
      ? employeeData.id
      : generateUUID();

    const cleanData = sanitizeEmployeeForDB({
      ...employeeData,
      id: newId,
      first_name: employeeData.first_name?.trim() || '',
      last_name: employeeData.last_name?.trim() || '',
      workforce_category: employeeData.workforce_category || 'site',
      contact_number: employeeData.contact_number || '+63 900 000 0000',
      date_hired: employeeData.date_hired?.trim() || new Date().toISOString().split('T')[0],
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    employees = [cleanData, ...employees];
    saveToStorage('employees', employees);
    notifySubscribers('employees');

    // Async write to Supabase PostgreSQL cloud backend
    if (isSupabaseConfigured && supabase) {
      supabase.from('employees').insert([cleanData]).then(({ data, error }) => {
        if (error) {
          console.error('Supabase create employee error:', error);
        } else {
          console.log('Supabase employee created successfully:', cleanData.employee_id);
        }
      });
    }

    // If site/project is assigned, record initial site assignment history
    if (cleanData.assigned_project_id && cleanData.assigned_site_id) {
      const proj = projects.find(p => p.id === cleanData.assigned_project_id);
      const site = sites.find(s => s.id === cleanData.assigned_site_id);
      this.createSiteAssignment(
        {
          employee_id: newId,
          project_id: cleanData.assigned_project_id,
          site_id: cleanData.assigned_site_id,
          position_title: cleanData.designation_id,
          supervisor_name: site?.site_supervisor_name || 'Assigned Supervisor',
          assignment_start: cleanData.date_assigned || cleanData.date_hired || new Date().toISOString().split('T')[0],
          status: 'Active',
          notes: `Initial assignment upon onboarding to ${proj?.name || 'Project'}`
        },
        user
      );
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Created new employee: ${cleanData.first_name} ${cleanData.last_name} (${cleanData.employee_id})`,
      'Employees',
      newId,
      { employee_id: cleanData.employee_id, category: cleanData.workforce_category }
    );

    return cleanData;
  },

  updateEmployee(id, updates, user) {
    const existing = employees.find(e => e.id === id || e.employee_id === id);
    if (!existing) return null;

    const targetId = existing.id;

    // Check if site assignment changed
    const siteChanged = updates.assigned_site_id && updates.assigned_site_id !== existing.assigned_site_id;
    const projectChanged = updates.assigned_project_id && updates.assigned_project_id !== existing.assigned_project_id;

    if (siteChanged || projectChanged) {
      siteAssignments = siteAssignments.map(asg => {
        if (asg.employee_id === targetId && asg.status === 'Active') {
          const closed = { ...asg, status: 'Transferred', assignment_end: new Date().toISOString().split('T')[0] };
          if (isSupabaseConfigured && supabase) {
            supabase.from('employee_site_assignments').update(closed).eq('id', asg.id).then();
          }
          return closed;
        }
        return asg;
      });

      const newSite = sites.find(s => s.id === (updates.assigned_site_id || existing.assigned_site_id));
      this.createSiteAssignment(
        {
          employee_id: targetId,
          project_id: updates.assigned_project_id || existing.assigned_project_id,
          site_id: updates.assigned_site_id || existing.assigned_site_id,
          position_title: updates.designation_id || existing.designation_id,
          supervisor_name: newSite?.site_supervisor_name || 'Site Supervisor',
          assignment_start: new Date().toISOString().split('T')[0],
          status: 'Active',
          notes: 'Transferred via Employee Profile update'
        },
        user
      );
    }

    // Clean & sanitize updates for PostgreSQL
    const cleanUpdates = sanitizeEmployeeForDB({ ...updates });
    cleanUpdates.updated_at = new Date().toISOString();

    const updated = { ...existing, ...cleanUpdates };
    employees = employees.map(e => (e.id === targetId ? updated : e));
    saveToStorage('employees', employees);
    notifySubscribers('employees');

    // Async write to Supabase PostgreSQL cloud backend
    if (isSupabaseConfigured && supabase) {
      supabase.from('employees').update(cleanUpdates).eq('id', targetId).then(({ data, error }) => {
        if (error) {
          console.error('Supabase update employee error:', error);
        } else {
          console.log('Supabase employee updated successfully:', targetId);
        }
      });
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Updated employee profile: ${updated.first_name} ${updated.last_name} (${updated.employee_id})`,
      'Employees',
      targetId,
      updates
    );

    return updated;
  },

  softDeleteEmployee(id, user) {
    const existing = employees.find(e => e.id === id || e.employee_id === id);
    if (!existing) return false;

    const targetId = existing.id;
    employees = employees.map(e => (e.id === targetId ? { ...e, is_deleted: true, employment_status: 'Terminated', updated_at: new Date().toISOString() } : e));
    saveToStorage('employees', employees);
    notifySubscribers('employees');

    if (isSupabaseConfigured && supabase) {
      supabase.from('employees').update({ is_deleted: true, employment_status: 'Terminated', updated_at: new Date().toISOString() }).eq('id', targetId).then(({ error }) => {
        if (error) console.warn('Supabase delete employee error:', error);
      });
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Deactivated employee: ${existing.first_name} ${existing.last_name} (${existing.employee_id})`,
      'Employees',
      targetId
    );

    return true;
  },

  // --- PROJECTS & SITES ---
  getProjects() {
    return [...projects];
  },

  getProjectById(id) {
    return projects.find(p => p.id === id);
  },

  createProject(projectData, user) {
    const newProj = {
      ...projectData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    projects = [newProj, ...projects];
    saveToStorage('projects', projects);
    notifySubscribers('projects');

    if (isSupabaseConfigured && supabase) {
      supabase.from('projects').insert([newProj]).then(({ error }) => {
        if (error) console.warn('Supabase project insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created project: ${newProj.name} (${newProj.project_code})`, 'Projects', newProj.id);
    return newProj;
  },

  updateProject(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    projects = projects.map(p => (p.id === id ? { ...p, ...cleanUpdates } : p));
    saveToStorage('projects', projects);
    notifySubscribers('projects');

    if (isSupabaseConfigured && supabase) {
      supabase.from('projects').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase project update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated project ID ${id}`, 'Projects', id, updates);
    return projects.find(p => p.id === id);
  },

  getSites() {
    return [...sites];
  },

  getSitesByProject(projectId) {
    return sites.filter(s => s.project_id === projectId);
  },

  createSite(siteData, user) {
    const newSite = {
      ...siteData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    sites = [newSite, ...sites];
    saveToStorage('sites', sites);
    notifySubscribers('sites');

    if (isSupabaseConfigured && supabase) {
      supabase.from('sites').insert([newSite]).then(({ error }) => {
        if (error) console.warn('Supabase site insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created site: ${newSite.name} (${newSite.site_code})`, 'Sites', newSite.id);
    return newSite;
  },

  updateSite(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    sites = sites.map(s => (s.id === id ? { ...s, ...cleanUpdates } : s));
    saveToStorage('sites', sites);
    notifySubscribers('sites');

    if (isSupabaseConfigured && supabase) {
      supabase.from('sites').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase site update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated site ID ${id}`, 'Sites', id, updates);
    return sites.find(s => s.id === id);
  },

  // --- SITE ASSIGNMENTS HISTORY ---
  getSiteAssignments(employeeId = null) {
    if (employeeId) {
      return siteAssignments.filter(a => a.employee_id === employeeId);
    }
    return [...siteAssignments];
  },

  createSiteAssignment(assignmentData, user) {
    const newAsg = {
      ...assignmentData,
      id: generateUUID(),
      employee_id: sanitizeUUID(assignmentData.employee_id) || assignmentData.employee_id,
      project_id: sanitizeUUID(assignmentData.project_id),
      site_id: sanitizeUUID(assignmentData.site_id),
      created_at: new Date().toISOString()
    };
    siteAssignments = [newAsg, ...siteAssignments];
    saveToStorage('site_assignments', siteAssignments);

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_site_assignments').insert([newAsg]).then(({ error }) => {
        if (error) console.warn('Supabase site assignment insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created site assignment for employee ${newAsg.employee_id}`, 'Sites', newAsg.id);
    return newAsg;
  },

  // --- DOCUMENTS ---
  getDocumentCategories() {
    return [...documentCategories];
  },

  createDocumentCategory(catData, user) {
    const newCat = { ...catData, id: generateUUID(), created_at: new Date().toISOString() };
    documentCategories = [...documentCategories, newCat];
    saveToStorage('doc_categories', documentCategories);

    if (isSupabaseConfigured && supabase) {
      supabase.from('document_categories').insert([newCat]).then(({ error }) => {
        if (error) console.warn('Supabase doc category insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created document category: ${newCat.name}`, 'Documents', newCat.id);
    return newCat;
  },

  getDocumentsByEmployee(employeeId) {
    return documents.filter(d => d.employee_id === employeeId);
  },

  getAllDocuments() {
    return [...documents];
  },

  createDocument(docData, user) {
    const newDoc = {
      ...docData,
      id: generateUUID(),
      employee_id: sanitizeUUID(docData.employee_id) || docData.employee_id,
      category_id: sanitizeUUID(docData.category_id),
      uploaded_by: sanitizeUUID(user?.id),
      uploader_name: user?.name || 'HR Administrator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    documents = [newDoc, ...documents];
    saveToStorage('documents', documents);
    notifySubscribers('documents');

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_documents').insert([newDoc]).then(({ error }) => {
        if (error) console.warn('Supabase document insert error:', error);
      });
    }

    const emp = employees.find(e => e.id === newDoc.employee_id);
    this.logAudit(
      user?.name,
      user?.role,
      `Uploaded document: ${newDoc.document_name} for ${emp ? emp.first_name + ' ' + emp.last_name : 'Employee'}`,
      'Documents',
      newDoc.id
    );
    return newDoc;
  },

  updateDocument(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    documents = documents.map(d => (d.id === id ? { ...d, ...cleanUpdates } : d));
    saveToStorage('documents', documents);
    notifySubscribers('documents');

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_documents').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase document update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated document metadata ID ${id}`, 'Documents', id);
    return documents.find(d => d.id === id);
  },

  deleteDocument(id, user) {
    const doc = documents.find(d => d.id === id);
    documents = documents.filter(d => d.id !== id);
    saveToStorage('documents', documents);
    notifySubscribers('documents');

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_documents').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase document delete error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Deleted document: ${doc?.document_name || id}`, 'Documents', id);
    return true;
  },

  // --- ATTENDANCE ---
  getAttendanceLogs(filterDate = null, projectId = null, siteId = null) {
    return attendanceLogs.filter(att => {
      if (filterDate && att.date !== filterDate) return false;
      if (projectId && att.project_id !== projectId) return false;
      if (siteId && att.site_id !== siteId) return false;
      return true;
    });
  },

  getAttendanceByEmployee(employeeId) {
    return attendanceLogs.filter(a => a.employee_id === employeeId);
  },

  recordAttendance(logData, user) {
    const existingIndex = attendanceLogs.findIndex(
      a => a.employee_id === logData.employee_id && a.date === logData.date
    );

    const newLog = {
      ...logData,
      id: logData.id && logData.id.length === 36 ? logData.id : generateUUID(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      attendanceLogs[existingIndex] = newLog;
    } else {
      attendanceLogs = [newLog, ...attendanceLogs];
    }
    saveToStorage('attendance', attendanceLogs);
    notifySubscribers('attendance');

    if (isSupabaseConfigured && supabase) {
      supabase.from('attendance').upsert([newLog], { onConflict: 'employee_id,date' }).then(({ error }) => {
        if (error) console.warn('Supabase attendance upsert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Recorded attendance for date ${newLog.date}`, 'Attendance', newLog.id);
    return newLog;
  },

  bulkImportAttendance(records, user) {
    const logsToUpsert = [];
    records.forEach(rec => {
      const idx = attendanceLogs.findIndex(a => a.employee_id === rec.employee_id && a.date === rec.date);
      const entry = {
        ...rec,
        id: rec.id && rec.id.length === 36 ? rec.id : generateUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (idx >= 0) {
        attendanceLogs[idx] = entry;
      } else {
        attendanceLogs.push(entry);
      }
      logsToUpsert.push(entry);
    });

    saveToStorage('attendance', attendanceLogs);
    notifySubscribers('attendance');

    if (isSupabaseConfigured && supabase && logsToUpsert.length > 0) {
      supabase.from('attendance').upsert(logsToUpsert, { onConflict: 'employee_id,date' }).then(({ error }) => {
        if (error) console.warn('Supabase bulk attendance error:', error);
      });
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Bulk imported ${records.length} attendance records`,
      'Attendance',
      null,
      { count: records.length }
    );
    return records.length;
  },

  // --- LEAVE ---
  getLeaveTypes() {
    return [...leaveTypes];
  },

  getLeaveRequests(employeeId = null) {
    if (employeeId) {
      return leaveRequests.filter(l => l.employee_id === employeeId);
    }
    return [...leaveRequests];
  },

  createLeaveRequest(requestData, user) {
    const newReq = {
      ...requestData,
      id: generateUUID(),
      status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    leaveRequests = [newReq, ...leaveRequests];
    saveToStorage('leave_requests', leaveRequests);
    notifySubscribers('leave');

    if (isSupabaseConfigured && supabase) {
      supabase.from('leave_requests').insert([newReq]).then(({ error }) => {
        if (error) console.warn('Supabase leave insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Submitted leave request for employee ${newReq.employee_id}`, 'Leave', newReq.id);
    return newReq;
  },

  updateLeaveStatus(id, status, approverUser, rejectionReason = null) {
    const updates = {
      status,
      approved_by: approverUser?.id || null,
      approver_name: approverUser?.name || 'HR Administrator',
      approval_date: new Date().toISOString(),
      rejection_reason: rejectionReason,
      updated_at: new Date().toISOString()
    };

    leaveRequests = leaveRequests.map(l => (l.id === id ? { ...l, ...updates } : l));
    saveToStorage('leave_requests', leaveRequests);
    notifySubscribers('leave');

    if (isSupabaseConfigured && supabase) {
      supabase.from('leave_requests').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase leave update error:', error);
      });
    }

    this.logAudit(approverUser?.name, approverUser?.role, `${status} leave request ID ${id}`, 'Leave', id);
    return leaveRequests.find(l => l.id === id);
  },

  // --- PAYROLL & GOVERNMENT RULES ---
  getGovernmentRules() {
    return [...governmentRules];
  },

  createGovernmentRule(ruleData, user) {
    const newRule = {
      ...ruleData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    governmentRules = [...governmentRules, newRule];
    saveToStorage('gov_rules', governmentRules);
    notifySubscribers('gov_rules');

    if (isSupabaseConfigured && supabase) {
      supabase.from('government_contribution_rules').insert([newRule]).then(({ error }) => {
        if (error) console.warn('Supabase gov rule insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created contribution rule: ${newRule.rule_name}`, 'Settings', newRule.id);
    return newRule;
  },

  updateGovernmentRule(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    governmentRules = governmentRules.map(r => (r.id === id ? { ...r, ...cleanUpdates } : r));
    saveToStorage('gov_rules', governmentRules);
    notifySubscribers('gov_rules');

    if (isSupabaseConfigured && supabase) {
      supabase.from('government_contribution_rules').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase gov rule update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated contribution rule ID ${id}`, 'Settings', id, updates);
    return governmentRules.find(r => r.id === id);
  },

  deleteGovernmentRule(id, user) {
    const target = governmentRules.find(r => r.id === id);
    governmentRules = governmentRules.filter(r => r.id !== id);
    saveToStorage('gov_rules', governmentRules);
    notifySubscribers('gov_rules');

    if (isSupabaseConfigured && supabase) {
      supabase.from('government_contribution_rules').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase gov rule delete error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Deleted contribution rule ${target?.rule_name || id}`, 'Settings', id);
    return true;
  },

  getPayrollPeriods() {
    return [...payrollPeriods];
  },

  getPayrollPeriodById(id) {
    return payrollPeriods.find(p => p.id === id);
  },

  createPayrollPeriod(periodData, user) {
    const periodId = generateUUID();
    const newPeriod = {
      ...periodData,
      id: periodId,
      status: 'Draft',
      total_gross: 0,
      total_deductions: 0,
      total_net: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const activeEmployees = employees.filter(e => !e.is_deleted && e.employment_status === 'Active');
    const generatedRecords = activeEmployees.map(emp => {
      const calc = computeEmployeePayroll(
        emp,
        {
          days_worked: emp.workforce_category === 'office' ? 13 : 12,
          overtime_hours: emp.workforce_category === 'site' ? 6 : 0
        },
        governmentRules,
        newPeriod.period_type
      );
      return {
        ...calc,
        id: generateUUID(),
        payroll_period_id: periodId,
        employee_id: emp.id,
        workforce_category: emp.workforce_category,
        rate_type: emp.rate_type,
        base_rate: Number(emp.base_rate) || 0,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    const totalGross = generatedRecords.reduce((acc, r) => acc + (Number(r.gross_pay) || 0), 0);
    const totalDeductions = generatedRecords.reduce((acc, r) => acc + (Number(r.total_deductions) || 0), 0);
    const totalNet = generatedRecords.reduce((acc, r) => acc + (Number(r.net_pay) || 0), 0);

    newPeriod.total_gross = totalGross;
    newPeriod.total_deductions = totalDeductions;
    newPeriod.total_net = totalNet;

    payrollPeriods = [newPeriod, ...payrollPeriods];
    payrollRecords = [...payrollRecords, ...generatedRecords];

    saveToStorage('payroll_periods', payrollPeriods);
    saveToStorage('payroll_records', payrollRecords);
    notifySubscribers('payroll');

    if (isSupabaseConfigured && supabase) {
      supabase.from('payroll_periods').insert([newPeriod]).then(({ error: pErr }) => {
        if (pErr) console.warn('Supabase payroll period insert error:', pErr);
        if (!pErr && generatedRecords.length > 0) {
          supabase.from('payroll_records').insert(generatedRecords).then(({ error: rErr }) => {
            if (rErr) console.warn('Supabase payroll records insert error:', rErr);
          });
        }
      });
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Generated payroll period ${newPeriod.period_code}`,
      'Payroll',
      newPeriod.id,
      { count: activeEmployees.length, net: totalNet }
    );

    return newPeriod;
  },

  getPayrollRecords(periodId) {
    return payrollRecords.filter(r => r.payroll_period_id === periodId);
  },

  getPayrollRecordsByEmployee(employeeId) {
    return payrollRecords.filter(r => r.employee_id === employeeId);
  },

  updatePayrollRecord(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    payrollRecords = payrollRecords.map(r => (r.id === id ? { ...r, ...cleanUpdates } : r));
    saveToStorage('payroll_records', payrollRecords);

    const target = payrollRecords.find(r => r.id === id);
    if (target) {
      const records = payrollRecords.filter(r => r.payroll_period_id === target.payroll_period_id);
      const totalGross = records.reduce((acc, r) => acc + (Number(r.gross_pay) || 0), 0);
      const totalDeductions = records.reduce((acc, r) => acc + (Number(r.total_deductions) || 0), 0);
      const totalNet = records.reduce((acc, r) => acc + (Number(r.net_pay) || 0), 0);

      payrollPeriods = payrollPeriods.map(p =>
        p.id === target.payroll_period_id
          ? {
              ...p,
              total_gross: totalGross,
              total_deductions: totalDeductions,
              total_net: totalNet,
              updated_at: new Date().toISOString()
            }
          : p
      );
      saveToStorage('payroll_periods', payrollPeriods);

      if (isSupabaseConfigured && supabase) {
        supabase.from('payroll_records').update(cleanUpdates).eq('id', id).then();
        supabase.from('payroll_periods').update({ total_gross: totalGross, total_deductions: totalDeductions, total_net: totalNet, updated_at: new Date().toISOString() }).eq('id', target.payroll_period_id).then();
      }
    }

    notifySubscribers('payroll');
    this.logAudit(user?.name, user?.role, `Edited payroll record ID ${id}`, 'Payroll', id);
    return payrollRecords.find(r => r.id === id);
  },

  updatePayrollPeriodStatus(periodId, status, user) {
    const p = payrollPeriods.find(item => item.id === periodId);
    if (!p) return null;

    const periodUpdates = {
      status,
      approved_by: status === 'Approved' ? user?.id || null : p.approved_by,
      approver_name: status === 'Approved' ? user?.name || 'HR Administrator' : p.approver_name,
      approved_at: status === 'Approved' ? new Date().toISOString() : p.approved_at,
      updated_at: new Date().toISOString()
    };

    payrollPeriods = payrollPeriods.map(item =>
      item.id === periodId ? { ...item, ...periodUpdates } : item
    );

    payrollRecords = payrollRecords.map(r =>
      r.payroll_period_id === periodId ? { ...r, status, updated_at: new Date().toISOString() } : r
    );

    saveToStorage('payroll_periods', payrollPeriods);
    saveToStorage('payroll_records', payrollRecords);
    notifySubscribers('payroll');

    if (isSupabaseConfigured && supabase) {
      supabase.from('payroll_periods').update(periodUpdates).eq('id', periodId).then();
      supabase.from('payroll_records').update({ status, updated_at: new Date().toISOString() }).eq('payroll_period_id', periodId).then();
    }

    this.logAudit(user?.name, user?.role, `Changed Payroll Period ${p.period_code} status to ${status}`, 'Payroll', periodId);
    return payrollPeriods.find(item => item.id === periodId);
  },

  bulkImportPayroll(periodId, parsedRows, user) {
    const recordsToUpsert = [];
    parsedRows.forEach(row => {
      const idx = payrollRecords.findIndex(
        r => r.payroll_period_id === periodId && r.employee_id === row.employee_id
      );
      const record = {
        ...row,
        id: row.id && row.id.length === 36 ? row.id : generateUUID(),
        payroll_period_id: periodId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      if (idx >= 0) {
        payrollRecords[idx] = record;
      } else {
        payrollRecords.push(record);
      }
      recordsToUpsert.push(record);
    });

    const records = payrollRecords.filter(r => r.payroll_period_id === periodId);
    const totalGross = records.reduce((acc, r) => acc + (Number(r.gross_pay) || 0), 0);
    const totalDeductions = records.reduce((acc, r) => acc + (Number(r.total_deductions) || 0), 0);
    const totalNet = records.reduce((acc, r) => acc + (Number(r.net_pay) || 0), 0);

    payrollPeriods = payrollPeriods.map(p =>
      p.id === periodId
        ? {
            ...p,
            total_gross: totalGross,
            total_deductions: totalDeductions,
            total_net: totalNet,
            updated_at: new Date().toISOString()
          }
        : p
    );

    saveToStorage('payroll_records', payrollRecords);
    saveToStorage('payroll_periods', payrollPeriods);
    notifySubscribers('payroll');

    if (isSupabaseConfigured && supabase && recordsToUpsert.length > 0) {
      supabase.from('payroll_records').upsert(recordsToUpsert).then();
      supabase.from('payroll_periods').update({ total_gross: totalGross, total_deductions: totalDeductions, total_net: totalNet }).eq('id', periodId).then();
    }

    this.logAudit(
      user?.name,
      user?.role,
      `Excel imported ${parsedRows.length} payroll entries for Period ID ${periodId}`,
      'Payroll',
      periodId
    );
    return parsedRows.length;
  },

  // --- SETTINGS & DEPARTMENTS / DESIGNATIONS ---
  getDepartments() {
    return [...departments];
  },

  createDepartment(deptData, user) {
    const newDept = {
      ...deptData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    departments = [...departments, newDept];
    saveToStorage('departments', departments);
    notifySubscribers('departments');

    if (isSupabaseConfigured && supabase) {
      supabase.from('departments').insert([newDept]).then(({ error }) => {
        if (error) console.warn('Supabase department insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created department: ${newDept.name}`, 'Settings', newDept.id);
    return newDept;
  },

  updateDepartment(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    departments = departments.map(d => (d.id === id ? { ...d, ...cleanUpdates } : d));
    saveToStorage('departments', departments);
    notifySubscribers('departments');

    if (isSupabaseConfigured && supabase) {
      supabase.from('departments').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase department update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated department ID ${id}`, 'Settings', id);
    return departments.find(d => d.id === id);
  },

  deleteDepartment(id, user) {
    const target = departments.find(d => d.id === id);
    departments = departments.filter(d => d.id !== id);
    saveToStorage('departments', departments);
    notifySubscribers('departments');

    if (isSupabaseConfigured && supabase) {
      supabase.from('departments').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase department delete error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Deleted department ${target?.name || id}`, 'Settings', id);
    return true;
  },

  getDesignations() {
    return [...designations];
  },

  createDesignation(desigData, user) {
    const newDesig = {
      ...desigData,
      id: generateUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    designations = [...designations, newDesig];
    saveToStorage('designations', designations);
    notifySubscribers('designations');

    if (isSupabaseConfigured && supabase) {
      supabase.from('designations').insert([newDesig]).then(({ error }) => {
        if (error) console.warn('Supabase designation insert error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Created designation: ${newDesig.title}`, 'Settings', newDesig.id);
    return newDesig;
  },

  updateDesignation(id, updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    designations = designations.map(d => (d.id === id ? { ...d, ...cleanUpdates } : d));
    saveToStorage('designations', designations);
    notifySubscribers('designations');

    if (isSupabaseConfigured && supabase) {
      supabase.from('designations').update(cleanUpdates).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase designation update error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Updated designation ID ${id}`, 'Settings', id);
    return designations.find(d => d.id === id);
  },

  deleteDesignation(id, user) {
    const target = designations.find(d => d.id === id);
    designations = designations.filter(d => d.id !== id);
    saveToStorage('designations', designations);
    notifySubscribers('designations');

    if (isSupabaseConfigured && supabase) {
      supabase.from('designations').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase designation delete error:', error);
      });
    }

    this.logAudit(user?.name, user?.role, `Deleted designation ${target?.title || id}`, 'Settings', id);
    return true;
  },

  getCompanySettings() {
    return { ...companySettings };
  },

  updateCompanySettings(updates, user) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    companySettings = { ...companySettings, ...cleanUpdates };
    saveToStorage('company_settings', companySettings);
    notifySubscribers('settings');

    if (isSupabaseConfigured && supabase) {
      if (companySettings.id) {
        supabase.from('company_settings').update(cleanUpdates).eq('id', companySettings.id).then();
      } else {
        supabase.from('company_settings').insert([cleanUpdates]).then();
      }
    }

    this.logAudit(user?.name, user?.role, `Updated company profile settings`, 'Settings');
    return companySettings;
  },

  // --- CLEAR ALL WORKFORCE DATA ---
  clearAllWorkforceData() {
    employees = [];
    projects = [];
    sites = [];
    siteAssignments = [];
    documents = [];
    payrollPeriods = [];
    payrollRecords = [];
    attendanceLogs = [];
    leaveRequests = [];
    notifications = [];
    auditLogs = [];

    saveToStorage('employees', []);
    saveToStorage('projects', []);
    saveToStorage('sites', []);
    saveToStorage('site_assignments', []);
    saveToStorage('documents', []);
    saveToStorage('payroll_periods', []);
    saveToStorage('payroll_records', []);
    saveToStorage('attendance', []);
    saveToStorage('leave_requests', []);
    saveToStorage('notifications', []);
    saveToStorage('audit_logs', []);
    notifySubscribers('clear');
  },

  // --- RESET TO DEMO FACTORY ---
  resetToDemoFactory() {
    localStorage.clear();
    departments = initialDepartments;
    designations = initialDesignations;
    projects = initialProjects;
    sites = initialSites;
    documentCategories = initialDocumentCategories;
    employees = initialEmployees;
    siteAssignments = initialSiteAssignments;
    documents = initialDocuments;
    leaveTypes = initialLeaveTypes;
    leaveRequests = initialLeaveRequests;
    governmentRules = initialGovernmentRules;
    payrollPeriods = initialPayrollPeriods;
    auditLogs = initialAuditLogs;
    notifications = initialNotifications;
    window.location.reload();
  }
};

// Initiate automatic background sync on module load
if (typeof window !== 'undefined') {
  dataService.syncWithSupabase();
}
