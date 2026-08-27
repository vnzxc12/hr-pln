import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, History, UserCheck, Clock, Download } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { excelService } from '../../services/excelService';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  useEffect(() => {
    setLogs(dataService.getAuditLogs());
  }, []);

  const handleExport = () => {
    const data = filteredLogs.map(l => ({
      'Date & Time': new Date(l.created_at).toLocaleString(),
      'User Name': l.user_name,
      'Role': l.user_role,
      'Module': l.module,
      'Action': l.action,
      'Record ID': l.record_id || 'N/A',
      'Details': JSON.stringify(l.details || {})
    }));
    excelService.exportToExcel(data, 'Lunayve_Audit_Trail_Export', 'AuditLogs');
  };

  const filteredLogs = logs.filter(l => {
    if (selectedModule !== 'all' && l.module !== selectedModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = l.action.toLowerCase().includes(q);
      const matchUser = l.user_name.toLowerCase().includes(q);
      const matchModule = l.module.toLowerCase().includes(q);
      if (!matchAction && !matchUser && !matchModule) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-700" />
            System Audit Trail & Governance Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of employee modifications, site reassignments, document uploads, and payroll approvals
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by actor, action description, or record ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold"
          >
            <option value="all">All Modules</option>
            <option value="Employees">Employees</option>
            <option value="Payroll">Payroll</option>
            <option value="Sites">Sites & Deployments</option>
            <option value="Documents">Documents</option>
            <option value="Attendance">Attendance</option>
            <option value="Leave">Leave Requests</option>
            <option value="Settings">Settings</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Timestamp</th>
                <th className="p-3.5">Actor (User)</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5 pr-5">Record Reference / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No audit records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {log.user_name}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {log.user_role}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-800">
                      {log.module}
                    </td>
                    <td className="p-3.5 font-medium text-slate-900">
                      {log.action}
                    </td>
                    <td className="p-3.5 pr-5 font-mono text-[11px] text-slate-500 max-w-xs truncate">
                      {log.record_id ? `ID: ${log.record_id}` : (log.details ? JSON.stringify(log.details) : '-')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
