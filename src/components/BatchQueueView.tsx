import React, { useState } from 'react';
import {
  Layers,
  Upload,
  Play,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Download,
} from 'lucide-react';
import { AppSettings, FormatDef } from '../types/converta';
import { ALL_FORMATS, CATEGORIES } from '../utils/categories';
import { analyzeFile, formatBytes } from '../utils/fileDetector';
import { convertFile } from '../utils/converters';

interface BatchQueueViewProps {
  settings: AppSettings;
  onAddHistory: (item: any) => void;
}

interface BatchItem {
  id: string;
  file: File;
  targetFormat: FormatDef;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  progress: number;
  outputBlob?: Blob;
  outputName?: string;
  outputSize?: number;
  errorMessage?: string;
}

export const BatchQueueView: React.FC<BatchQueueViewProps> = ({
  settings,
  onAddHistory,
}) => {
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [globalTarget, setGlobalTarget] = useState<FormatDef>(ALL_FORMATS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files).map((f) => {
      const analysis = analyzeFile(f);
      const target = analysis.recommendedTargets[0] || globalTarget;
      return {
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        targetFormat: target,
        status: 'pending',
        progress: 0,
      };
    });
    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const applyGlobalTarget = (format: FormatDef) => {
    setGlobalTarget(format);
    setQueue((prev) =>
      prev.map((item) =>
        item.status === 'pending' ? { ...item, targetFormat: format } : item
      )
    );
  };

  const processAll = async () => {
    if (queue.length === 0 || isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      setQueue((prev) =>
        prev.map((q, idx) =>
          idx === i ? { ...q, status: 'converting', progress: 0.1 } : q
        )
      );

      try {
        const result = await convertFile(
          item.file,
          item.targetFormat,
          settings,
          (p) => {
            setQueue((prev) =>
              prev.map((q, idx) => (idx === i ? { ...q, progress: p } : q))
            );
          }
        );

        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'completed',
                  progress: 1.0,
                  outputBlob: result.blob,
                  outputName: result.outputName,
                  outputSize: result.outputSize,
                }
              : q
          )
        );

        onAddHistory({
          id: Math.random().toString(),
          sourceName: item.file.name,
          sourceSize: item.file.size,
          sourceFormat: item.file.name.split('.').pop() || '',
          targetFormat: item.targetFormat.name,
          outputName: result.outputName,
          outputSize: result.outputSize,
          timestamp: Date.now(),
          category: item.targetFormat.category,
        });
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'failed',
                  errorMessage: err.message || 'Conversion failed',
                }
              : q
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const downloadItem = (item: BatchItem) => {
    if (item.outputBlob && item.outputName) {
      const url = URL.createObjectURL(item.outputBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto">
      {/* Batch Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Batch Conversion Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Convert multiple files simultaneously with customized output formats.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 cursor-pointer rounded-lg text-xs font-semibold text-slate-200 border border-white/10 transition-colors">
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          <button
            onClick={processAll}
            disabled={queue.length === 0 || isProcessing}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
              queue.length === 0 || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isProcessing ? 'Converting...' : 'Convert All'}</span>
          </button>
        </div>
      </div>

      {/* Queue Table */}
      {queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">
            Batch Queue is Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Drag files here or click "Add Files" to batch convert images, documents, audio, or PDFs in a single pass.
          </p>
          <label className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer transition-colors">
            Select Files
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between space-x-4 text-xs"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-200 truncate">
                  {item.file.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {formatBytes(item.file.size)}
                </p>
              </div>

              {/* Target Format Selector */}
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <select
                  disabled={item.status !== 'pending'}
                  value={item.targetFormat.id}
                  onChange={(e) => {
                    const fmt = ALL_FORMATS.find((f) => f.id === e.target.value);
                    if (fmt) {
                      setQueue((prev) =>
                        prev.map((q) =>
                          q.id === item.id ? { ...q, targetFormat: fmt } : q
                        )
                      );
                    }
                  }}
                  className="bg-slate-800 border border-white/15 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-1"
                >
                  {ALL_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (.{f.ext})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Indicator */}
              <div className="w-28 text-right">
                {item.status === 'pending' && (
                  <span className="text-slate-400 text-[11px]">Ready</span>
                )}
                {item.status === 'converting' && (
                  <span className="text-indigo-400 font-mono font-bold text-[11px] animate-pulse">
                    {Math.round(item.progress * 100)}%
                  </span>
                )}
                {item.status === 'completed' && (
                  <button
                    onClick={() => downloadItem(item)}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}
                {item.status === 'failed' && (
                  <span className="text-rose-400 text-[11px]">Failed</span>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                disabled={isProcessing}
                className="p-1 rounded text-slate-500 hover:text-slate-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
