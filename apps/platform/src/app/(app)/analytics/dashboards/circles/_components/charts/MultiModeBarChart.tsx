'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import type { Chart, ChartOptions, ChartEvent, ActiveElement } from 'chart.js';
import './chart-setup';
import { circleTopPlugin } from './plugins/circle-top';
import MatrixHeatmap from './MatrixHeatmap';
import { useIsMobile } from './useIsMobile';
import type { BarChartData, ViewMode, LegendItem, FilterConfig } from '../../_data/types';
import { getLuminance, createBarExternalTooltip } from './chart-utils';

declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends import('chart.js').ChartType> {
    circleTop?: { enabled: boolean };
  }
}

interface MultiModeBarChartProps {
  title: string;
  chartId: string;
  chartData: BarChartData;
  legendItems: LegendItem[];
  colorMode?: 'blue' | 'orange';
  filterConfig?: FilterConfig;
  selectedValues?: string[];
  onLegendClick?: (value: string) => void;
  compact?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  hideViewModeSelector?: boolean;
  hideLegend?: boolean;
}

const VIEW_MODE_ICONS: { mode: ViewMode; title: string; svg: string }[] = [
  {
    mode: 'stacked',
    title: 'Stacked Bar',
    svg: '<rect x="3" y="3" width="6" height="18"/><rect x="9" y="8" width="6" height="13"/><rect x="15" y="12" width="6" height="9"/>',
  },
  {
    mode: 'percent',
    title: '100% Stacked',
    svg: '<rect x="3" y="3" width="6" height="18"/><rect x="9" y="3" width="6" height="18"/><rect x="15" y="3" width="6" height="18"/>',
  },
  {
    mode: 'grouped',
    title: 'Grouped Bar',
    svg: '<rect x="2" y="6" width="3" height="15"/><rect x="6" y="10" width="3" height="11"/><rect x="10" y="8" width="3" height="13"/><rect x="14" y="4" width="3" height="17"/><rect x="18" y="12" width="3" height="9"/>',
  },
  {
    mode: 'matrix',
    title: 'Matrix Heatmap',
    svg: '<rect x="3" y="3" width="5" height="5"/><rect x="9" y="3" width="5" height="5"/><rect x="15" y="3" width="5" height="5"/><rect x="3" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/><rect x="15" y="9" width="5" height="5"/><rect x="3" y="15" width="5" height="5"/><rect x="9" y="15" width="5" height="5"/><rect x="15" y="15" width="5" height="5"/>',
  },
];

