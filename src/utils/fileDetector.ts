import { CategoryId, FormatDef } from '../types/converta';
import { ALL_FORMATS, CATEGORIES, getCategoryById } from './categories';

export interface FileAnalysis {
  fileName: string;
  extension: string;
  fileSize: number;
  formattedSize: string;
  detectedFormat?: FormatDef;
  detectedCategory: CategoryId;
  recommendedTargets: FormatDef[];
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function analyzeFile(file: File | { name: string; size: number; type?: string }): FileAnalysis {
  const fileName = file.name;
  const parts = fileName.split('.');
  const extension = (parts.length > 1 ? parts.pop() || '' : '').toLowerCase();
  const fileSize = file.size;

  let detectedFormat = ALL_FORMATS.find(
    (f) => f.ext.toLowerCase() === extension || f.id.toLowerCase() === extension
  );

  let detectedCategory: CategoryId = 'other';

  if (detectedFormat) {
    detectedCategory = detectedFormat.category;
  } else {
    // Fallback checks
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'heic', 'svg', 'ico', 'avif'].includes(extension)) {
      detectedCategory = 'images';
    } else if (['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'flv'].includes(extension)) {
      detectedCategory = 'video';
    } else if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'aiff', 'wma'].includes(extension)) {
      detectedCategory = 'audio';
    } else if (['pdf'].includes(extension)) {
      detectedCategory = 'pdf';
    } else if (['docx', 'doc', 'txt', 'rtf', 'odt', 'xlsx', 'csv', 'pptx'].includes(extension)) {
      detectedCategory = 'documents';
    } else if (['zip', 'tar', 'gz', 'gzip', '7z', 'rar', 'bz2'].includes(extension)) {
      detectedCategory = 'archives';
    } else if (['json', 'xml', 'yaml', 'yml', 'html', 'md', 'markdown', 'js', 'ts', 'css'].includes(extension)) {
      detectedCategory = 'devtools';
    }
  }

  const recommendedTargets = getRecommendedTargets(extension, detectedCategory);

  return {
    fileName,
    extension,
    fileSize,
    formattedSize: formatBytes(fileSize),
    detectedFormat,
    detectedCategory,
    recommendedTargets,
  };
}

export function getRecommendedTargets(extension: string, category: CategoryId): FormatDef[] {
  const ext = extension.toLowerCase();

  switch (ext) {
    case 'heic':
    case 'heif':
      return [
        findFormat('jpg'),
        findFormat('png'),
        findFormat('webp'),
        findFormat('pdf'),
      ].filter(Boolean) as FormatDef[];

    case 'png':
      return [
        findFormat('webp'),
        findFormat('jpg'),
        findFormat('pdf'),
        findFormat('ico'),
      ].filter(Boolean) as FormatDef[];

    case 'jpg':
    case 'jpeg':
      return [
        findFormat('webp'),
        findFormat('png'),
        findFormat('pdf'),
        findFormat('bmp'),
      ].filter(Boolean) as FormatDef[];

    case 'webp':
      return [
        findFormat('png'),
        findFormat('jpg'),
        findFormat('pdf'),
      ].filter(Boolean) as FormatDef[];

    case 'svg':
      return [
        findFormat('png'),
        findFormat('jpg'),
        findFormat('pdf'),
        findFormat('ico'),
      ].filter(Boolean) as FormatDef[];

    case 'mov':
      return [
        findFormat('mp4'),
        findFormat('webm'),
        findFormat('gif_video'),
        findFormat('mp3'),
      ].filter(Boolean) as FormatDef[];

    case 'mp4':
      return [
        findFormat('mov'),
        findFormat('webm'),
        findFormat('gif_video'),
        findFormat('mp3'),
      ].filter(Boolean) as FormatDef[];

    case 'wav':
      return [
        findFormat('mp3'),
        findFormat('flac'),
        findFormat('aac'),
        findFormat('m4a'),
      ].filter(Boolean) as FormatDef[];

    case 'flac':
      return [
        findFormat('mp3'),
        findFormat('wav'),
        findFormat('m4a'),
      ].filter(Boolean) as FormatDef[];

    case 'pdf':
      return [
        findFormat('pdf_to_images'),
        findFormat('compress_pdf'),
        findFormat('txt'),
      ].filter(Boolean) as FormatDef[];

    case 'csv':
      return [
        findFormat('json'),
        findFormat('xlsx'),
        findFormat('html'),
        findFormat('markdown'),
      ].filter(Boolean) as FormatDef[];

    case 'json':
      return [
        findFormat('csv'),
        findFormat('yaml'),
        findFormat('xml'),
      ].filter(Boolean) as FormatDef[];

    case 'yaml':
    case 'yml':
      return [
        findFormat('json'),
        findFormat('xml'),
        findFormat('csv'),
      ].filter(Boolean) as FormatDef[];

    case 'md':
    case 'markdown':
      return [
        findFormat('html'),
        findFormat('pdf'),
        findFormat('txt'),
      ].filter(Boolean) as FormatDef[];

    default: {
      const cat = getCategoryById(category);
      return cat.formats.slice(0, 4);
    }
  }
}

function findFormat(idOrExt: string): FormatDef | undefined {
  return ALL_FORMATS.find(
    (f) => f.id === idOrExt || f.ext === idOrExt
  );
}
