import { pgTable, uuid, varchar, boolean, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Tenants Table
 * Central database table mapping subdomains to church configurations.
 *
 * Each tenant represents a church deployment with its own:
 * - MinistryPlatform credentials (mp_domain, mp_client_id, mp_client_secret)
 * - Branding (logo_url, primary_color)
 * - Optional custom domain
 *
 * Looked up by slug (subdomain) or custom_domain in middleware.
 */
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 63 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    mpDomain: varchar('mp_domain', { length: 255 }),
    mpClientId: varchar('mp_client_id', { length: 255 }),
    mpClientSecret: varchar('mp_client_secret', { length: 255 }),
    customDomain: varchar('custom_domain', { length: 255 }),
    logoUrl: varchar('logo_url', { length: 500 }),
    primaryColor: varchar('primary_color', { length: 7 }),
    active: boolean('active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('tenants_slug_key').on(table.slug),
    index('idx_tenants_slug')
      .on(table.slug)
      .where(sql`(active = true)`),
    index('idx_tenants_custom_domain')
      .on(table.customDomain)
      .where(sql`((active = true) AND (custom_domain IS NOT NULL))`),
  ]
);

// Export types
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
