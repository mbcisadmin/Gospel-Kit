'use client';

import { useState, useCallback, useMemo } from 'react';
import FilterBar from '../filters/FilterBar';
import DistributionDoughnut from '../charts/DistributionDoughnut';
import MultiModeBarChart from '../charts/MultiModeBarChart';
import ChartCard from '../charts/ChartCard';
import FullscreenChartOverlay from '../charts/FullscreenChartOverlay';
import { getLuminance } from '../charts/chart-utils';
import type {
  FilterConfig,
  ParticipantRow,
  LegendItem,
  ViewMode,
  BarChartData,
} from '../../_data/types';

type MobileChart = 'distribution' | 'engagement' | 'participants' | 'demographics';

const MOBILE_CHART_OPTIONS: { value: MobileChart; label: string }[] = [
  { value: 'distribution', label: 'Distribution' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'participants', label: 'Participants' },
  { value: 'demographics', label: 'Household' },
];

const VIEW_MODE_ITEMS = [
  { id: 'stacked', label: 'Stacked' },
  { id: 'percent', label: '100%' },
  { id: 'grouped', label: 'Grouped' },
  { id: 'matrix', label: 'Matrix' },
];

// --- Chart structure constants ---

const CIRCLE_LABELS = ['Community', 'Crowd', 'Congregation', 'Committed', 'Core'];

const ENGAGEMENT_CATEGORIES = [
  'Fully Engaged',
  'Partially Engaged',
  'Lapsing',
  'Observing',
  'Lapsed',
];
const ENGAGEMENT_COLORS = ['#1d9fd9', '#eab308', '#f97316', '#3b82f6', '#ef4444'];

const PARTICIPANT_CATEGORIES = [
  'Church Family',
  'Attendee',
  'New',
  'MC3 Neighbor',
  'Non-Attending/Other',
  'Dropped',
];
const PARTICIPANT_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

