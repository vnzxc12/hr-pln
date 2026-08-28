import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Filter,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
  Search
} from 'lucide-react';
import { StatusBadge, WorkforceBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { excelService } from '../../services/excelService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import ExcelImportWizard from '../../components/import/ExcelImportWizard';

export const AttendanceListPage = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);

  // Modals
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [entryData, setEntryData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    time_in: '07:00',
    time_out: '17:00',
    regular_hours: 8,
    overtime_hours: 0,
    night_diff_hours: 0,
    late_minutes: 0,
    status: 'Present',
    notes: 'Regular site shift'
  });

  const loadData = () => {
    setAttendance(dataService.getAttendanceLogs());
    setEmployees(dataService.getEmployees());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleCreateEntry = (e) => {
    e.preventDefault();
    if (!entryData.employee_id) {
      alert('Please select an employee.');
      return;
    }
    const emp = employees.find(item => item.id === entryData.employee_id);
    dataService.recordAttendance({
      ...entryData,
      project_id: emp?.assigned_project_id,
      site_id: emp?.assigned_site_id
    }, currentUser);

    setIsEntryModalOpen(false);
    loadData();
  };

  const handleExportAttendance = () => {
    const exportData = filteredAttendance.map(a => {
      const emp = employees.find(e => e.id === a.employee_id);
      const prj = projects.find(p => p.id === a.project_id);
      const st = sites.find(s => s.id === a.site_id);
      return {
        'Date': a.date,
        'Employee ID': emp?.employee_id || 'N/A',
        'Employee Name': emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        'Category': emp?.workforce_category || 'site',
        'Project': prj?.name || 'Office',
        'Site': st?.name || 'Office',
        'Time In': a.time_in,
        'Time Out': a.time_out,
        'Regular Hours': a.regular_hours,
        'Overtime Hours': a.overtime_hours,
        'Late (Mins)': a.late_minutes,
        'Status': a.status
      };
    });
    excelService.exportToExcel(exportData, `Lunayve_Attendance_${selectedDate}`, 'Attendance');
  };

  // Filtered List
  const filteredAttendance = attendance.filter(att => {
    if (selectedDate && att.date !== selectedDate) return false;
    const emp = employees.find(e => e.id === att.employee_id);
    if (selectedCategory !== 'all' && emp?.workforce_category !== selectedCategory) return false;
    if (selectedProject !== 'all' && att.project_id !== selectedProject) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-700" />
            Time & Attendance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric and site duty tracking for office staff and construction crews
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAttendance}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Time Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Select Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold bg-slate-50"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Workforce Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
          >
            <option value="all">All Workforce</option>
            <option value="office">Office / Professional</option>
            <option value="site">Site / Skilled Worker</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Project Site</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
          >
            Reset to Today
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Employee</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Time In / Out</th>
                <th className="p-3.5">Regular Hours</th>
                <th className="p-3.5">Overtime (OT)</th>
                <th className="p-3.5">Late (Mins)</th>
                <th className="p-3.5">Project / Site</th>
                <th className="p-3.5 pr-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No time logs found for the selected date ({selectedDate}). Click "Record Time Log" or "Import Excel".
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((att) => {
                  const emp = employees.find(e => e.id === att.employee_id);
                  const proj = projects.find(p => p.id === att.project_id);
                  const site = sites.find(s => s.id === att.site_id);

                  return (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp?.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'}
                            alt={emp?.first_name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</p>
                            <span className="font-mono text-[10px] text-slate-500">{emp?.employee_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5"><WorkforceBadge category={emp?.workforce_category} /></td>
                      <td className="p-3.5 font-mono text-slate-700 font-medium">
                        {att.time_in} - {att.time_out}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">{att.regular_hours} hrs</td>
                      <td className="p-3.5 font-semibold text-emerald-700">
                        {att.overtime_hours > 0 ? `+${att.overtime_hours} hrs` : '0 hrs'}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {att.late_minutes > 0 ? <span className="text-amber-700 font-bold">{att.late_minutes} min</span> : '0 min'}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{proj?.name || 'Central Office'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{site?.name || 'HQ'}</p>
                      </td>
                      <td className="p-3.5 pr-5"><StatusBadge status={att.status} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD TIME LOG MODAL */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Record Employee Time Log"
        subtitle="Individual Daily Entry"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Employee *</label>
            <select
              required
              value={entryData.employee_id}
              onChange={(e) => setEntryData({ ...entryData, employee_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={entryData.date}
              onChange={(e) => setEntryData({ ...entryData, date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time In</label>
              <input
                type="time"
                value={entryData.time_in}
                onChange={(e) => setEntryData({ ...entryData, time_in: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Out</label>
              <input
                type="time"
                value={entryData.time_out}
                onChange={(e) => setEntryData({ ...entryData, time_out: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Regular Hrs</label>
              <input
                type="number"
                step="0.5"
                value={entryData.regular_hours}
                onChange={(e) => setEntryData({ ...entryData, regular_hours: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Overtime Hrs</label>
              <input
                type="number"
                step="0.5"
                value={entryData.overtime_hours}
                onChange={(e) => setEntryData({ ...entryData, overtime_hours: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Late (Mins)</label>
              <input
                type="number"
                value={entryData.late_minutes}
                onChange={(e) => setEntryData({ ...entryData, late_minutes: parseInt(e.target.value) || 0 })}
                className="w-full p-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status</label>
            <select
              value={entryData.status}
              onChange={(e) => setEntryData({ ...entryData, status: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            >
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
            </select>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Save Time Log
            </button>
          </div>
        </form>
      </Modal>

      {/* EXCEL ATTENDANCE IMPORT WIZARD MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Excel Attendance Import Wizard"
        subtitle="10-Step Automated Validation & Commit Workflow"
        maxWidth="max-w-3xl"
      >
        <ExcelImportWizard
          type="attendance"
          onComplete={loadData}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default AttendanceListPage;
