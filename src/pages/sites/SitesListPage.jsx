import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Building, Users, MapPin, Calendar, Plus, UserCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export const SitesListPage = () => {
  const navigate = useNavigate();
  const { canManageProjects, currentUser } = useAuth();

  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Assignment Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    employee_id: '',
    project_id: '',
    site_id: '',
    notes: ''
  });

  const loadData = () => {
    setSites(dataService.getSites());
    setProjects(dataService.getProjects());
    setEmployees(dataService.getEmployees());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferData.employee_id || !transferData.site_id) {
      alert('Please select employee and target site.');
      return;
    }

    dataService.updateEmployee(transferData.employee_id, {
      assigned_project_id: transferData.project_id,
      assigned_site_id: transferData.site_id
    }, currentUser);

    setIsTransferModalOpen(false);
    loadData();
    alert('Worker transferred and site assignment history logged successfully.');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <HardHat className="w-6 h-6 text-teal-700" />
            Construction Sites & Site Deployments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active construction zones and real-time site personnel allocation
          </p>
        </div>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Transfer Worker to Site</span>
        </button>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => {
          const parentProject = projects.find(p => p.id === site.project_id);
          const siteWorkers = employees.filter(e => e.assigned_site_id === site.id);

          return (
            <div
              key={site.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle hover:shadow-card transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {site.site_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{site.name}</h3>
                  <p className="text-xs text-emerald-800 font-semibold">{parentProject?.name}</p>
                </div>
                <StatusBadge status={site.status} />
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{site.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{site.start_date} → {site.end_date || 'Active'}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Site Supervisor</span>
                  <p className="font-bold text-slate-800 truncate">{site.site_supervisor_name || 'Assigned'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Site Foreman</span>
                  <p className="font-bold text-slate-800 truncate">{site.foreman_name || 'Assigned'}</p>
                </div>
              </div>

              {/* Workers roster preview */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-800">Assigned Workers ({siteWorkers.length})</span>
                </div>
                <div className="flex items-center -space-x-2 overflow-hidden py-1">
                  {siteWorkers.slice(0, 6).map((worker) => (
                    <img
                      key={worker.id}
                      src={worker.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'}
                      alt={worker.first_name}
                      title={`${worker.first_name} ${worker.last_name}`}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                    />
                  ))}
                  {siteWorkers.length > 6 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                      +{siteWorkers.length - 6}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WORKER SITE TRANSFER MODAL */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Worker to Construction Site"
        subtitle="Automatic logging of site assignment history"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
            <select
              required
              value={transferData.employee_id}
              onChange={(e) => {
                const emp = employees.find(item => item.id === e.target.value);
                setTransferData({
                  ...transferData,
                  employee_id: e.target.value,
                  project_id: emp?.assigned_project_id || projects[0]?.id || ''
                });
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id}) - {emp.workforce_category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Project</label>
            <select
              value={transferData.project_id}
              onChange={(e) => setTransferData({ ...transferData, project_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            >
              <option value="">-- Choose Project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Construction Site *</label>
            <select
              required
              value={transferData.site_id}
              onChange={(e) => setTransferData({ ...transferData, site_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
            >
              <option value="">-- Choose Site --</option>
              {sites
                .filter(s => !transferData.project_id || s.project_id === transferData.project_id)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.site_code})</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Transfer Notes</label>
            <textarea
              rows={2}
              value={transferData.notes}
              onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
              placeholder="e.g. Reassigned to Superstructure rebar installation"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SitesListPage;
