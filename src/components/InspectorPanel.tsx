import React from 'react';
import {
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  RotateCw,
  Maximize2,
  Volume2,
  Film,
  HardDrive,
  FileCode,
  FileImage,
} from 'lucide-react';
import { AppSettings, FormatDef } from '../types/converta';
import { FileAnalysis } from '../utils/fileDetector';

interface InspectorPanelProps {
  analysis: FileAnalysis | null;
  selectedFormat: FormatDef | null;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSelectFormat: (format: FormatDef) => void;
  onStartConversion: () => void;
  onLoadSample: (sampleType: string) => void;
  isConverting: boolean;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  analysis,
  selectedFormat,
  settings,
  onUpdateSettings,
  onSelectFormat,
  onStartConversion,
  onLoadSample,
  isConverting,
}) => {
  return (
    <aside className="w-80 border-l border-white/10 bg-[#0e1420]/80 backdrop-blur-xl p-5 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-6">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Conversion Setup
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Local Engine
          </span>
        </div>

        {/* Selected File Card or Empty State */}
        {analysis ? (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-3 shadow-md">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate" title={analysis.fileName}>
                  {analysis.fileName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase bg-white/10 text-slate-300">
                    {analysis.extension}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {analysis.formattedSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Recommended Formats */}
            {analysis.recommendedTargets.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Recommended Targets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.recommendedTargets.map((rec) => {
                    const isSelected = selectedFormat?.id === rec.id;
                    return (
                      <button
                        key={rec.id}
                        onClick={() => onSelectFormat(rec)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {rec.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-white/10 bg-slate-900/40 text-center space-y-2">
            <div className="w-8 h-8 rounded-full bg-white/5 mx-auto flex items-center justify-center text-slate-400">
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">No File Selected</p>
            <p className="text-[11px] text-slate-400">
              Drop a file on the circular wheel or pick a preset below to try instant conversion:
            </p>

            {/* Quick Sample File Loaders */}
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              <button
                onClick={() => onLoadSample('image')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-medium text-slate-300 flex items-center gap-1.5 justify-center transition-all"
              >
                <FileImage className="w-3 h-3 text-indigo-400" />
                <span>Photo (PNG)</span>
              </button>
              <button
                onClick={() => onLoadSample('json')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-medium text-slate-300 flex items-center gap-1.5 justify-center transition-all"
              >
                <FileCode className="w-3 h-3 text-cyan-400" />
                <span>JSON Data</span>
              </button>
              <button
                onClick={() => onLoadSample('doc')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-medium text-slate-300 flex items-center gap-1.5 justify-center transition-all"
              >
                <FileText className="w-3 h-3 text-blue-400" />
                <span>Doc (TXT)</span>
              </button>
              <button
                onClick={() => onLoadSample('csv')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-medium text-slate-300 flex items-center gap-1.5 justify-center transition-all"
              >
                <Sliders className="w-3 h-3 text-emerald-400" />
                <span>Sales CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Target Format Status */}
        {selectedFormat && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-indigo-300">Target Output</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                .{selectedFormat.ext}
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                {selectedFormat.name}
              </span>
              <span className="text-xs text-slate-400">({selectedFormat.category})</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {selectedFormat.description}
            </p>
          </div>
        )}

        {/* Format Specific Conversion Settings */}
        {selectedFormat && (
          <div className="space-y-4 pt-1">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Format Parameters
            </span>

            {/* Image controls */}
            {selectedFormat.category === 'images' && (
              <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Quality</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {Math.round(settings.imageQuality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.imageQuality}
                    onChange={(e) =>
                      onUpdateSettings({ imageQuality: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Rotate Angle</span>
                  <select
                    value={settings.rotateDegrees}
                    onChange={(e) =>
                      onUpdateSettings({ rotateDegrees: parseInt(e.target.value) })
                    }
                    className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded px-2 py-1 font-mono"
                  >
                    <option value={0}>0° (None)</option>
                    <option value={90}>90° Clockwise</option>
                    <option value={180}>180° Flip</option>
                    <option value={270}>270° CCW</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Constrain Size</span>
                  <select
                    value={settings.maxDimension}
                    onChange={(e) =>
                      onUpdateSettings({
                        maxDimension: parseInt(e.target.value),
                        imageResize: parseInt(e.target.value) > 0,
                      })
                    }
                    className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded px-2 py-1 font-mono"
                  >
                    <option value={0}>Original</option>
                    <option value={3840}>4K (3840px)</option>
                    <option value={2048}>2K (2048px)</option>
                    <option value={1080}>1080p (1080px)</option>
                    <option value={512}>Icon (512px)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Video controls */}
            {selectedFormat.category === 'video' && (
              <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Preset Resolution</span>
                  <select
                    value={settings.videoResolution}
                    onChange={(e) =>
                      onUpdateSettings({
                        videoResolution: e.target.value as any,
                      })
                    }
                    className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded px-2 py-1 font-mono"
                  >
                    <option value="original">Original</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Audio controls */}
            {selectedFormat.category === 'audio' && (
              <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Bitrate</span>
                  <select
                    value={settings.audioBitrate}
                    onChange={(e) =>
                      onUpdateSettings({
                        audioBitrate: parseInt(e.target.value) as any,
                      })
                    }
                    className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded px-2 py-1 font-mono"
                  >
                    <option value={128}>128 kbps</option>
                    <option value={192}>192 kbps</option>
                    <option value={256}>256 kbps (HQ)</option>
                    <option value={320}>320 kbps (Max)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Convert Action Button */}
      <div className="pt-4 border-t border-white/10 mt-6">
        <button
          onClick={onStartConversion}
          disabled={!analysis || !selectedFormat || isConverting}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-200 shadow-xl ${
            !analysis || !selectedFormat
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              : isConverting
              ? 'bg-indigo-600/70 text-white cursor-wait animate-pulse'
              : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 active:scale-[0.98] text-white shadow-indigo-500/30 ring-2 ring-indigo-400/40'
          }`}
        >
          {isConverting ? (
            <span>Processing File...</span>
          ) : selectedFormat ? (
            <>
              <span>Convert to {selectedFormat.name}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <span>Select Target Format</span>
          )}
        </button>

        <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
          Strictly local processing • Zero cloud upload
        </p>
      </div>
    </aside>
  );
};
