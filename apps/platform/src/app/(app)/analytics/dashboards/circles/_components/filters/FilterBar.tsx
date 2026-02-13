'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import { PeekSheet, type PeekSheetTriggerContext } from '@church/nextjs-ui/peek-sheet';
import { useRegisterPageActions } from '@church/nextjs-ui/page-actions';
import { AnimatePresence, motion } from 'framer-motion';
import { useTabReady } from '../TabReadyProvider';
import type { FilterConfig } from '../../_data/types';

const BRAND_GRADIENT = 'var(--brand-gradient)';

interface FilterBarProps {
  filterConfigs: FilterConfig[];
  filters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onReset: () => void;
}

// Peek trigger — FAB on mobile, round action button on desktop
function FilterPeekTrigger({
  activeCount,
  onTap,
  mode,
}: {
  activeCount: number;
  onTap: () => void;
  mode: PeekSheetTriggerContext['mode'];
}) {
  if (mode === 'modal') {
    // Desktop: round brand action button (PageActionButton primary style)
    return (
      <div className="relative">
        <button
          onClick={onTap}
          aria-label="Filters"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all hover:shadow-md"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 shadow ring-2 ring-white"
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile: gradient FAB in the peek bar
  return (
    <div className="flex items-center justify-center py-2">
      <motion.button
        onClick={onTap}
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: BRAND_GRADIENT }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <SlidersHorizontal className="h-6 w-6 text-white" />

        <AnimatePresence>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-900 shadow"
            >
              {activeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

// Header component for the filter sheet
function FilterSheetHeader({ activeCount, onReset }: { activeCount: number; onReset: () => void }) {
  return (
    <div
      className="relative overflow-hidden px-4 pt-3 pb-6 md:px-8 md:pt-6 md:pb-8"
      style={{ background: BRAND_GRADIENT }}
    >
      {/* Sliders icon watermark */}
      <div className="pointer-events-none absolute right-2 bottom-2 md:top-1/2 md:-right-4 md:bottom-auto md:-translate-y-1/2">
        <SlidersHorizontal className="h-28 w-28 text-white opacity-10 md:h-40 md:w-40" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-bold tracking-wider text-white/70 uppercase">Chart</p>
          <h2 className="text-xl font-bold tracking-wider text-white uppercase md:text-2xl">
            FILTERS
          </h2>
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

// Filter toggle button component (rectangular, not round)
function FilterToggle({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
      }`}
    >
      {isSelected && <Check className="h-4 w-4" />}
      {label}
    </button>
  );
}

// Filter section component
function FilterSection({
  config,
  selected,
  onChange,
}: {
  config: FilterConfig;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const allValues = config.options.map((o) => o.value);
  const allSelected = selected.length === 0 || selected.length === allValues.length;

  function toggleOption(value: string) {
    let next: string[];
    if (selected.includes(value)) {
      next = selected.filter((v) => v !== value);
      if (next.length === 0) next = [];
    } else {
      next = [...selected, value];
      if (next.length === allValues.length) next = [];
    }
    onChange(next);
  }

  function selectAll() {
    onChange([]);
  }

  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        {config.label}
      </h3>
      <div className="flex flex-wrap gap-2">
        <FilterToggle label="All" isSelected={allSelected} onClick={selectAll} />
        {config.options.map((opt) => {
          const isSelected = !allSelected && selected.includes(opt.value);
          return (
            <FilterToggle
              key={opt.value}
              label={opt.label}
              isSelected={isSelected}
              onClick={() => toggleOption(opt.value)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Main filter content
function FilterContent({
  filterConfigs,
  filters,
  onFilterChange,
}: {
  filterConfigs: FilterConfig[];
  filters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
}) {
  return (
    <div className="bg-card space-y-6 p-6">
      {/* Filter sections */}
      {filterConfigs.map((config) => (
        <FilterSection
          key={config.key}
          config={config}
          selected={filters[config.key] ?? []}
          onChange={(values) => onFilterChange(config.key, values)}
        />
      ))}
    </div>
  );
}

export default function FilterBar({
  filterConfigs,
  filters,
  onFilterChange,
  onReset,
}: FilterBarProps) {
  const { activeTab } = useTabReady();
  const expandRef = useRef<(() => void) | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Count active filters
  const activeFilterCount = Object.values(filters).reduce(
    (count, values) => count + (values.length > 0 ? 1 : 0),
    0
  );

  // On mobile, register filter as a page action so it appears in the unified pill.
  // On desktop, PeekSheet's own trigger portals into the SectionHeader as before.
  const isOnCurrentTab = activeTab === 'current';
  const filterAction = useMemo(
    () =>
      isMobile
        ? [
            {
              key: 'filters',
              icon: SlidersHorizontal,
              label: 'Filters',
              variant: 'primary' as const,
              lifecycle: 'dynamic' as const,
              visible: isOnCurrentTab,
              badge: activeFilterCount || undefined,
              onAction: () => expandRef.current?.(),
            },
          ]
        : [],
    [isMobile, isOnCurrentTab, activeFilterCount]
  );
  useRegisterPageActions(filterAction);

  return (
    <PeekSheet
      panelClassName="bg-card overflow-hidden"
      noPanelPadding
      maxWidth="max-w-3xl"
      visible={isMobile ? false : isOnCurrentTab}
      triggerPortalId="circles-filter-actions"
      expandRef={expandRef}
      renderTrigger={({ expand, mode }) => (
        <FilterPeekTrigger activeCount={activeFilterCount} onTap={expand} mode={mode} />
      )}
      header={() => <FilterSheetHeader activeCount={activeFilterCount} onReset={onReset} />}
    >
      <FilterContent
        filterConfigs={filterConfigs}
        filters={filters}
        onFilterChange={onFilterChange}
      />
    </PeekSheet>
  );
}
