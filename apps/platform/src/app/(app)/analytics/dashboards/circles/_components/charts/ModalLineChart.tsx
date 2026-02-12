'use client';

import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import './chart-setup';
import { useIsMobile } from './useIsMobile';

interface ModalLineChartProps {
  history: number[];
  color: string;
  label: string;
  labels: (string | string[])[];
}

export default function ModalLineChart({ history, color, label, labels }: ModalLineChartProps) {
  const isMobile = useIsMobile();

  // Track dark mode for chart styling
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label,
        data: history,
        borderColor: color,
        backgroundColor: color + '20',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: color,
        pointBorderColor: isDark ? '#1a1a1a' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: !isMobile,
          backgroundColor: isDark ? '#1e3c5a' : '#1a1a1a',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 14, weight: 'bold' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => (context.parsed.y ?? 0).toLocaleString() + ' people',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: isDark ? 'rgba(128, 160, 200, 0.15)' : 'rgba(128, 128, 128, 0.12)' },
          ticks: {
            font: { size: 11 },
            color: isDark ? '#a0b8c8' : undefined,
            callback: (value) => Number(value).toLocaleString(),
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: isDark ? '#a0b8c8' : undefined,
            autoSkip: false,
            maxRotation: 0,
          },
        },
      },
    }),
    [isMobile, isDark]
  );

  return (
    <div style={{ height: 250 }}>
      <Line data={data} options={options} />
    </div>
  );
}
