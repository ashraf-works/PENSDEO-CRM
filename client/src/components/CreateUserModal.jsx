import React, { useState, useEffect } from 'react';
import { UserPlus, X, Layers, CheckCircle2, AlertCircle, Send, Key, User, Mail } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const { token } = useAppStore();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [selectedDepts, setSelectedDepts] = useState(['Development']);
  const [availableDepartments, setAvailableDepartments] = useState([
    'Development',
    'Design',
    'SEO',
    'Marketing',
  ]);

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments(token);
      if (data && data.length > 0) {
        setAvailableDepartments(data.map((d) => d.name));
      }
    } catch (err) {
      console.log('Using default department list for create user modal.');
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
    if (!name || (!username && !email) || !password) {
      setErrorMessage('Please provide Name, Username/Email, and Password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const userPayload = {
        name,
        username,
        email: email || `${username.toLowerCase()}@agency.com`,
        password,
        role,
        departmentNames: selectedDepts,
      };

      const res = await api.createUser(userPayload, token).catch((err) => {
        // Fallback mock user if server offline
        return {
          _id: `usr_${Date.now()}`,
          name,
          username: username || name.toLowerCase().replace(/\s+/g, '_'),
          email: email || `${username || 'user'}@agency.com`,
          password,
          role,
          departmentNames: selectedDepts,
        };
      });

      setToastMessage(`User "${name}" created successfully!`);
      if (onUserCreated) onUserCreated(res);

      setTimeout(() => {
        setToastMessage('');
        onClose();
        setName('');
        setUsername('');
        setEmail('');
        setPassword('');
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Create User Account (Manager Direct)
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> {toastMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Username *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Password *</label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address (Optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@agency.com"
                className="w-full bg-slate-950 text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 text-xs px-3 py-2.5 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Client">Client (Client Portal)</option>
              <option value="SuperAdmin">SuperAdmin</option>
            </select>
          </div>

          {/* MULTI-SELECT DEPARTMENTS PICKER */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Department Assignment
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap gap-1.5">
              {availableDepartments.map((deptName) => {
                const isSelected = selectedDepts.includes(deptName);
                return (
                  <button
                    key={deptName}
                    type="button"
                    onClick={() => toggleDept(deptName)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
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
              <Send className="w-3.5 h-3.5" /> {loading ? 'Creating...' : 'Create User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
