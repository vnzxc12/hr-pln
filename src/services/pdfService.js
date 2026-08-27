import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from './payrollEngine';

export const pdfService = {
  /**
   * Generates a branded, printable PDF Payslip for an employee
   */
  generatePayslipPDF(record, employee, period, company) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [6, 78, 59]; // #064e3b Dark Forest Green
    const accentBlue = [2, 132, 199];  // #0284c7 Lunayve Blue
    const darkSlate = [15, 23, 42];   // #0f172a Deep Slate

    // Header Background Bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 32, 'F');

    // Accent line
    doc.setFillColor(...accentBlue);
    doc.rect(0, 32, 210, 2.5, 'F');

    // Company Title & Branding
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PROJECT LUNAYVE CONSTRUCTION', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('Human Resource & Workforce Management | Confidential Employee Payslip', 14, 23);

    // Document Meta
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`PAYROLL PERIOD: ${period?.period_code || 'PR-2026'}`, 196, 14, { align: 'right' });
    doc.text(`PAYOUT DATE: ${period?.payout_date || '2026-08-31'}`, 196, 20, { align: 'right' });
    doc.text(`STATUS: ${record?.status?.toUpperCase() || 'APPROVED'}`, 196, 26, { align: 'right' });

    // Employee Information Block
    doc.setFontSize(11);
    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE DETAILS', 14, 45);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 48, 182, 34, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Name:', 18, 56);
    doc.text('Employee ID:', 18, 64);
    doc.text('Workforce Category:', 18, 72);

    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'bold');
    doc.text(`${employee?.first_name} ${employee?.middle_name ? employee.middle_name + ' ' : ''}${employee?.last_name} ${employee?.suffix || ''}`, 56, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(employee?.employee_id || 'PLN-000', 56, 64);
    doc.text(employee?.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Construction Worker', 56, 72);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Designation:', 110, 56);
    doc.text('Project / Site:', 110, 64);
    doc.text('Rate Type / Base:', 110, 72);

    doc.setTextColor(...darkSlate);
    doc.setFont('helvetica', 'normal');
    doc.text(employee?.designation_title || 'Employee Position', 140, 56);
    doc.text(`${employee?.project_name || 'Central Office'} / ${employee?.site_name || 'N/A'}`, 140, 64);
    doc.text(`${record?.rate_type} (${formatCurrency(record?.base_rate)})`, 140, 72);

    // Earnings Table (Left Column)
    const earningsData = [
      ['Basic Pay (Regular)', formatCurrency(record?.basic_pay)],
      [`Overtime (${record?.overtime_hours || 0} hrs)`, formatCurrency(record?.overtime_pay)],
      [`Night Diff (${record?.night_diff_hours || 0} hrs)`, formatCurrency(record?.night_diff_pay)],
      [`Holiday / Rest Day`, formatCurrency((record?.holiday_pay || 0) + (record?.rest_day_pay || 0))],
      ['Allowances & Per Diem', formatCurrency(record?.allowances)],
      ['Bonuses & Incentives', formatCurrency(record?.bonuses)],
      ['Other Earnings', formatCurrency(record?.other_earnings)]
    ];

    // Deductions Table (Right Column)
    const deductionsData = [
      ['SSS Contribution (EE)', formatCurrency(record?.sss_employee)],
      ['PhilHealth Premium (EE)', formatCurrency(record?.philhealth_employee)],
      ['Pag-IBIG / HDMF (EE)', formatCurrency(record?.pagibig_employee)],
      ['Withholding Tax (BIR)', formatCurrency(record?.withholding_tax)],
      ['Employee Loans', formatCurrency(record?.employee_loans)],
      ['Cash Advances', formatCurrency(record?.cash_advances)],
      ['Late / Undertime Deduction', formatCurrency(record?.late_undertime_deduction || 0)],
      ['Other Deductions', formatCurrency(record?.other_deductions)]
    ];

    // AutoTables for Side-by-Side Breakdown
    doc.autoTable({
      startY: 88,
      margin: { left: 14, right: 110 },
      head: [['EARNINGS', 'AMOUNT']],
      body: earningsData,
      foot: [['GROSS PAY', formatCurrency(record?.gross_pay)]],
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: primaryColor, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2 }
    });

    doc.autoTable({
      startY: 88,
      margin: { left: 110, right: 14 },
      head: [['DEDUCTIONS', 'AMOUNT']],
      body: deductionsData,
      foot: [['TOTAL DEDUCTIONS', formatCurrency(record?.total_deductions)]],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 2 }
    });

    const finalY = Math.max(doc.lastAutoTable.finalY, 175);

    // NET PAY SUMMARY BOX
    doc.setFillColor(6, 78, 59);
    doc.roundedRect(14, finalY + 6, 182, 22, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL NET PAY (TAKE HOME):', 22, finalY + 20);

    doc.setFontSize(16);
    doc.setTextColor(134, 239, 172); // Light emerald green
    doc.text(formatCurrency(record?.net_pay), 190, finalY + 20, { align: 'right' });

    // Signatures Section
    const sigY = finalY + 45;
    doc.setTextColor(...darkSlate);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Prepared by
    doc.line(20, sigY, 80, sigY);
    doc.text('Prepared / Verified By: HR Officer', 20, sigY + 5);

    // Employee Signature
    doc.line(130, sigY, 190, sigY);
    doc.text('Employee Signature & Date Received', 130, sigY + 5);

    // Footer Disclaimer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Project Lunayve Construction | A product by VCS Technologies | © 2026 VCS Technologies. All rights reserved.', 105, 285, { align: 'center' });
    doc.text('This is a computer-generated official payslip. No manual alteration is permitted.', 105, 290, { align: 'center' });

    // Save and download
    const fileName = `Payslip_${employee?.employee_id}_${period?.period_code || 'Period'}.pdf`;
    doc.save(fileName);
  }
};
