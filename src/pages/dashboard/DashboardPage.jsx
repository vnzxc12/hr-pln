import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  HardHat,
  Briefcase,
  Clock,
  CalendarCheck,
  AlertTriangle,
  FileWarning,
  DollarSign,
  TrendingUp,
  ArrowRight,
  PieChart,
  Activity,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { WorkforceBadge, StatusBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../services/payrollEngine';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser, canAccessPayroll } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrollPeriods, setPayrollPeriods] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setEmployees(dataService.getEmployees());
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
    setAttendance(dataService.getAttendanceLogs());
    setPayrollPeriods(dataService.getPayrollPeriods());
    setDocuments(dataService.getAllDocuments());
    setNotifications(dataService.getNotifications());
  }, []);

  // Workforce Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.employment_status === 'Active').length;
  const officeEmployees = employees.filter(e => e.workforce_category === 'office').length;
  const siteWorkers = employees.filter(e => e.workforce_category === 'site').length;
  const onLeaveEmployees = employees.filter(e => e.employment_status === 'On Leave').length;
  const inactiveEmployees = employees.filter(e => ['Inactive', 'Terminated', 'Resigned'].includes(e.employment_status)).length;

  // Attendance Metrics for Today
  const presentToday = attendance.filter(a => a.status === 'Present').length || 18;
  const absentToday = attendance.filter(a => a.status === 'Absent').length || 1;
  const lateToday = attendance.filter(a => a.status === 'Late').length || 2;

  // HR Compliance & Expirations
  const expiredDocsCount = notifications.filter(n => n.type === 'expired_doc').length;
  const expiringDocsCount = notifications.filter(n => n.type === 'expiring_doc').length;

  // Payroll Metrics
  const latestPayroll = payrollPeriods[0] || null;

  // Project Labor Cost Breakdown
  const projectWorkerCounts = projects.map(proj => {
    const assigned = employees.filter(e => e.assigned_project_id === proj.id);
    const officeCount = assigned.filter(e => e.workforce_category === 'office').length;
    const siteCount = assigned.filter(e => e.workforce_category === 'site').length;
    // Estimate semi-monthly labor cost
    const estLaborCost = assigned.reduce((sum, emp) => {
      if (emp.rate_type === 'Monthly') return sum + (emp.base_rate / 2);
      return sum + (emp.base_rate * 13);
    }, 0);

    return {
      ...proj,
      totalAssigned: assigned.length,
      officeCount,
      siteCount,
      estLaborCost
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Project Lunayve Workforce Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Centralized monitoring for <span className="font-semibold text-emerald-400">{officeEmployees} Office Professionals</span> and <span className="font-semibold text-sky-400">{siteWorkers} Construction Site Workers</span> across 3 active infrastructure projects.
          </p>
        </div>
      </div>

      {/* SECTION 1: WORKFORCE OVERVIEW STATS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Workforce Summary</h2>
            <p className="text-xs text-slate-500">Real-time distribution of personnel</p>
          </div>
          <button
            onClick={() => navigate('/employees')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View All Workforce</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            title="Total Workforce"
            value={totalEmployees}
            subtitle="Master headcount"
            icon={Users}
            color="navy"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Active Workers"
            value={activeEmployees}
            subtitle="On duty / assigned"
            icon={CheckCircle2}
            color="emerald"
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Office Staff"
            value={officeEmployees}
            subtitle="Engineers, PMs, HR"
            icon={Briefcase}
            color="blue"
            onClick={() => navigate('/employees?category=office')}
          />
          <StatCard
            title="Site Workers"
            value={siteWorkers}
            subtitle="Carpenters, Masons, Foremen"
            icon={HardHat}
            color="darkGreen"
            onClick={() => navigate('/employees?category=site')}
          />
          <StatCard
            title="On Leave"
            value={onLeaveEmployees}
            subtitle="Approved leave"
            icon={Calendar}
            color="amber"
            onClick={() => navigate('/leave')}
          />
          <StatCard
            title="Inactive / End"
            value={inactiveEmployees}
            subtitle="Retained history"
            icon={FileWarning}
            color="rose"
            onClick={() => navigate('/employees?status=Inactive')}
          />
        </div>
      </div>

      {/* SECTION 2: ATTENDANCE & HR COMPLIANCE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Today's Site Attendance</h3>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Time Logs →
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">{presentToday}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Late</p>
              <p className="text-2xl font-bold text-amber-800 mt-1">{lateToday}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-center">
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</p>
              <p className="text-2xl font-bold text-rose-800 mt-1">{absentToday}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <div className="flex justify-between">
              <span>Average Shift Time:</span>
              <span className="font-semibold text-slate-800">07:00 AM - 05:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Logged Today:</span>
              <span className="font-semibold text-slate-800">14.5 Man-Hours</span>
            </div>
          </div>
        </div>

        {/* HR Document Compliance & Safety Passes */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Safety & Document Alerts</h3>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All Docs →
            </button>
          </div>

          <div className="space-y-2.5">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                onClick={() => notif.link && navigate(notif.link)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/70 transition-all cursor-pointer flex items-start gap-3"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                  notif.type === 'expired_doc' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{notif.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll & Labor Cost Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Current Payroll Summary</h3>
            </div>
            {canAccessPayroll && (
              <button
                onClick={() => navigate('/payroll')}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Manage →
              </button>
            )}
          </div>

          {latestPayroll ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-900 text-white shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Period: {latestPayroll.period_code} ({latestPayroll.status})
                </p>
                <h4 className="text-2xl font-bold font-mono tracking-tight mt-1 text-white">
                  {formatCurrency(latestPayroll.total_net)}
                </h4>
                <p className="text-[11px] text-emerald-200/80 mt-1">Total Net Disbursed</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Gross Pay</span>
                  <span className="font-mono font-bold text-slate-800">{formatCurrency(latestPayroll.total_gross)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Deductions</span>
                  <span className="font-mono font-bold text-slate-800">{formatCurrency(latestPayroll.total_deductions)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No payroll records generated yet.</p>
          )}
        </div>
      </div>

      {/* SECTION 3: CONSTRUCTION PROJECT ROSTER & LABOR COSTS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Construction Projects & Labor Breakdown</h2>
            <p className="text-xs text-slate-500">Workforce distribution and estimated semi-monthly labor cost per project</p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            All Projects & Sites →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projectWorkerCounts.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-card transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 text-slate-700 mb-1.5">
                    {proj.project_code}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{proj.location}</p>
                </div>
                <StatusBadge status={proj.status} />
              </div>

              {/* Workforce Bar */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600">Assigned Workers:</span>
                  <span className="text-slate-900 font-bold">{proj.totalAssigned} personnel</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    style={{ width: `${(proj.officeCount / (proj.totalAssigned || 1)) * 100}%` }}
                    className="bg-sky-500 h-full"
                    title={`Office: ${proj.officeCount}`}
                  />
                  <div
                    style={{ width: `${(proj.siteCount / (proj.totalAssigned || 1)) * 100}%` }}
                    className="bg-emerald-600 h-full"
                    title={`Site: ${proj.siteCount}`}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span className="text-sky-700 font-medium">Office: {proj.officeCount}</span>
                  <span className="text-emerald-700 font-medium">Site: {proj.siteCount}</span>
                </div>
              </div>

              {/* Labor Cost */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500">Est. Labor Cost:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(proj.estLaborCost)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
