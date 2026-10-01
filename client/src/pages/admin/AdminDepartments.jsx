import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Send, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';

export default function AdminDepartments() {
  const { token } = useAppStore();
  const [departments, setDepartments] = useState([
    { _id: 'dep_1', name: 'Development', description: 'Engineering, Fullstack & Mobile APIs' },
    { _id: 'dep_2', name: 'Design', description: 'UI/UX Prototypes, Figma Systems & Assets' },
    { _id: 'dep_3', name: 'SEO', description: 'Technical Audits, Sitemap Submissions & Keywords' },
    { _id: 'dep_4', name: 'Marketing', description: 'Campaign Strategy, Content & Outreach' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingDep, setEditingDep] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments(token);
      if (data && data.length > 0) setDepartments(data);
    } catch (err) {
      console.log('Using default departments list.');
    }
  };

  const openCreateModal = () => {
    setEditingDep(null);
    setName('');
    setDescription('');
    setErrorMsg('');
    setShowModal(true);
  };

  const openEditModal = (dep) => {
    setEditingDep(dep);
    setName(dep.name);
    setDescription(dep.description || '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Department name is required.');
      return;
    }

    try {
      if (editingDep) {
        // Edit Department
        const updated = await api.updateDepartment(editingDep._id, { name, description }, token).catch(() => null);
        setDepartments((prev) =>
          prev.map((d) => (d._id === editingDep._id ? (updated || { ...d, name, description }) : d))
        );
        setSuccessMsg('Department updated successfully!');
      } else {
        // Create Department
        const created = await api.createDepartment({ name, description }, token).catch(() => null);
        const newDep = created || { _id: `dep_${Date.now()}`, name, description };
        setDepartments([...departments, newDep]);
        setSuccessMsg('New department created successfully!');
      }

      setShowModal(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.deleteDepartment(id, token).catch(() => null);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
      setSuccessMsg('Department deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Delete department error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Dynamic Department Management
          </h1>
          <p className="text-xs text-slate-400">
            Create, edit, and organize agency departments dynamically for multi-department assignments.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 w-fit"
        >
          <Plus className="w-4 h-4" /> Add New Department
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dep) => (
          <div key={dep._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  Department
                </span>
                <span className="text-[10px] text-slate-500 font-mono">ID: {dep._id}</span>
              </div>
              <h3 className="text-base font-bold text-white">{dep.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{dep.description || 'No description provided.'}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(dep)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs flex items-center gap-1 font-semibold"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
              </button>
              <button
                onClick={() => handleDelete(dep._id)}
                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                {editingDep ? 'Edit Department' : 'Create New Department'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI & Machine Learning"
                  className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description Field (Rich Text Editor) */}
              <RichTextEditor
                value={description}
                onChange={setDescription}
                label="Department Brief & Responsibilities"
                placeholder="Describe department scope, key capabilities, or team responsibilities..."
                rows={3}
              />

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
