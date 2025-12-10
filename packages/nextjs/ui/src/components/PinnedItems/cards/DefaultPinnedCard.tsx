'use client';

import type { PinnedItem } from '@church/database';
import { Info } from 'lucide-react';

interface DefaultPinnedCardProps {
  item: PinnedItem;
}

/**
 * Default fallback card for pinned item types that don't have a specific card component
 */
export function DefaultPinnedCard({ item }: DefaultPinnedCardProps) {
  const { title, subtitle } = item.item_data;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-foreground text-lg font-bold transition-colors hover:text-[#61BC47]">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>

      <div className="text-muted-foreground text-xs italic">Item type: {item.item_type}</div>
    </div>
  );
}
