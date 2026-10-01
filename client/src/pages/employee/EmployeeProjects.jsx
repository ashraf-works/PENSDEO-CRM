import React from 'react';
import { FolderKanban } from 'lucide-react';

export default function EmployeeProjects() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-purple-400" /> Assigned Projects
        </h1>
        <p className="text-xs text-slate-400">View projects where you are listed in the assigned team roster.</p>
      </div>

      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center">
        Employee assigned projects view placeholder.
      </div>
    </div>
  );
}
