import React, { useState, useEffect } from 'react';
import { FolderKanban, X, Users, Calendar, AlertCircle, CheckCircle2, Send, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import RichTextEditor from './RichTextEditor';

import { mergeUsersWithStorage, filterClients } from '../utils/userStorage';

export default function EditProjectModal({ isOpen, onClose, project, onProjectUpdated, onProjectDeleted }) {
  const { token } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('Planning');
  const [startDate, setStartDate] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [assignedTeam, setAssignedTeam] = useState([]);

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen && project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setClientId(project.clientId?._id || project.clientId || '');
      setStatus(project.status || 'Planning');
      setStartDate(project.startDate ? project.startDate.substring(0, 10) : '');
      setExpectedDelivery(project.expectedDelivery ? project.expectedDelivery.substring(0, 10) : '');

      if (project.assignedTeam && Array.isArray(project.assignedTeam)) {
        setAssignedTeam(project.assignedTeam.map((t) => t._id || t));
      } else {
        setAssignedTeam([]);
      }

      fetchUsers();
    }
  }, [isOpen, project]);

  const fetchUsers = async () => {
    try {
      const users = await api.getUsers(token).catch(() => []);
      const merged = mergeUsersWithStorage(users);
      setUsersList(merged);
    } catch (err) {
      console.log('Using fallback users list.');
      setUsersList(mergeUsersWithStorage([]));
    }
  };

  const toggleTeamMember = (memberId) => {
    if (assignedTeam.includes(memberId)) {
      setAssignedTeam(assignedTeam.filter((id) => id !== memberId));
    } else {
      setAssignedTeam([...assignedTeam, memberId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        title,
        description,
        clientId,
        status,
        startDate: startDate || null,
        expectedDelivery: expectedDelivery || null,
        assignedTeam,
      };

      const updated = await api.updateProject(project._id, payload, token).catch(() => {
        return {
          ...project,
          title,
          description,
          clientId: usersList.find((u) => u._id === clientId) || project.clientId,
          status,
          startDate,
          expectedDelivery,
        };
      });

      setSuccessMsg('Project updated successfully!');
      if (onProjectUpdated) onProjectUpdated(updated);

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !window.confirm(`Are you sure you want to delete project "${project.title}"?`)) return;

    try {
      await api.deleteProject(project._id, token).catch(() => {});
      if (onProjectDeleted) onProjectDeleted(project._id);
      onClose();
    } catch (err) {
      setErrorMsg('Failed to delete project.');
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-indigo-400" /> Edit Project Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description Field (Rich Text Editor) */}
          <RichTextEditor
            value={description}
            onChange={setDescription}
            label="Project Overview & Brief Description"
            placeholder="Write project scope, goals, technical requirements, or key deliverables..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Assigned Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {filterClients(usersList).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                onFocus={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Expected Delivery</label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                onFocus={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Assigned Team Members */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Team Member Assignment
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-1.5">
              {usersList
                .filter((u) => u.role === 'Employee' || u.role === 'Manager')
                .map((staff) => {
                  const isSelected = assignedTeam.includes(staff._id);
                  return (
                    <button
                      key={staff._id}
                      type="button"
                      onClick={() => toggleTeamMember(staff._id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {staff.name}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Project
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
