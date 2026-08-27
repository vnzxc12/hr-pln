import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { excelService } from '../../services/excelService';
import { dataService } from '../../services/dataService';
import confetti from 'canvas-confetti';

export const ExcelImportWizard = ({
  type = 'attendance', // 'attendance' or 'payroll'
  payrollPeriodId = null,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'valid', 'errors'
  const [importSummary, setImportSummary] = useState(null);
  const fileInputRef = useRef(null);

  const existingEmployees = dataService.getEmployees();

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const result = await excelService.readSpreadsheet(uploadedFile);
      setParsedData(result);

      // Validate rows
      let validation = null;
      if (type === 'attendance') {
        validation = excelService.validateAttendanceRows(result.rows, existingEmployees);
      } else {
        validation = excelService.validatePayrollRows(result.rows, existingEmployees);
      }

      setValidationResult(validation);
      setStep(2); // Move to Preview & Validation step
    } catch (err) {
      alert(`Error reading file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    if (type === 'attendance') {
      excelService.downloadAttendanceTemplate(existingEmployees);
    } else {
      excelService.downloadPayrollTemplate(existingEmployees);
    }
  };

  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validCount === 0) return;

    setIsProcessing(true);
    const validRows = validationResult.rows.filter(r => r.isValid).map(r => r.data);

    try {
      let importedCount = 0;
      if (type === 'attendance') {
        importedCount = dataService.bulkImportAttendance(validRows, { name: 'HR Administrator', role: 'HR Admin' });
      } else {
        importedCount = dataService.bulkImportPayroll(payrollPeriodId, validRows, { name: 'Payroll Administrator', role: 'Payroll Admin' });
      }

      // Celebrate success
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setImportSummary({
        total: validationResult.total,
        imported: importedCount,
        rejected: validationResult.errorCount
      });
      setStep(3); // Success Summary
    } catch (err) {
      alert(`Import error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRows = validationResult?.rows.filter(row => {
    if (filterMode === 'valid') return row.isValid;
    if (filterMode === 'errors') return !row.isValid;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </div>
          <span className={`text-xs font-semibold ${step === 1 ? 'text-emerald-900' : 'text-slate-500'}`}>
            Upload Excel
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step === 2 ? 'text-emerald-900' : 'text-slate-500'}`}>
            Validate & Preview
          </span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </div>
          <span className={`text-xs font-semibold ${step === 3 ? 'text-emerald-900' : 'text-slate-500'}`}>
            Commit & Summary
          </span>
        </div>
      </div>

      {/* STEP 1: FILE UPLOAD */}
      {step === 1 && (
        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-10 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-emerald-50/20 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Select Excel or CSV Spreadsheet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Upload standard .xlsx or .csv files containing {type} records.
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              Browse Computer
            </button>
          </div>

          {/* Download Template Option */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Need the standardized template?</p>
                <p className="text-slate-500">Download sample format pre-filled with active company employees.</p>
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & VALIDATION */}
      {step === 2 && validationResult && (
        <div className="space-y-4">
          {/* Validation Metrics Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold uppercase text-slate-500">Total Read</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{validationResult.total}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-[11px] font-bold uppercase text-emerald-700">Valid Rows</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{validationResult.validCount}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-[11px] font-bold uppercase text-rose-700">Errors Found</p>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{validationResult.errorCount}</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === 'all' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Rows ({validationResult.total})
              </button>
              <button
                onClick={() => setFilterMode('valid')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === 'valid' ? 'bg-white shadow-2xs text-emerald-700' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Valid ({validationResult.validCount})
              </button>
              <button
                onClick={() => setFilterMode('errors')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterMode === 'errors' ? 'bg-white shadow-2xs text-rose-700' : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Errors ({validationResult.errorCount})
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredRows.length} entries
            </span>
          </div>

          {/* Preview Grid Table */}
          <div className="max-h-[300px] overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Emp ID</th>
                  <th className="p-2.5">Employee Name</th>
                  {type === 'attendance' ? (
                    <>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">In / Out</th>
                      <th className="p-2.5">Hours</th>
                    </>
                  ) : (
                    <>
                      <th className="p-2.5">Basic Pay</th>
                      <th className="p-2.5">Gross Pay</th>
                      <th className="p-2.5">Net Pay</th>
                    </>
                  )}
                  <th className="p-2.5">Validation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={!row.isValid ? 'bg-rose-50/60' : 'hover:bg-slate-50'}
                  >
                    <td className="p-2.5 font-mono text-slate-500">{row.rowNumber}</td>
                    <td className="p-2.5">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">
                      {row.data.employee_code || '-'}
                    </td>
                    <td className="p-2.5 font-medium text-slate-900">
                      {row.data.employee_name}
                    </td>
                    {type === 'attendance' ? (
                      <>
                        <td className="p-2.5 text-slate-600">{row.data.date}</td>
                        <td className="p-2.5 text-slate-600">{row.data.time_in} - {row.data.time_out}</td>
                        <td className="p-2.5 text-slate-600 font-semibold">{row.data.regular_hours}h (OT: {row.data.overtime_hours}h)</td>
                      </>
                    ) : (
                      <>
                        <td className="p-2.5 text-slate-600">₱{row.data.basic_pay?.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-600 font-medium">₱{row.data.gross_pay?.toLocaleString()}</td>
                        <td className="p-2.5 text-emerald-700 font-bold">₱{row.data.net_pay?.toLocaleString()}</td>
                      </>
                    )}
                    <td className="p-2.5">
                      {row.errors.length > 0 ? (
                        <span className="text-rose-700 text-[11px] font-medium block">
                          {row.errors.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Ready for import</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setFile(null);
                setStep(1);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Change File</span>
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={validationResult.validCount === 0 || isProcessing}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                validationResult.validCount > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                Confirm & Import ({validationResult.validCount} Records)
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS SUMMARY */}
      {step === 3 && importSummary && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">
            Import Completed Successfully
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your {type} dataset has been committed and validated against the workforce database.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Processed Records:</span>
              <span className="font-bold text-slate-900">{importSummary.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-700">Successfully Imported:</span>
              <span className="font-bold text-emerald-700">{importSummary.imported}</span>
            </div>
            {importSummary.rejected > 0 && (
              <div className="flex justify-between">
                <span className="text-rose-600">Rejected (Invalid):</span>
                <span className="font-bold text-rose-600">{importSummary.rejected}</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => {
                onComplete && onComplete();
                onClose && onClose();
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Done & View Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelImportWizard;
