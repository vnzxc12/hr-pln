// Project Lunayve Payroll Calculation Engine

/**
 * Calculates SSS Employee and Employer contribution
 */
export const calculateSSS = (monthlyGross, sssRules) => {
  const rule = sssRules?.find(r => r.agency === 'SSS' && r.is_active) || {
    min_base: 5000,
    max_base: 35000,
    employee_share_pct: 0.045,
    employer_share_pct: 0.095,
    employer_fixed_amount: 30
  };

  const clampedBase = Math.max(rule.min_base, Math.min(rule.max_base, monthlyGross));
  const ee = Math.round(clampedBase * rule.employee_share_pct * 100) / 100;
  const er = Math.round((clampedBase * rule.employer_share_pct + (rule.employer_fixed_amount || 0)) * 100) / 100;

  return { employee: ee, employer: er, total: ee + er };
};

/**
 * Calculates PhilHealth Employee and Employer contribution (5% total, 2.5% each)
 */
export const calculatePhilHealth = (monthlyGross, philhealthRules) => {
  const rule = philhealthRules?.find(r => r.agency === 'PhilHealth' && r.is_active) || {
    min_base: 10000,
    max_base: 100000,
    employee_share_pct: 0.025,
    employer_share_pct: 0.025
  };

  const clampedBase = Math.max(rule.min_base, Math.min(rule.max_base, monthlyGross));
  const ee = Math.round(clampedBase * rule.employee_share_pct * 100) / 100;
  const er = Math.round(clampedBase * rule.employer_share_pct * 100) / 100;

  return { employee: ee, employer: er, total: ee + er };
};

/**
 * Calculates Pag-IBIG HDMF contribution (₱200 cap)
 */
export const calculatePagIBIG = (monthlyGross, pagibigRules) => {
  const rule = pagibigRules?.find(r => r.agency === 'Pag-IBIG' && r.is_active) || {
    employee_fixed_amount: 200,
    employer_fixed_amount: 200
  };

  return {
    employee: rule.employee_fixed_amount || 200,
    employer: rule.employer_fixed_amount || 200,
    total: (rule.employee_fixed_amount || 200) + (rule.employer_fixed_amount || 200)
  };
};

/**
 * Calculates BIR TRAIN Law Semi-Monthly Withholding Tax
 */
export const calculateWithholdingTax = (taxableIncome, taxRules) => {
  if (taxableIncome <= 10417) {
    return 0;
  } else if (taxableIncome <= 16666) {
    return Math.round((taxableIncome - 10417) * 0.15 * 100) / 100;
  } else if (taxableIncome <= 33333) {
    return Math.round((937.50 + (taxableIncome - 16667) * 0.20) * 100) / 100;
  } else if (taxableIncome <= 83333) {
    return Math.round((4270.70 + (taxableIncome - 33333) * 0.25) * 100) / 100;
  } else if (taxableIncome <= 333333) {
    return Math.round((16770.70 + (taxableIncome - 83333) * 0.30) * 100) / 100;
  } else {
    return Math.round((91770.70 + (taxableIncome - 333333) * 0.35) * 100) / 100;
  }
};

/**
 * Full Employee Payroll Record Computation
 */
