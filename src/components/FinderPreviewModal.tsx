import React from 'react';
import {
  Folder,
  Download,
  FileText,
  FileImage,
  Eye,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Clock,
  Laptop,
  X,
  Share2,
} from 'lucide-react';
import { ConversionJob } from '../types/converta';
import { formatBytes } from '../utils/fileDetector';

interface FinderPreviewModalProps {
  job: ConversionJob | null;
  onClose: () => void;
  onDownload: () => void;
}

export const FinderPreviewModal: React.FC<FinderPreviewModalProps> = ({
  job,
  onClose,
  onDownload,
}) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1e2330] rounded-xl border border-white/20 shadow-2xl overflow-hidden flex flex-col h-[460px] animate-in fade-in zoom-in-95 duration-200">
        {/* Finder Titlebar */}
        <div className="h-10 bg-[#161a24] border-b border-white/10 px-4 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80"
            />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300">
            <Folder className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
            <span>Converta Output</span>
          </div>

          <div className="w-12" />
        </div>

        {/* Finder Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-44 bg-[#141822] border-r border-white/10 p-3 space-y-4 text-xs select-none">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Favorites
              </span>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center space-x-2 px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5">
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center space-x-2 px-2 py-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Documents</span>
                </div>
                <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/20">
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Downloads</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
                Locations
              </span>
              <div className="mt-1.5 space-y-0.5">
                <div className="flex items-center space-x-2 px-2 py-1 rounded-md text-slate-400">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Macintosh HD</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Column */}
          <div className="flex-1 bg-[#191e2b] p-3 overflow-y-auto border-r border-white/10 select-none">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1 font-mono">
              <span>Macintosh HD</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span>Users</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span>Downloads</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-200 font-semibold">Converta</span>
            </div>

            {/* Selected File Row */}
            <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <FileImage className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-100 truncate">
                  {job.outputName}
                </p>
                <p className="text-[10px] text-indigo-300 font-mono">
                  {formatBytes(job.outputSize || 0)} • {job.targetFormat.ext.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Look / Inspector Details */}
          <div className="w-56 bg-[#161a24] p-4 flex flex-col justify-between text-xs">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-indigo-400 shadow-md">
                <FileText className="w-10 h-10" />
              </div>

              <div className="text-center">
                <p className="font-bold text-slate-100 truncate text-xs" title={job.outputName}>
                  {job.outputName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {job.targetFormat.name} document
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Size:</span>
                  <span className="text-slate-200 font-mono">
                    {formatBytes(job.outputSize || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Created:</span>
                  <span className="text-slate-200">Just now</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Where:</span>
                  <span className="text-slate-200 font-mono text-[10px] truncate max-w-[100px]">
                    ~/Downloads
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                onClick={onDownload}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Disk</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
