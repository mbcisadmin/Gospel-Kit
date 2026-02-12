// Central Database (Multi-Tenant)
//
// This module provides the Drizzle ORM client and schemas for the central
// Neon database that holds SaaS/multi-tenant data:
// - Tenant configuration (slug, MP credentials, branding)
// - Business/sales data (future)

// Export the database client
export { centralDb } from './client';

// Export all schemas and types
export * from './schemas/tenants';

// Export services
export * from './services/tenant';
