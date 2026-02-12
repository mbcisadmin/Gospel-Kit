'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartEvent, ActiveElement } from 'chart.js';
import './chart-setup';
import { centerTextPlugin } from './plugins/center-text';
import { segmentLabelsPlugin } from './plugins/segment-labels';
import { CIRCLE_DOUGHNUT_COLORS, CIRCLE_DOUGHNUT_COLORS_DARK } from '../../_data/constants';
import { createDoughnutExternalTooltip } from './chart-utils';
import type { LegendItem, FilterConfig } from '../../_data/types';
import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';

const ICONS = [Globe, Users, Church, HeartHandshake, Star];

interface DistributionDoughnutProps {
  data: number[];
  labels: string[];
  legendItems: LegendItem[];
  filterConfig?: FilterConfig;
  selectedValues?: string[];
  onLegendClick?: (value: string) => void;
  compact?: boolean;
  hideLegend?: boolean;
}

interface LegendCardProps {
  item: LegendItem;
  index: number;
  isActive: boolean;
  hasActiveFilters: boolean;
  onClick?: () => void;
}

function LegendCard({
  item,
  index,
  isActive,
  hasActiveFilters,
  onClick,
  isDark,
  bgColor,
}: LegendCardProps & { isDark: boolean; bgColor: string }) {
  const Icon = ICONS[index];
  const textColor = isDark ? '#e0e0e0' : item.textColor || '#ffffff';
  const subColor = isDark
    ? 'rgba(224,224,224,0.75)'
    : item.textColor
      ? `${item.textColor}99`
      : 'rgba(255,255,255,0.75)';
  // Background icon colors that match the circle progression
  const bgIconColorsDark = ['#142a40', '#1e3c5a', '#2a5a80', '#3a7ab0', '#4a9ad0'];
  const bgIconColorsLight = ['#0d47a1', '#0d47a1', '#0a3d7a', '#0a3d7a', '#0a3d7a'];
  const bgIconColor = isDark ? bgIconColorsDark[index] : bgIconColorsLight[index];

  // Mute non-active items when there are active filters
  const isMuted = hasActiveFilters && !isActive;

  return (
    <div
      className={`relative flex h-16 flex-col overflow-hidden p-2 transition-all md:h-28 md:p-4 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''
      }`}
      style={{
        backgroundColor: bgColor,
        opacity: isMuted ? 0.4 : 1,
        filter: isMuted ? 'grayscale(40%)' : 'none',
      }}
      onClick={onClick}
    >
      {Icon && (
        <Icon
          className="absolute right-0 bottom-0 h-8 w-8 opacity-20 md:-right-2 md:-bottom-2 md:h-16 md:w-16"
          style={{ color: bgIconColor }}
        />
      )}
      <div
        className="text-[8px] font-bold tracking-wide uppercase md:text-xs"
        style={{ color: textColor, opacity: isDark ? 0.9 : index < 2 ? 0.7 : 0.9 }}
      >
        {item.label}
      </div>
      <div>
        <div className="text-sm font-bold md:text-2xl" style={{ color: textColor }}>
          {item.count}
        </div>
        <div className="hidden text-sm md:block" style={{ color: subColor }}>
          {item.percent}
        </div>
      </div>
    </div>
  );
}

