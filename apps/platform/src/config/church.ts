/**
 * Church Configuration
 *
 * This is THE file to edit when setting up a new church deployment.
 * All church identity and branding text lives here — not in .env.
 *
 * For branding colors, also update globals.css:
 *   --brand-primary, --brand-primary-dark, --brand-secondary
 */

export const churchConfig = {
  // ── Church Identity ─────────────────────────────────────────────
  /** Full church name — footers, metadata, headers */
  name: 'McLean Bible Church',

  /** Short abbreviation — used where space is limited */
  abbreviation: 'MBC',

  /** Church tagline — footer, sign-in page */
  tagline: '',

  /** Public-facing church website */
  websiteUrl: 'https://mcleanbible.org',

  /** Privacy policy page */
  privacyUrl: 'https://mcleanbible.org/privacy',

  // ── App Branding ────────────────────────────────────────────────
  /** App display name — header, page titles, PWA */
  appName: 'MBC Apps',

  /** App description — metadata, PWA manifest */
  appDescription: 'Internal tools and dashboards for McLean Bible Church staff and volunteers',

  /** Builder credit — shown in footer (leave empty to hide) */
  builtBy: '',

  // ── Deployment (from env) ───────────────────────────────────────
  /** MinistryPlatform base URL — sign-out redirect, image loading */
  mpBaseUrl: process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_BASE_URL || '',

  /** MinistryPlatform file URL — profile images, file downloads */
  mpFileUrl: process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL || '',
} as const;

/** Page title helper — "Page Name | MBC Apps | McLean Bible Church" */
export function pageTitle(page?: string): string {
  const base = `${churchConfig.appName} | ${churchConfig.name}`;
  return page ? `${page} | ${base}` : base;
}

/** Footer links derived from config */
export function footerLinks(): Array<{ label: string; href: string; external: boolean }> {
  const links: Array<{ label: string; href: string; external: boolean }> = [];

  const website: string = churchConfig.websiteUrl;
  if (website && website !== 'https://example.com') {
    const display = website.replace(/^https?:\/\//, '');
    links.push({ label: display, href: website, external: true });
  }

  const privacy: string = churchConfig.privacyUrl;
  if (privacy && privacy !== 'https://example.com/privacy') {
    links.push({ label: 'Privacy Policy', href: privacy, external: true });
  }

  return links;
}
