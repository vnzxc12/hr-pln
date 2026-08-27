import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Plus, MapPin, Calendar, Users, DollarSign, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';
import { dataService } from '../../services/dataService';
import { formatCurrency } from '../../services/payrollEngine';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

export const ProjectsListPage = () => {
  const navigate = useNavigate();
  const { canManageProjects, currentUser } = useAuth();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    project_code: '',
    name: '',
    client: '',
    location: '',
    project_manager_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    estimated_budget: 100000000,
    status: 'Active',
    description: ''
  });

  const loadData = () => {
    setProjects(dataService.getProjects());
    setEmployees(dataService.getEmployees());
    setSites(dataService.getSites());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.name || !newProject.project_code) {
      alert('Project Code and Project Name are required.');
      return;
    }
    dataService.createProject(newProject, currentUser);
    setIsCreateModalOpen(false);
    setNewProject({
      project_code: '',
      name: '',
      client: '',
      location: '',
      project_manager_name: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      estimated_budget: 100000000,
      status: 'Active',
      description: ''
    });
    loadData();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Building className="w-6 h-6 text-sky-700" />
            Infrastructure Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active construction project master records and workforce assignments
          </p>
        </div>

        {canManageProjects && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const assignedWorkers = employees.filter(e => e.assigned_project_id === proj.id);
          const projectSites = sites.filter(s => s.project_id === proj.id);

          return (
            <div
              key={proj.id}
              onClick={() => navigate(`/projects/${proj.id}`)}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle hover:shadow-card hover:border-emerald-300 transition-all cursor-pointer space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                    {proj.project_code}
                  </span>
                  <StatusBadge status={proj.status} />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{proj.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Client: {proj.client}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description || 'Commercial & Residential Construction Project.'}
                </p>

                <div className="space-y-1.5 pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{proj.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{proj.start_date} → {proj.end_date || 'Ongoing'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>PM: <strong>{proj.project_manager_name || 'Designated PM'}</strong></span>
                  </p>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Assigned Workforce</span>
                  <p className="font-bold text-slate-900">{assignedWorkers.length} Workers ({projectSites.length} Sites)</p>
                </div>
                <div className="flex items-center text-emerald-700 font-bold gap-1">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Construction Project"
        subtitle="Project Lunayve Master Database"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Code *</label>
              <input
                type="text"
                required
                value={newProject.project_code}
                onChange={(e) => setNewProject({ ...newProject, project_code: e.target.value })}
                placeholder="e.g. PRJ-2026-DELTA"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g. Lunayve Delta Residences"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Entity *</label>
              <input
                type="text"
                required
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                placeholder="e.g. Megaworld Properties"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designated Project Manager</label>
              <input
                type="text"
                value={newProject.project_manager_name}
                onChange={(e) => setNewProject({ ...newProject, project_manager_name: e.target.value })}
                placeholder="Engr. First Last"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Project Location *</label>
            <input
              type="text"
              required
              value={newProject.location}
              onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
              placeholder="e.g. Ortigas Center, Pasig City"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={newProject.start_date}
                onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target End Date</label>
              <input
                type="date"
                value={newProject.end_date}
                onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectsListPage;