export const computeEmployeePayroll = (employee, attendanceStats, rules = [], periodType = 'Semi-Monthly') => {
  const rateType = employee.rate_type || 'Monthly';
  const baseRate = Number(employee.base_rate) || 0;
  const isMonthly = rateType === 'Monthly';

  // Determine Hourly & Daily Rates
  let dailyRate = 0;
  let hourlyRate = 0;

  if (isMonthly) {
    // 313 Factor (Standard Philippine Construction 6-day work week) or 261 (5-day work week)
    dailyRate = (baseRate * 12) / 313;
    hourlyRate = dailyRate / 8;
  } else if (rateType === 'Daily') {
    dailyRate = baseRate;
    hourlyRate = dailyRate / 8;
  } else {
    // Hourly
    hourlyRate = baseRate;
    dailyRate = hourlyRate * 8;
  }

  // Attendance metrics (strictly from timesheets/attendance records)
  const daysWorked = Number(attendanceStats?.days_worked ?? 0);
  const otHours = Number(attendanceStats?.overtime_hours ?? 0);
  const ndHours = Number(attendanceStats?.night_diff_hours ?? 0);
  const holidayHours = Number(attendanceStats?.holiday_hours ?? 0);
  const restDayHours = Number(attendanceStats?.rest_day_hours ?? 0);
  const lateMinutes = Number(attendanceStats?.late_minutes ?? 0);

  // Standard period working days (Semi-Monthly: 13 days; Monthly: 26 days)
  const standardDays = periodType === 'Semi-Monthly' ? 13 : 26;

  // Earnings calculations - Zero pay if zero days worked
  let basicPay = 0;
  if (daysWorked > 0) {
    if (isMonthly) {
      if (daysWorked >= standardDays) {
        basicPay = periodType === 'Semi-Monthly' ? baseRate / 2 : baseRate;
      } else {
        // Prorated by actual days logged on timesheets
        basicPay = Math.round(dailyRate * daysWorked * 100) / 100;
      }
    } else {
      basicPay = Math.round(dailyRate * daysWorked * 100) / 100;
    }
  }

  const overtimePay = daysWorked > 0 ? Math.round(otHours * (hourlyRate * 1.25) * 100) / 100 : 0;
  const nightDiffPay = daysWorked > 0 ? Math.round(ndHours * (hourlyRate * 0.10) * 100) / 100 : 0;
  const holidayPay = daysWorked > 0 ? Math.round(holidayHours * (hourlyRate * 1.30) * 100) / 100 : 0;
  const restDayPay = daysWorked > 0 ? Math.round(restDayHours * (hourlyRate * 1.30) * 100) / 100 : 0;
  const lateDeduction = daysWorked > 0 ? Math.round(lateMinutes * (hourlyRate / 60) * 100) / 100 : 0;

  const monthlyAllowance = Number(employee.monthly_allowance || 0);
  const dailyAllowance = Number(employee.daily_allowance || 0);
  const totalAllowances = daysWorked > 0
    ? (isMonthly ? Math.round((monthlyAllowance / 2) * Math.min(1, daysWorked / standardDays) * 100) / 100 : (dailyAllowance * daysWorked))
    : 0;

  const bonuses = daysWorked > 0 ? Number(attendanceStats?.bonus || 0) : 0;
  const otherEarnings = daysWorked > 0 ? Number(attendanceStats?.other_earnings || 0) : 0;

  const grossPay = Math.max(
    0,
    Math.round((basicPay + overtimePay + nightDiffPay + holidayPay + restDayPay + totalAllowances + bonuses + otherEarnings - lateDeduction) * 100) / 100
  );

  // Equivalent Monthly Gross for statutory contribution lookup
  const estimatedMonthlyGross = isMonthly ? baseRate : (dailyRate * 26);

  // Government Statutory Contributions (Applied semi-monthly, halved if semi-monthly)
  const isSemi = periodType === 'Semi-Monthly';
  const divisor = isSemi ? 2 : 1;

  let sssEE = 0;
  let sssER = 0;
  let phEE = 0;
  let phER = 0;
  let hdmfEE = 0;
  let hdmfER = 0;
  let statutoryDeductions = 0;
  let withholdingTax = 0;
  let employeeLoans = 0;
  let cashAdvances = 0;
  let otherDeductions = 0;
  let totalDeductions = 0;
  let netPay = 0;

  // If employee has zero earnings (no timesheet), zero deductions and zero net pay
  if (grossPay > 0) {
    const sss = calculateSSS(estimatedMonthlyGross, rules);
    const philhealth = calculatePhilHealth(estimatedMonthlyGross, rules);
    const pagibig = calculatePagIBIG(estimatedMonthlyGross, rules);

    sssEE = Math.round((sss.employee / divisor) * 100) / 100;
    sssER = Math.round((sss.employer / divisor) * 100) / 100;
    phEE = Math.round((philhealth.employee / divisor) * 100) / 100;
    phER = Math.round((philhealth.employer / divisor) * 100) / 100;
    hdmfEE = Math.round((pagibig.employee / divisor) * 100) / 100;
    hdmfER = Math.round((pagibig.employer / divisor) * 100) / 100;

    statutoryDeductions = sssEE + phEE + hdmfEE;
    const taxableIncome = Math.max(0, grossPay - statutoryDeductions);
    withholdingTax = calculateWithholdingTax(taxableIncome, rules);

    employeeLoans = Number(attendanceStats?.loans || 0);
    cashAdvances = Number(attendanceStats?.cash_advances || 0);
    otherDeductions = Number(attendanceStats?.other_deductions || 0);

    totalDeductions = Math.min(grossPay, Math.round((statutoryDeductions + withholdingTax + employeeLoans + cashAdvances + otherDeductions) * 100) / 100);
    netPay = Math.max(0, Math.round((grossPay - totalDeductions) * 100) / 100);
  }

  return {
    employee_id: employee.id,
    workforce_category: employee.workforce_category,
    project_id: employee.assigned_project_id,
    site_id: employee.assigned_site_id,
    rate_type: rateType,
    base_rate: baseRate,
    days_worked: daysWorked,
    regular_hours: daysWorked * 8,
    overtime_hours: otHours,
    night_diff_hours: ndHours,
    holiday_hours: holidayHours,
    rest_day_hours: restDayHours,
    late_undertime_deduction: lateDeduction,
    basic_pay: Math.round(basicPay * 100) / 100,
    overtime_pay: overtimePay,
    night_diff_pay: nightDiffPay,
    holiday_pay: holidayPay,
    rest_day_pay: restDayPay,
    allowances: Math.round(totalAllowances * 100) / 100,
    bonuses: bonuses,
    other_earnings: otherEarnings,
    gross_pay: grossPay,
    sss_employee: sssEE,
    sss_employer: sssER,
    philhealth_employee: phEE,
    philhealth_employer: phER,
    pagibig_employee: hdmfEE,
    pagibig_employer: hdmfER,
    withholding_tax: withholdingTax,
    employee_loans: employeeLoans,
    cash_advances: cashAdvances,
    other_deductions: otherDeductions,
    total_deductions: totalDeductions,
    net_pay: netPay
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount || 0);
};
