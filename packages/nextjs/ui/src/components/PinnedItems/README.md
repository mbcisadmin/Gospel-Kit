# PinnedItems Component Library

A flexible, extensible system for displaying pinned items on the homepage with
support for multiple item types and custom card layouts.

## Architecture

The PinnedItems system follows Gospel Kit's architectural principles:

- **Church-Agnostic**: No hardcoded church-specific data or styling
- **Type-Safe**: Full TypeScript + Zod validation via `@church/database`
- **Extensible**: Easy to add new card types through registry pattern
- **Reusable**: Clean separation between layout, behavior, and presentation

## Package Organization

```
@church/database (core)
└── schemas/custom/pinned-items.ts  # Zod schemas & types

@church/nextjs-ui (nextjs)
└── components/PinnedItems/
    ├── PinnedItemsGrid.tsx         # Container with animations
    ├── PinnedCardWrapper.tsx       # Base card wrapper
    ├── cardRegistry.ts             # Type→Component mapping
    ├── cards/
    │   ├── BudgetPinnedCard.tsx    # Budget project card
    │   └── DefaultPinnedCard.tsx   # Fallback card
    └── index.ts                    # Public exports
```

## Installation

The components are already available in your Gospel Kit project via the
`@church/nextjs-ui` package.

## Basic Usage

### 1. In Your App (e.g., `/apps/platform`)

Create a custom hook to manage pinned items:

```typescript
// apps/platform/src/hooks/usePinnedItems.ts
import { useState, useEffect, useCallback } from 'react';
import type { PinnedItem, PinnedItemType } from '@church/database';

export function usePinnedItems() {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPinnedItems = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch('/api/pinned-items');
    const data = await response.json();
    setPinnedItems(data);
    setIsLoading(false);
  }, []);

  const unpinItem = useCallback(
    async (itemType: PinnedItemType, itemId: string) => {
      // Optimistic update
      setPinnedItems((prev) =>
        prev.filter(
          (item) => !(item.item_type === itemType && item.item_id === itemId)
        )
      );

      try {
        await fetch(`/api/pinned-items?itemType=${itemType}&itemId=${itemId}`, {
          method: 'DELETE',
        });
        return true;
      } catch (error) {
        await fetchPinnedItems(); // Rollback on error
        throw error;
      }
    },
    [fetchPinnedItems]
  );

  useEffect(() => {
    fetchPinnedItems();
  }, [fetchPinnedItems]);

  return { pinnedItems, isLoading, unpinItem, refetch: fetchPinnedItems };
}
```

### 2. Display Pinned Items

```typescript
// apps/platform/src/app/page.tsx
'use client';

import {
  PinnedItemsGrid,
  PinnedCardWrapper,
  getPinnedCardComponent,
} from '@church/nextjs-ui';
import { usePinnedItems } from '@/hooks/usePinnedItems';

export default function HomePage() {
  const { pinnedItems, isLoading, unpinItem } = usePinnedItems();

  return (
    <div className="container">
      <PinnedItemsGrid
        items={pinnedItems}
        isLoading={isLoading}
        onUnpin={unpinItem}
        renderCard={(item, onUnpin) => {
          const CardContent = getPinnedCardComponent(item.item_type);
          return (
            <PinnedCardWrapper item={item} onUnpin={onUnpin}>
              <CardContent item={item} />
            </PinnedCardWrapper>
          );
        }}
      />

      {/* Rest of your homepage */}
    </div>
  );
}
```

## Adding Custom Card Types

### Step 1: Update Type Definition

If adding a new type, update the schema:

```typescript
// packages/core/database/src/ministry-platform/schemas/custom/pinned-items.ts
export const PinnedItemTypeSchema = z.enum([
  'budget-project',
  'event', // Add your new type
  'custom',
]);
```

### Step 2: Create Card Component

```typescript
// packages/nextjs/ui/src/components/PinnedItems/cards/EventPinnedCard.tsx
'use client';

import type { PinnedItem } from '@church/database';
import { Calendar, Users } from 'lucide-react';

interface EventPinnedCardProps {
  item: PinnedItem;
}

export function EventPinnedCard({ item }: EventPinnedCardProps) {
  const { title, subtitle, stats } = item.item_data;
  const attendees = stats?.find(s => s.label === 'Attendees');

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-foreground mb-4">
        {title}
      </h2>

      {subtitle && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="w-4 h-4" />
          <span>{subtitle}</span>
        </div>
      )}

      {attendees && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4" />
          <span>{attendees.value} attendees</span>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Register in Registry

```typescript
// packages/nextjs/ui/src/components/PinnedItems/cardRegistry.ts
import { EventPinnedCard } from './cards/EventPinnedCard';

