import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, DollarSign, Building, HardHat, Users, ArrowLeft, Download, TrendingUp } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../services/payrollEngine';
import { excelService } from '../../services/excelService';

export const LaborCostAnalyticsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');

  useEffect(() => {
    setProjects(dataService.getProjects());
    setSites(dataService.getSites());
    setEmployees(dataService.getEmployees());
    setDesignations(dataService.getDesignations());
  }, []);

  // Compute Project Labor Rollups
  const projectLaborData = projects.map(proj => {
    const assigned = employees.filter(e => e.assigned_project_id === proj.id);
    const officeCount = assigned.filter(e => e.workforce_category === 'office').length;
    const siteCount = assigned.filter(e => e.workforce_category === 'site').length;

    // Monthly estimated labor cost
    const monthlyLaborCost = assigned.reduce((sum, emp) => {
      if (emp.rate_type === 'Monthly') return sum + Number(emp.base_rate);
      return sum + (Number(emp.base_rate) * 26);
    }, 0);

    // Group workers by designation
    const byDesignation = {};
    assigned.forEach(emp => {
      const desig = designations.find(d => d.id === emp.designation_id)?.title || 'General';
      byDesignation[desig] = (byDesignation[desig] || 0) + 1;
    });

    return {
      ...proj,
      totalWorkers: assigned.length,
      officeCount,
      siteCount,
      monthlyLaborCost,
      byDesignation
    };
  });

  const totalCompanyLaborCost = projectLaborData.reduce((acc, p) => acc + p.monthlyLaborCost, 0);

  const filteredProjects = selectedProjectId === 'all'
    ? projectLaborData
    : projectLaborData.filter(p => p.id === selectedProjectId);

  const handleExportLaborCost = () => {
    const exportData = [];
    filteredProjects.forEach(p => {
      Object.entries(p.byDesignation).forEach(([desig, count]) => {
        exportData.push({
          'Project Code': p.project_code,
          'Project Name': p.name,
          'Designation': desig,
          'Worker Headcount': count,
          'Est Monthly Project Cost': p.monthlyLaborCost
        });
      });
    });
    excelService.exportToExcel(exportData, 'Lunayve_Labor_Cost_Analytics', 'LaborCost');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate('/payroll')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Payroll Periods</span>
      </button>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <PieChart className="w-6 h-6 text-emerald-700" />
            Project Labor Cost Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Workforce expenditure breakdown by infrastructure project, construction site, and trade designations
          </p>
        </div>

        <button
          onClick={handleExportLaborCost}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
        >
          <Download className="w-4 h-4 text-emerald-700" />
          <span>Export Analytics (XLSX)</span>
        </button>
      </div>

      {/* Top Banner Total Monthly Labor Cost */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 to-emerald-950 text-white shadow-elevated border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Total Active Workforce Estimated Monthly Labor Burn
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mt-1 text-white">
            {formatCurrency(totalCompanyLaborCost)}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Across {projects.length} major infrastructure projects and central headquarters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Construction Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Labor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                    {proj.project_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 font-display">{proj.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{proj.client}</p>
                </div>
              </div>

              {/* Monthly Labor Cost Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Est. Monthly Project Labor Cost
                </span>
                <p className="text-2xl font-bold font-mono tracking-tight mt-0.5">
                  {formatCurrency(proj.monthlyLaborCost)}
                </p>
              </div>

              {/* Workforce Distribution by Trade Designation */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Workers by Trade Designation ({proj.totalWorkers} Total)
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl p-1 max-h-48 overflow-y-auto">
                  {Object.entries(proj.byDesignation).map(([desig, count]) => (
                    <div key={desig} className="flex items-center justify-between p-2 text-xs">
                      <span className="text-slate-700 font-medium">{desig}</span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {count} workers
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Office: <strong>{proj.officeCount}</strong></span>
              <span>Site Workers: <strong>{proj.siteCount}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LaborCostAnalyticsPage;
