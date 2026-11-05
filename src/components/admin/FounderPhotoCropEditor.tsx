/**
 * ORION-9 FOUNDER PHOTO CROP EDITOR
 *
 * Interactive crop and positioning editor for the Creator Profile photograph.
 * Provides drag-to-reposition, pinch/scroll-to-zoom, rotation, guide overlays,
 * and live preview before uploading the cropped result to Cloudflare R2.
 *
 * Uses react-easy-crop for the interactive crop viewport and Canvas API for
 * generating the final cropped image blob.
 *
 * Key design decisions:
 * - Only uploads after the user clicks "Apply & Upload" — never auto-uploads
 * - Generates a cropped JPEG/PNG/WebP blob before upload; the stored URL
 *   points to the processed crop, not the unedited original
 * - Falls back gracefully if canvas export fails
 * - Preserves all existing brandingStorage upload infrastructure
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  Crosshair,
  AlignCenter,
  Grid3X3,
  X,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CropEditorResult {
  blob: Blob;
  filename: string;
  mimeType: string;
  dataUrl: string; // for immediate preview before upload confirms
}

interface GuideState {
  centerV: boolean;
  centerH: boolean;
  thirds: boolean;
  safe: boolean;
}

interface FounderPhotoCropEditorProps {
  /** The raw File selected by the user (not yet uploaded) */
  sourceFile: File;
  /** Called when the user confirms the crop; provides the processed Blob */
  onApply: (result: CropEditorResult) => void;
  /** Called when the user cancels without uploading */
  onCancel: () => void;
  /** Whether the parent is currently uploading the crop result */
  isUploading?: boolean;
  /** Upload progress 0–100 */
  uploadProgress?: number;
  /** Error message if the upload from the parent failed */
  uploadError?: string | null;
}

// ---------------------------------------------------------------------------
// Canvas crop utility
// ---------------------------------------------------------------------------

/**
 * Renders the cropped pixel area from a source image to a new square canvas
 * and returns the result as a Blob.
 */
async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  flipH: boolean,
  outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  quality = 0.95
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is not available.');

  // Output is always a square at the crop size
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;

  ctx.save();

  // Move to center, apply rotation and flip, then draw
  ctx.translate(size / 2, size / 2);
  if (flipH) ctx.scale(-1, 1);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-size / 2, -size / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  ctx.restore();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null — the image could not be exported.'));
      },
      outputMimeType,
      quality
    );
  });
}

// ---------------------------------------------------------------------------
// Guide overlay component
// ---------------------------------------------------------------------------

