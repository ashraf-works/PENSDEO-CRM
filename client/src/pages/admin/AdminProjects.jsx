import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Users, Calendar, CheckCircle2, RefreshCw, X, UserCheck, Edit2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import EditProjectModal from '../../components/EditProjectModal';
import RichTextEditor from '../../components/RichTextEditor';

const defaultProjects = [];

const getStoredProjects = () => {
  try {
    const saved = localStorage.getItem('pensdeo_projects');
    return saved ? JSON.parse(saved) : defaultProjects;
  } catch (e) {
    return defaultProjects;
  }
};

const saveProjectsToStorage = (list) => {
  try {
    localStorage.setItem('pensdeo_projects', JSON.stringify(list));
  } catch (e) {}
};

export default function AdminProjects() {
  const { token } = useAppStore();
  const [projects, setProjects] = useState(getStoredProjects());

  const [usersList, setUsersList] = useState([
    { _id: 'usr_5', name: 'Acme Corp (Robert Taylor)', role: 'Client' },
    { _id: 'usr_2', name: 'Sarah Jenkins', role: 'Manager', department: 'Design' },
    { _id: 'usr_3', name: 'David Miller', role: 'Employee', department: 'Development' },
    { _id: 'usr_4', name: 'Elena Rostova', role: 'Employee', department: 'SEO' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: 'usr_5',
    status: 'In Progress',
    startDate: '',
    expectedDelivery: '',
    assignedTeam: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedProjects, fetchedUsers] = await Promise.all([
        api.getProjects(token).catch(() => null),
        api.getUsers(token).catch(() => null),
      ]);
      if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
        saveProjectsToStorage(fetchedProjects);
      }
      if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
        setUsersList(fetchedUsers);
      }
    } catch (err) {
      console.log('Using local/stored mock project data.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    let newProjectsList = [];
    try {
      const created = await api.createProject(formData, token);
      if (created) {
        newProjectsList = [created, ...projects];
      }
    } catch (err) {
      const mockNew = {
        _id: `prj_${Date.now()}`,
        ...formData,
        clientId: usersList.find((u) => u._id === formData.clientId) || { name: 'Client Account' },
        progressPercentage: 0,
      };
      newProjectsList = [mockNew, ...projects];
    } finally {
      if (newProjectsList.length > 0) {
        setProjects(newProjectsList);
        saveProjectsToStorage(newProjectsList);
      }
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        clientId: 'usr_5',
        status: 'In Progress',
        startDate: '',
        expectedDelivery: '',
        assignedTeam: [],
      });
    }
  };

  const handleCalculateProgress = async (projectId) => {
    try {
      const res = await api.calculateProjectProgress(projectId, token);
      if (res && res.progressPercentage !== undefined) {
        setProjects((prev) => {
          const updated = prev.map((p) => (p._id === projectId ? { ...p, progressPercentage: res.progressPercentage } : p));
          saveProjectsToStorage(updated);
          return updated;
        });
      }
    } catch (err) {
      setProjects((prev) => {
        const updated = prev.map((p) => (p._id === projectId ? { ...p, progressPercentage: 100 } : p));
        saveProjectsToStorage(updated);
        return updated;
      });
    }
  };

  const handleProjectUpdated = (updatedProject) => {
    if (updatedProject) {
      setProjects((prev) => {
        const updated = prev.map((p) => (p._id === updatedProject._id ? updatedProject : p));
        saveProjectsToStorage(updated);
        return updated;
      });
    }
    fetchData();
  };

  const handleProjectDeleted = (deletedId) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p._id !== deletedId);
      saveProjectsToStorage(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" /> Agency Projects Management
          </h1>
          <p className="text-xs text-slate-400">Manage client projects, assign teams, edit details, and calculate progress.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 w-fit"
        >
          <Plus className="w-4 h-4" /> Create New Project
        </button>
      </div>

      {/* Projects List Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Project Title & Description</th>
                <th className="p-4">Client</th>
                <th className="p-4">Status</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Delivery Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No agency projects created yet. Click "Create New Project" to add your first project.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                <tr key={project._id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4 font-bold text-white space-y-1">
                    <div>{project.title}</div>
                    {project.description && (
                      <p className="text-[11px] font-normal text-slate-400 max-w-md line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="text-[10px] font-normal text-slate-500 font-mono">ID: {project._id}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-indigo-300">
                      {project.clientId?.name || 'Client Account'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 w-48">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-indigo-400 font-bold">{project.progressPercentage || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${project.progressPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{project.expectedDelivery || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleCalculateProgress(project._id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition inline-flex items-center gap-1"
                        title="Recalculate task completion percentage"
                      >
                        <RefreshCw className="w-3 h-3" /> Sync Progress
                      </button>

                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setShowEditModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white text-[11px] font-semibold transition inline-flex items-center gap-1"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-indigo-400" /> Create New Agency Project
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Acme Mobile App Development"
                  className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description Field (Rich Text Editor) */}
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                label="Project Overview & Brief Description"
                placeholder="Write project brief, scope, targets, or technical requirements..."
                rows={3}
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Select Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {usersList
                      .filter((u) => u.role === 'Client')
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                    onFocus={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                    className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Expected Delivery</label>
                  <input
                    type="date"
                    value={formData.expectedDelivery}
                    onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })}
                    onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                    onFocus={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                    className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Create & Link Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
          }}
          project={editingProject}
          onProjectUpdated={handleProjectUpdated}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </div>
  );
}
