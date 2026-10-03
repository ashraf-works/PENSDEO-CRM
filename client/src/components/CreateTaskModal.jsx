import React, { useState, useEffect } from 'react';
import { CheckSquare, X, Upload, UserCheck, FolderKanban, Calendar, AlertCircle, Send, User, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import RichTextEditor from './RichTextEditor';

import { mergeUsersWithStorage, filterClients } from '../utils/userStorage';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated, taskToEdit = null }) {
  const { token } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Not Started');
  const [dueDate, setDueDate] = useState('');
  const [submittedToClient, setSubmittedToClient] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Lists for dropdowns
  const [clientsList, setClientsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen, taskToEdit]);

  useEffect(() => {
    if (clientId) {
      const matched = projectsList.filter((p) => {
        const pClientId = p.clientId?._id || p.clientId;
        return pClientId === clientId;
      });
      setFilteredProjects(matched.length > 0 ? matched : projectsList);
      if (matched.length > 0 && !matched.some((p) => p._id === projectId)) {
        setProjectId(matched[0]._id);
      }
    } else {
      setFilteredProjects(projectsList);
    }
  }, [clientId, projectsList]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const [projectsData, usersData] = await Promise.all([
        api.getProjects(token).catch(() => []),
        api.getUsers(token).catch(() => []),
      ]);

      const allUsers = mergeUsersWithStorage(usersData);
      const clients = filterClients(allUsers);
      const staff = allUsers.filter(
        (u) => u.role && (u.role.toLowerCase() === 'employee' || u.role.toLowerCase() === 'manager' || u.role.toLowerCase() === 'superadmin')
      );

      const defaultStaff = [
        { _id: 'usr_3', name: 'David Miller', role: 'Employee', department: 'Development' },
        { _id: 'usr_2', name: 'Sarah Jenkins', role: 'Manager', department: 'Design' },
      ];

      const finalStaff = staff.length > 0 ? staff : defaultStaff;

      setClientsList(clients);
      setEmployeesList(finalStaff);

      let prjs = projectsData && projectsData.length > 0 ? projectsData : [
        { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO', clientId: clients[0]?._id || 'usr_5' },
      ];

      setProjectsList(prjs);

      if (taskToEdit) {
        // Edit mode prefill
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        const taskClientId = taskToEdit.clientId?._id || taskToEdit.clientId || clients[0]?._id || 'usr_5';
        setClientId(taskClientId);
        setProjectId(taskToEdit.projectId?._id || taskToEdit.projectId || prjs[0]._id);
        setAssignedTo(taskToEdit.assignedTo?._id || taskToEdit.assignedTo || finalStaff[0]._id);
        setPriority(taskToEdit.priority || 'Medium');
        setStatus(taskToEdit.status || 'In Progress');
        setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.substring(0, 10) : '');
        setSubmittedToClient(taskToEdit.submittedToClient || taskToEdit.status === 'Waiting for Client');
      } else {
        // Create mode prefill
        setTitle('');
        setDescription('');
        setClientId(clients[0]?._id || 'usr_5');
        setProjectId(prjs[0]._id);
        setAssignedTo(finalStaff[0]._id);
        setPriority('Medium');
        setStatus('Not Started');
        setDueDate('');
        setSubmittedToClient(false);
      }
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !projectId) {
      setErrorMsg('Please provide task title and project.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('projectId', projectId);
      if (clientId) formData.append('clientId', clientId);
      if (assignedTo) formData.append('assignedTo', assignedTo);
      formData.append('priority', priority);
      formData.append('status', submittedToClient ? 'Waiting for Client' : status);
      formData.append('submittedToClient', submittedToClient);
      if (dueDate) formData.append('dueDate', dueDate);

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      let taskResult;
      if (taskToEdit) {
        taskResult = await api.updateTaskFormData(taskToEdit._id, formData, token).catch(async () => {
          return await api.updateTask(
            taskToEdit._id,
            { title, description, projectId, clientId, assignedTo, priority, status: submittedToClient ? 'Waiting for Client' : status, submittedToClient, dueDate },
            token
          );
        });
        setSuccessMsg('Task updated and changes saved!');
      } else {
        taskResult = await api.createTaskFormData(formData, token).catch(async () => {
          return await api.createTask(
            { title, description, projectId, clientId, assignedTo, priority, status: submittedToClient ? 'Waiting for Client' : status, submittedToClient, dueDate },
            token
          );
        });
        setSuccessMsg('Task created and assigned successfully!');
      }

      if (onTaskCreated) onTaskCreated(taskResult);

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        setTitle('');
        setDescription('');
        setSelectedFiles([]);
        setErrorMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process task request.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            {taskToEdit ? 'Edit & Submit Task' : 'Create, Assign & Submit Task'}
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
            <label className="text-xs font-semibold text-slate-300">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Responsive Checkout Component"
              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description Field (Rich Text Editor) */}
          <RichTextEditor
            value={description}
            onChange={setDescription}
            label="Brief Description & Task Specifications"
            placeholder="Write task brief, key objectives, technical specs, or deliverables guidelines..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            {/* Select Client Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Select Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {clientsList.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Project Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-400" /> Select Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {filteredProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Assign To Employee Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-purple-400" /> Assign To Employee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {employeesList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.role || emp.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Status Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Internal Review">Internal Review</option>
                <option value="Waiting for Client">Waiting for Client</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                onFocus={(e) => { try { e.target.showPicker(); } catch (err) {} }}
                className="w-full bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-800 text-slate-200 focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* SUBMIT TO CLIENT TOGGLE BOX */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Submit Task & Deliverable to Client</span>
              <span className="text-[11px] text-slate-400">
                Mark task ready for client review and notify selected client.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={submittedToClient}
                onChange={(e) => setSubmittedToClient(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* File Attachments */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-indigo-400" /> File Attachments (Multer)
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600 hover:file:text-white transition"
              />
              {selectedFiles.length > 0 && (
                <div className="text-[11px] text-indigo-400 font-mono">
                  {selectedFiles.length} file(s) selected: {selectedFiles.map((f) => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {taskToEdit ? 'Save Task Updates' : 'Create & Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
