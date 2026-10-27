/**
 * ORION-9 ADVANCED LIQUID GLASS MATERIAL ENGINE
 * 
 * Provides runtime pointer tracking, dynamic specular reflections,
 * hardware capability detection, and accessible material adaptation.
 * 
 * High-performance: Zero React re-renders, direct CSS custom properties via rAF,
 * delegated document-level pointer dispatching, and automatic cleanup.
 */

interface PointerState {
  px: number;
  py: number;
  active: boolean;
  rafId: number | null;
}

const activeElements = new WeakMap<HTMLElement, PointerState>();

/**
 * Initializes global delegated pointer tracking for Liquid Glass interactive elements.
 * Automatically handles hover coordinates, specular sheen movement, and smooth exit decay.
 */
export function initLiquidGlassEngine(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.documentElement.classList.add('reduced-motion');
  }

  // Check reduced transparency preference
  const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
  if (prefersReducedTransparency.matches) {
    document.documentElement.classList.add('reduced-transparency');
  }

  // Track prefers-reduced changes dynamically
  const onMotionChange = (e: MediaQueryListEvent) => {
    document.documentElement.classList.toggle('reduced-motion', e.matches);
  };
  const onTransparencyChange = (e: MediaQueryListEvent) => {
    document.documentElement.classList.toggle('reduced-transparency', e.matches);
  };

  try {
    prefersReducedMotion.addEventListener('change', onMotionChange);
    prefersReducedTransparency.addEventListener('change', onTransparencyChange);
  } catch {
    // Legacy browser fallback
  }

  let currentTarget: HTMLElement | null = null;
  let cachedRect: DOMRect | null = null;

  const findGlassTarget = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest<HTMLElement>(
      '.liquid-glass-interactive, .liquid-glass-card, .liquid-glass-elevated, .liquid-glass-clear, [data-liquid-glass]'
    );
  };

  const updateCoordinates = (element: HTMLElement, clientX: number, clientY: number) => {
    if (!cachedRect) {
      cachedRect = element.getBoundingClientRect();
    }
    const width = cachedRect.width || 1;
    const height = cachedRect.height || 1;

    // Relative percentage within component bounds [0% - 100%]
    const xPct = Math.max(0, Math.min(100, ((clientX - cachedRect.left) / width) * 100));
    const yPct = Math.max(0, Math.min(100, ((clientY - cachedRect.top) / height) * 100));

    let state = activeElements.get(element);
    if (!state) {
      state = { px: xPct, py: yPct, active: true, rafId: null };
      activeElements.set(element, state);
    } else {
      state.px = xPct;
      state.py = yPct;
      state.active = true;
    }

    if (state.rafId === null) {
      state.rafId = requestAnimationFrame(() => {
        if (!state) return;
        element.style.setProperty('--glass-px', `${state.px.toFixed(1)}%`);
        element.style.setProperty('--glass-py', `${state.py.toFixed(1)}%`);
        element.style.setProperty('--glass-pointer-active', '1');
        state.rafId = null;
      });
    }
  };

  const resetTarget = (element: HTMLElement) => {
    const state = activeElements.get(element);
    if (state) {
      state.active = false;
      if (state.rafId !== null) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    }
    element.style.setProperty('--glass-pointer-active', '0');
  };

  const onPointerMove = (e: PointerEvent) => {
    const target = findGlassTarget(e.target);
    if (target !== currentTarget) {
      if (currentTarget) {
        resetTarget(currentTarget);
      }
      currentTarget = target;
      cachedRect = currentTarget ? currentTarget.getBoundingClientRect() : null;
    }

    if (currentTarget) {
      updateCoordinates(currentTarget, e.clientX, e.clientY);
    }
  };

  const onPointerLeaveWindow = () => {
    if (currentTarget) {
      resetTarget(currentTarget);
      currentTarget = null;
      cachedRect = null;
    }
  };

  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeaveWindow, { passive: true });
  window.addEventListener('scroll', () => {
    cachedRect = currentTarget ? currentTarget.getBoundingClientRect() : null;
  }, { passive: true });

  return () => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeaveWindow);
    try {
      prefersReducedMotion.removeEventListener('change', onMotionChange);
      prefersReducedTransparency.removeEventListener('change', onTransparencyChange);
    } catch {}
  };
}
