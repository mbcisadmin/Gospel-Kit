'use client';

import { BarChart3, RefreshCw, Globe, Users, Church, HeartHandshake, Star } from 'lucide-react';
import { SectionHeader } from '@/components/ui/section-header';

const CIRCLES = [
  {
    size: 440,
    offset: 0,
    bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    border: '#90caf9',
    borderStyle: 'dashed',
    Icon: Globe,
    iconColor: '#1565c0',
    iconSize: 20,
    isCore: false,
  },
  {
    size: 352,
    offset: 44,
    bg: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
    border: '#64b5f6',
    borderStyle: 'solid',
    Icon: Users,
    iconColor: '#0d47a1',
    iconSize: 20,
    isCore: false,
  },
  {
    size: 264,
    offset: 88,
    bg: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
    border: '#42a5f5',
    borderStyle: 'solid',
    Icon: Church,
    iconColor: '#0d47a1',
    iconSize: 20,
    isCore: false,
  },
  {
    size: 176,
    offset: 132,
    bg: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
    border: '#1d9fd9',
    borderStyle: 'solid',
    Icon: HeartHandshake,
    iconColor: '#fff',
    iconSize: 20,
    isCore: false,
  },
  {
    size: 88,
    offset: 176,
    bg: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    border: '#0e5a7a',
    borderStyle: 'solid',
    Icon: Star,
    iconColor: '#fff',
    iconSize: 16,
    isCore: true,
  },
];

const STAT_ROWS = [
  {
    name: 'Community',
    gradient: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    border: '#90caf9',
    borderStyle: 'dashed',
    textColor: '#252525',
    labelColor: 'text-[#1565c0]',
    Icon: Globe,
    bgIconColor: '#0d47a1',
  },
  {
    name: 'Crowd',
    gradient: 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)',
    border: '#64b5f6',
    borderStyle: 'solid',
    textColor: '#252525',
    labelColor: 'text-[#0d47a1]',
    Icon: Users,
    bgIconColor: '#0d47a1',
  },
  {
    name: 'Congregation',
    gradient: 'linear-gradient(135deg, #90caf9 0%, #64b5f6 100%)',
    border: '#42a5f5',
    borderStyle: 'solid',
    textColor: '#252525',
    labelColor: 'text-[#0a3d7a]',
    Icon: Church,
    bgIconColor: '#0a3d7a',
  },
  {
    name: 'Committed',
    gradient: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
    border: '#1d9fd9',
    borderStyle: 'solid',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    Icon: HeartHandshake,
    bgIconColor: '#0a3d7a',
  },
  {
    name: 'Core',
    gradient: 'linear-gradient(135deg, #1d9fd9 0%, #1272a0 100%)',
    border: '#0e5a7a',
    borderStyle: 'solid',
    textColor: '#ffffff',
    labelColor: 'text-blue-100',
    Icon: Star,
    bgIconColor: '#0a3d7a',
  },
];

function StatSkeleton({ color }: { color: string }) {
  return <div className="h-5 w-14 animate-pulse rounded" style={{ backgroundColor: color }} />;
}

