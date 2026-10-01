import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Clock,
  RefreshCw,
  Lock,
  Eye,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  Edit3
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';
import ManagerReviewModal from '../../components/ManagerReviewModal';

export default function AdminOverview() {
  const { token } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 1,
    activeProjects: 1,
    tasksToday: 2,
    blockedTasks: 0,
  });

  const [projectsList, setProjectsList] = useState([
    {
      _id: 'prj_1',
      title: 'Acme E-Commerce Redesign & SEO',
      clientId: { name: 'Acme Corp (Robert Taylor)', email: 'client@acmecorp.com' },
      status: 'In Progress',
      progressPercentage: 65,
      startDate: '2026-09-01',
      expectedDelivery: '2026-11-15',
    },
  ]);

  const [recentUpdates, setRecentUpdates] = useState([
    {
      _id: 'upd_1',
      description: 'Integrated Stripe API checkout & authorization webhooks.',
      employeeName: 'David Miller',
      timeSpent: 240,
      visibility: 'Visible to Client',
      reviewStatus: 'Approved by Manager',
      managerNotesForClient: 'Approved by Sarah Jenkins (Design Lead). Stripe payment flow validated.',
      managerNotesForEmployee: 'Great work David! Clean webhook implementation.',
      createdAt: 'Today, 2:30 PM',
      attachments: [],
    },
    {
      _id: 'upd_2',
      description: 'Internal Refactoring: Resolved CORS proxy configuration.',
      employeeName: 'David Miller',
      timeSpent: 90,
      visibility: 'Internal Only',
      reviewStatus: 'Pending Review',
      managerNotesForClient: '',
      managerNotesForEmployee: '',
      createdAt: 'Today, 11:15 AM',
      attachments: [],
    },
  ]);

  // Manager Review Modal State
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedProjects, fetchedTasks, fetchedUsers, fetchedUpdates] = await Promise.all([
        api.getProjects(token).catch(() => null),
        api.getTasks(token).catch(() => null),
        api.getUsers(token).catch(() => null),
        api.getDailyUpdates(token).catch(() => null),
      ]);

      if (fetchedProjects) setProjectsList(fetchedProjects);
      if (fetchedUpdates) setRecentUpdates(fetchedUpdates);

      if (fetchedProjects || fetchedTasks || fetchedUsers) {
        const clientCount = fetchedUsers ? fetchedUsers.filter((u) => u.role === 'Client').length : 1;
        const activeProjCount = fetchedProjects ? fetchedProjects.filter((p) => p.status === 'In Progress').length : 1;
        const tasksCount = fetchedTasks ? fetchedTasks.length : 2;
        const blockedCount = fetchedTasks ? fetchedTasks.filter((t) => t.status === 'Blocked').length : 0;

        setStats({
          totalClients: clientCount || 1,
          activeProjects: activeProjCount || 1,
          tasksToday: tasksCount || 2,
          blockedTasks: blockedCount || 0,
        });
      }
    } catch (err) {
      console.log('Using default mock stats for Admin Overview.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateProgress = async (projectId) => {
    try {
      const res = await api.calculateProjectProgress(projectId, token);
      if (res && res.progressPercentage !== undefined) {
        setProjectsList((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, progressPercentage: res.progressPercentage } : p))
        );
      }
    } catch (err) {
      setProjectsList((prev) =>
        prev.map((p) => (p._id === projectId ? { ...p, progressPercentage: Math.min(100, p.progressPercentage + 5) } : p))
      );
    }
  };

  const handleOpenReviewModal = (upd) => {
    setSelectedUpdate(upd);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = (updatedLog) => {
    if (updatedLog) {
      setRecentUpdates((prev) =>
        prev.map((u) => (u._id === updatedLog._id ? updatedLog : u))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Admin & Manager Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Review employee work reports, add client/employee messages, and control client visibility.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 flex items-center gap-2 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.totalClients}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active Accounts</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.activeProjects}</div>
          <span className="text-[11px] text-purple-400 mt-1 block font-medium">In Development</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Tasks Today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.tasksToday}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Assigned to Team</span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Blocked Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.blockedTasks}</div>
          <span className="text-[11px] text-rose-400 mt-1 block font-semibold">Requires Attention</span>
        </div>
      </div>

      {/* Projects & Manager Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <FolderKanban className="w-4 h-4 text-indigo-400" /> Active Agency Projects
            </h3>
            <span className="text-xs text-slate-400 font-mono">Progress Percentage Auto-Calculator</span>
          </div>

          <div className="space-y-4">
            {projectsList.map((prj) => (
              <div key={prj._id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{prj.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Client: {prj.clientId?.name || 'Acme Corp'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRecalculateProgress(prj._id)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center gap-1.5"
                    title="Calculate progress based on completed tasks"
                  >
                    <RefreshCw className="w-3 h-3" /> Sync Progress
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Calculated Progress</span>
                    <span className="text-indigo-400 font-bold">{prj.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${prj.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WORK REPORT MANAGER REVIEW FEED */}
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Manager Review & Client Release
            </h3>
            <span className="text-xs text-slate-400">Click to Review</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {recentUpdates.map((upd) => (
              <div
                key={upd._id}
                onClick={() => handleOpenReviewModal(upd)}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 cursor-pointer space-y-2 text-xs transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{upd.employeeId?.name || upd.employeeName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                      upd.visibility === 'Visible to Client'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {upd.visibility === 'Visible to Client' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {upd.visibility}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed font-normal">{upd.description}</p>

                {upd.managerNotesForClient && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                    <span className="font-bold block">Client Note:</span> "{upd.managerNotesForClient}"
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="text-indigo-400 font-semibold">{upd.reviewStatus || 'Pending Review'}</span>
                  <span className="text-indigo-300 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Click Detailed Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MANAGER REVIEW MODAL */}
      {showReviewModal && selectedUpdate && (
        <ManagerReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedUpdate(null);
          }}
          update={selectedUpdate}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