export default function DistributionDoughnut({
  data: distributionData,
  labels: distributionLabels,
  legendItems,
  filterConfig,
  selectedValues = [],
  onLegendClick,
  compact = false,
  hideLegend = false,
}: DistributionDoughnutProps) {
  const total = useMemo(() => distributionData.reduce((a, b) => a + b, 0), [distributionData]);

  // Detect mobile to disable tooltips (legend cards show the data instead)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track dark mode to force chart re-render when theme changes
  // (center text plugin reads color from CSS, but chart doesn't auto-update)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Build a map from label to filter value
  const labelToValue = useMemo(() => {
    if (!filterConfig) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const opt of filterConfig.options) {
      map.set(opt.label, opt.value);
    }
    return map;
  }, [filterConfig]);

  // Build a set of selected labels for quick lookup
  const selectedLabels = useMemo(() => {
    if (!filterConfig) return new Set<string>();
    const set = new Set<string>();
    for (const opt of filterConfig.options) {
      if (selectedValues.includes(opt.value)) {
        set.add(opt.label);
      }
    }
    return set;
  }, [filterConfig, selectedValues]);

  const hasActiveFilters = selectedValues.length > 0;

  const chartColors = isDark ? CIRCLE_DOUGHNUT_COLORS_DARK : CIRCLE_DOUGHNUT_COLORS;

  const data = {
    labels: distributionLabels,
    datasets: [
      {
        data: distributionData,
        backgroundColor: chartColors,
        borderColor: isDark ? '#1a1a1a' : '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 30 },
      plugins: {
        legend: { display: false },
        // Disable tooltips on mobile - legend cards show the data
        tooltip: isMobile
          ? { enabled: false }
          : createDoughnutExternalTooltip('distribution-tooltip', total, chartColors),
      },
    }),
    [isMobile, total, chartColors]
  );

  function handleLegendClick(label: string) {
    if (!onLegendClick || !filterConfig) return;
    const value = labelToValue.get(label);
    if (value) {
      onLegendClick(value);
    }
  }

  // Handle click on chart segment
  const handleChartClick = useCallback(
    (_event: ChartEvent, elements: ActiveElement[]) => {
      if (!onLegendClick || !filterConfig || elements.length === 0) return;
      const index = elements[0].index;
      const label = distributionLabels[index];
      if (label) {
        handleLegendClick(label);
      }
    },
    [onLegendClick, filterConfig, distributionLabels, handleLegendClick]
  );

  const chartOptions = useMemo(
    () => ({
      ...options,
      onClick: !compact && onLegendClick ? handleChartClick : undefined,
      onHover:
        !compact && onLegendClick
          ? (event: ChartEvent) => {
              const canvas = event.native?.target as HTMLCanvasElement | undefined;
              if (canvas) {
                canvas.style.cursor = 'pointer';
              }
            }
          : undefined,
      ...(compact ? { plugins: { ...options.plugins, tooltip: { enabled: false } } } : {}),
    }),
    [options, onLegendClick, handleChartClick, compact]
  );

  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1">
          <Doughnut
            key={isDark ? 'dark' : 'light'}
            data={data}
            options={chartOptions}
            plugins={[centerTextPlugin, segmentLabelsPlugin]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`text-card-foreground flex flex-col ${hideLegend ? 'h-full' : 'mb-8 md:mb-0'}`}>
      <h3 className="mb-4 hidden text-lg font-bold tracking-tight uppercase md:block">
        Distribution
      </h3>
      <div className={hideLegend ? 'min-h-0 flex-1' : 'min-h-[300px] md:min-h-0 md:flex-1'}>
        <Doughnut
          key={isDark ? 'dark' : 'light'}
          data={data}
          options={chartOptions}
          plugins={[centerTextPlugin, segmentLabelsPlugin]}
        />
      </div>
      {/* Mobile: horizontal scroll with fade indicator */}
      {!hideLegend && (
        <div className="relative -mx-4 pt-4 md:hidden">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto px-4">
            {legendItems.map((item, i) => {
              const Icon = ICONS[i];
              const textColor = isDark ? '#e0e0e0' : item.textColor || '#ffffff';
              // Background icon colors that match the circle progression
              const mobileBgIconColorsDark = [
                '#142a40',
                '#1e3c5a',
                '#2a5a80',
                '#3a7ab0',
                '#4a9ad0',
              ];
              const mobileBgIconColorsLight = [
                '#0d47a1',
                '#0d47a1',
                '#0a3d7a',
                '#0a3d7a',
                '#0a3d7a',
              ];
              const bgIconColor = isDark ? mobileBgIconColorsDark[i] : mobileBgIconColorsLight[i];
              const isActive = selectedLabels.has(item.label);
              const isMuted = hasActiveFilters && !isActive;

              return (
                <div
                  key={item.label}
                  className={`relative flex flex-col overflow-hidden p-2 transition-all ${
                    onLegendClick ? 'cursor-pointer hover:shadow-md' : ''
                  }`}
                  style={{
                    minWidth: 100,
                    flexShrink: 0,
                    backgroundColor: chartColors[i],
                    opacity: isMuted ? 0.4 : 1,
                    filter: isMuted ? 'grayscale(40%)' : 'none',
                  }}
                  onClick={onLegendClick ? () => handleLegendClick(item.label) : undefined}
                >
                  {Icon && (
                    <Icon
                      className="absolute right-0 bottom-0 h-8 w-8 opacity-20"
                      style={{ color: bgIconColor }}
                    />
                  )}
                  <div
                    className="text-[9px] font-bold tracking-wide uppercase"
                    style={{ color: textColor, opacity: isDark ? 0.9 : i < 2 ? 0.7 : 0.9 }}
                  >
                    {item.label}
                  </div>
                  <div className="text-sm font-bold" style={{ color: textColor }}>
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Fade gradient to indicate more content */}
          <div className="from-background pointer-events-none absolute top-4 right-0 bottom-0 w-8 bg-gradient-to-l to-transparent" />
        </div>
      )}

      {/* Desktop: grid */}
      {!hideLegend && (
        <div className="mt-auto hidden grid-cols-5 gap-3 pt-4 md:grid">
          {legendItems.map((item, i) => (
            <LegendCard
              key={item.label}
              item={item}
              index={i}
              isActive={selectedLabels.has(item.label)}
              hasActiveFilters={hasActiveFilters}
              onClick={onLegendClick ? () => handleLegendClick(item.label) : undefined}
              isDark={isDark}
              bgColor={chartColors[i]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