export default function CirclesLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Real header */}
      <header>
        <SectionHeader
          title="Circles"
          subtitle={<div className="h-12 md:h-7" />}
          icon={BarChart3}
          variant="watermark"
          as="h1"
          className="mb-0"
        />
      </header>

      {/* Mobile: SwipeableTabs skeleton */}
      <div className="md:hidden">
        <div className="relative flex h-28 items-center justify-center overflow-hidden">
          {/* Tab labels with arc effect */}
          <div className="text-foreground absolute px-6 py-3 text-sm font-bold tracking-wider uppercase">
            Over Time
          </div>
          <div
            className="text-muted-foreground/40 absolute flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wider uppercase"
            style={{
              transform: 'translateX(90%) translateY(8px) scale(0.8)',
              opacity: 0.5,
            }}
          >
            Current
            <span className="border-muted-foreground/40 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
          <div
            className="text-muted-foreground/40 absolute flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-wider uppercase"
            style={{
              transform: 'translateX(180%) translateY(16px) scale(0.6)',
              opacity: 0.2,
            }}
          >
            Milestones
            <span className="border-muted-foreground/40 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" />
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            <div className="bg-primary h-1.5 w-4 rounded-full" />
            <div className="bg-muted-foreground/20 h-1.5 w-1.5 rounded-full" />
            <div className="bg-muted-foreground/20 h-1.5 w-1.5 rounded-full" />
          </div>
        </div>

        {/* Period selector skeleton */}
        <div className="relative mt-6">
          <div className="bg-muted absolute top-1/2 left-4 h-4 w-28 -translate-y-1/2 animate-pulse rounded" />
          <div className="border-border w-full border bg-transparent px-4 py-3 pr-10">
            <div className="h-4" />
          </div>
        </div>
      </div>

      {/* Desktop: Real tabs */}
      <div className="border-border hidden gap-1 border-b md:flex">
        <div className="border-primary text-foreground border-b-[3px] px-6 py-3 text-xs font-semibold tracking-wide uppercase">
          Over Time
        </div>
        <div className="text-muted-foreground border-b-[3px] border-transparent px-6 py-3 text-xs font-semibold tracking-wide uppercase">
          Current
        </div>
        <div className="text-muted-foreground border-b-[3px] border-transparent px-6 py-3 text-xs font-semibold tracking-wide uppercase">
          Milestones
        </div>
      </div>

      {/* Mobile: Circle Overview header */}
      <div className="bg-secondary border-2 border-transparent px-3 py-3 md:hidden">
        <div className="flex items-center">
          <div className="flex-1 pl-8">
            <div className="text-sm font-bold tracking-wide text-white uppercase">
              Circle Overview
            </div>
            <div className="mt-1 h-2.5 w-20 animate-pulse rounded bg-gray-700" />
          </div>
          <div className="text-right">
            <div className="ml-auto h-4 w-10 animate-pulse rounded bg-gray-600" />
            <div className="text-[10px] tracking-wide text-gray-500 uppercase">Total</div>
          </div>
        </div>
      </div>

      {/* Mobile: Stat bars */}
      <div className="mt-2 flex flex-col gap-2 pb-14 md:hidden">
        {STAT_ROWS.map((row) => (
          <div
            key={row.name}
            className="relative overflow-hidden"
            style={{
              background: row.gradient,
              border: `2px ${row.borderStyle} ${row.border}`,
            }}
          >
            <row.Icon
              className="absolute top-1/2 -left-4 h-16 w-16 -translate-y-1/2 opacity-10"
              style={{ color: row.bgIconColor }}
            />
            <div className="relative z-10 flex items-center px-3 py-2">
              <div className="flex-1 pl-10">
                <div
                  className="text-sm font-bold tracking-wide uppercase"
                  style={{ color: row.textColor }}
                >
                  {row.name}
                </div>
              </div>
              <div className="w-12 text-right">
                <div
                  className="ml-auto h-4 w-8 animate-pulse rounded"
                  style={{
                    backgroundColor:
                      row.textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
                  }}
                />
                <div className={`text-[10px] tracking-wide uppercase ${row.labelColor}`}>Total</div>
              </div>
              <div className="w-10 text-right">
                <div
                  className="ml-auto h-4 w-6 animate-pulse rounded"
                  style={{
                    backgroundColor:
                      row.textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)',
                  }}
                />
                <div className={`text-[10px] tracking-wide uppercase ${row.labelColor}`}>New</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Chart toggle */}
      <div className="flex md:hidden">
        <div className="bg-secondary flex-1 py-2 text-center text-sm font-semibold tracking-wide text-white uppercase">
          In Circle
        </div>
        <div className="bg-muted text-muted-foreground flex-1 py-2 text-center text-sm font-semibold tracking-wide uppercase">
          Joined Circle
        </div>
      </div>

      {/* Mobile: Chart skeleton */}
      <div className="mt-4 md:hidden">
        <div className="flex min-h-[300px] flex-col">
          <div className="mb-3">
            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted mt-1 h-2.5 w-32 animate-pulse rounded" />
          </div>
          <div className="bg-muted min-h-0 flex-1 animate-pulse rounded" />
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-muted h-3 w-12 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Circle Overview header */}
      <div className="bg-secondary hidden items-center justify-between px-6 py-4 md:flex">
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-white uppercase">
            Circle Overview
          </h2>
          <p className="mt-1 text-sm font-semibold tracking-wide text-gray-500 uppercase">
            <span className="inline-block h-3 w-32 animate-pulse rounded bg-gray-700" />
          </p>
        </div>
        <div className="text-right">
          <div className="h-7 w-16 animate-pulse rounded bg-gray-600" />
          <div className="mt-1 text-xs tracking-wide text-gray-500 uppercase">Total</div>
        </div>
      </div>

      {/* Desktop: Main content — real circles, real row structure, skeleton numbers */}
      <div className="bg-card hidden px-14 pt-14 pb-14 md:block">
        <div className="flex items-stretch gap-28">
          {/* Real concentric circles */}
          <div className="flex flex-shrink-0 items-center justify-center" style={{ width: 440 }}>
            <div className="relative" style={{ width: 440, height: 440 }}>
              {CIRCLES.map((c, i) => (
                <div
                  key={i}
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: c.size,
                    height: c.size,
                    top: c.offset,
                    left: c.offset,
                    background: c.bg,
                    border: `3px ${c.borderStyle} ${c.border}`,
                  }}
                >
                  <span
                    className="absolute whitespace-nowrap"
                    style={
                      c.isCore
                        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                        : { top: 2, left: '50%', transform: 'translateX(-50%)' }
                    }
                  >
                    <c.Icon style={{ width: c.iconSize, height: c.iconSize, color: c.iconColor }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real stat rows with skeleton values */}
          <div className="flex h-full flex-1 flex-col justify-between gap-2">
            {STAT_ROWS.map((row) => (
              <div
                key={row.name}
                className="relative flex-1 overflow-hidden"
                style={{
                  background: row.gradient,
                  border: `2px ${row.borderStyle} ${row.border}`,
                }}
              >
                <row.Icon
                  className="absolute top-1/2 -left-6 h-28 w-28 -translate-y-1/2 opacity-10"
                  style={{ color: row.bgIconColor }}
                />
                <div className="relative z-10 flex h-full items-center px-4 py-4">
                  <div className="flex-1 pl-14">
                    <div
                      className="text-lg font-bold tracking-wide uppercase"
                      style={{ color: row.textColor }}
                    >
                      {row.name}
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <StatSkeleton
                      color={
                        row.textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)'
                      }
                    />
                    <div className={`mt-1 text-xs tracking-wide uppercase ${row.labelColor}`}>
                      Total
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <StatSkeleton
                      color={
                        row.textColor === '#ffffff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.1)'
                      }
                    />
                    <div className={`mt-1 text-xs tracking-wide uppercase ${row.labelColor}`}>
                      New
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Bottom charts — skeleton placeholders */}
      <div className="mt-6 hidden grid-cols-2 gap-6 md:grid">
        <div className="bg-card flex h-80 items-center justify-center rounded">
          <div className="text-muted-foreground text-sm tracking-wide uppercase">
            Loading chart...
          </div>
        </div>
        <div className="bg-card flex h-80 items-center justify-center rounded">
          <div className="text-muted-foreground text-sm tracking-wide uppercase">
            Loading chart...
          </div>
        </div>
      </div>
    </div>
  );
}
