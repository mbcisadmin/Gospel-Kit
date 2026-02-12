import type { Plugin, Chart } from 'chart.js';
import { createSegmentIconImage } from '../chart-utils';
import { ICON_SVG_PATHS } from '../../../_data/constants';

const ICON_NAMES = ['globe', 'users', 'church', 'heart-handshake', 'star'];

// Light mode colors
const INNER_COLORS_LIGHT = ['#0d47a1', '#0a3d7a', '#ffffff', '#ffffff', '#ffffff'];
const OUTER_COLOR_LIGHT = '#6b7280';

// Dark mode colors - more vibrant on dark backgrounds
const INNER_COLORS_DARK = ['#64b5f6', '#90caf9', '#ffffff', '#ffffff', '#ffffff'];
const OUTER_COLOR_DARK = '#9ca3af';

// Cache icons for each theme
let innerIconsLight: HTMLImageElement[] | null = null;
let outerIconsLight: HTMLImageElement[] | null = null;
let innerIconsDark: HTMLImageElement[] | null = null;
let outerIconsDark: HTMLImageElement[] | null = null;
let lightReady = false;
let darkReady = false;

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

function ensureIcons(isDark: boolean): boolean {
  if (isDark) {
    if (!innerIconsDark) {
      innerIconsDark = ICON_NAMES.map((name, i) =>
        createSegmentIconImage(ICON_SVG_PATHS[name], INNER_COLORS_DARK[i], 20)
      );
    }
    if (!outerIconsDark) {
      outerIconsDark = ICON_NAMES.map((name) =>
        createSegmentIconImage(ICON_SVG_PATHS[name], OUTER_COLOR_DARK, 16)
      );
    }
    if (!darkReady) {
      darkReady = [...innerIconsDark, ...outerIconsDark].every((i) => i.complete);
    }
    return darkReady;
  } else {
    if (!innerIconsLight) {
      innerIconsLight = ICON_NAMES.map((name, i) =>
        createSegmentIconImage(ICON_SVG_PATHS[name], INNER_COLORS_LIGHT[i], 20)
      );
    }
    if (!outerIconsLight) {
      outerIconsLight = ICON_NAMES.map((name) =>
        createSegmentIconImage(ICON_SVG_PATHS[name], OUTER_COLOR_LIGHT, 16)
      );
    }
    if (!lightReady) {
      lightReady = [...innerIconsLight, ...outerIconsLight].every((i) => i.complete);
    }
    return lightReady;
  }
}

export const segmentLabelsPlugin: Plugin<'doughnut'> = {
  id: 'segmentLabels',
  afterDraw(chart: Chart<'doughnut'>) {
    const isDark = isDarkMode();
    const ready = ensureIcons(isDark);

    const innerIcons = isDark ? innerIconsDark : innerIconsLight;
    const outerIcons = isDark ? outerIconsDark : outerIconsLight;
    const lineColor = isDark ? '#6b7280' : '#9ca3af';

    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((arc, i) => {
      const a = arc as unknown as {
        startAngle: number;
        endAngle: number;
        innerRadius: number;
        outerRadius: number;
        x: number;
        y: number;
      };
      const arcSpan = a.endAngle - a.startAngle;
      const midAngle = (a.startAngle + a.endAngle) / 2;
      const midRadius = (a.innerRadius + a.outerRadius) / 2;
      const arcLength = arcSpan * midRadius;

      ctx.save();

      if (arcLength > 60) {
        const x = a.x + Math.cos(midAngle) * midRadius;
        const y = a.y + Math.sin(midAngle) * midRadius;
        const icon = innerIcons![i];
        if (icon && icon.complete) {
          ctx.globalAlpha = 0.5;
          ctx.drawImage(icon, x - 10, y - 10, 20, 20);
        }
      } else {
        const outerX = a.x + Math.cos(midAngle) * a.outerRadius;
        const outerY = a.y + Math.sin(midAngle) * a.outerRadius;
        const lineEnd = a.outerRadius + 12;
        const lineEndX = a.x + Math.cos(midAngle) * lineEnd;
        const lineEndY = a.y + Math.sin(midAngle) * lineEnd;

        ctx.beginPath();
        ctx.moveTo(outerX, outerY);
        ctx.lineTo(lineEndX, lineEndY);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        const iconDist = a.outerRadius + 22;
        const iconX = a.x + Math.cos(midAngle) * iconDist;
        const iconY = a.y + Math.sin(midAngle) * iconDist;
        const icon = outerIcons![i];
        if (icon && icon.complete) {
          ctx.globalAlpha = 0.6;
          ctx.drawImage(icon, iconX - 8, iconY - 8, 16, 16);
        }
      }

      ctx.restore();
    });

    // Data URI images may not be decoded by the first afterDraw call.
    // Schedule a redraw so icons appear once they finish loading.
    if (!ready) {
      requestAnimationFrame(() => chart.draw());
    }
  },
};
