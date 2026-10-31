import React, { useState, useRef, useEffect } from 'react';
import { MacTitleBar, ActiveTab } from './components/MacTitleBar';
import { RadialWheel } from './components/RadialWheel';
import { InspectorPanel } from './components/InspectorPanel';
import { ConversionModal } from './components/ConversionModal';
import { FinderPreviewModal } from './components/FinderPreviewModal';
import { BatchQueueView } from './components/BatchQueueView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { XcodeProjectViewer } from './components/XcodeProjectViewer';
import { AppSettings, CategoryDef, ConversionJob, FormatDef, HistoryItem } from './types/converta';
import { CATEGORIES, getCategoryById } from './utils/categories';
import { analyzeFile, FileAnalysis } from './utils/fileDetector';
import { convertFile } from './utils/converters';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  imageQuality: 0.85,
  imageResize: false,
  maxDimension: 2048,
  rotateDegrees: 0,
  videoResolution: 'original',
  audioBitrate: 256,
  audioSampleRate: 44100,
  pdfDpi: 300,
  overwriteExisting: false,
  defaultOutputFolder: '~/Downloads/Converta',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wheel');
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(CATEGORIES[0]);
  const [selectedFormat, setSelectedFormat] = useState<FormatDef | null>(CATEGORIES[0].formats[0]);
  const [currentFile, setCurrentFile] = useState<File | { name: string; size: number; type: string; content?: string | ArrayBuffer } | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeJob, setActiveJob] = useState<ConversionJob | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showFinderModal, setShowFinderModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('converta_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save history
  const addHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('converta_history', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleFileSelection = (file: File | { name: string; size: number; type: string; content?: string | ArrayBuffer }) => {
    setCurrentFile(file);
    const result = analyzeFile(file);
    setAnalysis(result);

    const cat = getCategoryById(result.detectedCategory);
    setSelectedCategory(cat);

    if (result.recommendedTargets.length > 0) {
      setSelectedFormat(result.recommendedTargets[0]);
    } else if (cat.formats.length > 0) {
      setSelectedFormat(cat.formats[0]);
    }
  };

  const handleNativeFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDrop = (files: FileList | File[]) => {
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const loadSampleFile = (type: string) => {
    if (type === 'image') {
      // Create a sample canvas PNG
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d')!;
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 800, 600);
      grad.addColorStop(0, '#4f46e5');
      grad.addColorStop(0.5, '#7c3aed');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 600);

      // Sphere
      ctx.beginPath();
      ctx.arc(400, 300, 160, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Converta Sample Photo', 400, 310);

      canvas.toBlob((b) => {
        if (b) {
          const sample = new File([b], 'sample-photo.png', { type: 'image/png' });
          handleFileSelection(sample);
        }
      }, 'image/png');
    } else if (type === 'json') {
      const sampleData = JSON.stringify(
        [
          { id: 1, name: 'MacBook Pro M3 Max', category: 'Laptops', price: 3499, inStock: true },
          { id: 2, name: 'Studio Display 5K', category: 'Monitors', price: 1599, inStock: true },
          { id: 3, name: 'Magic Trackpad Space Black', category: 'Accessories', price: 149, inStock: false },
          { id: 4, name: 'AirPods Max USB-C', category: 'Audio', price: 549, inStock: true },
        ],
        null,
        2
      );
      const sample = new File([sampleData], 'analytics-data.json', { type: 'application/json' });
      handleFileSelection(sample);
    } else if (type === 'csv') {
      const csvData = `Quarter,Product,Revenue,Growth,Region\nQ1,Converta Pro,125000,18%,North America\nQ2,Converta Pro,158000,26%,Europe\nQ3,Converta Enterprise,240000,52%,Asia Pacific\nQ4,Converta Enterprise,310000,29%,Global`;
      const sample = new File([csvData], 'quarterly-revenue.csv', { type: 'text/csv' });
      handleFileSelection(sample);
    } else if (type === 'doc') {
      const docData = `# Converta Product Architecture\n\nConverta is an ultra-fast, native macOS desktop file converter.\n\n## Core Capabilities\n- 8 radial categories with custom annular sector trigonometry.\n- Offline real processing with Zero Cloud Telemetry.\n- Full support for Images, Video, Audio, Documents, PDF, Archives, Developer Tools.`;
      const sample = new File([docData], 'architecture-notes.txt', { type: 'text/plain' });
      handleFileSelection(sample);
    }
  };

  // Run Real Conversion
  const handleStartConversion = async () => {
    if (!currentFile || !selectedFormat) return;

    const job: ConversionJob = {
      id: Math.random().toString(36).substring(2, 9),
      file: currentFile,
      sourceFormat: currentFile.name.split('.').pop() || '',
      targetFormat: selectedFormat,
      status: 'converting',
      progress: 0.1,
      timestamp: Date.now(),
      settings,
    };

    setActiveJob(job);

    try {
      const result = await convertFile(currentFile, selectedFormat, settings, (p) => {
        setActiveJob((prev) => (prev ? { ...prev, progress: p } : null));
      });

      const finishedJob: ConversionJob = {
        ...job,
        status: 'completed',
        progress: 1.0,
        outputBlob: result.blob,
        outputName: result.outputName,
        outputSize: result.outputSize,
      };

      setActiveJob(finishedJob);

      addHistoryItem({
        id: job.id,
        sourceName: currentFile.name,
        sourceSize: currentFile.size,
        sourceFormat: job.sourceFormat,
        targetFormat: selectedFormat.name,
        outputName: result.outputName,
        outputSize: result.outputSize,
        timestamp: Date.now(),
        category: selectedFormat.category,
      });
    } catch (err: any) {
      setActiveJob((prev) =>
        prev
          ? {
              ...prev,
              status: 'failed',
              errorMessage: err.message || 'An error occurred during conversion.',
            }
          : null
      );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* Hidden File Input for Native File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeFileInput}
        className="hidden"
      />

      {/* Top macOS App Window Title Bar */}
      <MacTitleBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        historyCount={history.length}
      />

      {/* Main Workspace based on active tab */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'wheel' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Center Area: Radial Wheel UI */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
              <RadialWheel
                selectedCategory={selectedCategory}
                selectedFormat={selectedFormat}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  if (cat && cat.formats.length > 0) {
                    setSelectedFormat(cat.formats[0]);
                  }
                }}
                onSelectFormat={(fmt) => setSelectedFormat(fmt)}
                onFileDrop={handleDrop}
                onBrowseClick={() => fileInputRef.current?.click()}
                hasFile={!!currentFile}
                fileName={currentFile?.name}
                fileExt={currentFile?.name.split('.').pop()?.toUpperCase()}
              />
            </div>

            {/* Right Inspector Sidebar */}
            <InspectorPanel
              analysis={analysis}
              selectedFormat={selectedFormat}
              settings={settings}
              onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
              onSelectFormat={(fmt) => {
                setSelectedFormat(fmt);
                setSelectedCategory(getCategoryById(fmt.category));
              }}
              onStartConversion={handleStartConversion}
              onLoadSample={loadSampleFile}
              isConverting={activeJob?.status === 'converting'}
            />
          </div>
        )}

        {activeTab === 'batch' && (
          <BatchQueueView
            settings={settings}
            onAddHistory={addHistoryItem}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onClearHistory={() => {
              setHistory([]);
              localStorage.removeItem('converta_history');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
          />
        )}

        {activeTab === 'xcode' && <XcodeProjectViewer />}
      </main>

      {/* Modal: In-flight or Finished Conversion Progress */}
      {activeJob && (
        <ConversionModal
          job={activeJob}
          onClose={() => setActiveJob(null)}
          onRevealInFinder={() => setShowFinderModal(true)}
          onConvertAnother={() => {
            setActiveJob(null);
            setCurrentFile(null);
            setAnalysis(null);
          }}
          onCancel={() => {
            setActiveJob(null);
          }}
        />
      )}

      {/* Modal: Realistic macOS Finder Preview */}
      {showFinderModal && activeJob && (
        <FinderPreviewModal
          job={activeJob}
          onClose={() => setShowFinderModal(false)}
          onDownload={() => {
            if (activeJob.outputBlob && activeJob.outputName) {
              const url = URL.createObjectURL(activeJob.outputBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = activeJob.outputName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
          }}
        />
      )}
    </div>
  );
}
