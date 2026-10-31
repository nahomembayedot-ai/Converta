import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  FolderOpen,
  RefreshCw,
  Share2,
  X,
  AlertCircle,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { ConversionJob } from '../types/converta';
import { formatBytes } from '../utils/fileDetector';

interface ConversionModalProps {
  job: ConversionJob | null;
  onClose: () => void;
  onRevealInFinder: () => void;
  onConvertAnother: () => void;
  onCancel: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({
  job,
  onClose,
  onRevealInFinder,
  onConvertAnother,
  onCancel,
}) => {
  useEffect(() => {
    if (job?.status === 'completed') {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#06b6d4', '#10b981'],
      });
    }
  }, [job?.status]);

  if (!job) return null;

  const handleDownload = () => {
    if (job.outputBlob && job.outputName) {
      const url = URL.createObjectURL(job.outputBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = job.outputName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleShare = async () => {
    if (navigator.share && job.outputBlob) {
      try {
        const file = new File([job.outputBlob], job.outputName || 'converted', {
          type: job.outputBlob.type,
        });
        await navigator.share({
          files: [file],
          title: job.outputName,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(`Converted file: ${job.outputName}`);
      alert('File info copied to clipboard!');
    }
  };

  const isConverting = job.status === 'converting';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  const sourceSize = job.file.size;
  const outputSize = job.outputSize || 0;
  const sizeDiff = outputSize - sourceSize;
  const percentChange = sourceSize > 0 ? ((sizeDiff / sourceSize) * 100).toFixed(0) : '0';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#131a28] border border-white/15 rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Subtle Ambient Gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. In Progress State */}
        {isConverting && (
          <div className="space-y-6 py-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Converting File...</h3>
                <p className="text-xs text-slate-400">
                  Target: <span className="text-indigo-400 font-mono font-semibold">{job.targetFormat.name}</span>
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Processing bytes</span>
                <span className="text-indigo-300 font-bold">
                  {Math.round(job.progress * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.max(job.progress * 100, 5)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Input:</span>
                <span className="text-slate-200 font-mono truncate max-w-[200px]">
                  {job.file.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Engine:</span>
                <span className="text-emerald-400 font-medium">Apple Core / Web Worker</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 2. Completed State */}
        {isCompleted && (
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Conversion Complete!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your file is ready and saved locally.
              </p>
            </div>

            {/* Output File Details Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-100 truncate max-w-[240px]">
                  {job.outputName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300">
                  {job.targetFormat.ext}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5 font-mono">
                <span>{formatBytes(sourceSize)} → {formatBytes(outputSize)}</span>
                <span className={Number(percentChange) <= 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {Number(percentChange) <= 0 ? `${percentChange}%` : `+${percentChange}%`}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons (Step 10 of brief) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={handleDownload}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save / Download</span>
              </button>

              <button
                onClick={onRevealInFinder}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-white/10 transition-all"
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <span>Reveal in Finder</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <button
                onClick={handleShare}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share File</span>
              </button>

              <button
                onClick={onConvertAnother}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Convert Another</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* 3. Failed State */}
        {isFailed && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Conversion Failed</h3>
              <p className="text-xs text-rose-300 mt-1">
                {job.errorMessage || 'An error occurred during file processing.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-slate-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