const CARD_COMPONENTS: Partial<Record<PinnedItemType, PinnedCardComponent>> = {
  'budget-project': BudgetPinnedCard,
  event: EventPinnedCard, // Add your card
};
```

### Step 4: Export Component

```typescript
// packages/nextjs/ui/src/components/PinnedItems/index.ts
export { EventPinnedCard } from './cards/EventPinnedCard';
```

That's it! The new card type will automatically work.

## API Routes (App-Specific)

Create API routes in your app to manage pinned items:

```typescript
// apps/platform/src/app/api/pinned-items/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { CreatePinnedItemSchema } from '@church/database';

export async function GET() {
  const session = await auth();
  if (!session?.user?.contactId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch from your database
  const items = await db.pinnedItems.findMany({
    where: { contact_id: session.user.contactId },
    orderBy: { sort_order: 'asc' },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.contactId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validated = CreatePinnedItemSchema.parse(body);

  // Insert into database
  const item = await db.pinnedItems.create({
    data: {
      contact_id: session.user.contactId,
      item_type: validated.itemType,
      item_id: validated.itemId,
      item_data: validated.itemData,
      route: validated.route,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.contactId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const itemType = searchParams.get('itemType');
  const itemId = searchParams.get('itemId');

  await db.pinnedItems.deleteMany({
    where: {
      contact_id: session.user.contactId,
      item_type: itemType,
      item_id: itemId,
    },
  });

  return NextResponse.json({ success: true });
}
```

## Database Schema

You'll need a custom table in MinistryPlatform:

```sql
CREATE TABLE [dbo].[User_Pinned_Items] (
    [User_Pinned_Item_ID] INT IDENTITY(1,1) PRIMARY KEY,
    [Contact_ID] INT NOT NULL,
    [Item_Type] NVARCHAR(50) NOT NULL,
    [Item_ID] NVARCHAR(100) NOT NULL,
    [Item_Data] NVARCHAR(MAX) NOT NULL, -- JSON
    [Route] NVARCHAR(500) NOT NULL,
    [Sort_Order] INT NOT NULL DEFAULT 0,
    [Created_Date] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_User_Pinned_Items_Contact
        FOREIGN KEY ([Contact_ID]) REFERENCES [dbo].[Contacts]([Contact_ID])
);
```

## Component API

### PinnedItemsGrid

```typescript
interface PinnedItemsGridProps<T extends PinnedItem> {
  items: T[]; // Array of pinned items
  isLoading: boolean; // Loading state
  onUnpin: (itemType, itemId) => Promise<boolean>; // Unpin callback
  renderCard: (item, onUnpin) => ReactNode; // Card renderer
  className?: string; // Grid layout classes
}
```

### PinnedCardWrapper

```typescript
interface PinnedCardWrapperProps {
  item: PinnedItem; // The item to display
  onUnpin: (itemType, itemId) => Promise<boolean>; // Unpin callback
  children: ReactNode; // Card content
}
```

### Card Registry

```typescript
getPinnedCardComponent(itemType: PinnedItemType): PinnedCardComponent
registerPinnedCardComponent(itemType: PinnedItemType, component: PinnedCardComponent): void
getRegisteredItemTypes(): PinnedItemType[]
```

## Styling

Uses Tailwind CSS with Gospel Kit's design tokens:

- `bg-card`, `border-border`, `text-foreground` - Semantic colors
- `#61BC47` - Woodside brand green (customize via CSS variables)
- Dark mode fully supported with `dark:` variants

Customize via your app's `globals.css`:

```css
:root {
  --brand-primary: #your-color;
  --primary: var(--brand-primary);
}
```

## Best Practices

1. **Keep Cards Church-Agnostic**: No hardcoded church names/data
2. **Use Zod Schemas**: Always validate with `@church/database` schemas
3. **Optimistic UI**: Update UI immediately, rollback on error
4. **Type Safety**: Let TypeScript catch issues at compile time
5. **Follow Gospel Kit Patterns**: Match existing component structure

## Questions?

- Check Gospel Kit's `CLAUDE.md` for architectural guidance
- See `packages/nextjs/ui/src/components/` for component examples
- Review `packages/core/database/` for schema patterns
