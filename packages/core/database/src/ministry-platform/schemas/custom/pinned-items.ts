import { z } from 'zod';

/**
 * Valid types for pinned items
 * Extend this union as new pinnable item types are added
 */
export const PinnedItemTypeSchema = z.enum(['budget-project', 'event', 'custom']);

export type PinnedItemType = z.infer<typeof PinnedItemTypeSchema>;

/**
 * Flexible data structure for pinned item content
 * Each item type can have different fields in item_data
 */
export const PinnedItemDataSchema = z
  .object({
    title: z.string(),
    subtitle: z.string().optional(),
    icon: z.string().optional(),
    stats: z
      .array(
        z.object({
          label: z.string(),
          actual: z.string().optional(),
          expected: z.string().optional(),
          value: z.string().optional(),
        })
      )
      .optional(),
    status: z.string().optional(),
    budgetStatus: z.enum(['under', 'on-track', 'over']).optional(),
  })
  .passthrough(); // Allow additional custom fields

export type PinnedItemData = z.infer<typeof PinnedItemDataSchema>;

/**
 * Schema for a pinned item as stored in the database
 */
export const PinnedItemSchema = z.object({
  user_pinned_item_id: z.number(),
  contact_id: z.number(),
  item_type: PinnedItemTypeSchema,
  item_id: z.string(),
  item_data: PinnedItemDataSchema,
  route: z.string(),
  sort_order: z.number(),
  created_date: z.string(),
});

export type PinnedItem = z.infer<typeof PinnedItemSchema>;

/**
 * Schema for creating a new pinned item
 */
export const CreatePinnedItemSchema = z.object({
  itemType: PinnedItemTypeSchema,
  itemId: z.string(),
  itemData: PinnedItemDataSchema,
  route: z.string(),
});

export type CreatePinnedItem = z.infer<typeof CreatePinnedItemSchema>;

/**
 * Schema for querying pinned items
 */
export const GetPinnedItemsQuerySchema = z.object({
  itemType: PinnedItemTypeSchema.optional(),
  itemId: z.string().optional(),
});

export type GetPinnedItemsQuery = z.infer<typeof GetPinnedItemsQuerySchema>;
