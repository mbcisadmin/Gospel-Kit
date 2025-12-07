# Changelog

All notable changes to Gospel Kit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Next.js 16 Upgrade** - Upgraded to Next.js 16.0.7 with Turbopack
  - Turbopack is now the default bundler (50%+ faster builds)
  - Updated to NextAuth v5 beta.30 (latest)
  - Added compatibility wrapper for NextAuth handlers until official Next.js 16
    support
  - Updated minimum requirements: Node.js 20.9+ (LTS), TypeScript 5.1+
  - All tests passing, production builds successful

### Changed

- **Developer Tooling** - Added comprehensive developer experience improvements
  - Prettier with Tailwind CSS plugin for code formatting
  - Vitest for fast, modern testing with example tests
  - Drizzle ORM setup for Neon PostgreSQL (placeholder)
  - Husky + lint-staged for pre-commit formatting
  - VS Code workspace settings and recommended extensions
  - DEVELOPMENT.md comprehensive guide

### Known Issues

- **NextAuth + Next.js 16** - Temporary compatibility wrapper required
  - NextAuth v5 doesn't officially support Next.js 16 yet
  - Wrapper in `apps/platform/src/app/api/auth/[...nextauth]/route.ts` bridges
    the gap
  - All auth functionality works perfectly - no features lost
  - Will be removed when NextAuth adds Next.js 16 support
  - Tracking: https://github.com/nextauthjs/next-auth/issues/13302

### Planned

- Counter App - Event metrics tracking example
- People Search - Contact lookup micro-app
- RSVP Widget - Public event registration

## [1.0.0] - TBD

### Added

- **Monorepo Architecture** - Turborepo with shared packages
- **Core Packages**
  - `@church/ministry-platform` - Type-safe MP API client with enforced audit
    logging
  - `@church/database` - Zod schemas for runtime validation and TypeScript types
- **Next.js Packages**
  - `@church/nextjs-auth` - NextAuth v5 with MP OAuth, role fetching, and
    impersonation
  - `@church/nextjs-ui` - Complete Shadcn UI component library (23 components)
  - `@church/tailwind-config` - Shared Tailwind preset with CSS variable theming
- **Apps Platform** - Next.js 15 multi-app platform with route-based auth
- **Claude Skills** - 5 development automation skills:
  - `new-micro-app` - Scaffold complete micro-apps
  - `new-api-route` - Create type-safe API endpoints
  - `new-entity` - Add Zod schemas for MP tables
  - `new-stored-proc` - Template stored procedures
  - `mp-troubleshoot` - Debug common MP issues
- **Architecture Documentation** - 5 ADRs covering key technical decisions
- **Database Scripts** - Baseline table references and stored procedure
  templates
- **GitHub Workflows** - CI/CD for linting, type checking, and Vercel deployment
- **Comprehensive Documentation** - README, SETUP guide, CLAUDE.md, and skill
  docs
- **MIT License** - Open source licensing for church use

### Features

- Type-safe MP API calls with automatic token management
- Enforced `$userId` parameter for proper audit logging
- CSS variable theming for easy church branding customization
- Raw TypeScript packages (no build step) for better DX
- Role-based access control from Security Roles + User Groups
- Admin user impersonation for testing
- Dark mode support
- PWA installation support
- Campus/congregation selection with context

### Developer Experience

- Hot module replacement with Turbopack
- TypeScript strict mode throughout
- Zod runtime validation
- ESLint and Prettier configured
- VS Code recommended extensions
- Detailed error messages and troubleshooting guides

---

## Release Guidelines

### Version Numbers

- **Major (X.0.0)** - Breaking changes requiring migration
- **Minor (0.X.0)** - New features, backward compatible
- **Patch (0.0.X)** - Bug fixes, backward compatible

### Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
