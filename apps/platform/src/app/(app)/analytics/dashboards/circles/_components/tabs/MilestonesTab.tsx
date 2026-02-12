'use client';

import { Info, Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { CIRCLE_STYLES, CIRCLE_STYLES_DARK } from '../../_data/constants';
import type { CircleName, MilestoneRow, MilestoneSection } from '../../_data/types';

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

type TextStyles = {
  heading: string;
  th: string;
  firstInCircle: string;
  desc: string;
  border: string;
  rowHover: string;
};

const HEADER_TEXT_STYLES: Record<
  CircleName,
  {
    heading: string;
    th: string;
    firstInCircle: string;
    desc: string;
    border: string;
    rowHover: string;
  }
> = {
  community: {
    heading: 'text-[#252525]',
    th: 'text-[#1565c0]',
    firstInCircle: 'text-[#1565c0]',
    desc: 'text-[#1565c0]/70',
    border: 'border-blue-200/50',
    rowHover: 'hover:bg-white/30',
  },
  crowd: {
    heading: 'text-[#252525]',
    th: 'text-[#0d47a1]',
    firstInCircle: 'text-[#0d47a1]',
    desc: 'text-[#0d47a1]/70',
    border: 'border-blue-300/50',
    rowHover: 'hover:bg-white/30',
  },
  congregation: {
    heading: 'text-[#252525]',
    th: 'text-[#0a3d7a]',
    firstInCircle: 'text-[#0a3d7a]',
    desc: 'text-[#0a3d7a]/70',
    border: 'border-blue-400/50',
    rowHover: 'hover:bg-white/30',
  },
  committed: {
    heading: 'text-white',
    th: 'text-white',
    firstInCircle: 'text-blue-100',
    desc: 'text-white/80',
    border: 'border-blue-500/50',
    rowHover: 'hover:bg-white/20',
  },
  core: {
    heading: 'text-white',
    th: 'text-white',
    firstInCircle: '',
    desc: 'text-white/80',
    border: '',
    rowHover: 'hover:bg-white/20',
  },
};

// Dark mode text styles - all use light text on dark muted backgrounds
const HEADER_TEXT_STYLES_DARK: Record<CircleName, TextStyles> = {
  community: {
    heading: 'text-blue-100',
    th: 'text-blue-200',
    firstInCircle: 'text-blue-300',
    desc: 'text-blue-200/70',
    border: 'border-blue-800/50',
    rowHover: 'hover:bg-white/10',
  },
  crowd: {
    heading: 'text-blue-100',
    th: 'text-blue-200',
    firstInCircle: 'text-blue-300',
    desc: 'text-blue-200/70',
    border: 'border-blue-700/50',
    rowHover: 'hover:bg-white/10',
  },
  congregation: {
    heading: 'text-blue-100',
    th: 'text-blue-200',
    firstInCircle: 'text-blue-300',
    desc: 'text-blue-200/70',
    border: 'border-blue-600/50',
    rowHover: 'hover:bg-white/10',
  },
  committed: {
    heading: 'text-white',
    th: 'text-blue-100',
    firstInCircle: 'text-blue-200',
    desc: 'text-white/80',
    border: 'border-blue-500/50',
    rowHover: 'hover:bg-white/15',
  },
  core: {
    heading: 'text-white',
    th: 'text-blue-100',
    firstInCircle: 'text-blue-200',
    desc: 'text-white/80',
    border: 'border-blue-400/50',
    rowHover: 'hover:bg-white/15',
  },
};

function MilestoneTable({
  circle,
  rows,
  styles,
  isDark,
}: {
  circle: CircleName;
  rows: MilestoneRow[];
  styles: TextStyles;
  isDark: boolean;
}) {
  const isInnerCircle = circle === 'committed' || circle === 'core';
  const nameColor = isDark ? 'text-blue-100' : isInnerCircle ? 'text-white' : 'text-[#252525]';
  const totalColor = isDark ? 'text-blue-100' : isInnerCircle ? 'text-white' : 'text-[#252525]';

  return (
    <table className="w-full">
      <thead>
        <tr
          className={`border-b ${styles.border}`}
          style={circle === 'core' ? { borderColor: 'rgba(14, 90, 122, 0.5)' } : undefined}
        >
          <th
            className={`px-2 py-1 text-left text-xs font-bold tracking-wider uppercase md:px-4 ${styles.th}`}
          >
            Milestone
          </th>
          <th
            className={`px-2 py-1 text-right text-xs font-bold tracking-wider whitespace-nowrap uppercase md:px-4 ${styles.th}`}
          >
            <span className="hidden md:inline">Total </span>Assigned
          </th>
          <th
            className={`px-2 py-1 text-right text-xs font-bold tracking-wider whitespace-nowrap uppercase md:px-4 ${styles.th}`}
          >
            <span className="hidden md:inline">First In Circle</span>
            <span className="md:hidden">1st</span>
          </th>
          <th
            className={`hidden px-4 py-1 text-left text-xs font-bold tracking-wider uppercase lg:table-cell ${styles.th}`}
          >
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.name}
            className={`cursor-pointer ${styles.rowHover}`}
            onClick={() => window.open(row.mpUrl, '_blank')}
          >
            <td
              className={`px-2 py-1.5 text-sm font-semibold md:px-4 md:py-3 md:text-base ${nameColor}`}
              style={{ verticalAlign: 'top' }}
            >
              {row.name}
            </td>
            <td
              className={`px-2 py-1.5 text-right text-sm font-bold whitespace-nowrap md:px-4 md:py-3 md:text-base ${totalColor}`}
              style={{ verticalAlign: 'top' }}
            >
              {row.totalAssigned}
            </td>
            <td
              className={`px-2 py-1.5 text-right text-sm font-medium whitespace-nowrap md:px-4 md:py-3 md:text-base ${styles.firstInCircle}`}
              style={{ verticalAlign: 'top', ...(circle === 'core' ? { color: '#e3f2fd' } : {}) }}
            >
              {row.firstInCircle}
            </td>
            <td className={`hidden px-4 py-3 text-sm lg:table-cell ${styles.desc}`}>
              {row.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface MilestonesTabProps {
  sections: MilestoneSection[];
}

export default function MilestonesTab({ sections }: MilestonesTabProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const circleStyles = isDark ? CIRCLE_STYLES_DARK : CIRCLE_STYLES;
  const textStylesMap = isDark ? HEADER_TEXT_STYLES_DARK : HEADER_TEXT_STYLES;
  const bgIconColors = isDark ? BG_ICON_COLORS_DARK : BG_ICON_COLORS;

  return (
    <div className="mt-6 md:mt-0">
      {/* Info banner */}
      <p className="text-muted-foreground mb-4 flex items-start gap-2 text-xs md:mb-6 md:text-sm">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>
          <strong className="text-foreground/70">How milestones work:</strong> When a milestone is
          assigned to a person, it can move them into a circle.
          <span className="hidden md:inline">
            {' '}
            The &ldquo;First In Circle&rdquo; column shows how many people entered that circle for
            the first time due to this milestone.
          </span>
        </span>
      </p>

      {sections.map((section) => {
        const style = circleStyles[section.circle];
        const Icon = ICON_MAP[section.circle];
        const textStyles = textStylesMap[section.circle];

        return (
          <div
            key={section.circle}
            className="relative mb-4 overflow-hidden shadow-sm md:mb-6"
            style={{
              background: style.bgGradient,
              border: `2px ${style.borderStyle} ${style.border}`,
            }}
          >
            <Icon
              className="absolute -right-4 -bottom-4 h-24 w-24 md:-right-8 md:-bottom-8 md:h-48 md:w-48"
              style={{
                color: bgIconColors[section.circle],
                opacity: section.circle === 'core' ? 0.15 : 0.1,
              }}
            />
            <div className="relative z-10 flex items-center justify-between py-2 pr-3 pl-2 md:py-3 md:pr-6 md:pl-4">
              <h3
                className={`text-base font-bold tracking-wide uppercase md:text-lg ${textStyles.heading}`}
              >
                {section.title}
              </h3>
            </div>
            <div className="relative z-10">
              <MilestoneTable
                circle={section.circle}
                rows={section.milestones}
                styles={textStyles}
                isDark={isDark}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
