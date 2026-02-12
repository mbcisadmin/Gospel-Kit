// Central Database Client (Drizzle ORM)
//
// This file provides the Drizzle client for the central Neon database
// that holds multi-tenant metadata (tenants table, business/sales data).
// Separate from the per-church Neon database (neon/client.ts).

import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';

// Import all schemas
import * as tenantsSchema from './schemas/tenants';

// Lazy-initialized database client
let _db: NeonHttpDatabase<typeof tenantsSchema> | null = null;

/**
 * Get the central Drizzle database client.
 * Lazily initializes on first call to avoid build-time errors when CENTRAL_DATABASE_URL isn't set.
 */
export function getCentralDb(): NeonHttpDatabase<typeof tenantsSchema> {
  if (!_db) {
    if (!process.env.CENTRAL_DATABASE_URL) {
      throw new Error('CENTRAL_DATABASE_URL environment variable is not set');
    }
    const sql = neon(process.env.CENTRAL_DATABASE_URL);
    _db = drizzle(sql, {
      schema: {
        ...tenantsSchema,
      },
    });
  }
  return _db;
}

// Proxy for convenient usage — lazily initializes on first property access
export const centralDb = new Proxy({} as NeonHttpDatabase<typeof tenantsSchema>, {
  get(_, prop) {
    return (getCentralDb() as any)[prop];
  },
});

// Re-export schema types for convenience
export * from './schemas/tenants';
