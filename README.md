# Gospel Kit

> **A modern, type-safe toolkit for building church applications with
> MinistryPlatform integration**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue)](https://www.typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-latest-red)](https://turbo.build)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com)

Gospel Kit is a Turborepo monorepo template that provides everything you need to
build custom apps, microsites, and integrations for churches using
MinistryPlatform. It emphasizes type safety, proper audit logging, and developer
experience.

## 🎯 What's Included

### 📦 Shared Packages

**Core Packages** (framework-agnostic):

- **`@church/ministry-platform`** - Type-safe MP API client with automatic token
  management and **enforced userId auditing**
- **`@church/database`** - Zod schemas for runtime validation and TypeScript
  types

**Next.js Packages**:

- **`@church/nextjs-auth`** - NextAuth v5 configuration with MP OAuth, role
  fetching, and user impersonation
- **`@church/nextjs-ui`** - Complete Shadcn UI component library + admin tools +
  PWA components

### 🚀 Apps Platform

A production-ready Next.js 16 platform for hosting multiple micro-apps:

- **Counter App** - Event metrics tracking (included as working example)
- Route-based authentication with middleware
- Each micro-app independently installable as PWA
- Campus/congregation selection with context
- Dark mode support
- Admin user impersonation for testing

### 🛠️ Claude Skills

Pre-built skills to accelerate development:

- **`new-micro-app`** - Scaffold complete micro-apps
- **`new-api-route`** - Create type-safe API endpoints
- **`new-entity`** - Add Zod schemas for MP tables
- **`new-stored-proc`** - Template stored procedures
- **`mp-troubleshoot`** - Debug common MP issues

## 🏗️ Architecture

```
gospel-kit-template/
├── packages/
│   ├── core/
│   │   ├── ministry-platform/    # MP API client
│   │   └── database/              # Zod schemas
│   └── nextjs/
│       ├── auth/                  # NextAuth config
│       └── ui/                    # UI components
├── apps/
│   └── platform/                  # Multi-tenant apps platform
│       ├── src/app/(app)/         # Protected micro-apps
│       │   └── counter/           # Example: Counter app
│       ├── src/app/api/           # API routes
│       └── src/services/          # Business logic layer
├── database/
│   ├── baseline/                  # MP built-in table scripts
│   ├── customizations/            # Church-specific tables
│   └── migrations/                # Schema changes
└── .claude/
    └── skills/                    # Development automation
```

## 🎨 Key Features

### Type Safety Throughout

```typescript
import { Event, CreateEventMetricSchema } from '@church/database';
import { TableService } from '@church/ministry-platform';

// Runtime validation with Zod
const validatedData = CreateEventMetricSchema.parse(body);

// Type-safe API calls
const events = await tableService.getTableRecords<Event>('Events', {
  $select: 'Event_ID,Event_Title,Event_Start_Date',
});
```

### Enforced Audit Logging

```typescript
// ❌ Won't compile - userId required
await tableService.createTableRecords('Event_Metrics', [data]);

// ✅ Correct - userId enforced at TypeScript level
await tableService.createTableRecords(
  'Event_Metrics',
  [data],
  userId // REQUIRED for proper MP audit logging
);
```

### Authentication & Authorization

```typescript
// Built-in MP OAuth with role fetching
const session = await auth();

if (!session?.contactId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Roles from Security Roles + User Groups
const hasAccess = session.roles?.includes('Event Coordinators');
```

### Component Library

```typescript
import {
  Button,
  Card,
  Dialog,
  Form,
  Calendar,
  // ... 23 total Shadcn components
} from '@church/nextjs-ui';

// Plus admin tools
import {
  AppSimulationModal,
  UserMenu,
  PWAInstallPrompt,
} from '@church/nextjs-ui';
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20.9+ (LTS)
- MinistryPlatform instance with OAuth configured
- Git

### Quick Start

See **[SETUP.md](./SETUP.md)** for complete church onboarding guide.

```bash
# 1. Clone for your church
git clone <template-url> my-church-apps
cd my-church-apps

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your MP credentials

# 4. Start development
npm run dev
```

Visit `http://localhost:3000` to see the apps platform.

**For day-to-day development:** See **[DEVELOPMENT.md](./DEVELOPMENT.md)** for
testing, formatting, database workflows, and IDE setup.

## 📖 Development Workflow

### Creating a New Micro-App

Use the Claude skill:

```bash
/new-micro-app
```

Or manually:

1. Create route: `apps/platform/src/app/(app)/my-app/page.tsx`
2. Create API: `apps/platform/src/app/api/my-app/route.ts`
3. Create service: `apps/platform/src/services/myAppService.ts`
4. Add to database table (for listing in nav)

### Adding a New Entity Schema

Use the Claude skill:

```bash
/new-entity
```

Or manually create in `packages/core/database/schemas/`:

- `baseline/[table].ts` - For MP built-in tables (only fields you use)
- `custom/[table].ts` - For church-specific tables (all fields)

### Creating an API Endpoint

Use the Claude skill:

```bash
/new-api-route
```

Always include:

- ✅ Authentication check with `await auth()`
- ✅ Use `session.contactId` for userId
- ✅ Validate inputs (use Zod schemas)
- ✅ Proper error handling
- ✅ Type-safe responses

### Creating a Stored Procedure

Use the Claude skill:

```bash
/new-stored-proc
```

Follow naming convention: `api_Custom_[Name]_JSON`

## 🎨 Customization

### Branding

Update CSS variables in `apps/platform/src/app/globals.css`:

```css
:root {
  --brand-primary: #61bc47; /* Your primary color */
  --brand-secondary: #1c2b39; /* Your secondary color */
}
```

### Church Name

Search and replace:

- Update page titles in components
- Update manifest in `apps/platform/src/app/api/manifest/route.ts`
- Update README and documentation

### Workspace Scope

To rename from `@church/*` to `@yourchurch/*`:

1. Update all `package.json` files
2. Update all imports
3. Run `npm install` to relink

## 🔒 Security Best Practices

### Always Pass userId for Mutations

```typescript
// CREATE operations
await tableService.createTableRecords(table, [data], userId);

// UPDATE operations
await tableService.updateTableRecords(table, [data], userId);
```

This ensures proper audit logging in MP's `Domain_User` table.

### Validate All Inputs

```typescript
import { CreateEventMetricSchema } from '@church/database';

// Runtime validation
const validatedData = CreateEventMetricSchema.parse(requestBody);
```

### Use Session Data Correctly

```typescript
// ✅ Correct - use contactId for userId
const userId = parseInt(session.contactId);

// ❌ Wrong - don't use user.id
const userId = session.user.id;

// ❌ Wrong - don't use accessToken as userId
const userId = session.accessToken;
```

## 📚 Package Documentation

### @church/ministry-platform

Core MP API client with automatic token management.

**Key Classes:**

- `MinistryPlatformClient` - OAuth token management
- `TableService` - CRUD operations on MP tables
- `ProcedureService` - Execute stored procedures

**Example:**

```typescript
import {
  MinistryPlatformClient,
  TableService,
} from '@church/ministry-platform';

const client = new MinistryPlatformClient();
const tableService = new TableService(client);

await client.ensureValidToken();
const events = await tableService.getTableRecords('Events', {
  $filter: "Event_Start_Date >= '2024-01-01'",
  $select: 'Event_ID,Event_Title',
});
```

### @church/database

Zod schemas for type safety and validation.

**Organization:**

- `schemas/baseline/` - MP built-in tables (partial schemas)
- `schemas/custom/` - Church-specific tables (complete schemas)

**Example:**

```typescript
import { Event, EventMeta, CreateEventMetricSchema } from '@church/database';

// TypeScript type
const event: Event = { Event_ID: 1, Event_Title: 'Sunday Service' };

// Runtime validation
const metric = CreateEventMetricSchema.parse(data);

// Table metadata
console.log(EventMeta.table); // "Events"
console.log(EventMeta.usedBy); // ["apps-platform"]
```

### @church/nextjs-auth

NextAuth v5 with MP OAuth integration.

**Features:**

- MP OAuth provider
- Automatic role fetching (Security Roles + User Groups)
- Token refresh
- User impersonation for admins

**Usage:**

```typescript
import { auth } from '@church/nextjs-auth';

const session = await auth();
// session.contactId, session.roles, session.accessToken
```

### @church/nextjs-ui

Complete Shadcn UI library + custom components.

**Includes:**

- 23 Shadcn UI components
- Admin tools (AppSimulationModal, UserMenu)
- PWA components (DynamicManifest, PWAInstallPrompt)
- Infrastructure (ThemeProvider, SessionProvider)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your repository to GitHub
2. Connect to Vercel
3. Configure:
   - Framework: Next.js
   - Root Directory: `apps/platform`
   - Build Command: `cd ../.. && npm run build --filter=@church/apps-platform`
   - Install Command: `npm install`
4. Set environment variables in Vercel dashboard
5. Deploy!

### Environment Variables

Required for production:

```env
MINISTRY_PLATFORM_BASE_URL=https://your-church.ministryplatform.com
MINISTRY_PLATFORM_CLIENT_ID=your-client-id
MINISTRY_PLATFORM_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=https://apps.yourchurch.org
```

Generate secret:

```bash
openssl rand -base64 32
```

## 🗄️ Database Setup

See `database/` folder for:

- Baseline table scripts (reference only)
- Custom table migrations
- Stored procedure definitions

### Required Stored Procedures

- `api_Custom_GetUserRolesAndGroups_JSON` - Role fetching for auth
- `api_Custom_GetCongregationsWithSVG` - Campus selection (Counter app)

See individual `.sql` files in `database/customizations/stored-procedures/`

## 🐛 Troubleshooting

Use the troubleshooting skill:

```bash
/mp-troubleshoot
```

Common issues:

- **401 Unauthorized** - Check OAuth credentials and token refresh
- **Empty results** - Verify table permissions and $filter syntax
- **TypeScript errors** - Ensure workspace packages are linked
- **Stored proc fails** - Check registration in MP Admin Console

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

Copyright (c) 2024-present Colton Wirgau

## 🤝 Contributing

This template is maintained for multiple churches. To propose changes:

1. Test thoroughly with real MP data
2. Ensure backward compatibility
3. Update documentation
4. Consider if change is church-specific or universal

## 📞 Support

- Review `.claude/skills/` for development guides
- Check `database/customizations/` for MP setup examples
- See `SETUP.md` for onboarding checklist

---

**Built with:**

- [Next.js 16](https://nextjs.org) (Turbopack)
- [Turborepo](https://turbo.build)
- [NextAuth.js v5](https://next-auth.js.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [MinistryPlatform](https://www.ministryplatform.com)
