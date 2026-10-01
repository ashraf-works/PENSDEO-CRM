import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Building2, UserPlus, Edit2, Layers, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import InviteUserModal from '../../components/InviteUserModal';
import EditUserModal from '../../components/EditUserModal';

export default function AdminClients() {
  const { token } = useAppStore();

  const [clients, setClients] = useState([
    {
      _id: 'usr_5',
      name: 'Acme Corp (Robert Taylor)',
      email: 'client@acmecorp.com',
      role: 'Client',
      departmentNames: ['Marketing', 'Design'],
      assignedProjects: [{ _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' }],
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await api.getUsers(token, { role: 'Client' });
      if (data && data.length > 0) setClients(data);
    } catch (err) {
      console.log('Using default mock clients list.');
    }
  };

  const handleClientInvited = (newClient) => {
    if (newClient) {
      setClients([newClient, ...clients]);
    }
  };

  const handleClientUpdated = (updatedClient) => {
    if (updatedClient) {
      setClients((prev) =>
        prev.map((c) => (c._id === updatedClient._id ? updatedClient : c))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Client Account Management
          </h1>
          <p className="text-xs text-slate-400">
            Invite clients to their custom Client Portal and manage multi-department assignments.
          </p>
        </div>
        {/* FIX: Invite New Client button opens InviteUserModal */}
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 w-fit"
        >
          <UserPlus className="w-4 h-4" /> Invite New Client
        </button>
      </div>

      {/* Clients List Table */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Client Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Assigned Departments</th>
                <th className="p-4">Linked Projects</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-slate-850/40 transition">
                  <td className="p-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs">
                      <Building2 className="w-4 h-4" />
                    </div>
                    {client.name}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{client.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {client.departmentNames && client.departmentNames.length > 0 ? (
                        client.departmentNames.map((dName, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-950 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800"
                          >
                            {dName}
                          </span>
                        ))
                      ) : (
                        <span className="bg-slate-950 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800">
                          Marketing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {client.assignedProjects && client.assignedProjects.length > 0 ? (
                      <span className="font-semibold text-indigo-300">
                        {client.assignedProjects.map((p) => p.title || p).join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-500">Acme E-Commerce Redesign</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit Departments
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal for Clients */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onUserInvited={handleClientInvited}
      />

      {/* Edit User/Departments Modal */}
      {showEditModal && editingClient && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          user={editingClient}
          onUserUpdated={handleClientUpdated}
        />
      )}
    </div>
  );
}
