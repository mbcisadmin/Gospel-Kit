import { ICON_SVG_PATHS } from '../../_data/constants';

export function createCircleIconSVG(
  bgColor: string,
  borderColor: string,
  iconColor: string,
  iconName: string,
  isDashed = false
): HTMLImageElement {
  const iconSvg = ICON_SVG_PATHS[iconName] || '';
  const dashStyle = isDashed ? 'stroke-dasharray="2,2"' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="9" fill="${bgColor}" stroke="${borderColor}" stroke-width="1.5" ${dashStyle}/>
    <g transform="translate(5, 5) scale(0.42)" stroke="${iconColor}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconSvg}
    </g>
  </svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}

export function createSegmentIconImage(
  iconSvg: string,
  color: string,
  size: number
): HTMLImageElement {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return img;
}

export function getTooltipConfig() {
  return {
    backgroundColor: '#1a1a1a',
    titleFont: { size: 12, weight: '600' as const },
    bodyFont: { size: 14, weight: 'bold' as const },
    padding: 12,
    cornerRadius: 8,
  };
}

// Track tooltip hide timeouts for mobile auto-hide
const tooltipTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

function getOrCreateTooltipEl(id: string): HTMLDivElement {
  let el = document.getElementById(id) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = id;
    el.style.cssText =
      'position:absolute;pointer-events:none;padding:8px 12px;border-radius:6px;font-family:inherit;transition:opacity 0.15s;z-index:50;';
    document.body.appendChild(el);
  }
  return el;
}

// Auto-hide tooltip after delay on touch devices
function scheduleTooltipHide(id: string, el: HTMLDivElement) {
  // Clear any existing timeout
  if (tooltipTimeouts[id]) {
    clearTimeout(tooltipTimeouts[id]);
  }
  // Only auto-hide on touch devices
  if ('ontouchstart' in window) {
    tooltipTimeouts[id] = setTimeout(() => {
      el.style.opacity = '0';
    }, 2000);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function createBarExternalTooltip(tooltipId: string, isPercent: boolean) {
  return {
    enabled: false,
    external(context: any) {
      const el = getOrCreateTooltipEl(tooltipId);
      const tooltip = context.tooltip;

      if (tooltip.opacity === 0) {
        el.style.opacity = '0';
        return;
      }

      const dp = tooltip.dataPoints[0];
      const bg =
        typeof dp.dataset.backgroundColor === 'string'
          ? dp.dataset.backgroundColor
          : (dp.dataset.backgroundColor[dp.dataIndex] ?? '#333');
      const textColor = getLuminance(bg) > 0.6 ? '#1a1a1a' : '#ffffff';
      const val = isPercent ? dp.raw.toFixed(1) + '%' : dp.raw.toLocaleString();

      el.style.background = bg;
      el.style.color = textColor;
      el.innerHTML = `<div style="font-size:12px;font-weight:600;margin-bottom:2px;">${dp.dataset.label}</div><div style="font-size:13px;">${val}</div>`;

      const pos = context.chart.canvas.getBoundingClientRect();
      el.style.opacity = '1';
      el.style.left = pos.left + window.scrollX + tooltip.caretX + 'px';
      el.style.top = pos.top + window.scrollY + tooltip.caretY - 50 + 'px';

      scheduleTooltipHide(tooltipId, el);
    },
  };
}

export function createDoughnutExternalTooltip(tooltipId: string, total: number, colors: string[]) {
  return {
    enabled: false,
    external(context: any) {
      const el = getOrCreateTooltipEl(tooltipId);
      const tooltip = context.tooltip;

      if (tooltip.opacity === 0) {
        el.style.opacity = '0';
        return;
      }

      const idx = tooltip.dataPoints[0].dataIndex;
      const bg = colors[idx];
      const textColor = getLuminance(bg) > 0.6 ? '#0d47a1' : '#ffffff';
      const val = tooltip.dataPoints[0].parsed.toLocaleString();
      const pct = ((tooltip.dataPoints[0].parsed / total) * 100).toFixed(1);

      el.style.background = bg;
      el.style.color = textColor;
      el.innerHTML = `<div style="font-size:12px;font-weight:600;margin-bottom:2px;">${tooltip.title[0]}</div><div style="font-size:13px;">${val} (${pct}%)</div>`;

      const pos = context.chart.canvas.getBoundingClientRect();
      el.style.opacity = '1';
      el.style.left = pos.left + window.scrollX + tooltip.caretX + 'px';
      el.style.top = pos.top + window.scrollY + tooltip.caretY - 50 + 'px';

      scheduleTooltipHide(tooltipId, el);
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substr(0, 2), 16);
  const g = parseInt(clean.substr(2, 2), 16);
  const b = parseInt(clean.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
