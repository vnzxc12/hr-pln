import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Printer,
  Users,
  Clock,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import PesoIcon from '../../components/common/PesoIcon';
import { dataService } from '../../services/dataService';
import { excelService } from '../../services/excelService';
import { formatCurrency } from '../../services/payrollEngine';
import { StatusBadge, WorkforceBadge } from '../../components/common/Badge';

export const ReportsPage = () => {
  const [activeReportTab, setActiveReportTab] = useState('employees'); // 'employees', 'attendance', 'payroll', 'documents'

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    setEmployees(dataService.getEmployees());
    setDepartments(dataService.getDepartments());
    setDesignations(dataService.getDesignations());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
    setAttendance(dataService.getAttendanceLogs());
    setPayrollRecords(dataService.getPayrollRecords(dataService.getPayrollPeriods()[0]?.id));
    setPayrollPeriods(dataService.getPayrollPeriods());
    setDocuments(dataService.getAllDocuments());
  }, []);

  // Report 1: Employee Master List Export
  const handleExportEmployees = () => {
    const data = employees.map(e => ({
      'Employee ID': e.employee_id,
      'Full Name': `${e.first_name} ${e.last_name}`,
      'Workforce Category': e.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Worker',
      'Designation': designations.find(d => d.id === e.designation_id)?.title || 'N/A',
      'Department': departments.find(d => d.id === e.department_id)?.name || 'N/A',
      'Project': projects.find(p => p.id === e.assigned_project_id)?.name || 'Headquarters',
      'Site': sites.find(s => s.id === e.assigned_site_id)?.name || 'Office',
      'Status': e.employment_status,
      'Date Hired': e.date_hired,
      'Rate Type': e.rate_type,
      'Base Rate': e.base_rate,
      'SSS': e.sss_number,
      'PhilHealth': e.philhealth_number,
      'Pag-IBIG': e.pagibig_number,
      'TIN': e.tin_number
    }));
    excelService.exportToExcel(data, 'Lunayve_HR_Master_Workforce_Report', 'MasterList');
  };

  // Report 2: Attendance & Overtime Summary Export
  const handleExportAttendance = () => {
    const data = attendance.map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      return {
        'Date': a.date,
        'Employee ID': emp?.employee_id || 'N/A',
        'Employee Name': emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        'Category': emp?.workforce_category,
        'Time In': a.time_in,
        'Time Out': a.time_out,
        'Regular Hours': a.regular_hours,
        'Overtime Hours': a.overtime_hours,
        'Late Minutes': a.late_minutes,
        'Status': a.status
      };
    });
    excelService.exportToExcel(data, 'Lunayve_Attendance_Overtime_Report', 'Attendance');
  };

  // Report 3: Government Contributions Remittance Summary
  const handleExportGovernment = () => {
    const data = payrollRecords.map(r => {
      const emp = employees.find(e => e.id === r.employee_id);
      return {
        'Employee ID': emp?.employee_id || 'N/A',
        'Employee Name': emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        'SSS Number': emp?.sss_number || 'N/A',
        'SSS Employee Share': r.sss_employee,
        'SSS Employer Share': r.sss_employer,
        'SSS Total Remittance': (r.sss_employee || 0) + (r.sss_employer || 0),
        'PhilHealth Number': emp?.philhealth_number || 'N/A',
        'PhilHealth Employee Share': r.philhealth_employee,
        'PhilHealth Employer Share': r.philhealth_employer,
        'PhilHealth Total Remittance': (r.philhealth_employee || 0) + (r.philhealth_employer || 0),
        'Pag-IBIG Number': emp?.pagibig_number || 'N/A',
        'Pag-IBIG Employee Share': r.pagibig_employee,
        'Pag-IBIG Employer Share': r.pagibig_employer,
        'Pag-IBIG Total Remittance': (r.pagibig_employee || 0) + (r.pagibig_employer || 0),
        'Withholding Tax (BIR)': r.withholding_tax
      };
    });
    excelService.exportToExcel(data, 'Lunayve_Government_Contributions_Remittance', 'Remittance');
  };

  // Report 4: Document Expiration & Compliance
  const handleExportDocuments = () => {
    const data = documents.map(d => {
      const emp = employees.find(e => e.id === d.employee_id);
      const isExp = d.expiration_date && new Date(d.expiration_date) < new Date();
      return {
        'Document Name': d.document_name,
        'Employee ID': emp?.employee_id || 'N/A',
        'Employee Name': emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        'Expiration Date': d.expiration_date || 'No Expiry',
        'Status': isExp ? 'EXPIRED' : 'VALID',
        'Uploader': d.uploader_name
      };
    });
    excelService.exportToExcel(data, 'Lunayve_Document_Compliance_Report', 'Documents');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-700" />
            Executive Reports & Government Compliance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready exportable reports for SSS, PhilHealth, Pag-IBIG, DOLE OSH, and Labor Costing
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>
      </div>

      {/* Reports Tab Navigation */}
      <div className="tab-scroll-container flex items-center gap-2.5 pb-3 pt-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'employees', label: '1. Master Workforce Roster', icon: Users },
          { id: 'attendance', label: '2. Site Attendance & Overtime', icon: Clock },
          { id: 'payroll', label: '3. Government Contributions (SSS/PH/HDMF/BIR)', icon: PesoIcon },
          { id: 'documents', label: '4. Safety Passes & Document Expirations', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReportTab(tab.id)}
              className={`tab-nav-btn group transition-all duration-200 ease-in-out cursor-pointer ${
                isActive
                  ? 'bg-emerald-900 dark:bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-900/20 font-bold border border-emerald-800 dark:border-emerald-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white shadow-2xs'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ease-in-out ${isActive ? 'text-emerald-300' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`} />
              <span>{tab.label}</span>
              {/* Below Hover & Active Indicator Bar */}
              <span
                className={`absolute -bottom-3 left-2 right-2 h-1 rounded-full transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-emerald-600 dark:bg-emerald-400 opacity-100 shadow-xs'
                    : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-600 group-hover:opacity-100 opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* REPORT 1: EMPLOYEE MASTER LIST */}
      {activeReportTab === 'employees' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Workforce Report</h3>
              <p className="text-xs text-slate-500">Comprehensive demographic, position, and site distribution</p>
            </div>
            <button
              onClick={handleExportEmployees}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (XLSX)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Project / Site</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3 pl-4 font-mono font-bold">{emp.employee_id}</td>
                    <td className="p-3 font-semibold text-slate-900">{emp.first_name} {emp.last_name}</td>
                    <td className="p-3"><WorkforceBadge category={emp.workforce_category} /></td>
                    <td className="p-3 text-slate-700">{designations.find(d => d.id === emp.designation_id)?.title || 'N/A'}</td>
                    <td className="p-3 text-slate-600">{projects.find(p => p.id === emp.assigned_project_id)?.name || 'HQ'}</td>
                    <td className="p-3"><StatusBadge status={emp.employment_status} /></td>
                    <td className="p-3 font-mono font-bold">₱{Number(emp.base_rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: ATTENDANCE */}
      {activeReportTab === 'attendance' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance & Overtime Summary Report</h3>
              <p className="text-xs text-slate-500">Shift compliance and accumulated overtime hours</p>
            </div>
            <button
              onClick={handleExportAttendance}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (XLSX)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Date</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">In - Out</th>
                  <th className="p-3">Regular Hours</th>
                  <th className="p-3">Overtime</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map(a => {
                  const emp = employees.find(e => e.id === a.employee_id);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-mono font-bold">{a.date}</td>
                      <td className="p-3 font-semibold">{emp ? `${emp.first_name} ${emp.last_name}` : 'N/A'}</td>
                      <td className="p-3 font-mono">{a.time_in} - {a.time_out}</td>
                      <td className="p-3">{a.regular_hours} hrs</td>
                      <td className="p-3 font-semibold text-emerald-700">{a.overtime_hours} hrs</td>
                      <td className="p-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: GOVERNMENT CONTRIBUTIONS */}
      {activeReportTab === 'payroll' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Government Remittance Summary Report</h3>
              <p className="text-xs text-slate-500">Detailed breakdown of SSS, PhilHealth, Pag-IBIG & BIR Withholding Taxes</p>
            </div>
            <button
              onClick={handleExportGovernment}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (XLSX)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Employee</th>
                  <th className="p-3">SSS (EE + ER)</th>
                  <th className="p-3">PhilHealth (EE + ER)</th>
                  <th className="p-3">Pag-IBIG (EE + ER)</th>
                  <th className="p-3">BIR Tax</th>
                  <th className="p-3">Gross Pay</th>
                  <th className="p-3 pr-4">Net Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRecords.map(r => {
                  const emp = employees.find(e => e.id === r.employee_id);
                  const totalSSS = (r.sss_employee || 0) + (r.sss_employer || 0);
                  const totalPH = (r.philhealth_employee || 0) + (r.philhealth_employer || 0);
                  const totalHDMF = (r.pagibig_employee || 0) + (r.pagibig_employer || 0);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-semibold">{emp ? `${emp.first_name} ${emp.last_name}` : 'Employee'}</td>
                      <td className="p-3 font-mono">{formatCurrency(totalSSS)}</td>
                      <td className="p-3 font-mono">{formatCurrency(totalPH)}</td>
                      <td className="p-3 font-mono">{formatCurrency(totalHDMF)}</td>
                      <td className="p-3 font-mono text-rose-700">{formatCurrency(r.withholding_tax)}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{formatCurrency(r.gross_pay)}</td>
                      <td className="p-3 pr-4 font-mono font-bold text-emerald-700">{formatCurrency(r.net_pay)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: DOCUMENT EXPIRATION */}
      {activeReportTab === 'documents' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Document Expiration & DOLE Compliance Report</h3>
              <p className="text-xs text-slate-500">Tracking safety inductions, heavy equipment licenses, and contracts</p>
            </div>
            <button
              onClick={handleExportDocuments}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel (XLSX)</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Document Title</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Expiration Date</th>
                  <th className="p-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(d => {
                  const emp = employees.find(e => e.id === d.employee_id);
                  const isExp = d.expiration_date && new Date(d.expiration_date) < new Date();
                  return (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 pl-4 font-bold text-slate-900">{d.document_name}</td>
                      <td className="p-3 font-semibold">{emp ? `${emp.first_name} ${emp.last_name}` : 'N/A'}</td>
                      <td className="p-3 font-mono text-slate-500">{d.file_name}</td>
                      <td className="p-3 font-mono font-bold">{d.expiration_date || 'No Expiry'}</td>
                      <td className="p-3 pr-4">
                        {isExp ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                            EXPIRED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            VALID
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
