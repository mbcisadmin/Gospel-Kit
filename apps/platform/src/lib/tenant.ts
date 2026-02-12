import { headers } from 'next/headers';

/**
 * Tenant info resolved from middleware via request headers.
 * Only available in multi-tenant mode (*.churchhub.dev or custom domain).
 */
export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  mpDomain: string;
  mpClientId: string;
  logoUrl: string | null;
  primaryColor: string | null;
}

/**
 * Read tenant info from request headers set by middleware.
 *
 * Returns null in single-tenant mode (localhost, no subdomain).
 * Headers are server-side only — they never reach the browser.
 */
export async function getTenant(): Promise<TenantInfo | null> {
  const h = await headers();
  const id = h.get('x-tenant-id');

  // No tenant header = single-tenant mode
  if (!id) return null;

  return {
    id,
    slug: h.get('x-tenant-slug') ?? '',
    name: h.get('x-tenant-name') ?? '',
    mpDomain: h.get('x-tenant-mp-domain') ?? '',
    mpClientId: h.get('x-tenant-mp-client-id') ?? '',
    logoUrl: h.get('x-tenant-logo-url'),
    primaryColor: h.get('x-tenant-primary-color'),
  };
}
