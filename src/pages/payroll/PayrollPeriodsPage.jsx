import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  Calendar,
  PieChart,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import PesoIcon from '../../components/common/PesoIcon';
import { StatusBadge, WorkforceBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../services/payrollEngine';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import ExcelImportWizard from '../../components/import/ExcelImportWizard';
import PayslipModal from '../../components/payslip/PayslipModal';

export const PayrollPeriodsPage = () => {
  const navigate = useNavigate();
  const { currentUser, canEditPayroll } = useAuth();
  const { showToast } = useNotifications();

  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals
  const [isCreatePeriodModalOpen, setIsCreatePeriodModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const [newPeriodData, setNewPeriodData] = useState({
    period_code: 'PR-2026-09A',
    period_type: 'Semi-Monthly',
    start_date: '2026-09-01',
    end_date: '2026-09-15',
    payout_date: '2026-09-20',
    notes: 'First half September regular payroll'
  });

  const loadData = () => {
    const list = dataService.getPayrollPeriods();
    setPeriods(list);
    setEmployees(dataService.getEmployees());
    if (list.length > 0) {
      const active = selectedPeriod ? list.find(p => p.id === selectedPeriod.id) || list[0] : list[0];
      setSelectedPeriod(active);
      setPayrollRecords(dataService.getPayrollRecords(active.id));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleSelectPeriod = (period) => {
    setSelectedPeriod(period);
    setPayrollRecords(dataService.getPayrollRecords(period.id));
  };

  const handleCreatePeriod = (e) => {
    e.preventDefault();
    const created = dataService.createPayrollPeriod(newPeriodData, currentUser);
    showToast(`Payroll Period ${created.period_code} generated.`, 'success');
    setIsCreatePeriodModalOpen(false);
    loadData();
    handleSelectPeriod(created);
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedPeriod) return;
    dataService.updatePayrollPeriodStatus(selectedPeriod.id, newStatus, currentUser);
    showToast(`Payroll Period status changed to ${newStatus}.`, 'success');
    loadData();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <PesoIcon className="w-6 h-6 text-emerald-700" />
            Payroll Management & Disbursements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated statutory calculations for Monthly Salaries & Daily Site Rates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/payroll/labor-cost')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <PieChart className="w-4 h-4 text-emerald-700" />
            <span>Project Labor Costs</span>
          </button>

          {canEditPayroll && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                disabled={!selectedPeriod || selectedPeriod.status === 'Approved' || selectedPeriod.status === 'Paid'}
                className="px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                <span>Import Excel Payroll</span>
              </button>

              <button
                onClick={() => setIsCreatePeriodModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Period</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payroll Periods Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {periods.map((p) => {
          const isSelected = selectedPeriod?.id === p.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSelectPeriod(p)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950 text-white border-emerald-700 shadow-elevated ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-subtle'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.period_code}
                  </span>
                  <h4 className="text-sm font-bold mt-1 font-display">{p.period_type}</h4>
                </div>
                <StatusBadge status={p.status} />
              </div>

              <div className="mt-3">
                <span className={`text-[10px] block uppercase font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                  Disbursed Net
                </span>
                <p className="text-xl font-bold font-mono tracking-tight">
                  {formatCurrency(p.total_net)}
                </p>
              </div>

              <p className={`text-[11px] mt-2 font-mono ${isSelected ? 'text-emerald-200/80' : 'text-slate-500'}`}>
                {p.start_date} → {p.end_date}
              </p>
            </div>
          );
        })}
      </div>

      {/* ACTIVE PERIOD DETAIL & APPROVAL WORKFLOW BAR */}
      {selectedPeriod && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Period: {selectedPeriod.period_code}
                </h2>
                <StatusBadge status={selectedPeriod.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Payout Date: <strong className="text-slate-800 font-mono">{selectedPeriod.payout_date}</strong> • Inclusive: {selectedPeriod.start_date} to {selectedPeriod.end_date}
              </p>
            </div>

            {/* Workflow Action Buttons */}
            {canEditPayroll && (
              <div className="flex items-center gap-2">
                {selectedPeriod.status === 'Draft' && (
                  <button
                    onClick={() => handleStatusChange('For Review')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Submit for Review
                  </button>
                )}
                {selectedPeriod.status === 'For Review' && (
                  <button
                    onClick={() => handleStatusChange('Approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Payroll</span>
                  </button>
                )}
                {selectedPeriod.status === 'Approved' && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-emerald-800 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Locked & Approved
                    </span>
                    <button
                      onClick={() => handleStatusChange('Paid')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Mark as Paid
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Financial Totals Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Total Gross Pay</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(selectedPeriod.total_gross)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Total Deductions (Gov/Tax/Loans)</span>
              <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{formatCurrency(selectedPeriod.total_deductions)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-bold uppercase text-[10px] block">Total Net Payroll</span>
              <p className="text-2xl font-bold font-mono text-emerald-950 mt-0.5">{formatCurrency(selectedPeriod.total_net)}</p>
            </div>
          </div>

          {/* Payroll Records Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5 pl-5">Employee</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Days / Rate</th>
                  <th className="p-3.5">Basic Pay</th>
                  <th className="p-3.5">Overtime Pay</th>
                  <th className="p-3.5">Allowances</th>
                  <th className="p-3.5">Gross Pay</th>
                  <th className="p-3.5">Statutory & Tax</th>
                  <th className="p-3.5">Net Pay</th>
                  <th className="p-3.5 pr-5 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrollRecords.map((rec) => {
                  const emp = employees.find(e => e.id === rec.employee_id);
                  const totalStatutory = (rec.sss_employee || 0) + (rec.philhealth_employee || 0) + (rec.pagibig_employee || 0) + (rec.withholding_tax || 0);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
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
                      <td className="p-3.5"><WorkforceBadge category={rec.workforce_category} /></td>
                      <td className="p-3.5 font-mono">
                        {rec.days_worked}d @ ₱{rec.base_rate}
                      </td>
                      <td className="p-3.5 font-mono">{formatCurrency(rec.basic_pay)}</td>
                      <td className="p-3.5 font-mono text-emerald-700">+{formatCurrency(rec.overtime_pay)}</td>
                      <td className="p-3.5 font-mono">+{formatCurrency(rec.allowances)}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">{formatCurrency(rec.gross_pay)}</td>
                      <td className="p-3.5 font-mono text-rose-700">-{formatCurrency(totalStatutory)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700 text-sm">{formatCurrency(rec.net_pay)}</td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => setSelectedPayslip({ record: rec, period: selectedPeriod })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all"
                        >
                          Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PAYROLL PERIOD MODAL */}
      <Modal
        isOpen={isCreatePeriodModalOpen}
        onClose={() => setIsCreatePeriodModalOpen(false)}
        title="Generate New Payroll Period"
        subtitle="Automatic computation for Office (Monthly) and Site (Daily/Hourly)"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreatePeriod} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Period Code *</label>
            <input
              type="text"
              required
              value={newPeriodData.period_code}
              onChange={(e) => setNewPeriodData({ ...newPeriodData, period_code: e.target.value })}
              placeholder="e.g. PR-2026-09A"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Period Type</label>
            <select
              value={newPeriodData.period_type}
              onChange={(e) => setNewPeriodData({ ...newPeriodData, period_type: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            >
              <option value="Semi-Monthly">Semi-Monthly (1st-15th / 16th-End)</option>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly (Site Workers)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={newPeriodData.start_date}
                onChange={(e) => setNewPeriodData({ ...newPeriodData, start_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={newPeriodData.end_date}
                onChange={(e) => setNewPeriodData({ ...newPeriodData, end_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payout Date *</label>
            <input
              type="date"
              required
              value={newPeriodData.payout_date}
              onChange={(e) => setNewPeriodData({ ...newPeriodData, payout_date: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={newPeriodData.notes}
              onChange={(e) => setNewPeriodData({ ...newPeriodData, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreatePeriodModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Generate Batch Payroll
            </button>
          </div>
        </form>
      </Modal>

      {/* EXCEL PAYROLL IMPORT WIZARD MODAL */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Excel Payroll Import Wizard"
        subtitle={`Importing into Period: ${selectedPeriod?.period_code}`}
        maxWidth="max-w-3xl"
      >
        <ExcelImportWizard
          type="payroll"
          payrollPeriodId={selectedPeriod?.id}
          onComplete={loadData}
          onClose={() => setIsImportModalOpen(false)}
        />
      </Modal>

      {/* PAYSLIP MODAL */}
      {selectedPayslip && (
        <PayslipModal
          isOpen={Boolean(selectedPayslip)}
          onClose={() => setSelectedPayslip(null)}
          record={selectedPayslip.record}
          employee={employees.find(e => e.id === selectedPayslip.record.employee_id)}
          period={selectedPayslip.period}
        />
      )}
    </div>
  );
};

export default PayrollPeriodsPage;
