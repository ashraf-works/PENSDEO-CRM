import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Clock3,
  FileCheck,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  UserCheck,
  CheckSquare,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  FileText,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function ClientOverview() {
  const { token, currentUser } = useAppStore();
  const [loading, setLoading] = useState(false);

  // Project state
  const [project, setProject] = useState(null);

  // Task Stats
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });

  // Today's Activity Timeline
  const [timelineUpdates, setTimelineUpdates] = useState([]);

  // Deliverables
  const [pendingDeliverables, setPendingDeliverables] = useState([]);

  useEffect(() => {
    fetchClientData();
  }, [currentUser]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      const [fetchedProjects, fetchedTasks, fetchedUpdates, fetchedDeliverables] = await Promise.all([
        api.getProjects(token).catch(() => null),
        api.getTasks(token).catch(() => null),
        api.getDailyUpdates(token).catch(() => null),
        api.getDeliverables(token).catch(() => null),
      ]);

      const storedProjectsRaw = localStorage.getItem('pensdeo_projects');
      let allProjects = Array.isArray(fetchedProjects) ? fetchedProjects : [];
      if (storedProjectsRaw) {
        try {
          const parsed = JSON.parse(storedProjectsRaw);
          allProjects = [...allProjects, ...parsed];
        } catch (e) {}
      }

      const clientEmail = currentUser?.email?.toLowerCase();
      const clientId = currentUser?._id;

      const myProject = allProjects.find((p) => {
        if (!p) return false;
        if (p.clientId === clientId || p.clientId?._id === clientId) return true;
        if (p.clientId?.email?.toLowerCase() === clientEmail) return true;
        if (typeof p.clientName === 'string' && currentUser?.name && p.clientName.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
        return false;
      });

      if (myProject) {
        setProject(myProject);

        if (Array.isArray(fetchedTasks)) {
          const myTasks = fetchedTasks.filter((t) => t.projectId === myProject._id || t.projectId?._id === myProject._id);
          const total = myTasks.length;
          const completed = myTasks.filter((t) => t.status === 'Completed').length;
          const inProgress = myTasks.filter((t) => t.status === 'In Progress').length;
          const overdue = myTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;
          setTaskStats({ total, completed, inProgress, overdue });
        }

        if (Array.isArray(fetchedUpdates)) {
          setTimelineUpdates(fetchedUpdates.filter((u) => (u.projectId === myProject._id || u.projectId?._id === myProject._id) && u.visibility !== 'Internal Only'));
        }

        if (Array.isArray(fetchedDeliverables)) {
          setPendingDeliverables(
            fetchedDeliverables.filter((d) => (d.projectId === myProject._id || d.projectId?._id === myProject._id) && d.status === 'Pending Review')
          );
        }
      } else {
        setProject(null);
        setTimelineUpdates([]);
        setPendingDeliverables([]);
        setTaskStats({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
      }
    } catch (err) {
      console.log('Using isolated client view.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const getProjectHealth = () => {
    if (taskStats.overdue > 0) return { label: '🔴 Delayed', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    if (pendingDeliverables.length > 0) return { label: '🟡 Review Needed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    return { label: '🟢 On Track', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  const health = getProjectHealth();

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl mx-auto flex items-center justify-center shadow-xl">
          <FolderKanban className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Project Assigned</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Welcome to PENSDEO Workspace, <span className="text-indigo-400 font-semibold">{currentUser?.name || currentUser?.email}</span>! Your agency project manager has not assigned an active project to your client portal yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-wide">Client Portal Dashboard</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${health.color}`}>
              Health: {health.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time project overview, verified daily progress updates, and employee file attachments.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl w-fit">
          <ShieldCheck className="w-4 h-4" /> Transparent Client Access Active
        </div>
      </div>

      {/* Active Project Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
              Active Project Overview
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-2">{project.title}</h2>
          </div>

          <div className="flex items-center gap-4 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Start Date:</span>
              <span className="font-bold text-slate-200">{project.startDate || '2026-09-01'}</span>
            </div>
            <div className="h-6 w-px bg-slate-800"></div>
            <div>
              <span className="text-slate-500 block">Expected Delivery:</span>
              <span className="font-bold text-emerald-400">{project.expectedDelivery || '2026-11-15'}</span>
            </div>
          </div>
        </div>

        {/* PROMINENT PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">Overall Completion Progress</span>
            <span className="text-emerald-400 font-mono text-base">{project.progressPercentage || 65}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/30"
              style={{ width: `${project.progressPercentage || 65}%` }}
            ></div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block">Total Tasks</span>
            <span className="text-xl font-bold text-white">{taskStats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block">Completed</span>
            <span className="text-xl font-bold text-emerald-400">{taskStats.completed}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block">In Progress</span>
            <span className="text-xl font-bold text-indigo-400">{taskStats.inProgress}</span>
          </div>
        </div>
      </div>

      {/* QUESTION 2 & 3: What was done today? & What's next? */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* VERTICAL TIMELINE UI WITH EMPLOYEE ATTACHMENTS */}
        <div className="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Today's Activity Timeline & Uploaded Files
              </h3>
              <p className="text-[11px] text-slate-400">
                Transparent work reports and file attachments logged by the agency team.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Verified Client View
            </span>
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timelineUpdates.map((update, index) => (
              <div key={update._id || index} className="relative group">
                <div className="absolute -left-[1.65rem] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 group-hover:scale-125 transition-transform shadow-md shadow-emerald-500/50"></div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {update.employeeId?.name || update.employeeName || 'Agency Developer'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {update.department || update.employeeId?.department || 'Development'} • {update.time || 'Today'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">{update.description}</p>

                  {/* MANAGER NOTE FOR CLIENT */}
                  {update.managerNotesForClient && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 my-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" /> Note from Manager:
                      </div>
                      <p className="text-xs text-emerald-100 leading-relaxed italic">{update.managerNotesForClient}</p>
                    </div>
                  )}

                  {/* DISPLAY EMPLOYEE UPLOADED ATTACHMENTS TO CLIENT */}
                  {update.attachments && update.attachments.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Attached Work Files ({update.attachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {update.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={
                              att.fileUrl.startsWith('blob:') || att.fileUrl.startsWith('http')
                                ? att.fileUrl
                                : `http://localhost:5000${att.fileUrl}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition flex items-center gap-1.5"
                          >
                            {att.fileType && att.fileType.startsWith('image/') ? (
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            )}
                            <span className="truncate max-w-[150px]">{att.fileName}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Logged Duration: {update.timeSpent} mins</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Update
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables Pending Approval Callout */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" /> Pending Approvals
            </h3>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              {pendingDeliverables.length} Action Needed
            </span>
          </div>

          {pendingDeliverables.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              All deliverable assets approved! No items pending review.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDeliverables.map((del) => (
                <div key={del._id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {del.type}
                  </span>
                  <h4 className="text-sm font-bold text-white">{del.title}</h4>
                  <a
                    href={del.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-mono truncate"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> View Deliverable File
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
