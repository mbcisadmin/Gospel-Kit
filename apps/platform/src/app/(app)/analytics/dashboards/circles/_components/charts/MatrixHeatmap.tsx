'use client';

import { Fragment } from 'react';
import { Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { CIRCLE_CHART_POINT_STYLES } from '../../_data/constants';
import type { BarChartData } from '../../_data/types';

const ICONS = [Globe, Users, Church, HeartHandshake, Star];

interface MatrixHeatmapProps {
  chartData: BarChartData;
  colorMode?: 'blue' | 'orange';
}

function getHeatmapColor(intensity: number, mode: string): string {
  const i = Math.pow(intensity, 0.5);
  if (mode === 'orange') {
    const r = Math.round(255 - i * 6);
    const g = Math.round(230 - i * 115);
    const b = Math.round(200 - i * 178);
    return `rgb(${r},${g},${b})`;
  }
  // blue (default for engagement)
  const r = Math.round(220 - i * 161);
  const g = Math.round(220 - i * 90);
  const b = Math.round(255 - i * 9);
  return `rgb(${r},${g},${b})`;
}

function formatValue(val: number): string {
  return val >= 1000 ? (val / 1000).toFixed(1) + 'k' : String(val);
}

export default function MatrixHeatmap({ chartData, colorMode = 'blue' }: MatrixHeatmapProps) {
  const maxVal = Math.max(...chartData.values.flat());

  return (
    <>
      {/* Mobile layout */}
      <div
        className="grid text-[8px] md:hidden"
        style={{
          gridTemplateColumns: `70px repeat(${chartData.labels.length}, 1fr)`,
          gridTemplateRows: `auto repeat(${chartData.categories.length}, minmax(52px, 1fr))`,
          gap: 1,
          minHeight: 320,
        }}
      >
        {/* Header row - icons only on mobile */}
        <div />
        {chartData.labels.map((label, i) => {
          const style = CIRCLE_CHART_POINT_STYLES[i];
          const Icon = ICONS[i];
          return (
            <div key={label} className="flex items-center justify-center p-0.5">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{
                  backgroundColor: style.bg,
                  border: `1.5px ${style.dashed ? 'dashed' : 'solid'} ${style.border}`,
                }}
              >
                <Icon className="h-2.5 w-2.5" style={{ color: style.iconColor }} />
              </div>
            </div>
          );
        })}

        {/* Data rows */}
        {chartData.categories.map((cat, rowIdx) => (
          <Fragment key={cat}>
            <div
              className="flex items-center text-[7px] leading-tight font-semibold"
              style={{ color: chartData.colors[rowIdx] }}
            >
              {cat}
            </div>
            {chartData.values[rowIdx].map((val, colIdx) => {
              const intensity = val / maxVal;
              const sqrtIntensity = Math.pow(intensity, 0.5);
              return (
                <div
                  key={`${cat}-${colIdx}`}
                  className="flex items-center justify-center text-[8px] font-medium"
                  style={{
                    background: getHeatmapColor(intensity, colorMode),
                    color: sqrtIntensity > 0.5 ? '#fff' : '#333',
                  }}
                  title={val.toLocaleString()}
                >
                  {formatValue(val)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Desktop layout */}
      <div
        className="hidden h-full gap-0.5 text-[9px] md:grid"
        style={{
          gridTemplateColumns: `120px repeat(${chartData.labels.length}, 1fr)`,
          gridTemplateRows: `auto repeat(${chartData.categories.length}, 1fr)`,
        }}
      >
        {/* Header row */}
        <div />
        {chartData.labels.map((label, i) => {
          const style = CIRCLE_CHART_POINT_STYLES[i];
          const Icon = ICONS[i];
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-1 p-1 text-center font-semibold"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  backgroundColor: style.bg,
                  border: `2px ${style.dashed ? 'dashed' : 'solid'} ${style.border}`,
                }}
              >
                <Icon className="h-3 w-3" style={{ color: style.iconColor }} />
              </div>
              <span>{label}</span>
            </div>
          );
        })}

        {/* Data rows */}
        {chartData.categories.map((cat, rowIdx) => (
          <Fragment key={cat}>
            <div
              className="flex items-center text-[8px] font-semibold"
              style={{ color: chartData.colors[rowIdx] }}
            >
              {cat}
            </div>
            {chartData.values[rowIdx].map((val, colIdx) => {
              const intensity = val / maxVal;
              const sqrtIntensity = Math.pow(intensity, 0.5);
              return (
                <div
                  key={`${cat}-${colIdx}`}
                  className="flex items-center justify-center font-medium"
                  style={{
                    background: getHeatmapColor(intensity, colorMode),
                    color: sqrtIntensity > 0.5 ? '#fff' : '#333',
                  }}
                  title={val.toLocaleString()}
                >
                  {formatValue(val)}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </>
  );
}
