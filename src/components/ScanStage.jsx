import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangleIcon, ContrastIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

const ScanStage = ({
  src,
  alt,
  loadingText = 'Loading scan...',
  statusBadge = null,
  maxWidthDefault = 100,
}) => {
  const { isDark, darkPaper, toggleDarkPaper } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(maxWidthDefault);
  const [retryKey, setRetryKey] = useState(0);

  const isDarkPaperActive = isDark && darkPaper;

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [src, retryKey]);

  const zoomOut = () => setZoom(z => Math.max(60, z - 15));
  const zoomIn = () => setZoom(z => Math.min(160, z + 15));
  const resetZoom = () => setZoom(100);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Stage Mini-Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[var(--border-hairline)] bg-[var(--bg-inset)]">
        <div className="flex items-center gap-2">{statusBadge}</div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 60}
              className="p-1.5 rounded text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOutIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="px-2 py-0.5 text-xs font-mono-code tabular-nums font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] transition-colors"
              title="Reset zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 160}
              className="p-1.5 rounded text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomInIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dark-Mode-Only Isolated Dark Paper Toggle */}
          {isDark && (
            <button
              type="button"
              onClick={toggleDarkPaper}
              aria-pressed={darkPaper}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                darkPaper
                  ? 'bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] border-[var(--action-primary-bg)]'
                  : 'bg-[var(--bg-surface)] text-[var(--ink-secondary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:text-[var(--ink-primary)]'
              }`}
              title="Invert scanned exam paper for comfortable Dark Mode reading (never affects print)"
            >
              <ContrastIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{darkPaper ? 'Dark Paper: On' : 'Dark Paper'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Paper Stage */}
      <div
        className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6 scholar-scroll bg-[var(--bg-paper)] transition-colors duration-150"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'manipulation',
        }}
      >
        <div className="flex justify-center items-start min-h-full">
          {/* Isolated Exam Paper Surface */}
          <div
            className={`exam-paper-surface relative rounded-lg border transition-colors duration-150 overflow-hidden p-2 sm:p-4 ${
              isDarkPaperActive
                ? 'bg-[#111827] border-[var(--border-hairline)]'
                : 'bg-[#FFFFFF] border-[var(--border-hairline)] shadow-[var(--shadow-card)]'
            }`}
            style={{
              width: zoom === 100 ? 'auto' : `${zoom}%`,
              maxWidth: zoom > 100 ? 'none' : '100%',
            }}
          >
            {imageLoading && !imageError && (
              <div className="min-w-[260px] min-h-[220px] flex flex-col items-center justify-center gap-3 p-8">
                <div className="w-7 h-7 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--subject-biology)] animate-spin" />
                <p className="text-xs font-medium text-[var(--ink-secondary)]">{loadingText}</p>
              </div>
            )}

            {imageError && (
              <div className="min-w-[260px] min-h-[220px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                  <AlertTriangleIcon className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[var(--ink-primary)]">
                  Failed to load image
                </p>
                <p className="text-xs text-[var(--ink-secondary)] mt-1">
                  Check your connection and retry.
                </p>
                <button
                  type="button"
                  onClick={() => setRetryKey(k => k + 1)}
                  className="mt-4 px-4 py-1.5 rounded-md text-xs font-medium bg-[var(--action-primary-bg)] text-[var(--action-primary-fg)] hover:bg-[var(--action-primary-hover)] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* .exam-paper-dark-invert applied STRICTLY to the scan <img> */}
            <img
              key={`${src}-${retryKey}`}
              src={src}
              alt={alt}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              className={`exam-scan-img max-w-full h-auto mx-auto rounded transition-opacity duration-150 ${
                isDarkPaperActive ? 'exam-paper-dark-invert' : ''
              } ${imageLoading || imageError ? 'hidden' : 'block'}`}
              style={{
                width: zoom !== 100 ? '100%' : 'auto',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanStage;
