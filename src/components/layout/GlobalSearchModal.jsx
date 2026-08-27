import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Building, HardHat, FileText, X, ArrowRight } from 'lucide-react';
import { dataService } from '../../services/dataService';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ employees: [], projects: [], sites: [], documents: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ employees: [], projects: [], sites: [], documents: [] });
      return;
    }

    const q = query.toLowerCase().trim();

    const employees = dataService.getEmployees().filter(e =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      (e.contact_number && e.contact_number.includes(q))
    ).slice(0, 5);

    const projects = dataService.getProjects().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.project_code.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q)
    ).slice(0, 3);

    const sites = dataService.getSites().filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.site_code.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
    ).slice(0, 3);

    const documents = dataService.getAllDocuments().filter(d =>
      d.document_name.toLowerCase().includes(q) ||
      d.file_name.toLowerCase().includes(q)
    ).slice(0, 3);

    setResults({ employees, projects, sites, documents });
  }, [query]);

  // Global key listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose ? onClose(!isOpen) : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = results.employees.length + results.projects.length + results.sites.length + results.documents.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:pt-24 text-center">
        <div
          className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-4 border-b border-slate-100 bg-slate-50">
            <Search className="w-5 h-5 text-emerald-600 mr-3" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search employees, ID, sites, projects, documents (e.g. Juan, Tower Alpha, SSS)..."
              className="w-full py-4 text-sm bg-transparent border-0 focus:ring-0 focus:outline-none text-slate-900 placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-500 bg-white border border-slate-200 rounded shadow-sm">
              ESC
            </kbd>
          </div>

          {/* Results Display */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {!query.trim() && (
              <div className="text-center py-8 text-slate-400 text-sm">
                <p>Type keywords to instantly search the master workforce database</p>
                <div className="flex justify-center gap-2 mt-3 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded-md">PLN-2026-001</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-md">Carpenter</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-md">Tower Alpha</span>
                  <span className="px-2 py-1 bg-slate-100 rounded-md">BOSH Safety</span>
                </div>
              </div>
            )}

            {query.trim() && totalResults === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No results found for "<span className="font-semibold text-slate-800">{query}</span>".
              </div>
            )}

            {/* Employees */}
            {results.employees.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Employees ({results.employees.length})
                </h4>
                <div className="space-y-1">
                  {results.employees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        navigate(`/employees/${emp.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profile_photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                          alt={emp.first_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-900">
                            {emp.first_name} {emp.last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            <span className="font-mono text-emerald-700 font-medium">{emp.employee_id}</span> • {emp.workforce_category === 'office' ? 'Office / Professional' : 'Site / Skilled Worker'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {results.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-sky-600" />
                  Projects ({results.projects.length})
                </h4>
                <div className="space-y-1">
                  {results.projects.map(prj => (
                    <div
                      key={prj.id}
                      onClick={() => {
                        navigate(`/projects/${prj.id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50/70 cursor-pointer group transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-900">{prj.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{prj.project_code} • {prj.client}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sites */}
            {results.sites.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-teal-600" />
                  Construction Sites ({results.sites.length})
                </h4>
                <div className="space-y-1">
                  {results.sites.map(site => (
                    <div
                      key={site.id}
                      onClick={() => {
                        navigate('/sites');
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50/70 cursor-pointer group transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-900">{site.name}</p>
                        <p className="text-xs text-slate-500">{site.site_code} • {site.location}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {results.documents.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  Documents ({results.documents.length})
                </h4>
                <div className="space-y-1">
                  {results.documents.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        navigate(`/employees/${doc.employee_id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/70 cursor-pointer group transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-amber-900">{doc.document_name}</p>
                        <p className="text-xs text-slate-500">{doc.file_name} • Expires: {doc.expiration_date || 'No Expiry'}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
