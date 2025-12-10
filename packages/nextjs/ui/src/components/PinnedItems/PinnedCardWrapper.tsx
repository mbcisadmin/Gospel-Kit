'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { PinnedItem, PinnedItemType } from '@church/database';

interface PinnedCardWrapperProps {
  item: PinnedItem;
  onUnpin: (itemType: PinnedItemType, itemId: string) => Promise<boolean>;
  children: React.ReactNode;
}

export function PinnedCardWrapper({ item, onUnpin, children }: PinnedCardWrapperProps) {
  const [isUnpinning, setIsUnpinning] = useState(false);

  const handleUnpin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUnpinning) return;

    setIsUnpinning(true);
    try {
      await onUnpin(item.item_type, item.item_id);
    } catch (error) {
      console.error('Failed to unpin item:', error);
      setIsUnpinning(false);
    }
  };

  return (
    <div className="bg-card border-border group relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg">
      <button
        onClick={handleUnpin}
        disabled={isUnpinning}
        className="bg-card border-border absolute top-3 right-3 z-10 rounded-md border p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:border-red-300 hover:bg-red-50 dark:hover:border-red-700 dark:hover:bg-red-900/20"
        title="Unpin from homepage"
        aria-label="Unpin from homepage"
      >
        <X className="text-muted-foreground h-4 w-4 hover:text-red-600 dark:hover:text-red-400" />
      </button>
      <Link href={item.route} className="block">
        {children}
      </Link>
    </div>
  );
}
