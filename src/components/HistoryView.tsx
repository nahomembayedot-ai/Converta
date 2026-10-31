import React, { useState } from 'react';
import {
  History,
  Search,
  Trash2,
  FileCheck,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { HistoryItem } from '../types/converta';
import { formatBytes } from '../utils/fileDetector';

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter(
    (h) =>
      h.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.targetFormat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Header and Search */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Conversion History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log of previously converted files from this session.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-white/15 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium border border-white/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">
            No Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Files converted via the radial wheel or batch queue will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-white/5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="py-3.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-lg transition-colors text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-200 truncate">
                    {item.sourceName}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span className="font-mono text-indigo-300 font-semibold">
                      {item.sourceFormat.toUpperCase()} → {item.targetFormat}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{formatBytes(item.outputSize)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-slate-400">
                <div className="flex items-center space-x-1 text-[11px] font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
