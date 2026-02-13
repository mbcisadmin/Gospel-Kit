'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { PeekSheetContext, type PeekSheetContextValue } from './usePeekSheet';

// ============================================================================
// Types
// ============================================================================

type SheetMode = 'sheet' | 'modal';
type SheetState = 'peek' | 'expanded';

export interface PeekSheetTriggerContext {
  state: SheetState;
  mode: SheetMode;
  expand: () => void;
}

export interface PeekSheetProps {
  children: ReactNode;
  renderTrigger: (ctx: PeekSheetTriggerContext) => ReactNode;
  header?: ReactNode | ((ctx: PeekSheetContextValue) => ReactNode);
  /** Height of the peek bar in px (default: 72) */
  peekHeight?: number;
  /** Maximum height when expanded (default: '90dvh') */
  maxHeight?: string;
  /** Breakpoint for switching to modal mode (default: 768) */
  modalBreakpoint?: number;
  /** Tailwind max-width class for modal (default: 'max-w-3xl') */
  maxWidth?: string;
  /** Additional class names for the panel */
  panelClassName?: string;
  /** Remove default padding from modal panel */
  noPanelPadding?: boolean;
  /** Z-index class (default: 'z-[55]') */
  zIndex?: string;
  /** Control peek bar visibility (e.g., for tab switching) */
  visible?: boolean;
  /** DOM element ID to portal the desktop trigger into (e.g., a SectionHeader actions slot) */
  triggerPortalId?: string;
  /** Callback when state changes */
  onStateChange?: (state: SheetState) => void;
  /** Imperative ref to trigger expand from outside (e.g., from a page action) */
  expandRef?: MutableRefObject<(() => void) | null>;
}

// ============================================================================
// Body Scroll Lock (from BottomSheet pattern)
// ============================================================================

function lockBodyScroll() {
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
}

function unlockBodyScroll() {
  const scrollY = document.body.style.top;
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
  }
}

// ============================================================================
// Scroll Indicator (from BottomSheet pattern)
// ============================================================================

