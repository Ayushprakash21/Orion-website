import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock, Check, AlertCircle } from 'lucide-react';

export interface OrionNovaDownloadButtonProps {
  filename: string;
  version: string;
  platform: 'windows' | 'macos';
  isAuthenticated: boolean;
  onDownload: () => Promise<void>;
  onNavigateAuth: (mode: 'login' | 'signup') => void;
  disabled?: boolean;
}

export const OrionNovaDownloadButton: React.FC<OrionNovaDownloadButtonProps> = ({
  filename,
  version,
  platform,
  isAuthenticated,
  onDownload,
  onNavigateAuth,
  disabled = false,
}) => {
  const [status, setStatus] = useState<'idle' | 'morphing' | 'loading' | 'complete'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Transition from morphing to loading after morph duration
  useEffect(() => {
    if (status !== 'morphing') return;
    const timer = setTimeout(() => {
      setStatus('loading');
    }, 650);
    return () => clearTimeout(timer);
  }, [status]);

  const handleClick = async () => {
    if (disabled) return;

    if (!isAuthenticated) {
      onNavigateAuth('login');
      return;
    }

    if (status === 'loading' || status === 'morphing') return;

    if (status === 'complete') {
      setStatus('idle');
      return;
    }

    // Start download flow
    setErrorMessage(null);
    setStatus('morphing');

    try {
      await onDownload();
      setStatus('complete');
      // Reset back to idle after 4 seconds
      setTimeout(() => {
        setStatus((curr) => (curr === 'complete' ? 'idle' : curr));
      }, 4200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      setErrorMessage(msg);
      setStatus('idle');
    }
  };

  const isMorphing = status === 'morphing';
  const isLoading = status === 'loading';
  const isComplete = status === 'complete';
  const isIdle = status === 'idle';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center justify-center min-h-[56px]">
        <motion.button
          type="button"
          onClick={handleClick}
          disabled={disabled || isLoading}
          layout
          animate={{
            width: isIdle || isComplete ? '100%' : '56px',
            height: '52px',
            borderRadius: isIdle || isComplete ? '16px' : '28px',
          }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`relative overflow-hidden flex items-center justify-center font-medium text-xs select-none cursor-pointer transition-colors border shadow-lg ${
            !isAuthenticated
              ? 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 border-sky-400/30 text-white'
              : isComplete
              ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
              : 'bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] border-sky-400/40 text-white shadow-[0_4px_24px_rgba(2,132,199,0.3)]'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {/* Subtle Glass Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/10 to-white/0 pointer-events-none" />

          {/* STATE: IDLE ICON */}
          <AnimatePresence>
            {isIdle && (
              <motion.div
                key="idle-icon"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="flex items-center gap-2.5 px-4"
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="w-4 h-4 text-sky-200 shrink-0" />
                    <span className="font-semibold tracking-wide truncate">
                      Authenticate to Download {filename}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-sky-200 shrink-0" />
                    <span className="font-semibold tracking-wide truncate">
                      Download {filename} <span className="opacity-80 font-mono text-[10px] ml-1">(v{version})</span>
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATE: MORPHING DIAMOND */}
          <AnimatePresence>
            {isMorphing && (
              <motion.div
                key="morphing-diamond"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  scale: [0.6, 1.15, 1],
                  rotate: [0, 90],
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-0 flex items-center justify-center text-sky-300"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                  <path
                    d="M12 3L19 12L12 21L5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 7L16 12L12 17L8 12Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATE: LOADING DIAMOND + SPINNER RING */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loading-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* SVG Progress Ring */}
                <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2.5"
                  />
                  <motion.circle
                    cx="28"
                    cy="28"
                    r="23"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength="1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 0.7, 1] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.85))',
                    }}
                  />
                </svg>

                {/* Inner Pulsing Diamond */}
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-sky-300"
                  fill="none"
                  animate={{ scale: [0.9, 1.08, 0.9] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path
                    d="M12 3L19 12L12 21L5 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATE: COMPLETE CHECK */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                key="complete-view"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 px-4"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="font-semibold text-emerald-300 tracking-wide">
                  Installer Stream Verified · Ready
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-rose-400 mt-2 flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMessage}</span>
        </motion.p>
      )}
    </div>
  );
};
