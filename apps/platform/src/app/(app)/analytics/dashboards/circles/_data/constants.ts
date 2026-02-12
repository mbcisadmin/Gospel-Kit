import type { CircleName, CircleModalDesign, CircleStyle } from './types';

export const CIRCLE_ORDER: CircleName[] = [
  'community',
  'crowd',
  'congregation',
  'committed',
  'core',
];

// Light mode circle styles — MBC blue brand palette (outer lightest → inner darkest)
export const CIRCLE_STYLES: Record<CircleName, CircleStyle> = {
  community: {
    bg: '#bbdefb',
    bgGradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    border: '#90caf9',
    borderStyle: 'dashed',
    iconColor: '#1565c0',
    textColor: '#252525',
    labelColor: 'text-[#1565c0]',
    icon: 'Globe',
  },
  crowd: {
    bg: '#90caf9',
    bgGradient: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
    border: '#64b5f6',
    borderStyle: 'solid',
    iconColor: '#0d47a1',
    textColor: '#252525',
    labelColor: 'text-[#0d47a1]',
    icon: 'Users',
  },
  congregation: {
    bg: '#64b5f6',
    bgGradient: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
    border: '#42a5f5',
    borderStyle: 'solid',
    iconColor: '#0d47a1',
    textColor: '#252525',
    labelColor: 'text-[#0a3d7a]',
    icon: 'Church',
  },
  committed: {
    bg: '#42a5f5',
    bgGradient: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
    border: '#1d9fd9',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    icon: 'HeartHandshake',
  },
  core: {
    bg: '#1d9fd9',
    bgGradient: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    border: '#0e5a7a',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    icon: 'Star',
  },
};

export type ChartPointStyle = {
  bg: string;
  border: string;
  dashed: boolean;
  iconColor: string;
  icon: string;
};

export const CIRCLE_CHART_POINT_STYLES: ChartPointStyle[] = [
  {
    bg: 'rgba(187, 222, 251, 0.3)',
    border: '#90caf9',
    dashed: true,
    iconColor: '#42a5f5',
    icon: 'globe',
  },
  { bg: '#bbdefb', border: '#90caf9', dashed: false, iconColor: '#1565c0', icon: 'users' },
  { bg: '#90caf9', border: '#64b5f6', dashed: false, iconColor: '#0d47a1', icon: 'church' },
  {
    bg: '#64b5f6',
    border: '#42a5f5',
    dashed: false,
    iconColor: '#ffffff',
    icon: 'heart-handshake',
  },
  { bg: '#1d9fd9', border: '#0e5a7a', dashed: false, iconColor: '#ffffff', icon: 'star' },
];

// Dark mode chart point styles
export const CIRCLE_CHART_POINT_STYLES_DARK: ChartPointStyle[] = [
  {
    bg: 'rgba(30, 60, 90, 0.5)',
    border: '#3a7ab0',
    dashed: true,
    iconColor: '#64b5f6',
    icon: 'globe',
  },
  { bg: '#1e3c5a', border: '#3a7ab0', dashed: false, iconColor: '#90caf9', icon: 'users' },
  { bg: '#2a5a80', border: '#4a8ac0', dashed: false, iconColor: '#bbdefb', icon: 'church' },
  {
    bg: '#3a7ab0',
    border: '#4a9ad0',
    dashed: false,
    iconColor: '#ffffff',
    icon: 'heart-handshake',
  },
  { bg: '#4a9ad0', border: '#5abaee', dashed: false, iconColor: '#ffffff', icon: 'star' },
];

export function getChartPointStyles(isDark: boolean): ChartPointStyle[] {
  return isDark ? CIRCLE_CHART_POINT_STYLES_DARK : CIRCLE_CHART_POINT_STYLES;
}

// Light mode chart colors
export const CIRCLE_LINE_COLORS = ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#1d9fd9'];
export const CIRCLE_DOUGHNUT_COLORS = ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#1d9fd9'];

// Dark mode chart colors
export const CIRCLE_LINE_COLORS_DARK = ['#1e3c5a', '#2a5a80', '#3a7ab0', '#4a9ad0', '#5abaee'];
export const CIRCLE_DOUGHNUT_COLORS_DARK = ['#1e3c5a', '#2a5a80', '#3a7ab0', '#4a9ad0', '#5abaee'];

// Dark mode circle styles
export const CIRCLE_STYLES_DARK: Record<CircleName, CircleStyle> = {
  community: {
    bg: '#1e3c5a',
    bgGradient: 'linear-gradient(135deg, #142a40 0%, #1e3c5a 100%)',
    border: '#3a7ab0',
    borderStyle: 'dashed',
    iconColor: '#64b5f6',
    textColor: '#e3f2fd',
    labelColor: 'text-blue-300',
    icon: 'Globe',
  },
  crowd: {
    bg: '#2a5a80',
    bgGradient: 'linear-gradient(135deg, #1e3c5a 0%, #2a5a80 100%)',
    border: '#4a8ac0',
    borderStyle: 'solid',
    iconColor: '#90caf9',
    textColor: '#e3f2fd',
    labelColor: 'text-blue-300',
    icon: 'Users',
  },
  congregation: {
    bg: '#3a7ab0',
    bgGradient: 'linear-gradient(135deg, #2a5a80 0%, #3a7ab0 100%)',
    border: '#4a9ad0',
    borderStyle: 'solid',
    iconColor: '#bbdefb',
    textColor: '#e3f2fd',
    labelColor: 'text-blue-200',
    icon: 'Church',
  },
  committed: {
    bg: '#4a9ad0',
    bgGradient: 'linear-gradient(135deg, #3a7ab0 0%, #4a9ad0 100%)',
    border: '#5abaee',
    borderStyle: 'solid',
    iconColor: '#dbeafe',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    icon: 'HeartHandshake',
  },
  core: {
    bg: '#5abaee',
    bgGradient: 'linear-gradient(135deg, #4a9ad0 0%, #5abaee 100%)',
    border: '#6acafe',
    borderStyle: 'solid',
    iconColor: '#ffffff',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    icon: 'Star',
  },
};

