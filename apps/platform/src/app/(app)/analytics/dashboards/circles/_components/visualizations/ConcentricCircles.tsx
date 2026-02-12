'use client';

import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { CircleName } from '../../_data/types';

// Circle layout configuration (size/position)
const CIRCLE_LAYOUT: {
  name: CircleName;
  label: string;
  size: number;
  offset: number;
  Icon: typeof Globe;
  iconSize: number;
}[] = [
  { name: 'community', label: 'Community', size: 440, offset: 0, Icon: Globe, iconSize: 20 },
  { name: 'crowd', label: 'Crowd', size: 352, offset: 44, Icon: Users, iconSize: 20 },
  {
    name: 'congregation',
    label: 'Congregation',
    size: 264,
    offset: 88,
    Icon: Church,
    iconSize: 20,
  },
  {
    name: 'committed',
    label: 'Committed',
    size: 176,
    offset: 132,
    Icon: HeartHandshake,
    iconSize: 20,
  },
  { name: 'core', label: 'Core', size: 88, offset: 176, Icon: Star, iconSize: 16 },
];

// Light mode colors
const LIGHT_COLORS: Record<
  CircleName,
  { bg: string; border: string; borderStyle: string; iconColor: string }
> = {
  community: {
    bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    border: '#90caf9',
    borderStyle: 'dashed',
    iconColor: '#1565c0',
  },
  crowd: {
    bg: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
    border: '#64b5f6',
    borderStyle: 'solid',
    iconColor: '#0d47a1',
  },
  congregation: {
    bg: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
    border: '#42a5f5',
    borderStyle: 'solid',
    iconColor: '#0d47a1',
  },
  committed: {
    bg: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
    border: '#1d9fd9',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
  core: {
    bg: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    border: '#0e5a7a',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
};

// Dark mode colors - blue brand, progressively brighter for inner circles
const DARK_COLORS: Record<
  CircleName,
  { bg: string; border: string; borderStyle: string; iconColor: string }
> = {
  community: {
    bg: 'linear-gradient(135deg, #142a40 0%, #1e3c5a 100%)',
    border: '#3a7ab0',
    borderStyle: 'dashed',
    iconColor: '#64b5f6',
  },
  crowd: {
    bg: 'linear-gradient(135deg, #1e3c5a 0%, #2a5a80 100%)',
    border: '#4a8ac0',
    borderStyle: 'solid',
    iconColor: '#90caf9',
  },
  congregation: {
    bg: 'linear-gradient(135deg, #2a5a80 0%, #3a7ab0 100%)',
    border: '#4a9ad0',
    borderStyle: 'solid',
    iconColor: '#bbdefb',
  },
  committed: {
    bg: 'linear-gradient(135deg, #3a7ab0 0%, #4a9ad0 100%)',
    border: '#5abaee',
    borderStyle: 'solid',
    iconColor: '#dbeafe',
  },
  core: {
    bg: 'linear-gradient(135deg, #4a9ad0 0%, #5abaee 100%)',
    border: '#6acafe',
    borderStyle: 'solid',
    iconColor: '#fff',
  },
};

interface ConcentricCirclesProps {
  onCircleClick: (circle: CircleName | 'overview') => void;
}

export default function ConcentricCircles({ onCircleClick }: ConcentricCirclesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  // Base size is 440px, all circles scale proportionally
  const BASE_SIZE = 440;

  return (
    <div className="relative aspect-square w-full max-w-[440px]">
      {CIRCLE_LAYOUT.map((c) => {
        const isCore = c.name === 'core';
        const colorStyle = colors[c.name];
        // Convert pixel values to percentages
        const sizePercent = (c.size / BASE_SIZE) * 100;
        const offsetPercent = (c.offset / BASE_SIZE) * 100;

        return (
          <div
            key={c.name}
            className="absolute flex cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:scale-[1.02]"
            style={{
              width: `${sizePercent}%`,
              height: `${sizePercent}%`,
              top: `${offsetPercent}%`,
              left: `${offsetPercent}%`,
              background: colorStyle.bg,
              border: `3px ${colorStyle.borderStyle} ${colorStyle.border}`,
              boxShadow: 'none',
            }}
            onClick={() => onCircleClick(c.name)}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                '0 0 30px rgba(29, 159, 217, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span
              className="absolute whitespace-nowrap"
              style={
                isCore
                  ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                  : { top: 2, left: '50%', transform: 'translateX(-50%)' }
              }
            >
              <c.Icon
                style={{ width: c.iconSize, height: c.iconSize, color: colorStyle.iconColor }}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
}
