import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, CheckCircle2, XCircle, Calendar, User, Clock } from 'lucide-react';
import { StatusBadge, WorkforceBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';

export const LeaveRequestsPage = () => {
  const { currentUser, canManageEmployees } = useAuth();
  const { showToast } = useNotifications();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [applyData, setApplyData] = useState({
    employee_id: '',
    leave_type_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    total_days: 1,
    reason: ''
  });

  const loadData = () => {
    setLeaveRequests(dataService.getLeaveRequests());
    setLeaveTypes(dataService.getLeaveTypes());
    setEmployees(dataService.getEmployees());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!applyData.employee_id || !applyData.leave_type_id) {
      alert('Please select employee and leave type.');
      return;
    }
    dataService.createLeaveRequest(applyData, currentUser);
    showToast('Leave request submitted successfully.', 'success');
    setIsApplyModalOpen(false);
    loadData();
  };

  const handleApprove = (id) => {
    dataService.updateLeaveStatus(id, 'Approved', currentUser);
    showToast('Leave request approved.', 'success');
    loadData();
  };

  const handleReject = (id) => {
    const reason = prompt('Please provide reason for rejection:');
    if (reason !== null) {
      dataService.updateLeaveStatus(id, 'Rejected', currentUser, reason);
      showToast('Leave request rejected.', 'info');
      loadData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-700" />
            Leave Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Vacation, sick, and emergency leave requests with approvals and balance tracking
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Types Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {leaveTypes.map((type) => (
          <div key={type.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
              {type.code}
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-2">{type.name}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">{type.days_allowed_per_year} Days / Year</p>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Leave Applications</h3>
          <span className="text-xs text-slate-500">{leaveRequests.length} Total Requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-5">Employee</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Inclusive Dates</th>
                <th className="p-3.5">Days</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((lvr) => {
                const emp = employees.find(e => e.id === lvr.employee_id);
                const lType = leaveTypes.find(t => t.id === lvr.leave_type_id);

                return (
                  <tr key={lvr.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp?.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'}
                          alt={emp?.first_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp ? `${emp.first_name} ${emp.last_name}` : 'Employee'}</p>
                          <span className="font-mono text-[10px] text-slate-500">{emp?.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{lType?.name || 'Leave'}</td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {lvr.start_date} → {lvr.end_date}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{lvr.total_days} Days</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">"{lvr.reason}"</td>
                    <td className="p-3.5"><StatusBadge status={lvr.status} /></td>
                    <td className="p-3.5 pr-5 text-right">
                      {lvr.status === 'Pending' && canManageEmployees ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleApprove(lvr.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(lvr.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold rounded-lg text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {lvr.approver_name ? `By ${lvr.approver_name}` : 'Completed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Submit Leave Application"
        subtitle="Vacation & Sick Leave Request"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              required
              value={applyData.employee_id}
              onChange={(e) => setApplyData({ ...applyData, employee_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
            <select
              required
              value={applyData.leave_type_id}
              onChange={(e) => setApplyData({ ...applyData, leave_type_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            >
              <option value="">-- Choose Type --</option>
              {leaveTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={applyData.start_date}
                onChange={(e) => setApplyData({ ...applyData, start_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={applyData.end_date}
                onChange={(e) => setApplyData({ ...applyData, end_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Total Days</label>
            <input
              type="number"
              step="0.5"
              required
              value={applyData.total_days}
              onChange={(e) => setApplyData({ ...applyData, total_days: parseFloat(e.target.value) || 1 })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason / Explanation *</label>
            <textarea
              rows={2}
              required
              value={applyData.reason}
              onChange={(e) => setApplyData({ ...applyData, reason: e.target.value })}
              placeholder="State reason for absence..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveRequestsPage;
