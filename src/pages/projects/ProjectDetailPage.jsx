import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building, HardHat, Users, MapPin, Calendar, ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { WorkforceBadge, StatusBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../services/payrollEngine';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, canManageProjects } = useAuth();

  const [project, setProject] = useState(null);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);

  const [newSite, setNewSite] = useState({
    site_code: '',
    name: '',
    location: '',
    site_supervisor_name: '',
    foreman_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'Active'
  });

  const loadData = () => {
    const proj = dataService.getProjectById(id);
    if (!proj) {
      navigate('/projects');
      return;
    }
    setProject(proj);
    setSites(dataService.getSitesByProject(id));
    setEmployees(dataService.getEmployees().filter(e => e.assigned_project_id === id));
    setDesignations(dataService.getDesignations());
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!project) return null;

  const handleCreateSite = (e) => {
    e.preventDefault();
    if (!newSite.name || !newSite.site_code) {
      alert('Site Code and Name are required.');
      return;
    }
    dataService.createSite({
      ...newSite,
      project_id: project.id
    }, currentUser);

    setIsSiteModalOpen(false);
    setNewSite({
      site_code: '',
      name: '',
      location: '',
      site_supervisor_name: '',
      foreman_name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'Active'
    });
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Projects</span>
      </button>

      {/* Project Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-800">
                {project.project_code}
              </span>
              <StatusBadge status={project.status} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display mt-1">{project.name}</h1>
            <p className="text-xs font-semibold text-emerald-800">Client: {project.client}</p>
          </div>
          {canManageProjects && (
            <button
              onClick={() => setIsSiteModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Construction Site</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          {project.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Location</span>
            <p className="font-bold text-slate-900 mt-1">{project.location}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Project Manager</span>
            <p className="font-bold text-slate-900 mt-1">{project.project_manager_name || 'Designated PM'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block font-medium">Project Duration</span>
            <p className="font-bold text-slate-900 mt-1 font-mono">{project.start_date} → {project.end_date || 'Ongoing'}</p>
          </div>
        </div>
      </div>

      {/* SITES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-teal-600" />
            <span>Construction Sites ({sites.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => {
            const siteWorkers = employees.filter(e => e.assigned_site_id === site.id);
            return (
              <div
                key={site.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-slate-500">{site.site_code}</span>
                    <h3 className="text-sm font-bold text-slate-900">{site.name}</h3>
                  </div>
                  <StatusBadge status={site.status} />
                </div>
                <p className="text-xs text-slate-500">{site.location}</p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Supervisor</span>
                    <p className="font-bold text-slate-800">{site.site_supervisor_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned Workers</span>
                    <p className="font-bold text-emerald-800">{siteWorkers.length} personnel</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROJECT WORKFORCE ROSTER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-700" />
          <span>Assigned Project Workforce Roster ({employees.length})</span>
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 pl-4">Employee</th>
                <th className="p-3">Category</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Site Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const des = designations.find(d => d.id === emp.designation_id);
                const s = sites.find(item => item.id === emp.assigned_site_id);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                          alt={emp.first_name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="p-3"><WorkforceBadge category={emp.workforce_category} /></td>
                    <td className="p-3 font-semibold text-slate-700">{des?.title || 'Staff'}</td>
                    <td className="p-3 font-mono text-slate-600">{s?.name || 'Central'}</td>
                    <td className="p-3"><StatusBadge status={emp.employment_status} /></td>
                    <td className="p-3 pr-4 text-right">
                      <button
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE SITE MODAL */}
      <Modal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        title={`Add Construction Site to ${project.name}`}
        subtitle="Hierarchy: Project → Construction Site"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSite} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Site Code *</label>
            <input
              type="text"
              required
              value={newSite.site_code}
              onChange={(e) => setNewSite({ ...newSite, site_code: e.target.value })}
              placeholder="e.g. SITE-ALPHA-03"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Site Name *</label>
            <input
              type="text"
              required
              value={newSite.name}
              onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              placeholder="e.g. Tower Alpha - Podium & Amenities"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Specific Location</label>
            <input
              type="text"
              value={newSite.location}
              onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
              placeholder="e.g. Zone C - Podium Deck"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Site Supervisor</label>
              <input
                type="text"
                value={newSite.site_supervisor_name}
                onChange={(e) => setNewSite({ ...newSite, site_supervisor_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Site Foreman</label>
              <input
                type="text"
                value={newSite.foreman_name}
                onChange={(e) => setNewSite({ ...newSite, foreman_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsSiteModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Save Site
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