export default function MultiModeBarChart({
  title,
  chartId,
  chartData,
  legendItems,
  colorMode = 'blue',
  filterConfig,
  selectedValues = [],
  onLegendClick,
  compact = false,
  viewMode: controlledViewMode,
  onViewModeChange,
  hideViewModeSelector = false,
  hideLegend = false,
}: MultiModeBarChartProps) {
  const isMobile = useIsMobile();
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('stacked');
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  function handleLegendClick(label: string) {
    if (!onLegendClick || !filterConfig) return;
    const value = labelToValue.get(label);
    if (value) {
      onLegendClick(value);
    }
  }

  // Handle click on chart bar segment
  const handleChartClick = useCallback(
    (_event: ChartEvent, elements: ActiveElement[]) => {
      if (!onLegendClick || !filterConfig || elements.length === 0) return;
      // datasetIndex tells us which category (e.g., "Fully Engaged") was clicked
      const datasetIndex = elements[0].datasetIndex;
      const categoryLabel = chartData.categories[datasetIndex];
      if (categoryLabel) {
        handleLegendClick(categoryLabel);
      }
    },
    [onLegendClick, filterConfig, chartData.categories, handleLegendClick]
  );

  // Clean up plugin-created circle icons when view mode changes
  useEffect(() => {
    if (chartContainerRef.current) {
      chartContainerRef.current.querySelectorAll('.chart-circle-icon').forEach((el) => el.remove());
    }
  }, [viewMode]);

  const isStacked = viewMode === 'stacked' || viewMode === 'percent';

  const barData = useMemo(() => {
    if (viewMode === 'matrix') return null;

    if (viewMode === 'percent') {
      const totals = chartData.labels.map((_, colIdx) =>
        chartData.values.reduce((sum, row) => sum + row[colIdx], 0)
      );
      return {
        labels: chartData.labels,
        datasets: chartData.categories.map((cat, i) => ({
          label: cat,
          data: chartData.values[i].map((val, colIdx) =>
            totals[colIdx] > 0 ? (val / totals[colIdx]) * 100 : 0
          ),
          backgroundColor: chartData.colors[i],
        })),
      };
    }

    return {
      labels: chartData.labels,
      datasets: chartData.categories.map((cat, i) => ({
        label: cat,
        data: chartData.values[i],
        backgroundColor: chartData.colors[i],
      })),
    };
  }, [viewMode, chartData]);

  const barOptions = useMemo((): ChartOptions<'bar'> => {
    const isPercent = viewMode === 'percent';
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: viewMode === 'grouped' ? 40 : 35 } },
      animation: {
        onComplete(this: Chart) {
          if (this.canvas.dataset.ready !== '1') {
            this.canvas.dataset.ready = '1';
            this.draw();
          }
        },
      },
      onClick: !compact && onLegendClick ? handleChartClick : undefined,
      onHover:
        !compact && onLegendClick
          ? (event: ChartEvent, elements: ActiveElement[]) => {
              const canvas = event.native?.target as HTMLCanvasElement | undefined;
              if (canvas) {
                canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
              }
            }
          : undefined,
      plugins: {
        legend: { display: false },
        circleTop: { enabled: viewMode !== 'matrix' },
        tooltip:
          compact || isMobile
            ? { enabled: false }
            : createBarExternalTooltip(`${chartId}-tooltip`, isPercent),
      },
      scales: {
        x: {
          stacked: isStacked,
          grid: { display: false },
          ticks: { font: { size: 10 } },
        },
        y: {
          stacked: isStacked,
          ...(isPercent ? { max: 100 } : {}),
          grid: { color: 'rgba(128,128,128,0.12)' },
          ticks: isPercent ? { callback: (v: string | number) => v + '%' } : {},
        },
      },
    };
  }, [viewMode, isStacked, isMobile, onLegendClick, handleChartClick, chartId]);

  // Chart type selector buttons (shared between mobile and desktop positions)
  const chartTypeSelector = (
    <div className="flex w-full gap-0 md:w-auto">
      {VIEW_MODE_ICONS.map(({ mode, title: modeTitle, svg }, i) => (
        <button
          key={mode}
          className={`flex flex-1 items-center justify-center border border-gray-200 p-2 transition-all md:flex-none md:p-1.5 ${
            viewMode === mode
              ? 'border-foreground bg-foreground text-card'
              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          } ${i === 0 ? 'rounded-l' : ''} ${i === VIEW_MODE_ICONS.length - 1 ? 'rounded-r' : ''} ${i > 0 ? '-ml-px' : ''}`}
          onClick={() => setViewMode(mode)}
          title={modeTitle}
        >
          <svg
            className="h-5 w-5 md:h-4 md:w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </button>
      ))}
    </div>
  );

  // Compact mode: chart only, no legend or controls
  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <div
          ref={chartContainerRef}
          className={`flex-1 ${viewMode === 'matrix' ? 'overflow-hidden' : ''}`}
        >
          {viewMode === 'matrix' ? (
            <MatrixHeatmap chartData={chartData} colorMode={colorMode} />
          ) : (
            <Bar
              key={`${chartId}-${viewMode}`}
              data={barData!}
              options={barOptions}
              plugins={[circleTopPlugin]}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`text-card-foreground flex flex-col ${hideLegend ? 'h-full' : 'mb-8 min-h-[420px] md:mb-0 md:min-h-[520px]'}`}
    >
      {/* Desktop: Title and chart type selector at top */}
      <div className="mb-6 hidden items-center justify-between md:flex">
        <h3 className="text-lg font-bold tracking-tight uppercase">{title}</h3>
        {chartTypeSelector}
      </div>

      <div
        ref={chartContainerRef}
        className={`h-56 flex-1 ${viewMode === 'matrix' ? 'overflow-hidden' : ''}`}
      >
        {viewMode === 'matrix' ? (
          <MatrixHeatmap chartData={chartData} colorMode={colorMode} />
        ) : (
          <Bar
            key={`${chartId}-${viewMode}`}
            data={barData!}
            options={barOptions}
            plugins={[circleTopPlugin]}
          />
        )}
      </div>

      {viewMode !== 'matrix' && !hideLegend && (
        <>
          {/* Mobile: horizontal scroll legend */}
          <div className="relative -mx-4 mt-4 md:hidden">
            <div className="scrollbar-hide flex gap-1 overflow-x-auto pl-4">
              {legendItems.map((item) => {
                const textColor =
                  item.textColor || (getLuminance(item.color) > 0.6 ? '#252525' : '#ffffff');

                const isActive = selectedLabels.has(item.label);
                const isMuted = hasActiveFilters && !isActive;
                const isClickable = !!onLegendClick && !!filterConfig;

                return (
                  <div
                    key={item.label}
                    className={`flex flex-col p-2 transition-all ${
                      isClickable ? 'cursor-pointer hover:shadow-md' : ''
                    }`}
                    style={{
                      minWidth: 100,
                      flexShrink: 0,
                      backgroundColor: item.color,
                      opacity: isMuted ? 0.4 : 1,
                      filter: isMuted ? 'grayscale(40%)' : 'none',
                    }}
                    onClick={isClickable ? () => handleLegendClick(item.label) : undefined}
                  >
                    <div
                      className="text-[9px] font-bold tracking-wide uppercase"
                      style={{ color: textColor, opacity: 0.9 }}
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
          </div>

          {/* Desktop: grid */}
          <div
            className="mt-auto hidden gap-2 pt-4 md:grid"
            style={{ gridTemplateColumns: `repeat(${legendItems.length}, 1fr)` }}
          >
            {legendItems.map((item) => {
              const textColor =
                item.textColor || (getLuminance(item.color) > 0.6 ? '#252525' : '#ffffff');
              const subColor = item.textColor
                ? `${item.textColor}99`
                : getLuminance(item.color) > 0.6
                  ? 'rgba(37,37,37,0.6)'
                  : 'rgba(255,255,255,0.75)';

              const isActive = selectedLabels.has(item.label);
              const isMuted = hasActiveFilters && !isActive;
              const isClickable = !!onLegendClick && !!filterConfig;

              return (
                <div
                  key={item.label}
                  className={`flex flex-col p-3 transition-all ${
                    isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : ''
                  }`}
                  style={{
                    backgroundColor: item.color,
                    height: legendItems.length > 5 ? 96 : 112,
                    opacity: isMuted ? 0.4 : 1,
                    filter: isMuted ? 'grayscale(40%)' : 'none',
                  }}
                  onClick={isClickable ? () => handleLegendClick(item.label) : undefined}
                >
                  <div
                    className="text-xs font-bold tracking-wide uppercase"
                    style={{ color: textColor, opacity: 0.9 }}
                  >
                    {item.label}
                  </div>
                  <div className="mt-auto">
                    <div
                      className={
                        legendItems.length > 5 ? 'text-lg font-bold' : 'text-2xl font-bold'
                      }
                      style={{ color: textColor }}
                    >
                      {item.count}
                    </div>
                    <div
                      className={legendItems.length > 5 ? 'text-xs' : 'text-sm'}
                      style={{ color: subColor }}
                    >
                      {item.percent}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile: chart type selector - always visible, below legend */}
      {!hideViewModeSelector && <div className="mt-6 md:hidden">{chartTypeSelector}</div>}
    </div>
  );
}
