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

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
    if (saved) return JSON.parse(saved);
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
      const rec = computeEmployeePayroll(emp, { days_worked: emp.workforce_category === 'office' ? 13 : 12, overtime_hours: emp.workforce_category === 'site' ? 8 : 0 }, governmentRules, 'Semi-Monthly');
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
    status: idx === 19 ? 'Late' : (idx === 14 ? 'On Leave' : 'Present'),
    project_id: emp.assigned_project_id,
    site_id: emp.assigned_site_id,
    notes: 'Regular site/office duty'
  }));
  saveToStorage('attendance', attendanceLogs);
}

// Data Service API
export const dataService = {
  // --- AUDIT LOGGING ---
  logAudit(userName, userRole, action, module, recordId = null, details = {}) {
    const newLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_name: userName || 'HR Administrator',
      user_role: userRole || 'HR Administrator',
      action,
      module,
      record_id: recordId,
      details,
      created_at: new Date().toISOString()
    };
    auditLogs = [newLog, ...auditLogs];
    saveToStorage('audit_logs', auditLogs);
    return newLog;
  },

  getAuditLogs() {
    return [...auditLogs];
  },

  // --- NOTIFICATIONS & ALERTS ---
  getNotifications() {
    // Dynamically check expiring documents & contracts
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

    // Merge static and dynamic without duplicates
    const combined = [...dynamicNotifs, ...notifications];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique;
  },

  markNotificationAsRead(id) {
    notifications = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    saveToStorage('notifications', notifications);
  },

  // --- EMPLOYEES ---
  getEmployees() {
    return employees.filter(e => !e.is_deleted);
  },

  getEmployeeById(id) {
    return employees.find(e => e.id === id && !e.is_deleted);
  },

  createEmployee(employeeData, user) {
    const newId = `emp-${Date.now()}`;
    const newEmp = {
      ...employeeData,
      id: newId,
      is_deleted: false,
      created_at: new Date().toISOString()
    };
    employees = [newEmp, ...employees];
    saveToStorage('employees', employees);

    // If site/project is assigned, record initial site assignment history
    if (newEmp.assigned_project_id && newEmp.assigned_site_id) {
      const proj = projects.find(p => p.id === newEmp.assigned_project_id);
      const site = sites.find(s => s.id === newEmp.assigned_site_id);
      this.createSiteAssignment({
        employee_id: newId,
        project_id: newEmp.assigned_project_id,
        site_id: newEmp.assigned_site_id,
        position_title: newEmp.designation_id,
        supervisor_name: site?.site_supervisor_name || 'Assigned Supervisor',
        assignment_start: newEmp.date_assigned || newEmp.date_hired || new Date().toISOString().split('T')[0],
        status: 'Active',
        notes: `Initial assignment upon onboarding to ${proj?.name || 'Project'}`
      }, user);
    }

    this.logAudit(user?.name, user?.role, `Created new employee: ${newEmp.first_name} ${newEmp.last_name} (${newEmp.employee_id})`, 'Employees', newId, { employee_id: newEmp.employee_id, category: newEmp.workforce_category });
    return newEmp;
  },

  updateEmployee(id, updates, user) {
    const existing = employees.find(e => e.id === id);
    if (!existing) return null;

    // Check if site assignment changed
    const siteChanged = updates.assigned_site_id && updates.assigned_site_id !== existing.assigned_site_id;
    const projectChanged = updates.assigned_project_id && updates.assigned_project_id !== existing.assigned_project_id;

    if (siteChanged || projectChanged) {
      // Close past active assignment
      siteAssignments = siteAssignments.map(asg => {
        if (asg.employee_id === id && asg.status === 'Active') {
          return { ...asg, status: 'Transferred', assignment_end: new Date().toISOString().split('T')[0] };
        }
        return asg;
      });

      // Create new assignment
      const newSite = sites.find(s => s.id === (updates.assigned_site_id || existing.assigned_site_id));
      this.createSiteAssignment({
        employee_id: id,
        project_id: updates.assigned_project_id || existing.assigned_project_id,
        site_id: updates.assigned_site_id || existing.assigned_site_id,
        position_title: updates.designation_id || existing.designation_id,
        supervisor_name: newSite?.site_supervisor_name || 'Site Supervisor',
        assignment_start: new Date().toISOString().split('T')[0],
        status: 'Active',
        notes: 'Transferred via Employee Profile update'
      }, user);
    }

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    employees = employees.map(e => e.id === id ? updated : e);
    saveToStorage('employees', employees);

    this.logAudit(user?.name, user?.role, `Updated employee profile: ${updated.first_name} ${updated.last_name}`, 'Employees', id, updates);
    return updated;
  },

  softDeleteEmployee(id, user) {
    const existing = employees.find(e => e.id === id);
    if (!existing) return false;

    employees = employees.map(e => e.id === id ? { ...e, is_deleted: true, employment_status: 'Terminated' } : e);
    saveToStorage('employees', employees);
    this.logAudit(user?.name, user?.role, `Deactivated employee: ${existing.first_name} ${existing.last_name} (${existing.employee_id})`, 'Employees', id);
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
      id: `prj-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    projects = [newProj, ...projects];
    saveToStorage('projects', projects);
    this.logAudit(user?.name, user?.role, `Created project: ${newProj.name} (${newProj.project_code})`, 'Projects', newProj.id);
    return newProj;
  },

  updateProject(id, updates, user) {
    projects = projects.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
    saveToStorage('projects', projects);
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
      id: `site-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    sites = [newSite, ...sites];
    saveToStorage('sites', sites);
    this.logAudit(user?.name, user?.role, `Created site: ${newSite.name} (${newSite.site_code})`, 'Sites', newSite.id);
    return newSite;
  },

  updateSite(id, updates, user) {
    sites = sites.map(s => s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s);
    saveToStorage('sites', sites);
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
      id: `asg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    siteAssignments = [newAsg, ...siteAssignments];
    saveToStorage('site_assignments', siteAssignments);
    this.logAudit(user?.name, user?.role, `Created site assignment for employee ${newAsg.employee_id}`, 'Sites', newAsg.id);
    return newAsg;
  },

  // --- DOCUMENTS ---
  getDocumentCategories() {
    return [...documentCategories];
  },

  createDocumentCategory(catData, user) {
    const newCat = { ...catData, id: `cat-${Date.now()}` };
    documentCategories = [...documentCategories, newCat];
    saveToStorage('doc_categories', documentCategories);
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
      id: `doc-${Date.now()}`,
      uploaded_by: user?.id || 'user-hr',
      uploader_name: user?.name || 'HR Administrator',
      created_at: new Date().toISOString()
    };
    documents = [newDoc, ...documents];
    saveToStorage('documents', documents);

    const emp = employees.find(e => e.id === newDoc.employee_id);
    this.logAudit(user?.name, user?.role, `Uploaded document: ${newDoc.document_name} for ${emp ? emp.first_name + ' ' + emp.last_name : 'Employee'}`, 'Documents', newDoc.id);
    return newDoc;
  },

  updateDocument(id, updates, user) {
    documents = documents.map(d => d.id === id ? { ...d, ...updates } : d);
    saveToStorage('documents', documents);
    this.logAudit(user?.name, user?.role, `Updated document metadata ID ${id}`, 'Documents', id);
    return documents.find(d => d.id === id);
  },

  deleteDocument(id, user) {
    const doc = documents.find(d => d.id === id);
    documents = documents.filter(d => d.id !== id);
    saveToStorage('documents', documents);
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
      id: logData.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      attendanceLogs[existingIndex] = newLog;
    } else {
      attendanceLogs = [newLog, ...attendanceLogs];
    }
    saveToStorage('attendance', attendanceLogs);
    this.logAudit(user?.name, user?.role, `Recorded attendance for date ${newLog.date}`, 'Attendance', newLog.id);
    return newLog;
  },

  bulkImportAttendance(records, user) {
    records.forEach(rec => {
      const idx = attendanceLogs.findIndex(a => a.employee_id === rec.employee_id && a.date === rec.date);
      const entry = {
        ...rec,
        id: rec.id || `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        created_at: new Date().toISOString()
      };
      if (idx >= 0) {
        attendanceLogs[idx] = entry;
      } else {
        attendanceLogs.push(entry);
      }
    });
    saveToStorage('attendance', attendanceLogs);
    this.logAudit(user?.name, user?.role, `Bulk imported ${records.length} attendance records`, 'Attendance', null, { count: records.length });
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
      id: `lvr-${Date.now()}`,
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    leaveRequests = [newReq, ...leaveRequests];
    saveToStorage('leave_requests', leaveRequests);
    this.logAudit(user?.name, user?.role, `Submitted leave request for employee ${newReq.employee_id}`, 'Leave', newReq.id);
    return newReq;
  },

  updateLeaveStatus(id, status, approverUser, rejectionReason = null) {
    leaveRequests = leaveRequests.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status,
          approved_by: approverUser?.id || 'admin',
          approver_name: approverUser?.name || 'HR Administrator',
          approval_date: new Date().toISOString(),
          rejection_reason: rejectionReason
        };
      }
      return l;
    });
    saveToStorage('leave_requests', leaveRequests);
    this.logAudit(approverUser?.name, approverUser?.role, `${status} leave request ID ${id}`, 'Leave', id);
    return leaveRequests.find(l => l.id === id);
  },

  // --- PAYROLL & GOVERNMENT RULES ---
  getGovernmentRules() {
    return [...governmentRules];
  },

  updateGovernmentRule(id, updates, user) {
    governmentRules = governmentRules.map(r => r.id === id ? { ...r, ...updates } : r);
    saveToStorage('gov_rules', governmentRules);
    this.logAudit(user?.name, user?.role, `Updated government contribution rule: ${id}`, 'Payroll Settings', id, updates);
    return governmentRules.find(r => r.id === id);
  },

  getPayrollPeriods() {
    return [...payrollPeriods];
  },

  getPayrollPeriodById(id) {
    return payrollPeriods.find(p => p.id === id);
  },

  createPayrollPeriod(periodData, user) {
    const newPeriod = {
      ...periodData,
      id: `pr-${Date.now()}`,
      status: 'Draft',
      total_gross: 0,
      total_deductions: 0,
      total_net: 0,
      created_at: new Date().toISOString()
    };

    // Auto-generate records for all active employees
    const activeEmployees = employees.filter(e => !e.is_deleted && e.employment_status === 'Active');
    const generatedRecords = activeEmployees.map(emp => {
      const calc = computeEmployeePayroll(
        emp,
        { days_worked: emp.workforce_category === 'office' ? 13 : 12, overtime_hours: emp.workforce_category === 'site' ? 6 : 0 },
        governmentRules,
        newPeriod.period_type
      );
      return {
        ...calc,
        id: `pr-rec-${newPeriod.id}-${emp.id}`,
        payroll_period_id: newPeriod.id,
        status: 'Draft'
      };
    });

    const totalGross = generatedRecords.reduce((acc, r) => acc + r.gross_pay, 0);
    const totalDeductions = generatedRecords.reduce((acc, r) => acc + r.total_deductions, 0);
    const totalNet = generatedRecords.reduce((acc, r) => acc + r.net_pay, 0);

    newPeriod.total_gross = totalGross;
    newPeriod.total_deductions = totalDeductions;
    newPeriod.total_net = totalNet;

    payrollPeriods = [newPeriod, ...payrollPeriods];
    payrollRecords = [...payrollRecords, ...generatedRecords];

    saveToStorage('payroll_periods', payrollPeriods);
    saveToStorage('payroll_records', payrollRecords);

    this.logAudit(user?.name, user?.role, `Generated payroll period ${newPeriod.period_code}`, 'Payroll', newPeriod.id, { count: activeEmployees.length, net: totalNet });
    return newPeriod;
  },

  getPayrollRecords(periodId) {
    return payrollRecords.filter(r => r.payroll_period_id === periodId);
  },

  getPayrollRecordsByEmployee(employeeId) {
    return payrollRecords.filter(r => r.employee_id === employeeId);
  },

  updatePayrollRecord(id, updates, user) {
    payrollRecords = payrollRecords.map(r => r.id === id ? { ...r, ...updates } : r);
    saveToStorage('payroll_records', payrollRecords);

    // Recalculate period totals
    const target = payrollRecords.find(r => r.id === id);
    if (target) {
      const records = payrollRecords.filter(r => r.payroll_period_id === target.payroll_period_id);
      const totalGross = records.reduce((acc, r) => acc + r.gross_pay, 0);
      const totalDeductions = records.reduce((acc, r) => acc + r.total_deductions, 0);
      const totalNet = records.reduce((acc, r) => acc + r.net_pay, 0);

      payrollPeriods = payrollPeriods.map(p => p.id === target.payroll_period_id ? {
        ...p,
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_net: totalNet
      } : p);
      saveToStorage('payroll_periods', payrollPeriods);
    }

    this.logAudit(user?.name, user?.role, `Edited payroll record ID ${id}`, 'Payroll', id);
    return payrollRecords.find(r => r.id === id);
  },

  updatePayrollPeriodStatus(periodId, status, user) {
    const p = payrollPeriods.find(item => item.id === periodId);
    if (!p) return null;

    payrollPeriods = payrollPeriods.map(item => {
      if (item.id === periodId) {
        return {
          ...item,
          status,
          approved_by: status === 'Approved' ? user?.id : item.approved_by,
          approver_name: status === 'Approved' ? user?.name : item.approver_name,
          approved_at: status === 'Approved' ? new Date().toISOString() : item.approved_at
        };
      }
      return item;
    });

    payrollRecords = payrollRecords.map(r => r.payroll_period_id === periodId ? { ...r, status } : r);

    saveToStorage('payroll_periods', payrollPeriods);
    saveToStorage('payroll_records', payrollRecords);

    this.logAudit(user?.name, user?.role, `Changed Payroll Period ${p.period_code} status to ${status}`, 'Payroll', periodId);
    return payrollPeriods.find(item => item.id === periodId);
  },

  bulkImportPayroll(periodId, parsedRows, user) {
    parsedRows.forEach(row => {
      const idx = payrollRecords.findIndex(r => r.payroll_period_id === periodId && r.employee_id === row.employee_id);
      const record = {
        ...row,
        id: row.id || `pr-rec-${periodId}-${row.employee_id}`,
        payroll_period_id: periodId
      };
      if (idx >= 0) {
        payrollRecords[idx] = record;
      } else {
        payrollRecords.push(record);
      }
    });

    // Recalculate period totals
    const records = payrollRecords.filter(r => r.payroll_period_id === periodId);
    const totalGross = records.reduce((acc, r) => acc + (Number(r.gross_pay) || 0), 0);
    const totalDeductions = records.reduce((acc, r) => acc + (Number(r.total_deductions) || 0), 0);
    const totalNet = records.reduce((acc, r) => acc + (Number(r.net_pay) || 0), 0);

    payrollPeriods = payrollPeriods.map(p => p.id === periodId ? {
      ...p,
      total_gross: totalGross,
      total_deductions: totalDeductions,
      total_net: totalNet
    } : p);

    saveToStorage('payroll_records', payrollRecords);
    saveToStorage('payroll_periods', payrollPeriods);

    this.logAudit(user?.name, user?.role, `Excel imported ${parsedRows.length} payroll entries for Period ID ${periodId}`, 'Payroll', periodId);
    return parsedRows.length;
  },

  // --- SETTINGS & DEPARTMENTS / DESIGNATIONS ---
  getDepartments() {
    return [...departments];
  },

  createDepartment(deptData, user) {
    const newDept = { ...deptData, id: `dept-${Date.now()}` };
    departments = [...departments, newDept];
    saveToStorage('departments', departments);
    this.logAudit(user?.name, user?.role, `Created department: ${newDept.name}`, 'Settings', newDept.id);
    return newDept;
  },

  updateDepartment(id, updates, user) {
    departments = departments.map(d => d.id === id ? { ...d, ...updates } : d);
    saveToStorage('departments', departments);
    this.logAudit(user?.name, user?.role, `Updated department ID ${id}`, 'Settings', id);
    return departments.find(d => d.id === id);
  },

  getDesignations() {
    return [...designations];
  },

  createDesignation(desigData, user) {
    const newDesig = { ...desigData, id: `desig-${Date.now()}` };
    designations = [...designations, newDesig];
    saveToStorage('designations', designations);
    this.logAudit(user?.name, user?.role, `Created designation: ${newDesig.title}`, 'Settings', newDesig.id);
    return newDesig;
  },

  updateDesignation(id, updates, user) {
    designations = designations.map(d => d.id === id ? { ...d, ...updates } : d);
    saveToStorage('designations', designations);
    this.logAudit(user?.name, user?.role, `Updated designation ID ${id}`, 'Settings', id);
    return designations.find(d => d.id === id);
  },

  getCompanySettings() {
    return { ...companySettings };
  },

  updateCompanySettings(updates, user) {
    companySettings = { ...companySettings, ...updates };
    saveToStorage('company_settings', companySettings);
    this.logAudit(user?.name, user?.role, `Updated company profile settings`, 'Settings');
    return companySettings;
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