const GuideOverlay: React.FC<{ guides: GuideState }> = ({ guides }) => {
  if (!guides.centerV && !guides.centerH && !guides.thirds && !guides.safe) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      aria-hidden="true"
    >
      {/* Center vertical */}
      {guides.centerV && (
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-sky-400/60" />
      )}
      {/* Center horizontal */}
      {guides.centerH && (
        <div className="absolute left-0 right-0 top-1/2 h-px bg-sky-400/60" />
      )}
      {/* Rule of thirds vertical lines */}
      {guides.thirds && (
        <>
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/25" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/25" />
          <div className="absolute left-0 right-0 top-1/3 h-px bg-white/25" />
          <div className="absolute left-0 right-0 top-2/3 h-px bg-white/25" />
        </>
      )}
      {/* Safe framing indicator — 80% inset */}
      {guides.safe && (
        <div className="absolute inset-[10%] border border-dashed border-amber-400/60 rounded-sm" />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main editor component
// ---------------------------------------------------------------------------

export const FounderPhotoCropEditor: React.FC<FounderPhotoCropEditorProps> = ({
  sourceFile,
  onApply,
  onCancel,
  isUploading = false,
  uploadProgress = 0,
  uploadError = null,
}) => {
  // ── Derived image source ────────────────────────────────────────────────
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  // ── Crop state ──────────────────────────────────────────────────────────
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // ── Guide overlay ───────────────────────────────────────────────────────
  const [guides, setGuides] = useState<GuideState>({
    centerV: false,
    centerH: false,
    thirds: false,
    safe: false,
  });

  // ── Processing state ────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // ── Preview ─────────────────────────────────────────────────────────────
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Determine output MIME type ──────────────────────────────────────────
  const outputMimeType: 'image/jpeg' | 'image/png' | 'image/webp' = (() => {
    const t = sourceFile.type.toLowerCase();
    if (t === 'image/png') return 'image/png';
    if (t === 'image/webp') return 'image/webp';
    return 'image/jpeg';
  })();

  const outputExtension = outputMimeType === 'image/png' ? 'png' : outputMimeType === 'image/webp' ? 'webp' : 'jpg';

  // ── Load source file as object URL ─────────────────────────────────────
  useEffect(() => {
    if (!sourceFile) return;
    const url = URL.createObjectURL(sourceFile);
    setImageSrc(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sourceFile]);

  // ── Regenerate preview after each crop change (debounced) ───────────────
  const updatePreview = useCallback(async (pixels: Area | null) => {
    if (!imageSrc || !pixels) return;
    try {
      const blob = await getCroppedImageBlob(imageSrc, pixels, rotation, flipH, outputMimeType, 0.80);
      const dataUrl = URL.createObjectURL(blob);
      setPreviewDataUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return dataUrl;
      });
    } catch {
      // silent — preview failure should not block editing
    }
  }, [imageSrc, rotation, flipH, outputMimeType]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
    // Debounce preview regeneration to avoid flooding while dragging
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => updatePreview(pixels), 150);
  }, [updatePreview]);

  // Update preview when rotation/flip changes
  useEffect(() => {
    if (croppedAreaPixels) {
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = setTimeout(() => updatePreview(croppedAreaPixels), 150);
    }
  }, [rotation, flipH, croppedAreaPixels, updatePreview]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewDataUrl) URL.revokeObjectURL(previewDataUrl);
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setProcessingError(null);
  };

  const handleCenterImage = () => {
    setCrop({ x: 0, y: 0 });
  };

  // ── Apply & upload ──────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const blob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flipH,
        outputMimeType,
        0.95
      );

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const baseName = sourceFile.name.replace(/\.[^.]+$/, '');
      const filename = `${baseName}-cropped.${outputExtension}`;

      onApply({ blob, filename, mimeType: outputMimeType, dataUrl });
    } catch (err) {
      const msg = (err as Error).message || 'Failed to process the cropped image.';
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleGuide = (key: keyof GuideState) => {
    setGuides((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (imageLoadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <p className="text-sm font-medium text-[var(--orion-text-primary)]">
          Unable to load this image
        </p>
        <p className="text-xs text-[var(--orion-text-secondary)]">{imageLoadError}</p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 px-4 py-2 rounded-xl border border-[var(--glass-border)] text-xs text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const busy = isUploading || isProcessing;

  return (
    <div className="flex flex-col gap-0 w-full" data-testid="founder-crop-editor">
      {/* ── Title row ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[var(--glass-border-subtle)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--orion-text-primary)]">
            Position &amp; Crop Photograph
          </h3>
          <p className="text-[11px] text-[var(--orion-text-muted)] mt-0.5">
            Drag to reposition · Scroll or use the slider to zoom
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="p-1.5 rounded-lg text-[var(--orion-text-muted)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main layout: crop viewport + right panel ────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-0 min-h-0">

        {/* ── Crop viewport ─────────────────────────────────────────────── */}
        <div className="relative flex-1 min-h-[320px] lg:min-h-[420px] bg-[#111] overflow-hidden rounded-none lg:rounded-bl-3xl">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="rect"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: '#111' },
                cropAreaStyle: {
                  border: '2px solid rgba(2, 132, 199, 0.85)',
                  borderRadius: '16px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                },
              }}
              objectFit="contain"
              minZoom={0.5}
              maxZoom={5}
              zoomSpeed={0.3}
            />
          )}
          <GuideOverlay guides={guides} />
        </div>

        {/* ── Right panel: controls + preview ───────────────────────────── */}
        <div className="w-full lg:w-64 flex flex-col bg-[var(--orion-surface)] border-t lg:border-t-0 lg:border-l border-[var(--glass-border-subtle)] rounded-none lg:rounded-br-3xl overflow-hidden">

          {/* Zoom controls */}
          <div className="px-4 pt-4 pb-3 space-y-2 border-b border-[var(--glass-border-subtle)]">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-text-muted)]">
              Zoom
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                disabled={busy}
                className="p-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={busy}
                className="flex-1 h-1.5 accent-[#0284C7] cursor-pointer disabled:opacity-40"
                aria-label="Zoom level"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(5, +(z + 0.1).toFixed(2)))}
                disabled={busy}
                className="p-1.5 rounded-lg border border-[var(--glass-border)] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] font-mono text-right text-[var(--orion-text-muted)]">
              {(zoom * 100).toFixed(0)}%
            </p>
          </div>

          {/* Rotation & flip */}
          <div className="px-4 py-3 border-b border-[var(--glass-border-subtle)] space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-text-muted)]">
              Rotate &amp; Flip
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => r - 90)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
                aria-label="Rotate left"
              >
                <RotateCcw className="w-3 h-3" /> −90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => r + 90)}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
                aria-label="Rotate right"
              >
                <RotateCw className="w-3 h-3" /> +90°
              </button>
              <button
                type="button"
                onClick={() => setFlipH((f) => !f)}
                disabled={busy}
                className={`p-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                  flipH
                    ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-400 text-sky-600 dark:text-sky-300'
                    : 'border-[var(--glass-border)] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)]'
                }`}
                aria-label="Flip horizontal"
                title="Flip horizontal"
              >
                <FlipHorizontal2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Fine rotation slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--orion-text-muted)] w-6 text-right">{rotation % 360}°</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation % 360 > 180 ? (rotation % 360) - 360 : rotation % 360}
                onChange={(e) => setRotation(Number(e.target.value))}
                disabled={busy}
                className="flex-1 h-1.5 accent-[#0284C7] cursor-pointer disabled:opacity-40"
                aria-label="Fine rotation"
              />
            </div>
          </div>

          {/* Position utilities */}
          <div className="px-4 py-3 border-b border-[var(--glass-border-subtle)] space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-text-muted)]">
              Position
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCenterImage}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
              >
                <AlignCenter className="w-3 h-3" /> Center
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[var(--glass-border)] text-[10px] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Guide overlays */}
          <div className="px-4 py-3 border-b border-[var(--glass-border-subtle)] space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-text-muted)]">
              Guides
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { key: 'centerV', label: 'Vertical', icon: Crosshair },
                  { key: 'centerH', label: 'Horizontal', icon: Crosshair },
                  { key: 'thirds', label: 'Thirds', icon: Grid3X3 },
                  { key: 'safe', label: 'Safe zone', icon: CheckCircle2 },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleGuide(key)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] transition-colors ${
                    guides[key]
                      ? 'bg-sky-100 dark:bg-sky-900/30 border-sky-400 text-sky-600 dark:text-sky-300'
                      : 'border-[var(--glass-border)] text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)]'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="px-4 py-3 border-b border-[var(--glass-border-subtle)] space-y-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--orion-text-muted)]">
              Live Preview
            </span>
            <div className="flex items-end gap-3">
              {/* 180px equivalent preview */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[var(--glass-border)] bg-slate-900 shadow-sm">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Crop preview large"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0284C7] to-[#070B19]" />
                  )}
                </div>
                <span className="text-[9px] font-mono text-[var(--orion-text-muted)]">180 px</span>
              </div>
              {/* 112px equivalent preview */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--glass-border)] bg-slate-900 shadow-sm">
                  {previewDataUrl ? (
                    <img
                      src={previewDataUrl}
                      alt="Crop preview small"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0284C7] to-[#070B19]" />
                  )}
                </div>
                <span className="text-[9px] font-mono text-[var(--orion-text-muted)]">112 px</span>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Error display */}
          {(processingError || uploadError) && (
            <div className="mx-4 mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 flex items-start gap-2 text-[11px] text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
              <span>{processingError || uploadError}</span>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div className="mx-4 mb-3 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-[var(--orion-text-muted)]">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#0284C7] transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="px-4 pb-4 pt-2 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="flex-1 py-2 rounded-xl border border-[var(--glass-border)] text-xs text-[var(--orion-text-secondary)] hover:bg-[var(--orion-alt-bg)] transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={busy || !croppedAreaPixels}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold transition-colors shadow-sm shadow-sky-600/20 disabled:opacity-50"
              data-testid="crop-apply-button"
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
                  Processing…
                </>
              ) : isUploading ? (
                <>
                  <div className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Apply &amp; Upload
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderPhotoCropEditor;
