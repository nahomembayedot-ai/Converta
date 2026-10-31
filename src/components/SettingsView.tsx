import React from 'react';
import {
  Sliders,
  Shield,
  Laptop,
  Folder,
  Volume2,
  Film,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { AppSettings } from '../types/converta';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-8">
      {/* Settings Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Application Preferences
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure default format behavior, resolution presets, and native macOS parameters.
        </p>
      </div>

      <div className="space-y-6 text-xs">
        {/* Image Quality Settings */}
        <section className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold border-b border-white/5 pb-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span>Image Conversion Engine</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Default JPEG & WEBP Compression Quality</span>
                <span className="font-mono text-indigo-300 font-bold">
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

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <p className="font-medium text-slate-200">Preserve Color Profiles & EXIF</p>
                <p className="text-[11px] text-slate-400">Retain embedded camera metadata in converted images</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Video & Audio Encoding */}
        <section className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold border-b border-white/5 pb-2">
            <Film className="w-4 h-4 text-purple-400" />
            <span>Video & Audio Encoding (AVFoundation / FFmpeg)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Default Video Preset</label>
              <select
                value={settings.videoResolution}
                onChange={(e) =>
                  onUpdateSettings({ videoResolution: e.target.value as any })
                }
                className="w-full bg-slate-800 border border-white/15 text-slate-200 rounded-lg p-2 font-mono"
              >
                <option value="original">Original Aspect & Resolution</option>
                <option value="1080p">1080p Full HD (1920x1080)</option>
                <option value="720p">720p HD (1280x720)</option>
                <option value="480p">480p SD (640x480)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Audio Sample Rate</label>
              <select
                value={settings.audioSampleRate}
                onChange={(e) =>
                  onUpdateSettings({ audioSampleRate: parseInt(e.target.value) as any })
                }
                className="w-full bg-slate-800 border border-white/15 text-slate-200 rounded-lg p-2 font-mono"
              >
                <option value={44100}>44.1 kHz (Standard Audio CD)</option>
                <option value={48000}>48.0 kHz (Studio Video Standard)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Storage & Privacy */}
        <section className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center space-x-2 text-slate-200 font-semibold border-b border-white/5 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & File Access</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Apple Sandbox Compliant</p>
                <p className="text-[11px] text-slate-400">Strictly scoped file read/write permissions via Security Scoped Bookmarks</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <p className="font-medium text-slate-200">Zero Cloud Telemetry</p>
                <p className="text-[11px] text-slate-400">All bytes are converted locally. No network transfers occur.</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Enforced
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
