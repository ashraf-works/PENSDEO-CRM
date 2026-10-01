import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Lock,
  Eye,
  CheckCircle2,
  FolderKanban,
  CheckSquare,
  Sparkles,
  Send,
  Upload,
  Paperclip,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function EmployeeDailyWork() {
  const { token, currentUser } = useAppStore();

  const [projectsList, setProjectsList] = useState([
    { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
  ]);

  const [tasksList, setTasksList] = useState([
    { _id: 'tsk_1', projectId: 'prj_1', title: 'Build Responsive Checkout Component', status: 'In Progress' },
    { _id: 'tsk_2', projectId: 'prj_1', title: 'On-Page Technical SEO Audit', status: 'Internal Review' },
  ]);

  const [logsFeed, setLogsFeed] = useState([
    {
      _id: 'upd_1',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      taskId: { _id: 'tsk_1', title: 'Build Responsive Checkout Component' },
      employeeId: { name: 'David Miller' },
      description: 'Integrated Stripe API SDK and optimized payment webhooks for cart authorization.',
      timeSpent: 240, // 4 hours
      visibility: 'Visible to Client',
      createdAt: 'Today, 2:30 PM',
      attachments: [
        { fileName: 'stripe-checkout-screenshot.png', fileUrl: '/uploads/sample-screenshot.png', fileType: 'image/png' },
      ],
    },
    {
      _id: 'upd_2',
      projectId: { _id: 'prj_1', title: 'Acme E-Commerce Redesign & SEO' },
      taskId: { _id: 'tsk_1', title: 'Build Responsive Checkout Component' },
      employeeId: { name: 'David Miller' },
      description: 'Internal Refactoring: Debugged CORS proxy and token configuration.',
      timeSpent: 90, // 1.5 hours
      visibility: 'Internal Only',
      createdAt: 'Today, 11:15 AM',
      attachments: [],
    },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    projectId: 'prj_1',
    taskId: 'tsk_1',
    description: '',
    taskStatus: 'In Progress',
    timeSpent: 120, // 2 hours default in minutes
    visibility: 'Internal Only',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [fetchedProjects, fetchedTasks, fetchedLogs] = await Promise.all([
        api.getProjects(token).catch(() => null),
        api.getTasks(token).catch(() => null),
        api.getDailyUpdates(token).catch(() => null),
      ]);

      if (fetchedProjects && fetchedProjects.length > 0) setProjectsList(fetchedProjects);
      if (fetchedTasks && fetchedTasks.length > 0) setTasksList(fetchedTasks);
      if (fetchedLogs && fetchedLogs.length > 0) setLogsFeed(fetchedLogs);
    } catch (err) {
      console.log('Using default mock logs and tasks for Employee view.');
    }
  };

  // Filter tasks based on selected project
  const availableTasks = tasksList.filter(
    (t) => String(t.projectId?._id || t.projectId) === String(formData.projectId)
  );

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.projectId) return;

    setLoading(true);
    try {
      // Build FormData payload to send text fields + file/image attachments
      const uploadPayload = new FormData();
      uploadPayload.append('projectId', formData.projectId);
      if (formData.taskId) uploadPayload.append('taskId', formData.taskId);
      uploadPayload.append('description', formData.description);
      uploadPayload.append('timeSpent', formData.timeSpent);
      uploadPayload.append('visibility', formData.visibility);

      // Append files
      selectedFiles.forEach((file) => {
        uploadPayload.append('attachments', file);
      });

      // 1. Post Daily Update Log via FormData API
      const newLog = await api.createDailyUpdateFormData(uploadPayload, token).catch(async () => {
        // Fallback for mock state
        return await api.createDailyUpdate(
          {
            projectId: formData.projectId,
            taskId: formData.taskId || null,
            description: formData.description,
            timeSpent: Number(formData.timeSpent),
            visibility: formData.visibility,
          },
          token
        );
      });

      // 2. Optionally update Task Status if linked
      if (formData.taskId && formData.taskStatus) {
        await api.updateTaskStatus(formData.taskId, formData.taskStatus, token).catch(() => null);
      }

      const mockAttachments = selectedFiles.map((f) => ({
        fileName: f.name,
        fileUrl: URL.createObjectURL(f),
        fileType: f.type,
      }));

      const logObj = newLog || {
        _id: `upd_${Date.now()}`,
        projectId: projectsList.find((p) => p._id === formData.projectId) || { title: 'Project' },
        taskId: tasksList.find((t) => t._id === formData.taskId) || { title: 'Task' },
        employeeId: { name: currentUser?.name || 'Employee' },
        description: formData.description,
        timeSpent: Number(formData.timeSpent),
        visibility: formData.visibility,
        createdAt: 'Just now',
        attachments: mockAttachments,
      };

      setLogsFeed([logObj, ...logsFeed]);
      setSubmittedMessage('Work report and file attachments submitted successfully!');
      setSelectedFiles([]);
      setFormData({
        projectId: formData.projectId,
        taskId: availableTasks[0]?._id || '',
        description: '',
        taskStatus: 'In Progress',
        timeSpent: 120,
        visibility: 'Internal Only',
      });

      setTimeout(() => setSubmittedMessage(''), 5000);
    } catch (err) {
      console.error('Failed to submit log:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Today's Work Logging Portal
          </h1>
          <p className="text-xs text-slate-400">
            Log time spent, report work progress, attach files/images, and set client visibility.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Staff Logger
        </div>
      </div>

      {submittedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {submittedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Daily Work Log Form */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Submit Work Report & Upload Attachments
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Multipart Work Log Entry</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project & Task Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-500" /> Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  {projectsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> Linked Task
                </label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- No specific task --</option>
                  {availableTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* What did you do today? Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">What did you do today?</label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe key achievements, code commits, designs finalized, or bugs fixed..."
                className="w-full bg-slate-50 dark:bg-slate-950 text-xs p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              ></textarea>
            </div>

            {/* FILE / IMAGE UPLOAD FIELD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Attach Files & Screenshots
              </label>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition inline-flex items-center gap-2 shadow-sm">
                    <Paperclip className="w-3.5 h-3.5" /> Select Images or Files
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Formats: Images, PDF, Docs, Zip</span>
                </div>

                {/* Selected Files Chips List */}
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 flex items-center gap-1.5 font-mono shadow-sm"
                      >
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                        <span className="truncate max-w-[140px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Task Status & Time Spent Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Task Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Update Task Status</label>
                <select
                  value={formData.taskStatus}
                  onChange={(e) => setFormData({ ...formData, taskStatus: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Waiting for Client">Waiting for Client (Triggers Alert)</option>
                  <option value="Internal Review">Internal Review</option>
                  <option value="Completed">Completed (Calculates Progress)</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Time Spent Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time Spent (Minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  required
                  value={formData.timeSpent}
                  onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono">
                  = {(formData.timeSpent / 60).toFixed(1)} Hours
                </span>
              </div>
            </div>

            {/* TOGGLE SWITCH FOR VISIBILITY */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Visibility Setting</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Control whether this work report & attachments are visible to the Client.
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'Internal Only' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      formData.visibility === 'Internal Only'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" /> Internal Only 🔒
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, visibility: 'Visible to Client' })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      formData.visibility === 'Visible to Client'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Visible to Client 👁️
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Submitting Work Report...' : 'Submit Report & Attachments'}
            </button>
          </form>
        </div>

        {/* Submitted Work Logs Feed with File & Image Attachments */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Submitted Reports & Files
            </h3>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">{logsFeed.length} Entries</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {logsFeed.map((log) => (
              <div
                key={log._id}
                className={`p-4 rounded-xl border space-y-2.5 transition shadow-sm ${
                  log.visibility === 'Visible to Client'
                    ? 'bg-emerald-50/50 dark:bg-slate-950/80 border-emerald-500/40'
                    : 'bg-amber-50/50 dark:bg-slate-950/80 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{log.employeeId?.name || 'Employee'}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                      log.visibility === 'Visible to Client'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                    }`}
                  >
                    {log.visibility === 'Visible to Client' ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Visible to Client
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Internal Only
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{log.description}</p>

                {/* MANAGER FEEDBACK FOR EMPLOYEE */}
                {log.managerNotesForEmployee && (
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 space-y-1 my-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Manager Feedback for You:
                    </div>
                    <p className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed italic">{log.managerNotesForEmployee}</p>
                  </div>
                )}

                {/* Render File/Image Attachments */}
                {log.attachments && log.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Attached Files ({log.attachments.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.fileUrl.startsWith('blob:') || att.fileUrl.startsWith('http') ? att.fileUrl : `http://localhost:5000${att.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-400 transition flex items-center gap-1.5 shadow-sm"
                        >
                          {att.fileType && att.fileType.startsWith('image/') ? (
                            <ImageIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          )}
                          <span className="truncate max-w-[120px]">{att.fileName}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                  <span className="text-indigo-600 dark:text-indigo-300 font-semibold">Time Spent: {log.timeSpent} mins</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      log.reviewStatus === 'Approved by Manager'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {log.reviewStatus || 'Pending Review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