function SheetScrollIndicator({ lightTheme }: { lightTheme: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-none absolute right-0 bottom-0 left-0 flex h-20 items-end justify-center ${
        lightTheme
          ? 'bg-gradient-to-t from-[var(--card)] to-transparent'
          : 'bg-gradient-to-t from-[#0b0d0c] to-transparent'
      }`}
    >
      <div
        className={`mb-3 flex flex-col items-center gap-1 ${
          lightTheme ? 'text-muted-foreground' : 'text-white/50'
        }`}
      >
        <span className="text-xs font-medium tracking-wide uppercase">Scroll for more</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronLeft className="h-4 w-4 -rotate-90" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Scroll Indicator Hook
// ============================================================================

function useScrollIndicator(active: boolean) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showIndicator, setShowIndicator] = useState(false);

  const checkScrollIndicator = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const hasMore = container.scrollHeight > container.clientHeight + 5;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;
    setShowIndicator(hasMore && !atBottom);
  }, []);

  useEffect(() => {
    if (!active) {
      setShowIndicator(false);
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollIndicator();
    const timeouts = [
      setTimeout(checkScrollIndicator, 50),
      setTimeout(checkScrollIndicator, 150),
      setTimeout(checkScrollIndicator, 300),
    ];

    container.addEventListener('scroll', checkScrollIndicator);
    window.addEventListener('resize', checkScrollIndicator);
    const resizeObserver = new ResizeObserver(checkScrollIndicator);
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    return () => {
      timeouts.forEach(clearTimeout);
      container.removeEventListener('scroll', checkScrollIndicator);
      window.removeEventListener('resize', checkScrollIndicator);
      resizeObserver.disconnect();
    };
  }, [active, checkScrollIndicator]);

  return { scrollContainerRef, showIndicator };
}

// ============================================================================
// Mobile Sheet Mode
// ============================================================================
//
// Two separate portal elements:
// 1. Peek bar — the FAB trigger at the bottom, visible when collapsed
// 2. Expanded sheet — full BottomSheet-style overlay with header edge-to-edge
//
// The expanded sheet uses BottomSheet's proven touch-based drag-to-close on
// the handle+header area only (NOT drag="y" on the entire panel).
// ============================================================================

function MobileSheet({
  children,
  renderTrigger,
  header,
  maxHeight,
  panelClassName,
  noPanelPadding,
  zIndex,
  visible,
  state,
  onExpand,
  onCollapse,
}: {
  children: ReactNode;
  renderTrigger: PeekSheetProps['renderTrigger'];
  header: PeekSheetProps['header'];
  maxHeight: string;
  panelClassName: string;
  noPanelPadding: boolean;
  zIndex: string;
  visible: boolean;
  state: SheetState;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const isExpanded = state === 'expanded';

  // --- Drag-to-close state (BottomSheet pattern) ---
  const dragAreaRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // --- Scroll indicator ---
  const { scrollContainerRef, showIndicator } = useScrollIndicator(isExpanded);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset drag offset when sheet collapses
  useEffect(() => {
    if (!isExpanded) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [isExpanded]);

  // Body scroll lock when expanded
  useEffect(() => {
    if (isExpanded) {
      lockBodyScroll();
      return () => unlockBodyScroll();
    }
  }, [isExpanded]);

  // Escape key to collapse
  useEffect(() => {
    if (!isExpanded) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCollapse();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded, onCollapse]);

  // Touch handlers for drag-to-close on handle+header area (BottomSheet pattern)
  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea || !isExpanded) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (touchStartY.current === null) return;
      const deltaY = e.touches[0].clientY - touchStartY.current;
      // Only allow dragging down (positive deltaY)
      setDragOffset(Math.max(0, deltaY));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null || touchStartTime.current === null) {
        setIsDragging(false);
        return;
      }

      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - touchStartY.current;
      const deltaTime = Date.now() - touchStartTime.current;
      const velocity = deltaTime > 0 ? deltaY / deltaTime : 0; // px/ms

      // Close if dragged past threshold OR flicked with enough velocity
      if (deltaY > 100 || velocity > 0.5) {
        onCollapse();
      } else {
        // Snap back
        setDragOffset(0);
      }

      touchStartY.current = null;
      touchStartTime.current = null;
      setIsDragging(false);
    };

    dragArea.addEventListener('touchstart', handleTouchStart, {
      passive: true,
    });
    dragArea.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    dragArea.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      dragArea.removeEventListener('touchstart', handleTouchStart);
      dragArea.removeEventListener('touchmove', handleTouchMove);
      dragArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isExpanded, onCollapse]);

  // Resolve header
  const contextValue: PeekSheetContextValue = {
    state,
    mode: 'sheet',
    collapse: onCollapse,
    expand: onExpand,
  };
  const resolvedHeader = typeof header === 'function' ? header(contextValue) : header;
  const hideHandle = noPanelPadding && !!resolvedHeader;
  const lightTheme = panelClassName?.includes('bg-card') ?? false;

  const panelTransform = isExpanded ? `translateY(${dragOffset}px)` : 'translateY(100%)';

  if (!mounted) return null;

  return createPortal(
    <PeekSheetContext.Provider value={contextValue}>
      {/* ---- Peek bar: visible when collapsed ---- */}
      <AnimatePresence>
        {visible && !isExpanded && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className={`fixed inset-x-0 bottom-0 ${zIndex}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex flex-col items-center" onClick={onExpand}>
              {renderTrigger({
                state: 'peek',
                mode: 'sheet',
                expand: onExpand,
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Expanded sheet overlay ---- */}
      <div
        className={`fixed inset-0 ${zIndex} transition-opacity duration-300 ${
          isExpanded ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ touchAction: 'none' }}
          onClick={onCollapse}
          aria-hidden="true"
        />

        {/* Panel — edge-to-edge header, BottomSheet-style drag on handle+header */}
        <div
          className={`absolute inset-x-0 bottom-0 flex flex-col rounded-t-[2rem] shadow-2xl ${
            isDragging ? '' : 'transition-transform duration-300 ease-out'
          } ${panelClassName}`}
          style={{
            transform: panelTransform,
            maxHeight,
            overscrollBehavior: 'contain',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Drag area: handle + header (pulling here closes the sheet) */}
          <div ref={dragAreaRef} className="shrink-0 cursor-grab">
            {/* Swipe handle */}
            {!hideHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1.5 w-14 rounded-full bg-black/30 dark:bg-gray-400" />
              </div>
            )}

            {/* Header — renders edge-to-edge at top of expanded sheet */}
            {resolvedHeader}
          </div>

          {/* Scrollable content */}
          <div
            ref={scrollContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            {children}
          </div>

          {/* Scroll indicator */}
          <AnimatePresence>
            {showIndicator && <SheetScrollIndicator lightTheme={lightTheme} />}
          </AnimatePresence>
        </div>
      </div>
    </PeekSheetContext.Provider>,
    document.body
  );
}

// ============================================================================
// Desktop Modal Mode
// ============================================================================
//
// Uses framer-motion layoutId so the inline trigger physically morphs into
// the modal panel (same element, FLIP animation with content crossfade).
// ============================================================================

const LAYOUT_TRANSITION = {
  layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
};

function DesktopModal({
  children,
  renderTrigger,
  header,
  maxWidth,
  panelClassName,
  noPanelPadding,
  visible,
  triggerPortalId,
  state,
  onExpand,
  onCollapse,
}: {
  children: ReactNode;
  renderTrigger: PeekSheetProps['renderTrigger'];
  header: PeekSheetProps['header'];
  maxWidth: string;
  panelClassName: string;
  noPanelPadding: boolean;
  visible: boolean;
  triggerPortalId?: string;
  state: SheetState;
  onExpand: () => void;
  onCollapse: () => void;
}) {
  const layoutId = useId();
  const isExpanded = state === 'expanded';
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // --- Scroll indicator ---
  const { scrollContainerRef, showIndicator } = useScrollIndicator(isExpanded);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve portal target element for the trigger
  useEffect(() => {
    if (!triggerPortalId) return;
    // Check immediately and also after a short delay (target may stream in)
    const resolve = () => {
      const el = document.getElementById(triggerPortalId);
      if (el) setPortalTarget(el);
    };
    resolve();
    const timer = setTimeout(resolve, 100);
    // Also observe DOM changes in case the target arrives later (Suspense streaming)
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [triggerPortalId]);

  // Escape key
  useEffect(() => {
    if (!isExpanded) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCollapse();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded, onCollapse]);

  const contextValue: PeekSheetContextValue = {
    state,
    mode: 'modal',
    collapse: onCollapse,
    expand: onExpand,
  };

  const resolvedHeader = typeof header === 'function' ? header(contextValue) : header;
  const lightTheme = panelClassName?.includes('bg-card') ?? false;

  // Only show trigger when:
  // 1. Not expanded (modal is showing)
  // 2. Visible (e.g., on the correct tab)
  // 3. Portal target resolved (if using triggerPortalId) — avoids rendering
  //    inline first and then animating to the portal position
  const shouldShowTrigger = !isExpanded && visible && (!triggerPortalId || !!portalTarget);

  // AnimatePresence wraps the trigger so it fades in on mount and fades out
  // on unmount (tab switch). When expanding (click), framer-motion's layoutId
  // morph takes priority over the exit animation.
  const triggerContainer = (
    <AnimatePresence>
      {shouldShowTrigger && (
        <motion.div
          key="peek-trigger"
          layoutId={layoutId}
          className="inline-flex rounded-full"
          transition={LAYOUT_TRANSITION}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {renderTrigger({
            state: 'peek',
            mode: 'modal',
            expand: onExpand,
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <PeekSheetContext.Provider value={contextValue}>
      <LayoutGroup>
        {/* Trigger — portaled to target element or rendered inline */}
        {portalTarget
          ? createPortal(triggerContainer, portalTarget)
          : !triggerPortalId
            ? triggerContainer
            : null}

        {/* Backdrop + Modal — portaled to document.body for full-screen overlay */}
        {mounted &&
          createPortal(
            <>
              {/* Backdrop */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    key="peek-backdrop"
                    className="fixed inset-0 z-50 bg-black/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onClick={onCollapse}
                  />
                )}
              </AnimatePresence>

              {/* Modal — same layoutId as trigger, framer-motion morphs between them */}
              {isExpanded && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
                  <motion.div
                    layoutId={layoutId}
                    className={`pointer-events-auto relative mx-4 flex max-h-[90vh] w-full flex-col overflow-hidden shadow-2xl ${noPanelPadding ? '' : 'p-4'} ${maxWidth} ${panelClassName}`}
                    transition={LAYOUT_TRANSITION}
                  >
                    {/* Close button */}
                    <motion.button
                      onClick={onCollapse}
                      className={`absolute z-20 p-1 transition-colors ${
                        lightTheme
                          ? 'text-muted-foreground hover:text-foreground'
                          : 'text-white/50 hover:text-white'
                      } ${noPanelPadding ? 'top-4 right-4' : 'top-2 right-2'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>

                    {/* Header */}
                    {resolvedHeader && (
                      <div className={`shrink-0 ${noPanelPadding ? '' : 'pt-2'}`}>
                        {resolvedHeader}
                      </div>
                    )}

                    {/* Content — scrollable */}
                    <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
                      {children}
                    </div>

                    {/* Scroll indicator */}
                    <AnimatePresence>
                      {showIndicator && <SheetScrollIndicator lightTheme={lightTheme} />}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </>,
            document.body
          )}
      </LayoutGroup>
    </PeekSheetContext.Provider>
  );
}

// ============================================================================
// PeekSheet Component
// ============================================================================

/**
 * A unified trigger + sheet component.
 *
 * On mobile, the trigger "peeks" from the bottom of the screen.
 * Tap or swipe up to expand into a full bottom sheet with edge-to-edge header.
 *
 * On desktop, the trigger renders inline and morphs into a centered modal
 * when clicked (FLIP animation via framer-motion layoutId).
 */
export function PeekSheet({
  children,
  renderTrigger,
  header,
  maxHeight = '90dvh',
  modalBreakpoint = 768,
  maxWidth = 'max-w-3xl',
  panelClassName = '',
  noPanelPadding = false,
  zIndex = 'z-[55]',
  visible = true,
  triggerPortalId,
  onStateChange,
  expandRef,
}: PeekSheetProps) {
  const [mode, setMode] = useState<SheetMode>('sheet');
  const [state, setState] = useState<SheetState>('peek');

  // Detect viewport mode
  useEffect(() => {
    const checkMode = () => {
      setMode(window.innerWidth >= modalBreakpoint ? 'modal' : 'sheet');
    };
    checkMode();
    window.addEventListener('resize', checkMode);
    return () => window.removeEventListener('resize', checkMode);
  }, [modalBreakpoint]);

  const expand = useCallback(() => {
    setState('expanded');
    onStateChange?.('expanded');
  }, [onStateChange]);

  // Expose expand to parent via ref
  useEffect(() => {
    if (expandRef) expandRef.current = expand;
    return () => {
      if (expandRef) expandRef.current = null;
    };
  }, [expandRef, expand]);

  const collapse = useCallback(() => {
    setState('peek');
    onStateChange?.('peek');
  }, [onStateChange]);

  if (mode === 'sheet') {
    return (
      <MobileSheet
        renderTrigger={renderTrigger}
        header={header}
        maxHeight={maxHeight}
        panelClassName={panelClassName}
        noPanelPadding={noPanelPadding}
        zIndex={zIndex}
        visible={visible}
        state={state}
        onExpand={expand}
        onCollapse={collapse}
      >
        {children}
      </MobileSheet>
    );
  }

  return (
    <DesktopModal
      renderTrigger={renderTrigger}
      header={header}
      maxWidth={maxWidth}
      panelClassName={panelClassName}
      noPanelPadding={noPanelPadding}
      visible={visible}
      triggerPortalId={triggerPortalId}
      state={state}
      onExpand={expand}
      onCollapse={collapse}
    >
      {children}
    </DesktopModal>
  );
}
