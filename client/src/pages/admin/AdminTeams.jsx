import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Filter, ShieldCheck, RefreshCw, Layers, Edit2, Plus, KeyRound } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import InviteUserModal from '../../components/InviteUserModal';
import EditUserModal from '../../components/EditUserModal';
import CreateUserModal from '../../components/CreateUserModal';
import ResetPasswordModal from '../../components/ResetPasswordModal';

const defaultMockUsers = [
  { _id: 'usr_1', name: 'Alex Vance', email: 'admin@agency.com', role: 'SuperAdmin', departmentNames: ['Development'] },
  { _id: 'usr_2', name: 'Sarah Jenkins', email: 'sarah@agency.com', role: 'Manager', departmentNames: ['Design'] },
  { _id: 'usr_3', name: 'David Miller', email: 'david@agency.com', role: 'Employee', departmentNames: ['Development'] },
  { _id: 'usr_4', name: 'Elena Rostova', email: 'elena@agency.com', role: 'Employee', departmentNames: ['SEO'] },
  { _id: 'usr_5', name: 'Acme Corp (Robert T.)', email: 'client@acmecorp.com', role: 'Client', departmentNames: ['Marketing'] },
];

const getStoredUsers = () => {
  try {
    const saved = localStorage.getItem('pensdeo_users');
    return saved ? JSON.parse(saved) : defaultMockUsers;
  } catch (e) {
    return defaultMockUsers;
  }
};

let initialMockUsers = getStoredUsers();

const saveUsersToStorage = () => {
  try {
    localStorage.setItem('pensdeo_users', JSON.stringify(initialMockUsers));
  } catch (e) {}
};

export default function AdminTeams() {
  const { token } = useAppStore();
  const [users, setUsers] = useState(initialMockUsers);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedDept]);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments(token);
      if (data && data.length > 0) setDepartmentsList(data);
    } catch (err) {
      console.log('Using default departments list.');
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(token, {
        role: selectedRole,
        department: selectedDept,
      });

      if (Array.isArray(data)) {
        // Merge any locally added/invited users from initialMockUsers not yet present in server response
        const serverIds = new Set(data.map((u) => u._id || u.email));
        const localAdded = initialMockUsers.filter(
          (u) => !serverIds.has(u._id) && !serverIds.has(u.email)
        );

        let merged = [...localAdded, ...data];

        if (selectedRole !== 'All') {
          merged = merged.filter((u) => u.role === selectedRole);
        }

        if (selectedDept !== 'All') {
          merged = merged.filter((u) => {
            if (u.departmentNames && u.departmentNames.includes(selectedDept)) return true;
            if (typeof u.department === 'string' && u.department === selectedDept) return true;
            if (Array.isArray(u.department) && u.department.some((d) => d.name === selectedDept || d === selectedDept)) return true;
            return false;
          });
        }

        setUsers(merged);
      }
    } catch (err) {
      // Fallback filtering on mock list
      let filtered = [...initialMockUsers];

      if (selectedRole !== 'All') {
        filtered = filtered.filter((u) => u.role === selectedRole);
      }

      if (selectedDept !== 'All') {
        filtered = filtered.filter((u) => {
          if (u.departmentNames && u.departmentNames.includes(selectedDept)) return true;
          if (typeof u.department === 'string' && u.department === selectedDept) return true;
          if (Array.isArray(u.department) && u.department.some((d) => d.name === selectedDept || d === selectedDept)) return true;
          return false;
        });
      }

      setUsers(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = (newUser) => {
    if (newUser) {
      if (!newUser._id) newUser._id = `usr_${Date.now()}`;
      if (!initialMockUsers.some((u) => u._id === newUser._id || u.email === newUser.email)) {
        initialMockUsers.unshift(newUser);
        saveUsersToStorage();
      }
      setUsers((prev) => [newUser, ...prev.filter((u) => u._id !== newUser._id && u.email !== newUser.email)]);
      fetchUsers();
    }
  };

  const handleUserInvited = (newUser) => {
    if (newUser) {
      if (!newUser._id) newUser._id = `usr_inv_${Date.now()}`;
      if (!initialMockUsers.some((u) => u._id === newUser._id || u.email === newUser.email)) {
        initialMockUsers.unshift(newUser);
        saveUsersToStorage();
      }
      setUsers((prev) => [newUser, ...prev.filter((u) => u._id !== newUser._id && u.email !== newUser.email)]);
      fetchUsers();
    }
  };

  const handleUserUpdated = (updatedUser) => {
    if (updatedUser) {
      const idx = initialMockUsers.findIndex((u) => u._id === updatedUser._id || u.email === updatedUser.email);
      if (idx !== -1) {
        initialMockUsers[idx] = { ...initialMockUsers[idx], ...updatedUser };
        saveUsersToStorage();
      }
      setUsers((prev) => prev.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-400" /> User & Department Management
          </h1>
          <p className="text-xs text-slate-400">
            Create users, filter roles & departments, assign multiple departments, and send invites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 w-fit"
          >
            <Plus className="w-4 h-4" /> Create User
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 w-fit border border-slate-700"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" /> Invite via Email
          </button>
        </div>
      </div>

      {/* ADVANCED FILTERING DROPDOWNS BAR */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Filter className="w-4 h-4 text-indigo-400" /> Query Filters:
          {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin ml-2" />}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-slate-950 text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
              <option value="Client">Client</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-950 text-xs px-3 py-1.5 rounded-lg border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d._id} value={d.name || d._id}>
                  {d.name}
                </option>
              ))}
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="SEO">SEO</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          {(selectedRole !== 'All' || selectedDept !== 'All') && (
            <button
              onClick={() => {
                setSelectedRole('All');
                setSelectedDept('All');
              }}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* User Roster Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">User Name</th>
                <th className="p-4">Username / Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Assigned Departments</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                    No users match the selected query filters ({selectedRole !== 'All' ? `Role: ${selectedRole}` : ''}{selectedRole !== 'All' && selectedDept !== 'All' ? ', ' : ''}{selectedDept !== 'All' ? `Dept: ${selectedDept}` : ''}).
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-850/40 transition">
                    <td className="p-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                        {user.name ? user.name.charAt(0) : 'U'}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {user.username && <span className="text-slate-300 font-semibold block">@{user.username}</span>}
                      {user.email}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.role === 'SuperAdmin'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : user.role === 'Manager'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : user.role === 'Client'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.departmentNames && user.departmentNames.length > 0 ? (
                          user.departmentNames.map((dName, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-950 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800"
                            >
                              {dName}
                            </span>
                          ))
                        ) : user.department && Array.isArray(user.department) ? (
                          user.department.map((d, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-950 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800"
                            >
                              {d.name || d}
                            </span>
                          ))
                        ) : (
                          <span className="bg-slate-950 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800">
                            Development
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setResetTargetUser(user);
                            setShowResetModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1"
                          title="Reset Password for user"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit Departments
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

      {/* Create User Modal (Direct creation by Manager/Admin) */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Invite Modal (Email invite) */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onUserInvited={handleUserInvited}
      />

      {/* Edit User/Departments Modal */}
      {showEditModal && editingUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          user={editingUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Admin Reset Password Modal */}
      {showResetModal && resetTargetUser && (
        <ResetPasswordModal
          isOpen={showResetModal}
          onClose={() => {
            setShowResetModal(false);
            setResetTargetUser(null);
          }}
          targetUser={resetTargetUser}
        />
      )}
    </div>
  );
}
