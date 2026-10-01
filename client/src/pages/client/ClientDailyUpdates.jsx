import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, UserCheck, CheckCircle2, Paperclip, Image as ImageIcon, FileText, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../services/api';

export default function ClientDailyUpdates() {
  const { token } = useAppStore();
  const [updates, setUpdates] = useState([
    {
      _id: 'upd_1',
      description: 'Integrated Stripe API SDK checkout gateway and optimized webhooks for cart authorization.',
      employeeName: 'David Miller',
      department: 'Development',
      timeSpent: 240,
      createdAt: 'Today, 2:30 PM',
      attachments: [
        { fileName: 'stripe-checkout-preview.png', fileUrl: '/uploads/sample-screenshot.png', fileType: 'image/png' },
      ],
    },
    {
      _id: 'upd_3',
      description: 'Completed sitemap XML submission and schema structured data validation for search engine indexation.',
      employeeName: 'Elena Rostova',
      department: 'SEO',
      timeSpent: 180,
      createdAt: 'Yesterday, 4:00 PM',
      attachments: [],
    },
  ]);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const data = await api.getDailyUpdates(token);
      if (data && data.length > 0) setUpdates(data);
    } catch (err) {
      console.log('Using default client verified updates.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Today's Verified Work Updates & Attachments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simplified progress updates and file attachments approved by agency managers for client transparency.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Internal Only Logs Filtered Out
        </span>
      </div>

      <div className="space-y-4">
        {updates.map((item) => (
          <div key={item._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                {item.employeeId?.name || item.employeeName || 'Agency Engineer'}
              </span>
              <span className="text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                {item.department || item.employeeId?.department || 'Engineering'} • {item.createdAt}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-normal">{item.description}</p>

            {/* MANAGER NOTE FOR CLIENT */}
            {item.managerNotesForClient && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1 my-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <MessageSquare className="w-3.5 h-3.5" /> Note from Manager:
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed italic">{item.managerNotesForClient}</p>
              </div>
            )}

            {/* ATTACHMENTS VIEW FOR CLIENT */}
            {item.attachments && item.attachments.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" /> Attached Work Files ({item.attachments.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {item.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={
                        att.fileUrl.startsWith('blob:') || att.fileUrl.startsWith('http')
                          ? att.fileUrl
                          : `http://localhost:5000${att.fileUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition flex items-center gap-2"
                    >
                      {att.fileType && att.fileType.startsWith('image/') ? (
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{att.fileName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="text-indigo-300">Logged Time: {item.timeSpent} minutes</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Client Verified Update
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
