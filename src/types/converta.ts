export type CategoryId =
  | 'images'
  | 'video'
  | 'audio'
  | 'documents'
  | 'pdf'
  | 'archives'
  | 'devtools'
  | 'other';

export interface CategoryDef {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: string;
  glowColor: string;
  formats: FormatDef[];
}

export interface FormatDef {
  id: string;
  name: string;
  ext: string;
  category: CategoryId;
  mime: string;
  description: string;
  isPopular?: boolean;
}

export interface ConversionJob {
  id: string;
  file: File | { name: string; size: number; type: string; content?: string | ArrayBuffer };
  sourceFormat: string;
  targetFormat: FormatDef;
  status: 'queued' | 'converting' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  outputBlob?: Blob;
  outputUrl?: string;
  outputName?: string;
  outputSize?: number;
  errorMessage?: string;
  timestamp: number;
  settings: AppSettings;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  imageQuality: number; // 0.1 to 1.0
  imageResize: boolean;
  maxDimension: number;
  rotateDegrees: number;
  videoResolution: 'original' | '1080p' | '720p' | '480p';
  audioBitrate: 128 | 192 | 256 | 320;
  audioSampleRate: 44100 | 48000;
  pdfDpi: number;
  overwriteExisting: boolean;
  defaultOutputFolder: string;
}

export interface HistoryItem {
  id: string;
  sourceName: string;
  sourceSize: number;
  sourceFormat: string;
  targetFormat: string;
  outputName: string;
  outputSize: number;
  downloadUrl?: string;
  timestamp: number;
  category: CategoryId;
}
