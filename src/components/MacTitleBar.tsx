import React from 'react';
import {
  CircleDot,
  FolderOpen,
  History,
  Layers,
  Settings,
  Terminal,
  Code2,
} from 'lucide-react';

export type ActiveTab = 'wheel' | 'batch' | 'history' | 'settings' | 'xcode';

interface MacTitleBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenFilePicker: () => void;
  historyCount: number;
}

export const MacTitleBar: React.FC<MacTitleBarProps> = ({
  activeTab,
  onTabChange,
  onOpenFilePicker,
  historyCount,
}) => {
  return (
    <header className="h-14 border-b border-white/10 bg-[#121824]/90 backdrop-blur-xl px-4 flex items-center justify-between select-none z-30">
      {/* Traffic Light Controls & App Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="flex items-center space-x-2 group">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm group-hover:brightness-90 transition-all cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm group-hover:brightness-90 transition-all cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm group-hover:brightness-90 transition-all cursor-pointer" />
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <CircleDot className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-100 tracking-wide flex items-center gap-1.5">
              Converta
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                macOS
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Bar */}
      <nav className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-white/10 shadow-inner">
        <button
          onClick={() => onTabChange('wheel')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'wheel'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Radial Wheel</span>
        </button>

        <button
          onClick={() => onTabChange('batch')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'batch'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Batch Queue</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[9px] font-mono bg-white/20 rounded-full">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('settings')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => onTabChange('xcode')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'xcode'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Xcode & DMG Suite</span>
        </button>
      </nav>

      {/* Quick Action Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenFilePicker}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 rounded-lg text-xs font-medium border border-white/10 transition-all shadow-sm"
        >
          <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Select File</span>
        </button>
      </div>
    </header>
  );
};