const DEMOGRAPHICS_CATEGORIES = [
  'Head of Household',
  'Minor Child',
  'Other Adult',
  'Adult Child',
  'Guest Child',
  'Company',
];
const DEMOGRAPHICS_COLORS = ['#f97316', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80'];

const DISTRIBUTION_COLORS = ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#1d9fd9'];
const DISTRIBUTION_TEXT_COLORS = ['#252525', '#252525', '#252525', undefined, undefined];
const DISTRIBUTION_ICONS = ['Globe', 'Users', 'Church', 'HeartHandshake', 'Star'];

// Demographics legend text colors (lighter colors need dark text)
const DEMOGRAPHICS_TEXT_COLORS: (string | undefined)[] = [
  undefined,
  undefined,
  '#252525',
  '#252525',
  '#252525',
  '#252525',
];

// Label abbreviations for compact legend
const LABEL_ABBREVIATIONS: Record<string, string> = {
  'Fully Engaged': 'Fully',
  'Partially Engaged': 'Partial',
  'Head of Household': 'HoH',
  'Non-Attending/Other': 'Other',
  'Minor Child': 'Minor',
  'Other Adult': 'Other',
  'Adult Child': 'Adult',
  'Guest Child': 'Guest',
  'Church Family': 'Family',
  'MC3 Neighbor': 'MC3',
};

// Filter key → ParticipantRow field mapping
const FILTER_FIELD_MAP: Record<string, keyof ParticipantRow> = {
  circle: 'Circle',
  engagement: 'Engagement_Level',
  campus: 'Congregation_Name',
  participantType: 'Participant_Type',
  householdPosition: 'Household_Position',
  maritalStatus: 'Marital_Status',
  gender: 'Gender',
};

// Static circle filter config (not from API)
const CIRCLE_FILTER_CONFIG: FilterConfig = {
  key: 'circle',
  label: 'Circle',
  defaultLabel: 'All Circles',
  pluralLabel: 'Circles',
  options: CIRCLE_LABELS.map((label) => ({
    value: label,
    label,
  })),
};

function buildLegend(
  categories: string[],
  colors: string[],
  counts: number[],
  total: number,
  textColors?: (string | undefined)[]
): LegendItem[] {
  return categories.map((cat, i) => ({
    label: cat,
    count: counts[i].toLocaleString(),
    percent: total > 0 ? `${((counts[i] / total) * 100).toFixed(1)}%` : '0.0%',
    color: colors[i],
    ...(textColors?.[i] ? { textColor: textColors[i] } : {}),
  }));
}

function buildBarChartData(
  circleLabels: string[],
  categories: string[],
  colors: string[],
  countMap: Map<string, Map<string, number>>
): BarChartData {
  return {
    labels: circleLabels,
    categories,
    colors,
    values: categories.map((cat) =>
      circleLabels.map((circle) => countMap.get(circle)?.get(cat) ?? 0)
    ),
  };
}

// Compact legend for chart cards
function CompactLegend({ items }: { items: LegendItem[] }) {
  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-3 overflow-hidden"
      style={{ maxHeight: '2.5rem' }}
    >
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground text-[10px]">
            {LABEL_ABBREVIATIONS[item.label] ?? item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

// Sidebar legend for fullscreen overlay (wrapping, with counts)
function SidebarLegend({
  items,
  onItemClick,
  selectedValues = [],
  filterConfig,
}: {
  items: LegendItem[];
  onItemClick?: (value: string) => void;
  selectedValues?: string[];
  filterConfig?: FilterConfig;
}) {
  const hasActive = selectedValues.length > 0;
  const selectedLabels = new Set(
    filterConfig?.options.filter((o) => selectedValues.includes(o.value)).map((o) => o.label) ?? []
  );

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = selectedLabels.has(item.label);
        const isMuted = hasActive && !isActive;
        const textColor =
          item.textColor || (getLuminance(item.color) > 0.6 ? '#252525' : '#ffffff');

        return (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded px-2 py-1.5 transition-all ${
              onItemClick ? 'cursor-pointer active:scale-[0.97]' : ''
            }`}
            style={{
              backgroundColor: item.color,
              opacity: isMuted ? 0.4 : 1,
              filter: isMuted ? 'grayscale(40%)' : 'none',
            }}
            onClick={
              onItemClick && filterConfig
                ? () => {
                    const val = filterConfig.options.find((o) => o.label === item.label)?.value;
                    if (val) onItemClick(val);
                  }
                : undefined
            }
          >
            <div className="flex-1">
              <div
                className="text-[9px] leading-tight font-bold tracking-wide uppercase"
                style={{ color: textColor, opacity: 0.9 }}
              >
                {item.label}
              </div>
            </div>
            <div className="text-xs font-bold" style={{ color: textColor }}>
              {item.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CurrentTabProps {
  filterConfigs: FilterConfig[];
  participants: ParticipantRow[];
}

export default function CurrentTab({ filterConfigs, participants }: CurrentTabProps) {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [mobileChart, setMobileChart] = useState<MobileChart>('distribution');
  const [expandedChart, setExpandedChart] = useState<MobileChart | null>(null);

  // View modes for each bar chart (controlled from fullscreen)
  const [engagementViewMode, setEngagementViewMode] = useState<ViewMode>('stacked');
  const [participantsViewMode, setParticipantsViewMode] = useState<ViewMode>('stacked');
  const [demographicsViewMode, setDemographicsViewMode] = useState<ViewMode>('stacked');

  // Prepend circle filter to the API-provided filters
  const allFilterConfigs = useMemo(() => [CIRCLE_FILTER_CONFIG, ...filterConfigs], [filterConfigs]);

  const handleFilterChange = useCallback((key: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
  }, []);

  // Toggle a single filter value (add if not present, remove if present)
  const toggleFilterValue = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValues };
    });
  }, []);

  // Get filter config by key for passing to charts
  const getFilterConfig = useCallback(
    (key: string) => allFilterConfigs.find((c) => c.key === key),
    [allFilterConfigs]
  );

  // Build label lookup sets for active filters (filter values are IDs, rows have label strings)
  const activeFilterLabels = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    for (const config of allFilterConfigs) {
      const selectedValues = filters[config.key];
      if (!selectedValues || selectedValues.length === 0) continue;
      const selectedSet = new Set(selectedValues);
      const labels = new Set<string>();
      for (const opt of config.options) {
        if (selectedSet.has(opt.value)) {
          labels.add(opt.label);
        }
      }
      result[config.key] = labels;
    }
    return result;
  }, [filters, allFilterConfigs]);

  // Filter + aggregate in a single pass
  const {
    distributionData,
    distributionLegend,
    engagementData,
    engagementLegend,
    participantData,
    participantLegend,
    demographicsData,
    demographicsLegend,
  } = useMemo(() => {
    // Distribution counts per circle
    const circleCounts = new Map<string, number>();
    for (const label of CIRCLE_LABELS) circleCounts.set(label, 0);

    // Engagement: circle × engagement level
    const engagementCounts = new Map<string, Map<string, number>>();
    for (const circle of CIRCLE_LABELS) {
      const m = new Map<string, number>();
      for (const cat of ENGAGEMENT_CATEGORIES) m.set(cat, 0);
      engagementCounts.set(circle, m);
    }

    // Participants: circle × participant type
    const participantCounts = new Map<string, Map<string, number>>();
    for (const circle of CIRCLE_LABELS) {
      const m = new Map<string, number>();
      for (const cat of PARTICIPANT_CATEGORIES) m.set(cat, 0);
      participantCounts.set(circle, m);
    }

    // Demographics: circle × household position
    const demographicsCounts = new Map<string, Map<string, number>>();
    for (const circle of CIRCLE_LABELS) {
      const m = new Map<string, number>();
      for (const cat of DEMOGRAPHICS_CATEGORIES) m.set(cat, 0);
      demographicsCounts.set(circle, m);
    }

    for (const row of participants) {
      // Apply filters (AND logic across dimensions)
      let pass = true;
      for (const [filterKey, labelSet] of Object.entries(activeFilterLabels)) {
        const field = FILTER_FIELD_MAP[filterKey];
        if (!field) continue;
        const val = row[field];
        if (val == null || !labelSet.has(val)) {
          pass = false;
          break;
        }
      }
      if (!pass) continue;

      const circle = row.Circle;
      if (!circleCounts.has(circle)) continue;

      // Distribution
      circleCounts.set(circle, circleCounts.get(circle)! + 1);

      // Engagement
      const engLevel = row.Engagement_Level;
      if (engagementCounts.get(circle)?.has(engLevel)) {
        const m = engagementCounts.get(circle)!;
        m.set(engLevel, m.get(engLevel)! + 1);
      }

      // Participant type
      const pType = row.Participant_Type ?? '';
      if (participantCounts.get(circle)?.has(pType)) {
        const m = participantCounts.get(circle)!;
        m.set(pType, m.get(pType)! + 1);
      }

      // Demographics (household position)
      const hPos = row.Household_Position ?? '';
      if (demographicsCounts.get(circle)?.has(hPos)) {
        const m = demographicsCounts.get(circle)!;
        m.set(hPos, m.get(hPos)! + 1);
      }
    }

    // Distribution
    const distData = CIRCLE_LABELS.map((c) => circleCounts.get(c) ?? 0);
    const distTotal = distData.reduce((a, b) => a + b, 0);
    const distLegend: LegendItem[] = CIRCLE_LABELS.map((label, i) => ({
      label,
      count: distData[i].toLocaleString(),
      percent: distTotal > 0 ? `${((distData[i] / distTotal) * 100).toFixed(1)}%` : '0.0%',
      color: DISTRIBUTION_COLORS[i],
      ...(DISTRIBUTION_TEXT_COLORS[i] ? { textColor: DISTRIBUTION_TEXT_COLORS[i] } : {}),
      icon: DISTRIBUTION_ICONS[i],
    }));

    // Engagement legend
    const engTotalCounts = ENGAGEMENT_CATEGORIES.map((cat) =>
      CIRCLE_LABELS.reduce((sum, circle) => sum + (engagementCounts.get(circle)?.get(cat) ?? 0), 0)
    );
    const engTotal = engTotalCounts.reduce((a, b) => a + b, 0);

    // Participant legend
    const partTotalCounts = PARTICIPANT_CATEGORIES.map((cat) =>
      CIRCLE_LABELS.reduce((sum, circle) => sum + (participantCounts.get(circle)?.get(cat) ?? 0), 0)
    );
    const partTotal = partTotalCounts.reduce((a, b) => a + b, 0);

    // Demographics legend
    const demoTotalCounts = DEMOGRAPHICS_CATEGORIES.map((cat) =>
      CIRCLE_LABELS.reduce(
        (sum, circle) => sum + (demographicsCounts.get(circle)?.get(cat) ?? 0),
        0
      )
    );
    const demoTotal = demoTotalCounts.reduce((a, b) => a + b, 0);

    return {
      distributionData: distData,
      distributionLegend: distLegend,
      engagementData: buildBarChartData(
        CIRCLE_LABELS,
        ENGAGEMENT_CATEGORIES,
        ENGAGEMENT_COLORS,
        engagementCounts
      ),
      engagementLegend: buildLegend(
        ENGAGEMENT_CATEGORIES,
        ENGAGEMENT_COLORS,
        engTotalCounts,
        engTotal
      ),
      participantData: buildBarChartData(
        CIRCLE_LABELS,
        PARTICIPANT_CATEGORIES,
        PARTICIPANT_COLORS,
        participantCounts
      ),
      participantLegend: buildLegend(
        PARTICIPANT_CATEGORIES,
        PARTICIPANT_COLORS,
        partTotalCounts,
        partTotal
      ),
      demographicsData: buildBarChartData(
        CIRCLE_LABELS,
        DEMOGRAPHICS_CATEGORIES,
        DEMOGRAPHICS_COLORS,
        demographicsCounts
      ),
      demographicsLegend: buildLegend(
        DEMOGRAPHICS_CATEGORIES,
        DEMOGRAPHICS_COLORS,
        demoTotalCounts,
        demoTotal,
        DEMOGRAPHICS_TEXT_COLORS
      ),
    };
  }, [participants, activeFilterLabels]);

  // Chart config lookup for fullscreen overlay
  const chartConfigs: Record<
    MobileChart,
    {
      title: string;
      viewMode?: ViewMode;
      onViewModeChange?: (mode: ViewMode) => void;
      legendItems: LegendItem[];
      filterKey?: string;
    }
  > = {
    distribution: {
      title: 'Distribution',
      legendItems: distributionLegend,
      filterKey: 'circle',
    },
    engagement: {
      title: 'Engagement',
      viewMode: engagementViewMode,
      onViewModeChange: setEngagementViewMode,
      legendItems: engagementLegend,
      filterKey: 'engagement',
    },
    participants: {
      title: 'Participants',
      viewMode: participantsViewMode,
      onViewModeChange: setParticipantsViewMode,
      legendItems: participantLegend,
      filterKey: 'participantType',
    },
    demographics: {
      title: 'Household Position',
      viewMode: demographicsViewMode,
      onViewModeChange: setDemographicsViewMode,
      legendItems: demographicsLegend,
      filterKey: 'householdPosition',
    },
  };

  // Render full-size chart for the fullscreen overlay
  function renderFullscreenChart(chart: MobileChart) {
    switch (chart) {
      case 'distribution':
        return (
          <DistributionDoughnut
            data={distributionData}
            labels={CIRCLE_LABELS}
            legendItems={distributionLegend}
            filterConfig={CIRCLE_FILTER_CONFIG}
            selectedValues={filters.circle ?? []}
            onLegendClick={(value) => toggleFilterValue('circle', value)}
            hideLegend
          />
        );
      case 'engagement':
        return (
          <MultiModeBarChart
            title="Engagement"
            chartId="engagement-fullscreen"
            chartData={engagementData}
            legendItems={engagementLegend}
            colorMode="blue"
            filterConfig={getFilterConfig('engagement')}
            selectedValues={filters.engagement ?? []}
            onLegendClick={(value) => toggleFilterValue('engagement', value)}
            viewMode={engagementViewMode}
            onViewModeChange={setEngagementViewMode}
            hideViewModeSelector
            hideLegend
          />
        );
      case 'participants':
        return (
          <MultiModeBarChart
            title="Participants"
            chartId="participant-fullscreen"
            chartData={participantData}
            legendItems={participantLegend}
            colorMode="blue"
            filterConfig={getFilterConfig('participantType')}
            selectedValues={filters.participantType ?? []}
            onLegendClick={(value) => toggleFilterValue('participantType', value)}
            viewMode={participantsViewMode}
            onViewModeChange={setParticipantsViewMode}
            hideViewModeSelector
            hideLegend
          />
        );
      case 'demographics':
        return (
          <MultiModeBarChart
            title="Household Position"
            chartId="demographics-fullscreen"
            chartData={demographicsData}
            legendItems={demographicsLegend}
            colorMode="orange"
            filterConfig={getFilterConfig('householdPosition')}
            selectedValues={filters.householdPosition ?? []}
            onLegendClick={(value) => toggleFilterValue('householdPosition', value)}
            viewMode={demographicsViewMode}
            onViewModeChange={setDemographicsViewMode}
            hideViewModeSelector
            hideLegend
          />
        );
    }
  }

  const expandedConfig = expandedChart ? chartConfigs[expandedChart] : null;

  return (
    <div>
      <FilterBar
        filterConfigs={allFilterConfigs}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Mobile: Chart selector tabs + Chart cards */}
      <div className="relative mt-4 space-y-4 pb-20 md:hidden">
        {/* Chart selector tabs */}
        <div className="border-border flex border-b">
          {MOBILE_CHART_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMobileChart(opt.value)}
              className={`flex-1 pb-2 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
                mobileChart === opt.value
                  ? 'text-foreground border-primary border-b-2'
                  : 'text-muted-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Active chart in a card */}
        {mobileChart === 'distribution' && (
          <div>
            <ChartCard title="Distribution" onExpand={() => setExpandedChart('distribution')}>
              <DistributionDoughnut
                data={distributionData}
                labels={CIRCLE_LABELS}
                legendItems={distributionLegend}
                compact
              />
            </ChartCard>
            <CompactLegend items={distributionLegend} />
          </div>
        )}
        {mobileChart === 'engagement' && (
          <div>
            <ChartCard title="Engagement" onExpand={() => setExpandedChart('engagement')}>
              <MultiModeBarChart
                title="Engagement"
                chartId="engagement-compact"
                chartData={engagementData}
                legendItems={engagementLegend}
                colorMode="blue"
                compact
                viewMode={engagementViewMode}
              />
            </ChartCard>
            <CompactLegend items={engagementLegend} />
          </div>
        )}
        {mobileChart === 'participants' && (
          <div>
            <ChartCard title="Participants" onExpand={() => setExpandedChart('participants')}>
              <MultiModeBarChart
                title="Participants"
                chartId="participant-compact"
                chartData={participantData}
                legendItems={participantLegend}
                colorMode="blue"
                compact
                viewMode={participantsViewMode}
              />
            </ChartCard>
            <CompactLegend items={participantLegend} />
          </div>
        )}
        {mobileChart === 'demographics' && (
          <div>
            <ChartCard title="Household Position" onExpand={() => setExpandedChart('demographics')}>
              <MultiModeBarChart
                title="Household Position"
                chartId="demographics-compact"
                chartData={demographicsData}
                legendItems={demographicsLegend}
                colorMode="orange"
                compact
                viewMode={demographicsViewMode}
              />
            </ChartCard>
            <CompactLegend items={demographicsLegend} />
          </div>
        )}
      </div>

      {/* Fullscreen overlay for mobile */}
      <FullscreenChartOverlay
        isOpen={!!expandedChart}
        onClose={() => setExpandedChart(null)}
        title={expandedConfig?.title ?? ''}
        controls={
          expandedChart && expandedChart !== 'distribution' && expandedConfig?.onViewModeChange ? (
            <select
              value={expandedConfig.viewMode ?? 'stacked'}
              onChange={(e) => expandedConfig.onViewModeChange!(e.target.value as ViewMode)}
              className="bg-muted text-foreground border-border w-full rounded-md border px-2 py-1.5 text-xs font-semibold tracking-wide uppercase"
            >
              {VIEW_MODE_ITEMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          ) : undefined
        }
        legend={
          expandedConfig ? (
            <SidebarLegend
              items={expandedConfig.legendItems}
              onItemClick={
                expandedConfig.filterKey
                  ? (value) => toggleFilterValue(expandedConfig.filterKey!, value)
                  : undefined
              }
              selectedValues={
                expandedConfig.filterKey ? (filters[expandedConfig.filterKey] ?? []) : []
              }
              filterConfig={
                expandedConfig.filterKey ? getFilterConfig(expandedConfig.filterKey) : undefined
              }
            />
          ) : undefined
        }
      >
        {expandedChart ? renderFullscreenChart(expandedChart) : null}
      </FullscreenChartOverlay>

      {/* Desktop: Row 1 - Distribution + Engagement */}
      <div className="mt-6 mb-8 hidden grid-cols-2 gap-6 md:grid lg:mt-8 lg:mb-12 lg:gap-16 xl:gap-24">
        <DistributionDoughnut
          data={distributionData}
          labels={CIRCLE_LABELS}
          legendItems={distributionLegend}
          filterConfig={CIRCLE_FILTER_CONFIG}
          selectedValues={filters.circle ?? []}
          onLegendClick={(value) => toggleFilterValue('circle', value)}
        />
        <MultiModeBarChart
          title="Engagement"
          chartId="engagement"
          chartData={engagementData}
          legendItems={engagementLegend}
          colorMode="blue"
          filterConfig={getFilterConfig('engagement')}
          selectedValues={filters.engagement ?? []}
          onLegendClick={(value) => toggleFilterValue('engagement', value)}
        />
      </div>

      {/* Desktop: Row 2 - Participants + Demographics */}
      <div className="hidden grid-cols-2 gap-6 md:grid lg:mt-4 lg:gap-16 xl:gap-24">
        <MultiModeBarChart
          title="Participants"
          chartId="participant"
          chartData={participantData}
          legendItems={participantLegend}
          colorMode="blue"
          filterConfig={getFilterConfig('participantType')}
          selectedValues={filters.participantType ?? []}
          onLegendClick={(value) => toggleFilterValue('participantType', value)}
        />
        <MultiModeBarChart
          title="Household Position"
          chartId="demographics"
          chartData={demographicsData}
          legendItems={demographicsLegend}
          colorMode="orange"
          filterConfig={getFilterConfig('householdPosition')}
          selectedValues={filters.householdPosition ?? []}
          onLegendClick={(value) => toggleFilterValue('householdPosition', value)}
        />
      </div>
    </div>
  );
}
