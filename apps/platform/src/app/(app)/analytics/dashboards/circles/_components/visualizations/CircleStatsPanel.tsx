'use client';

import { Globe, Users, Church, HeartHandshake, Star, ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { CircleName, CircleStats } from '../../_data/types';
import { CIRCLE_STYLES, CIRCLE_STYLES_DARK, CIRCLE_ORDER } from '../../_data/constants';

const ICON_MAP: Record<CircleName, typeof Globe> = {
  community: Globe,
  crowd: Users,
  congregation: Church,
  committed: HeartHandshake,
  core: Star,
};

const BG_ICON_COLORS: Record<CircleName, string> = {
  community: '#0d47a1',
  crowd: '#0d47a1',
  congregation: '#0a3d7a',
  committed: '#0a3d7a',
  core: '#0a3d7a',
};

const BG_ICON_COLORS_DARK: Record<CircleName, string> = {
  community: '#142a40',
  crowd: '#1e3c5a',
  congregation: '#2a5a80',
  committed: '#3a7ab0',
  core: '#4a9ad0',
};

interface CircleStatsPanelProps {
  circleStats: Record<CircleName, CircleStats>;
  onCircleClick: (circle: CircleName | 'overview') => void;
  isLoading?: boolean;
}

// Skeleton for stat values
function StatSkeleton() {
  return <div className="h-5 w-12 animate-pulse rounded bg-white/20" />;
}

export default function CircleStatsPanel({
  circleStats,
  onCircleClick,
  isLoading,
}: CircleStatsPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const styles = isDark ? CIRCLE_STYLES_DARK : CIRCLE_STYLES;
  const bgIconColors = isDark ? BG_ICON_COLORS_DARK : BG_ICON_COLORS;

  return (
    <div className="flex w-full flex-1 flex-col justify-between gap-2 lg:h-full">
      {CIRCLE_ORDER.map((name) => {
        const style = styles[name];
        const stats = circleStats[name];
        const Icon = ICON_MAP[name];

        return (
          <div
            key={name}
            className={`relative flex-1 overflow-hidden transition ${
              isLoading ? 'cursor-default' : 'cursor-pointer hover:shadow-md'
            }`}
            style={{
              background: style.bgGradient,
              border: `2px ${style.borderStyle} ${style.border}`,
            }}
            onClick={() => !isLoading && onCircleClick(name)}
          >
            <Icon
              className="absolute top-1/2 -left-4 h-20 w-20 -translate-y-1/2 opacity-10 md:-left-6 md:h-28 md:w-28"
              style={{ color: bgIconColors[name] }}
            />
            <div className="relative z-10 flex h-full items-center px-3 py-3 md:px-4 md:py-4">
              <div className="flex-1 md:pl-14">
                <div
                  className="text-sm font-bold tracking-wide uppercase md:text-lg"
                  style={{ color: style.textColor }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </div>
              </div>
              <div className="w-14 text-right md:w-20">
                {isLoading ? (
                  <StatSkeleton />
                ) : (
                  <div
                    className="text-sm font-bold md:text-base"
                    style={{ color: style.textColor }}
                  >
                    {stats.total}
                  </div>
                )}
                <div
                  className={`text-[10px] tracking-wide uppercase md:text-xs ${style.labelColor}`}
                >
                  Total
                </div>
              </div>
              <div className="w-12 text-right md:w-20">
                {isLoading ? (
                  <StatSkeleton />
                ) : (
                  <div
                    className="text-sm font-bold md:text-base"
                    style={{ color: style.textColor }}
                  >
                    {stats.newCount}
                  </div>
                )}
                <div
                  className={`text-[10px] tracking-wide uppercase md:text-xs ${style.labelColor}`}
                >
                  New
                </div>
              </div>
              <ChevronRight
                className="ml-1 h-5 w-5 md:hidden"
                style={{ color: style.textColor, opacity: 0.5 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
