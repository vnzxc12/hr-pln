import * as XLSX from 'xlsx';

export const excelService = {
  /**
   * Reads raw Excel or CSV file into JSON array
   */
  async readSpreadsheet(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve({
            sheetNames: workbook.SheetNames,
            activeSheet: firstSheetName,
            rows: json
          });
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err.message}`));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Validates Attendance import rows against system employees
   */
  validateAttendanceRows(rows, existingEmployees = []) {
    const results = [];
    const empIdMap = new Map(existingEmployees.map(e => [e.employee_id.trim().toUpperCase(), e]));
    const seenCombos = new Set();

    rows.forEach((row, index) => {
      const rowNum = index + 2; // Row 1 is header
      const errors = [];
      const warnings = [];

      // Normalize field names
      const rawEmpId = String(row['Employee ID'] || row['employee_id'] || row['Emp ID'] || '').trim();
      const rawDate = String(row['Date'] || row['date'] || '').trim();
      const timeIn = String(row['Time In'] || row['time_in'] || '07:00:00').trim();
      const timeOut = String(row['Time Out'] || row['time_out'] || '17:00:00').trim();
      const regularHours = parseFloat(row['Regular Hours'] || row['regular_hours'] || 8);
      const overtimeHours = parseFloat(row['Overtime Hours'] || row['overtime'] || 0);
      const status = String(row['Status'] || row['status'] || 'Present').trim();

      // 1. Employee ID check
      let matchedEmployee = null;
      if (!rawEmpId) {
        errors.push('Missing Employee ID');
      } else {
        matchedEmployee = empIdMap.get(rawEmpId.toUpperCase());
        if (!matchedEmployee) {
          errors.push(`Employee ID "${rawEmpId}" not found in system`);
        }
      }

      // 2. Date check
      if (!rawDate) {
        errors.push('Missing Date');
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate) && isNaN(Date.parse(rawDate))) {
        errors.push(`Invalid Date format "${rawDate}" (expected YYYY-MM-DD)`);
      }

      // 3. Duplicate check within file
      const combo = `${rawEmpId}_${rawDate}`;
      if (seenCombos.has(combo)) {
        errors.push(`Duplicate entry for ${rawEmpId} on ${rawDate}`);
      } else {
        seenCombos.add(combo);
      }

      // 4. Numeric bounds
      if (isNaN(regularHours) || regularHours < 0 || regularHours > 24) {
        errors.push(`Invalid regular hours: ${regularHours}`);
      }

      results.push({
        rowNumber: rowNum,
        isValid: errors.length === 0,
        errors,
        warnings,
        data: {
          employee_id: matchedEmployee ? matchedEmployee.id : null,
          employee_code: rawEmpId,
          employee_name: matchedEmployee ? `${matchedEmployee.first_name} ${matchedEmployee.last_name}` : (row['Employee Name'] || 'Unknown'),
          workforce_category: matchedEmployee ? matchedEmployee.workforce_category : 'site',
          project_id: matchedEmployee?.assigned_project_id || null,
          site_id: matchedEmployee?.assigned_site_id || null,
          date: rawDate,
          time_in: timeIn,
          time_out: timeOut,
          regular_hours: isNaN(regularHours) ? 8 : regularHours,
          overtime_hours: isNaN(overtimeHours) ? 0 : overtimeHours,
          status: status || 'Present',
          late_minutes: parseInt(row['Late Minutes'] || 0, 10) || 0,
          undertime_minutes: parseInt(row['Undertime Minutes'] || 0, 10) || 0
        }
      });
    });

    return {
      total: results.length,
      validCount: results.filter(r => r.isValid).length,
      errorCount: results.filter(r => !r.isValid).length,
      rows: results
    };
  },

  /**
   * Validates Payroll Excel import rows
   */
  validatePayrollRows(rows, existingEmployees = []) {
    const results = [];
    const empIdMap = new Map(existingEmployees.map(e => [e.employee_id.trim().toUpperCase(), e]));
    const seen = new Set();

    rows.forEach((row, index) => {
      const rowNum = index + 2;
      const errors = [];
      const warnings = [];

      const rawEmpId = String(row['Employee ID'] || row['employee_id'] || row['Emp ID'] || '').trim();
      let matchedEmployee = null;

      if (!rawEmpId) {
        errors.push('Missing Employee ID');
      } else {
        matchedEmployee = empIdMap.get(rawEmpId.toUpperCase());
        if (!matchedEmployee) {
          errors.push(`Employee ID "${rawEmpId}" does not exist in master employee records`);
        }
      }

      if (seen.has(rawEmpId)) {
        errors.push(`Duplicate row for Employee ID "${rawEmpId}" in spreadsheet`);
      } else {
        seen.add(rawEmpId);
      }

      const basicPay = parseFloat(row['Basic Pay'] || row['basic_pay'] || 0);
      const overtimePay = parseFloat(row['Overtime Pay'] || row['overtime_pay'] || 0);
      const allowances = parseFloat(row['Allowances'] || row['allowance'] || 0);
      const bonuses = parseFloat(row['Bonus'] || row['bonus'] || 0);
      const sssEE = parseFloat(row['SSS Employee'] || row['sss_ee'] || 0);
      const phEE = parseFloat(row['PhilHealth Employee'] || row['philhealth_ee'] || 0);
      const pagibigEE = parseFloat(row['Pag-IBIG Employee'] || row['pagibig_ee'] || 0);
      const tax = parseFloat(row['Withholding Tax'] || row['tax'] || 0);
      const loans = parseFloat(row['Loans / Cash Advance'] || row['loans'] || 0);
      const otherDeductions = parseFloat(row['Other Deductions'] || 0);

      const grossPay = basicPay + overtimePay + allowances + bonuses;
      const totalDeductions = sssEE + phEE + pagibigEE + tax + loans + otherDeductions;
      const netPay = Math.max(0, grossPay - totalDeductions);

      if (isNaN(basicPay) || basicPay < 0) {
        errors.push('Invalid Basic Pay amount');
      }

      results.push({
        rowNumber: rowNum,
        isValid: errors.length === 0,
        errors,
        warnings,
        data: {
          employee_id: matchedEmployee ? matchedEmployee.id : null,
          employee_code: rawEmpId,
          employee_name: matchedEmployee ? `${matchedEmployee.first_name} ${matchedEmployee.last_name}` : (row['Employee Name'] || 'Unknown'),
          workforce_category: matchedEmployee ? matchedEmployee.workforce_category : 'site',
          project_id: matchedEmployee?.assigned_project_id || null,
          site_id: matchedEmployee?.assigned_site_id || null,
          rate_type: matchedEmployee?.rate_type || 'Daily',
          base_rate: matchedEmployee?.base_rate || 0,
          days_worked: parseFloat(row['Days Worked'] || 12),
          basic_pay: basicPay,
          overtime_pay: overtimePay,
          allowances: allowances,
          bonuses: bonuses,
          other_earnings: parseFloat(row['Other Earnings'] || 0),
          gross_pay: grossPay,
          sss_employee: sssEE,
          sss_employer: parseFloat(row['SSS Employer'] || (sssEE * 2)),
          philhealth_employee: phEE,
          philhealth_employer: parseFloat(row['PhilHealth Employer'] || phEE),
          pagibig_employee: pagibigEE,
          pagibig_employer: parseFloat(row['Pag-IBIG Employer'] || pagibigEE),
          withholding_tax: tax,
          employee_loans: loans,
          cash_advances: 0,
          other_deductions: otherDeductions,
          total_deductions: totalDeductions,
          net_pay: netPay,
          status: 'Draft'
        }
      });
    });

    return {
      total: results.length,
      validCount: results.filter(r => r.isValid).length,
      errorCount: results.filter(r => !r.isValid).length,
      rows: results
    };
  },

  /**
   * Exports any dataset to an Excel workbook
   */
  exportToExcel(data, fileName = 'Lunayve_Export', sheetName = 'Data') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  /**
   * Generates Attendance Import Sample Template
   */
  downloadAttendanceTemplate(employees = []) {
    const sampleRows = employees.slice(0, 8).map(emp => ({
      'Employee ID': emp.employee_id,
      'Employee Name': `${emp.first_name} ${emp.last_name}`,
      'Date': new Date().toISOString().split('T')[0],
      'Time In': emp.workforce_category === 'site' ? '07:00:00' : '08:00:00',
      'Time Out': '17:00:00',
      'Regular Hours': 8,
      'Overtime Hours': emp.workforce_category === 'site' ? 2 : 0,
      'Late Minutes': 0,
      'Status': 'Present'
    }));

    this.exportToExcel(sampleRows, 'Lunayve_Attendance_Import_Template', 'Attendance');
  },

  /**
   * Generates Payroll Import Sample Template
   */
  downloadPayrollTemplate(employees = []) {
    const sampleRows = employees.slice(0, 8).map(emp => ({
      'Employee ID': emp.employee_id,
      'Employee Name': `${emp.first_name} ${emp.last_name}`,
      'Days Worked': 13,
      'Basic Pay': emp.workforce_category === 'office' ? (emp.base_rate / 2) : (emp.base_rate * 13),
      'Overtime Pay': emp.workforce_category === 'site' ? 1250.00 : 0,
      'Allowances': emp.workforce_category === 'office' ? 4000 : 1200,
      'Bonus': 0,
      'SSS Employee': 1125.00,
      'PhilHealth Employee': 625.00,
      'Pag-IBIG Employee': 100.00,
      'Withholding Tax': 0.00,
      'Loans / Cash Advance': 0.00,
      'Other Deductions': 0.00
    }));

    this.exportToExcel(sampleRows, 'Lunayve_Payroll_Import_Template', 'Payroll');
  }
};
