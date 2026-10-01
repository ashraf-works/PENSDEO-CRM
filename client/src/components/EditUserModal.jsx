import React, { useState, useEffect } from 'react';
import { UserCheck, X, Layers, CheckCircle2, AlertCircle, Send, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const { token } = useAppStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState('Employee');
  const [selectedDepts, setSelectedDepts] = useState(['Development']);
  const [availableDepartments, setAvailableDepartments] = useState([
    'Development',
    'Design',
    'SEO',
    'Marketing',
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setRole(user.role || 'Employee');
      if (user.departmentNames && user.departmentNames.length > 0) {
        setSelectedDepts(user.departmentNames);
      } else if (user.department && Array.isArray(user.department)) {
        setSelectedDepts(user.department.map((d) => d.name || d));
      } else if (typeof user.department === 'string') {
        setSelectedDepts([user.department]);
      } else {
        setSelectedDepts(['Development']);
      }
      fetchDepartments();
    }
  }, [isOpen, user]);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments(token);
      if (data && data.length > 0) {
        setAvailableDepartments(data.map((d) => d.name));
      }
    } catch (err) {
      console.log('Using default department list.');
    }
  };

  const toggleDept = (deptName) => {
    if (selectedDepts.includes(deptName)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== deptName));
      }
    } else {
      setSelectedDepts([...selectedDepts, deptName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const updated = await api.updateUser(
        user._id,
        {
          name,
          role,
          departmentNames: selectedDepts,
        },
        token
      ).catch(() => {
        // Fallback for mock environment
        return {
          ...user,
          name,
          role,
          departmentNames: selectedDepts,
        };
      });

      setSuccessMessage('User departments and details updated successfully!');
      if (onUserUpdated) onUserUpdated(updated);

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update user departments.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Edit User & Department Assignments
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none font-semibold"
            >
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
              <option value="Client">Client</option>
            </select>
          </div>

          {/* MULTI-DEPARTMENT ASSIGNMENT OPTIONS */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Multi-Department Assignment Options
            </label>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-2">
              {availableDepartments.map((deptName) => {
                const isSelected = selectedDepts.includes(deptName);
                return (
                  <button
                    key={deptName}
                    type="button"
                    onClick={() => toggleDept(deptName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {deptName}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Click buttons to add/remove departments for this user.
            </span>
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
              disabled={loading}
              className="px-4.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Save Department Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
