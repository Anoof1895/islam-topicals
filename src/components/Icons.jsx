import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Contrast,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Keyboard,
  Layers,
  Layers2,
  LayoutGrid,
  Library,
  Lightbulb,
  Menu,
  Moon,
  PencilLine,
  Printer,
  RefreshCw,
  ScrollText,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Sun,
  Target,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export const RubElHizbIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" />
    <rect x="4.5" y="4.5" width="15" height="15" rx="1.5" transform="rotate(45 12 12)" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

export const ArrowLeftIcon = ({ className = 'w-4 h-4' }) => (
  <ArrowLeft className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ArrowRightIcon = ({ className = 'w-4 h-4' }) => (
  <ArrowRight className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const MenuIcon = ({ className = 'w-5 h-5' }) => (
  <Menu className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const AlertTriangleIcon = ({ className = 'w-5 h-5' }) => (
  <AlertTriangle className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const BookOpenIcon = ({ className = 'w-5 h-5' }) => (
  <BookOpen className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const LibraryIcon = ({ className = 'w-5 h-5' }) => (
  <Library className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const TargetIcon = ({ className = 'w-5 h-5' }) => (
  <Target className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <Sparkles className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ScrollTextIcon = ({ className = 'w-5 h-5' }) => (
  <ScrollText className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const CompassIcon = ({ className = 'w-5 h-5' }) => (
  <Compass className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const SunIcon = ({ className = 'w-5 h-5' }) => (
  <Sun className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const MoonIcon = ({ className = 'w-5 h-5' }) => (
  <Moon className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const StarIcon = ({ className = 'w-5 h-5', filled = false }) => (
  <Star
    className={className}
    strokeWidth={1.85}
    fill={filled ? 'currentColor' : 'none'}
    aria-hidden="true"
  />
);

export const NoteIcon = ({ className = 'w-5 h-5' }) => (
  <PencilLine className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const PrinterIcon = ({ className = 'w-5 h-5' }) => (
  <Printer className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const KeyboardIcon = ({ className = 'w-5 h-5' }) => (
  <Keyboard className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <Search className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const FilterIcon = ({ className = 'w-5 h-5' }) => (
  <Filter className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ChevronLeftIcon = ({ className = 'w-5 h-5' }) => (
  <ChevronLeft className={className} strokeWidth={2} aria-hidden="true" />
);

export const ChevronRightIcon = ({ className = 'w-5 h-5' }) => (
  <ChevronRight className={className} strokeWidth={2} aria-hidden="true" />
);

export const ChevronDownIcon = ({ className = 'w-5 h-5' }) => (
  <ChevronDown className={className} strokeWidth={2} aria-hidden="true" />
);

export const XIcon = ({ className = 'w-5 h-5' }) => (
  <X className={className} strokeWidth={2} aria-hidden="true" />
);

export const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <Check className={className} strokeWidth={2} aria-hidden="true" />
);

export const ContrastIcon = ({ className = 'w-5 h-5' }) => (
  <Contrast className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ZoomInIcon = ({ className = 'w-5 h-5' }) => (
  <ZoomIn className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ZoomOutIcon = ({ className = 'w-5 h-5' }) => (
  <ZoomOut className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const LayersIcon = ({ className = 'w-5 h-5' }) => (
  <Layers className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ShuffleIcon = ({ className = 'w-5 h-5' }) => (
  <Shuffle className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const GridIcon = ({ className = 'w-5 h-5' }) => (
  <LayoutGrid className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const CardDeckIcon = ({ className = 'w-5 h-5' }) => (
  <Layers2 className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const DownloadIcon = ({ className = 'w-5 h-5' }) => (
  <Download className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const ExternalLinkIcon = ({ className = 'w-5 h-5' }) => (
  <ExternalLink className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const LightbulbIcon = ({ className = 'w-5 h-5' }) => (
  <Lightbulb className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const EyeIcon = ({ className = 'w-5 h-5' }) => (
  <Eye className={className} strokeWidth={1.85} aria-hidden="true" />
);

export const FlipIcon = ({ className = 'w-5 h-5' }) => (
  <RefreshCw className={className} strokeWidth={1.85} aria-hidden="true" />
);
