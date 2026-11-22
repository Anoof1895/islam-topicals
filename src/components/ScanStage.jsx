import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ContrastIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

const ScanStage = ({
  src,
  alt,
  loadingText = 'Loading scan...',
  statusBadge = null,
  maxWidthDefault = 100,
}) => {
  const { isDark, invertScan, toggleInvertScan } = useTheme();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(maxWidthDefault);
  const [retryKey, setRetryKey] = useState(0);

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
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 border-b border-[var(--border-hairline)] bg-[var(--bg-subtle)]/50">
        <div className="flex items-center gap-2">
          {statusBadge}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 60}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
              title="Zoom out"
            >
              <ZoomOutIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="px-2 py-0.5 text-xs font-mono-code font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Reset zoom"
            >
              {zoom}%
            </button>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 160}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-40 transition-colors"
              title="Zoom in"
            >
              <ZoomInIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dark Paper / Invert Scan Toggle */}
          <button
            type="button"
            onClick={toggleInvertScan}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              invertScan
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-xs'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
            }`}
            title="Invert black-on-white scan for dark-paper reading"
          >
            <ContrastIcon className="w-3.5 h-3.5" />
            <span>{invertScan ? 'Dark Paper On' : isDark ? 'Dark Paper' : 'Invert Scan'}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Paper Stage */}
      <div
        className={`flex-1 overflow-auto p-3 sm:p-5 lg:p-6 scholar-scroll transition-colors duration-200 ${
          invertScan ? 'scan-stage-dark' : 'bg-[var(--bg-subtle)]/70'
        }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'manipulation',
        }}
      >
        <div className="flex justify-center items-start min-h-full">
          <div
            className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
              invertScan
                ? 'scan-stage-dark border-[#2C4039] shadow-xl'
                : 'scan-stage-ivory border-[#E4DFD7] shadow-[0_6px_24px_rgba(20,30,27,0.08)]'
            } p-2 sm:p-4`}
            style={{ width: zoom === 100 ? 'auto' : `${zoom}%`, maxWidth: zoom > 100 ? 'none' : '100%' }}
          >
            {imageLoading && !imageError && (
              <div className="min-w-[260px] min-h-[220px] flex flex-col items-center justify-center gap-3 p-8">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent-primary)] animate-spin" />
                <p className="text-xs font-medium text-[var(--text-secondary)]">{loadingText}</p>
              </div>
            )}

            {imageError && (
              <div className="min-w-[260px] min-h-[220px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-11 h-11 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.226 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Failed to load image</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Check your connection and retry.</p>
                <button
                  type="button"
                  onClick={() => setRetryKey(k => k + 1)}
                  className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

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
              className={`exam-scan-img max-w-full h-auto mx-auto rounded-md transition-opacity duration-200 ${
                invertScan ? 'scan-invert' : ''
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
