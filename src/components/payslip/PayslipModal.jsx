import React from 'react';
import { Download, Printer, Building2, User, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../services/payrollEngine';
import { pdfService } from '../../services/pdfService';
import { dataService } from '../../services/dataService';

export const PayslipModal = ({ isOpen, onClose, record, employee, period }) => {
  if (!record || !employee) return null;

  const company = dataService.getCompanySettings();

  const handleDownloadPDF = () => {
    pdfService.generatePayslipPDF(record, employee, period, company);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Payslip"
      subtitle={`Period: ${period?.period_code || 'PR-2026'} • Payout: ${period?.payout_date || '2026-08-31'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-slate-800">
        {/* Printable Paper Canvas */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  PROJECT LUNAYVE CONSTRUCTION
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Human Resource & Workforce Management | Confidential
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {record.status?.toUpperCase() || 'APPROVED'}
              </span>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                Ref: {record.id}
              </p>
            </div>
          </div>

          {/* Employee Metadata Info Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Employee Name:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {employee.first_name} {employee.middle_name ? employee.middle_name + ' ' : ''}{employee.last_name} {employee.suffix || ''}
              </p>
              <p className="text-slate-500 mt-1">
                ID: <span className="font-mono font-bold text-emerald-800">{employee.employee_id}</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                Category: <span className="font-semibold text-slate-700">{employee.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Worker'}</span>
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Designation & Location:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {employee.designation_title || 'Position'}
              </p>
              <p className="text-slate-500 mt-1">
                Rate Type: <span className="font-semibold text-slate-700">{record.rate_type} ({formatCurrency(record.base_rate)})</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                Days / Hours Worked: <span className="font-semibold text-slate-700">{record.days_worked} days ({record.regular_hours} hrs)</span>
              </p>
            </div>
          </div>

          {/* Earnings & Deductions Breakdown Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* EARNINGS COLUMN */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-800 text-white font-bold px-3.5 py-2 flex justify-between">
                <span>EARNINGS BREAKDOWN</span>
                <span>AMOUNT</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Basic Pay</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.basic_pay)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Overtime Pay ({record.overtime_hours || 0} hrs)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.overtime_pay)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Night Differential ({record.night_diff_hours || 0} hrs)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.night_diff_pay)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Holiday & Rest Day Pay</span>
                  <span className="font-mono font-semibold">{formatCurrency((record.holiday_pay || 0) + (record.rest_day_pay || 0))}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Allowances & Per Diem</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.allowances)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Bonuses / Other Earnings</span>
                  <span className="font-mono font-semibold">{formatCurrency((record.bonuses || 0) + (record.other_earnings || 0))}</span>
                </div>
              </div>
              <div className="bg-emerald-50 px-3.5 py-2.5 flex justify-between font-bold text-emerald-900 border-t border-emerald-200">
                <span>GROSS PAY</span>
                <span className="font-mono text-sm">{formatCurrency(record.gross_pay)}</span>
              </div>
            </div>

            {/* DEDUCTIONS COLUMN */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-900 text-white font-bold px-3.5 py-2 flex justify-between">
                <span>DEDUCTIONS BREAKDOWN</span>
                <span>AMOUNT</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">SSS Contribution (EE)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.sss_employee)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">PhilHealth Premium (EE)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.philhealth_employee)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Pag-IBIG / HDMF (EE)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.pagibig_employee)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Withholding Tax (BIR)</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.withholding_tax)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Employee Loans</span>
                  <span className="font-mono font-semibold">{formatCurrency(record.employee_loans)}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Late / Undertime / Others</span>
                  <span className="font-mono font-semibold">{formatCurrency((record.late_undertime_deduction || 0) + (record.other_deductions || 0))}</span>
                </div>
              </div>
              <div className="bg-slate-100 px-3.5 py-2.5 flex justify-between font-bold text-slate-900 border-t border-slate-200">
                <span>TOTAL DEDUCTIONS</span>
                <span className="font-mono text-sm">{formatCurrency(record.total_deductions)}</span>
              </div>
            </div>
          </div>

          {/* NET PAY BANNER */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                Total Net Take-Home Pay
              </p>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Transferred to Employee Payroll Account
              </p>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-300">
              {formatCurrency(record.net_pay)}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Payslip</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;
