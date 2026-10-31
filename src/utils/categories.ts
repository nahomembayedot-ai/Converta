import { CategoryDef, CategoryId, FormatDef } from '../types/converta';

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'images',
    name: 'Images',
    icon: 'Image',
    description: 'Transform raster and vector graphics with precision quality and resizing',
    color: '#6366f1', // Indigo
    glowColor: 'rgba(99, 102, 241, 0.4)',
    formats: [
      { id: 'png', name: 'PNG', ext: 'png', category: 'images', mime: 'image/png', description: 'Lossless raster with alpha transparency', isPopular: true },
      { id: 'jpg', name: 'JPG', ext: 'jpg', category: 'images', mime: 'image/jpeg', description: 'High-compression JPEG photograph', isPopular: true },
      { id: 'webp', name: 'WEBP', ext: 'webp', category: 'images', mime: 'image/webp', description: 'Modern next-gen web image format', isPopular: true },
      { id: 'heic', name: 'HEIC', ext: 'heic', category: 'images', mime: 'image/heic', description: 'High Efficiency Image Container' },
      { id: 'tiff', name: 'TIFF', ext: 'tiff', category: 'images', mime: 'image/tiff', description: 'Uncompressed print & photography asset' },
      { id: 'bmp', name: 'BMP', ext: 'bmp', category: 'images', mime: 'image/bmp', description: 'Standard Windows Bitmap format' },
      { id: 'gif', name: 'GIF', ext: 'gif', category: 'images', mime: 'image/gif', description: 'Animated or paletted graphic' },
      { id: 'ico', name: 'ICO', ext: 'ico', category: 'images', mime: 'image/x-icon', description: 'macOS & Windows favicon icon' },
      { id: 'svg', name: 'SVG', ext: 'svg', category: 'images', mime: 'image/svg+xml', description: 'Scalable Vector Graphics' },
    ],
  },
  {
    id: 'video',
    name: 'Video',
    icon: 'Video',
    description: 'AVFoundation & FFmpeg conversion with custom resolutions and bitrates',
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    formats: [
      { id: 'mp4', name: 'MP4', ext: 'mp4', category: 'video', mime: 'video/mp4', description: 'Universal H.264 / HEVC video container', isPopular: true },
      { id: 'mov', name: 'MOV', ext: 'mov', category: 'video', mime: 'video/quicktime', description: 'Apple QuickTime native format', isPopular: true },
      { id: 'mkv', name: 'MKV', ext: 'mkv', category: 'video', mime: 'video/x-matroska', description: 'Matroska multimedia container' },
      { id: 'avi', name: 'AVI', ext: 'avi', category: 'video', mime: 'video/x-msvideo', description: 'Audio Video Interleave container' },
      { id: 'webm', name: 'WEBM', ext: 'webm', category: 'video', mime: 'video/webm', description: 'Google open web video format' },
      { id: 'gif_video', name: 'GIF Video', ext: 'gif', category: 'video', mime: 'image/gif', description: 'Looping animated GIF clip', isPopular: true },
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: 'Music',
    description: 'Lossless & compressed audio encoding, sample rate and bitrate adaptation',
    color: '#ec4899', // Pink
    glowColor: 'rgba(236, 72, 153, 0.4)',
    formats: [
      { id: 'mp3', name: 'MP3', ext: 'mp3', category: 'audio', mime: 'audio/mpeg', description: 'MPEG-1 Audio Layer III', isPopular: true },
      { id: 'wav', name: 'WAV', ext: 'wav', category: 'audio', mime: 'audio/wav', description: 'Uncompressed PCM waveform', isPopular: true },
      { id: 'flac', name: 'FLAC', ext: 'flac', category: 'audio', mime: 'audio/flac', description: 'Free Lossless Audio Codec' },
      { id: 'aac', name: 'AAC', ext: 'aac', category: 'audio', mime: 'audio/aac', description: 'Advanced Audio Coding' },
      { id: 'm4a', name: 'M4A', ext: 'm4a', category: 'audio', mime: 'audio/mp4', description: 'Apple MPEG-4 audio container' },
      { id: 'ogg', name: 'OGG', ext: 'ogg', category: 'audio', mime: 'audio/ogg', description: 'Ogg Vorbis compressed audio' },
      { id: 'aiff', name: 'AIFF', ext: 'aiff', category: 'audio', mime: 'audio/aiff', description: 'Apple Audio Interchange File' },
    ],
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'FileText',
    description: 'Convert between text formats, rich documents, worksheets, and presentations',
    color: '#3b82f6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    formats: [
      { id: 'docx', name: 'DOCX', ext: 'docx', category: 'documents', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', description: 'Microsoft Word Document', isPopular: true },
      { id: 'doc', name: 'DOC', ext: 'doc', category: 'documents', mime: 'application/msword', description: 'Legacy Word document' },
      { id: 'txt', name: 'TXT', ext: 'txt', category: 'documents', mime: 'text/plain', description: 'UTF-8 plain text file', isPopular: true },
      { id: 'rtf', name: 'RTF', ext: 'rtf', category: 'documents', mime: 'application/rtf', description: 'Rich Text Format' },
      { id: 'odt', name: 'ODT', ext: 'odt', category: 'documents', mime: 'application/vnd.oasis.opendocument.text', description: 'OpenDocument Text' },
      { id: 'xlsx', name: 'XLSX', ext: 'xlsx', category: 'documents', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', description: 'Microsoft Excel spreadsheet' },
      { id: 'csv', name: 'CSV', ext: 'csv', category: 'documents', mime: 'text/csv', description: 'Comma-Separated Values table', isPopular: true },
      { id: 'pptx', name: 'PPTX', ext: 'pptx', category: 'documents', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', description: 'PowerPoint presentation' },
    ],
  },
  {
    id: 'pdf',
    name: 'PDF',
    icon: 'BookOpen',
    description: 'PDFKit native tools: convert to images, assemble PDFs, extract and compress',
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    formats: [
      { id: 'pdf', name: 'PDF Document', ext: 'pdf', category: 'pdf', mime: 'application/pdf', description: 'Standard Portable Document Format', isPopular: true },
      { id: 'pdf_to_images', name: 'PDF to Images', ext: 'png', category: 'pdf', mime: 'image/png', description: 'Export all pages as crisp PNGs', isPopular: true },
      { id: 'images_to_pdf', name: 'Images to PDF', ext: 'pdf', category: 'pdf', mime: 'application/pdf', description: 'Combine images into a clean PDF', isPopular: true },
      { id: 'compress_pdf', name: 'Compress PDF', ext: 'pdf', category: 'pdf', mime: 'application/pdf', description: 'Reduce PDF file size for sharing' },
      { id: 'merge_pdf', name: 'Merge PDFs', ext: 'pdf', category: 'pdf', mime: 'application/pdf', description: 'Combine multiple PDF files into one' },
    ],
  },
  {
    id: 'archives',
    name: 'Archives',
    icon: 'Archive',
    description: 'Fast compression and extraction with native macOS ditto and tar engines',
    color: '#f97316', // Orange
    glowColor: 'rgba(249, 115, 22, 0.4)',
    formats: [
      { id: 'zip', name: 'ZIP', ext: 'zip', category: 'archives', mime: 'application/zip', description: 'Universal compressed zip archive', isPopular: true },
      { id: 'tar', name: 'TAR', ext: 'tar', category: 'archives', mime: 'application/x-tar', description: 'Unix tape archive' },
      { id: 'gzip', name: 'GZIP', ext: 'tar.gz', category: 'archives', mime: 'application/gzip', description: 'GNU zipped tar archive', isPopular: true },
      { id: '7z', name: '7Z', ext: '7z', category: 'archives', mime: 'application/x-7z-compressed', description: 'High-compression 7-Zip archive' },
    ],
  },
  {
    id: 'devtools',
    name: 'Developer Tools',
    icon: 'Code2',
    description: 'Data transformation between JSON, YAML, XML, CSV, HTML and Markdown',
    color: '#06b6d4', // Cyan
    glowColor: 'rgba(6, 182, 212, 0.4)',
    formats: [
      { id: 'json', name: 'JSON', ext: 'json', category: 'devtools', mime: 'application/json', description: 'JavaScript Object Notation', isPopular: true },
      { id: 'xml', name: 'XML', ext: 'xml', category: 'devtools', mime: 'application/xml', description: 'Extensible Markup Language' },
      { id: 'yaml', name: 'YAML', ext: 'yaml', category: 'devtools', mime: 'application/x-yaml', description: 'Human-friendly data serialization', isPopular: true },
      { id: 'html', name: 'HTML', ext: 'html', category: 'devtools', mime: 'text/html', description: 'HyperText Markup Language' },
      { id: 'markdown', name: 'Markdown', ext: 'md', category: 'devtools', mime: 'text/markdown', description: 'Formatted lightweight document', isPopular: true },
    ],
  },
  {
    id: 'other',
    name: 'Other Formats',
    icon: 'Sparkles',
    description: 'Vector fonts, raw byte streams, metadata extractors and utilities',
    color: '#14b8a6', // Teal
    glowColor: 'rgba(20, 184, 166, 0.4)',
    formats: [
      { id: 'base64', name: 'Base64', ext: 'txt', category: 'other', mime: 'text/plain', description: 'Binary to Base64 encoded string' },
      { id: 'hex', name: 'Hex Dump', ext: 'hex', category: 'other', mime: 'text/plain', description: 'Hexadecimal raw byte representation' },
      { id: 'data_uri', name: 'Data URI', ext: 'txt', category: 'other', mime: 'text/plain', description: 'Inline embeddable data URI' },
      { id: 'svg_clean', name: 'Clean SVG', ext: 'svg', category: 'other', mime: 'image/svg+xml', description: 'Minified & sanitized SVG asset' },
    ],
  },
];

export const ALL_FORMATS: FormatDef[] = CATEGORIES.flatMap((c) => c.formats);

export function getCategoryById(id: CategoryId): CategoryDef {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function getFormatById(id: string): FormatDef | undefined {
  return ALL_FORMATS.find((f) => f.id === id || f.ext.toLowerCase() === id.toLowerCase());
}
