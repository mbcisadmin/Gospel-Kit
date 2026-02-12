import { defineConfig } from 'drizzle-kit';

// Drizzle ORM Configuration for Central Database
//
// This file configures Drizzle Kit for managing the central multi-tenant database.
// Separate from drizzle.config.ts which handles per-church Neon schemas.
//
// Usage:
//   npx drizzle-kit push --config=drizzle.central.config.ts
//   npx drizzle-kit generate --config=drizzle.central.config.ts

export default defineConfig({
  // Schema location
  schema: './packages/core/database/src/central/schemas/**/*.ts',

  // Migration output directory
  out: './database/central/migrations',

  // Database driver
  dialect: 'postgresql',

  // Database connection (from environment variable)
  dbCredentials: {
    url: process.env.CENTRAL_DATABASE_URL || '',
  },

  // Verbose logging
  verbose: true,

  // Strict mode (recommended)
  strict: true,
});
