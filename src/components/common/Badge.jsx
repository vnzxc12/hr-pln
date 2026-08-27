import React from 'react';

export const WorkforceBadge = ({ category }) => {
  const isOffice = category === 'office' || category === 'Office';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        isOffice
          ? 'bg-sky-100 text-sky-800 border border-sky-300'
          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isOffice ? 'bg-sky-500' : 'bg-emerald-500'}`} />
      {isOffice ? 'Office / Professional' : 'Site / Skilled Worker'}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const getColors = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'paid':
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'on leave':
      case 'for review':
      case 'pending':
      case 'transferred':
      case 'planned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'inactive':
      case 'draft':
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'late':
      case 'suspended':
      case 'on hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'absent':
      case 'terminated':
      case 'cancelled':
      case 'rejected':
      case 'end of contract':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors()}`}>
      {status || 'Unknown'}
    </span>
  );
};
