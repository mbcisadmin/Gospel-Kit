import { eq, and } from 'drizzle-orm';
import { centralDb } from '../client';
import { tenants, type Tenant } from '../schemas/tenants';

/**
 * Look up an active tenant by slug (subdomain).
 * Returns null if not found or inactive.
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const results = await centralDb
    .select()
    .from(tenants)
    .where(and(eq(tenants.slug, slug), eq(tenants.active, true)))
    .limit(1);

  return results[0] ?? null;
}

/**
 * Look up an active tenant by custom domain.
 * Returns null if not found or inactive.
 */
export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const results = await centralDb
    .select()
    .from(tenants)
    .where(and(eq(tenants.customDomain, domain), eq(tenants.active, true)))
    .limit(1);

  return results[0] ?? null;
}