// Helper to get circle styles based on theme
export function getCircleStyles(isDark: boolean): Record<CircleName, CircleStyle> {
  return isDark ? CIRCLE_STYLES_DARK : CIRCLE_STYLES;
}

export function getCircleLineColors(isDark: boolean): string[] {
  return isDark ? CIRCLE_LINE_COLORS_DARK : CIRCLE_LINE_COLORS;
}

export function getCircleDoughnutColors(isDark: boolean): string[] {
  return isDark ? CIRCLE_DOUGHNUT_COLORS_DARK : CIRCLE_DOUGHNUT_COLORS;
}

export const ENGAGEMENT_COLORS = ['#1d9fd9', '#eab308', '#f97316', '#3b82f6', '#ef4444'];
export const PARTICIPANT_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];
export const DEMOGRAPHICS_COLORS = [
  '#f97316',
  '#fb923c',
  '#fbbf24',
  '#facc15',
  '#a3e635',
  '#4ade80',
];

// Lucide icon SVG paths for chart point markers
export const ICON_SVG_PATHS: Record<string, string> = {
  globe:
    '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  church:
    '<path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 22V5l-6-3-6 3v17"/><path d="M12 7v5"/><path d="M10 9h4"/>',
  'heart-handshake':
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
};

export const CIRCLE_MODAL_DESIGN: Record<'overview' | CircleName, CircleModalDesign> = {
  overview: {
    title: 'All Circles',
    description: 'Combined view across all circles of commitment',
    color: '#1d9fd9',
    gradient: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: 'rgba(255,255,255,0.7)',
    icon: 'Target',
  },
  community: {
    title: 'Community',
    description: 'The unchurched in the immediate area - your starting point and hottest prospects',
    color: '#90caf9',
    gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#1565c0',
    icon: 'Globe',
  },
  crowd: {
    title: 'Crowd',
    description: 'Everyone who shows up - regular service attendees',
    color: '#64b5f6',
    gradient: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#0d47a1',
    icon: 'Users',
  },
  congregation: {
    title: 'Congregation',
    description: 'Official members of the church with a sense of ownership',
    color: '#42a5f5',
    gradient: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
    headerTextColor: '#1a1a1a',
    headerSubColor: '#0a3d7a',
    icon: 'Church',
  },
  committed: {
    title: 'Committed',
    description: 'People who pray, give, and are dedicated to growing in discipleship',
    color: '#1d9fd9',
    gradient: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#e3f2fd',
    icon: 'HeartHandshake',
  },
  core: {
    title: 'Core',
    description:
      'Ministers and leaders - without these people the church would come to a standstill',
    color: '#1272a0',
    gradient: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#e3f2fd',
    icon: 'Star',
  },
};

// Dark mode modal design
export const CIRCLE_MODAL_DESIGN_DARK: Record<'overview' | CircleName, CircleModalDesign> = {
  overview: {
    title: 'All Circles',
    description: 'Combined view across all circles of commitment',
    color: '#1d9fd9',
    gradient: 'linear-gradient(135deg, #1272a0 0%, #1d9fd9 100%)',
    headerTextColor: '#e3f2fd',
    headerSubColor: 'rgba(187, 222, 251, 0.7)',
    icon: 'Target',
  },
  community: {
    title: 'Community',
    description: 'The unchurched in the immediate area - your starting point and hottest prospects',
    color: '#3a7ab0',
    gradient: 'linear-gradient(135deg, #142a40 0%, #1e3c5a 100%)',
    headerTextColor: '#e3f2fd',
    headerSubColor: '#90caf9',
    icon: 'Globe',
  },
  crowd: {
    title: 'Crowd',
    description: 'Everyone who shows up - regular service attendees',
    color: '#4a8ac0',
    gradient: 'linear-gradient(135deg, #1e3c5a 0%, #2a5a80 100%)',
    headerTextColor: '#e3f2fd',
    headerSubColor: '#90caf9',
    icon: 'Users',
  },
  congregation: {
    title: 'Congregation',
    description: 'Official members of the church with a sense of ownership',
    color: '#4a9ad0',
    gradient: 'linear-gradient(135deg, #2a5a80 0%, #3a7ab0 100%)',
    headerTextColor: '#e3f2fd',
    headerSubColor: '#bbdefb',
    icon: 'Church',
  },
  committed: {
    title: 'Committed',
    description: 'People who pray, give, and are dedicated to growing in discipleship',
    color: '#5abaee',
    gradient: 'linear-gradient(135deg, #3a7ab0 0%, #4a9ad0 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#bbdefb',
    icon: 'HeartHandshake',
  },
  core: {
    title: 'Core',
    description:
      'Ministers and leaders - without these people the church would come to a standstill',
    color: '#6acafe',
    gradient: 'linear-gradient(135deg, #4a9ad0 0%, #5abaee 100%)',
    headerTextColor: '#ffffff',
    headerSubColor: '#e3f2fd',
    icon: 'Star',
  },
};

export function getCircleModalDesign(
  isDark: boolean
): Record<'overview' | CircleName, CircleModalDesign> {
  return isDark ? CIRCLE_MODAL_DESIGN_DARK : CIRCLE_MODAL_DESIGN;
}
