import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FileText,
  BookOpen,
  Archive,
  Code2,
  Sparkles,
  Upload,
  Check,
  ChevronRight,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import { CategoryDef, CategoryId, FormatDef } from '../types/converta';
import { CATEGORIES } from '../utils/categories';

interface RadialWheelProps {
  selectedCategory: CategoryDef | null;
  selectedFormat: FormatDef | null;
  onSelectCategory: (cat: CategoryDef | null) => void;
  onSelectFormat: (format: FormatDef) => void;
  onFileDrop: (files: FileList | File[]) => void;
  onBrowseClick: () => void;
  hasFile: boolean;
  fileName?: string;
  fileExt?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Image: <ImageIcon className="w-5 h-5" />,
  Video: <VideoIcon className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  BookOpen: <BookOpen className="w-5 h-5" />,
  Archive: <Archive className="w-5 h-5" />,
  Code2: <Code2 className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
};

export const RadialWheel: React.FC<RadialWheelProps> = ({
  selectedCategory,
  selectedFormat,
  onSelectCategory,
  onSelectFormat,
  onFileDrop,
  onBrowseClick,
  hasFile,
  fileName,
  fileExt,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryDef | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Wheel Geometry constants
  const size = 520;
  const center = size / 2;
  const outerRadius = 220;
  const innerRadius = 120;
  const orbitRadius = 250;
  const numCategories = CATEGORIES.length;
  const anglePerSegment = 360 / numCategories;
  const paddingAngle = 2.4; // gap between segments in degrees

  // Helper to generate SVG annular sector path
  function describeArc(
    x: number,
    y: number,
    rInner: number,
    rOuter: number,
    startAngle: number,
    endAngle: number
  ) {
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const startInner = {
      x: x + rInner * Math.cos(toRad(startAngle)),
      y: y + rInner * Math.sin(toRad(startAngle)),
    };
    const endInner = {
      x: x + rInner * Math.cos(toRad(endAngle)),
      y: y + rInner * Math.sin(toRad(endAngle)),
    };
    const startOuter = {
      x: x + rOuter * Math.cos(toRad(startAngle)),
      y: y + rOuter * Math.sin(toRad(startAngle)),
    };
    const endOuter = {
      x: x + rOuter * Math.cos(toRad(endAngle)),
      y: y + rOuter * Math.sin(toRad(endAngle)),
    };

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      startOuter.x,
      startOuter.y,
      'A',
      rOuter,
      rOuter,
      0,
      largeArcFlag,
      1,
      endOuter.x,
      endOuter.y,
      'L',
      endInner.x,
      endInner.y,
      'A',
      rInner,
      rInner,
      0,
      largeArcFlag,
      0,
      startInner.x,
      startInner.y,
      'Z',
    ].join(' ');
  }

  const activeCategory = selectedCategory || hoveredCategory;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      {/* Dynamic Background Ambient Aura */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ease-out"
        style={{
          backgroundColor: activeCategory?.color || '#6366f1',
          transform: `scale(${selectedCategory ? 1.4 : 1.1})`,
        }}
      />

      {/* Outer Format Ring - Blooms out when category is active */}
      <div className="relative w-[520px] h-[520px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full overflow-visible drop-shadow-2xl"
        >
          <defs>
            {/* Filter for glow */}
            <filter id="segment-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradients for each segment */}
            {CATEGORIES.map((cat, idx) => (
              <linearGradient
                key={cat.id}
                id={`grad-${cat.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={cat.color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0.45" />
              </linearGradient>
            ))}
          </defs>

          {/* Background Outer Ring Track */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 8}
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          {/* Radial Wheel Segments */}
          <g>
            {CATEGORIES.map((cat, index) => {
              const startAngle = index * anglePerSegment + paddingAngle / 2;
              const endAngle = (index + 1) * anglePerSegment - paddingAngle / 2;
              const isSelected = selectedCategory?.id === cat.id;
              const isHovered = hoveredCategory?.id === cat.id;

              const midAngle = (startAngle + endAngle) / 2;
              const rad = ((midAngle - 90) * Math.PI) / 180;
              const iconRadius = (innerRadius + outerRadius) / 2;
              const iconX = center + iconRadius * Math.cos(rad);
              const iconY = center + iconRadius * Math.sin(rad);

              const path = describeArc(
                center,
                center,
                innerRadius,
                outerRadius,
                startAngle,
                endAngle
              );

              return (
                <g
                  key={cat.id}
                  className="cursor-pointer transition-transform duration-300"
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => {
                    if (selectedCategory?.id === cat.id) {
                      onSelectCategory(null);
                    } else {
                      onSelectCategory(cat);
                    }
                  }}
                >
                  {/* Segment Slice Path */}
                  <path
                    d={path}
                    fill={
                      isSelected
                        ? `url(#grad-${cat.id})`
                        : isHovered
                        ? cat.color + '40'
                        : '#1e293b80'
                    }
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : isHovered
                        ? cat.color
                        : 'rgba(255, 255, 255, 0.08)'
                    }
                    strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1'}
                    filter={isSelected ? 'url(#segment-glow)' : undefined}
                    className="transition-all duration-300 ease-out"
                    style={{
                      transformOrigin: `${center}px ${center}px`,
                      transform: isSelected
                        ? 'scale(1.035)'
                        : isHovered
                        ? 'scale(1.02)'
                        : 'scale(1)',
                    }}
                  />

                  {/* Icon & Label within segment */}
                  <g
                    transform={`translate(${iconX}, ${iconY})`}
                    className="pointer-events-none"
                  >
                    <foreignObject
                      x="-38"
                      y="-26"
                      width="76"
                      height="52"
                      className="overflow-visible"
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <div
                          className="transition-transform duration-300"
                          style={{
                            color: isSelected
                              ? '#ffffff'
                              : isHovered
                              ? cat.color
                              : '#cbd5e1',
                            transform: isSelected || isHovered ? 'scale(1.15)' : 'scale(1)',
                          }}
                        >
                          {ICON_MAP[cat.icon]}
                        </div>
                        <span
                          className={`text-[10px] tracking-tight font-medium mt-1 transition-colors duration-200 line-clamp-1 ${
                            isSelected
                              ? 'text-white font-bold'
                              : isHovered
                              ? 'text-slate-100 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Orbiting Format Ring (HTML elements overlaid smoothly) */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="absolute inset-0 pointer-events-none"
            >
              {selectedCategory.formats.map((fmt, idx) => {
                const total = selectedCategory.formats.length;
                const angle = (idx / total) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const x = center + orbitRadius * Math.cos(rad);
                const y = center + orbitRadius * Math.sin(rad);
                const isFmtSelected = selectedFormat?.id === fmt.id;

                return (
                  <button
                    key={fmt.id}
                    onClick={() => onSelectFormat(fmt)}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}px`, top: `${y}px` }}
                  >
                    <div
                      className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold font-mono transition-all duration-200 flex items-center space-x-1 shadow-lg ${
                        isFmtSelected
                          ? 'bg-white text-slate-900 ring-4 ring-offset-2 ring-offset-slate-900 scale-110 shadow-indigo-500/50'
                          : 'bg-slate-900/90 text-slate-200 border border-white/15 hover:border-white/40 hover:scale-105 hover:bg-slate-800'
                      }`}
                      style={{
                        borderColor: isFmtSelected
                          ? selectedCategory.color
                          : undefined,
                      }}
                    >
                      {isFmtSelected && (
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      )}
                      <span>{fmt.name}</span>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Hub (Drop target, File status & Center Trigger) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              onFileDrop(e.dataTransfer.files);
            }
          }}
          onClick={onBrowseClick}
          className={`absolute w-52 h-52 rounded-full cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-all duration-300 z-10 ${
            isDragOver
              ? 'scale-105 bg-indigo-950/80 border-2 border-dashed border-indigo-400 shadow-2xl shadow-indigo-500/50'
              : 'bg-slate-900/95 border border-white/15 hover:border-white/30 shadow-2xl backdrop-blur-xl'
          }`}
        >
          {/* Subtle Rotating border ring */}
          <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />

          {hasFile ? (
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 shadow-inner">
                <span className="text-xs font-mono font-bold uppercase">
                  {fileExt || 'FILE'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-100 max-w-[130px] truncate px-1">
                {fileName}
              </span>
              <span className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1 font-medium">
                Change File <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 transition-transform duration-300 ${
                  isDragOver
                    ? 'scale-110 bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-white/5 text-slate-300 group-hover:scale-105'
                }`}
              >
                <Upload className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-xs font-bold text-slate-100">
                {isDragOver ? 'Drop to Load' : 'Drop File Here'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">
                or click to browse
              </span>
            </div>
          )}

          {/* Active Category Tag at bottom of hub */}
          {selectedCategory && (
            <div
              className="mt-2 text-[9px] font-semibold px-2 py-0.5 rounded-full border flex items-center space-x-1"
              style={{
                backgroundColor: selectedCategory.color + '20',
                borderColor: selectedCategory.color + '50',
                color: selectedCategory.color,
              }}
            >
              <span>{selectedCategory.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Wheel Subtitle & Instructions */}
      <div className="mt-4 text-center max-w-sm">
        <p className="text-xs text-slate-400">
          {selectedCategory ? (
            <span className="text-slate-200">
              Click any outer format token to set output, or click the segment to collapse.
            </span>
          ) : (
            <span>
              Click a radial category segment to explore formats, or drag any file directly onto the center.
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
