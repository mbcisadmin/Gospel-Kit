# CLAUDE.md

This file provides guidance to Claude Code when working with the Gospel Kit template.

## Repository Overview

Gospel Kit is a Next.js + MinistryPlatform integration template for churches. It provides:

- **Monorepo Architecture** - Turborepo with shared packages
- **MinistryPlatform Integration** - OAuth, API client, audit logging
- **Shared Packages** - Reusable code across church apps
- **Church Customization** - Easy branding via CSS variables

## Architecture Principles

### Package Organization

```
gospel-kit-template/
├── apps/
│   └── platform/          # Main church apps platform
├── packages/
│   ├── core/              # Framework-agnostic packages
│   │   ├── database/      # Zod schemas, data models
│   │   └── ministry-platform/  # MP API client
│   └── nextjs/            # Next.js-specific packages
│       ├── auth/          # NextAuth + MP OAuth
│       ├── ui/            # Shared React components
│       └── tailwind-config/  # Design tokens, Tailwind preset
```

**Organization Rules:**
- `packages/core/*` - No React/Next.js dependencies
- `packages/nextjs/*` - Next.js/React-specific code
- `apps/*` - Specific applications (not shared)

---

## When to Abstract vs Keep Local

This is the **most important decision** when building with Gospel Kit.

### Decision Framework

Ask these questions **in order**:

#### 1. What type of code is this?

**UI Components** (carousel, modal, table, form inputs)
- ✅ Church-agnostic design? → Abstract to `@church/nextjs-ui` **immediately**
- ❌ Has hardcoded church branding? → Keep local, abstract later

**Business Logic** (annual meeting flow, budget approval process)
- ❌ Keep in app until needed in 3+ places (Rule of Three)
- ✅ Exception: Core MP patterns → Abstract to `@church/ministry-platform`

**Data Models** (Contact schema, Event schema)
- ✅ Standard MP tables? → Abstract to `@church/database` **immediately**
- ❌ Church-specific custom tables? → Keep local until proven reusable

**Utilities** (date formatting, string parsing, calculations)
- ✅ Pure functions with no coupling? → Abstract to appropriate package
- ❌ Uses church-specific logic? → Keep local

#### 2. Is it church-agnostic?

✅ **Abstract immediately if:**
- No hardcoded church names, colors, or content
- Works for any church using MinistryPlatform
- Example: Carousel component, MP API wrapper, Contact schema

❌ **Keep local if:**
- References Woodside (or specific church) data/logic
- Has church-specific business rules
- Example: Woodside annual meeting content, specific approval workflow

#### 3. Was it designed to be reusable?

✅ **Abstract immediately if:**
- You're building it thinking "other churches will use this"
- It's a common UI pattern (modal, dropdown, table)
- It's a standard MP integration pattern

❌ **Keep local if:**
- You're solving a specific one-off problem
- Uncertain if other churches need it
- Prototype/experiment stage

#### 4. Is it tightly coupled?

✅ **Can abstract if:**
- Standalone component/function
- Clear inputs/outputs (props, parameters)
- No dependencies on app-specific state/context

❌ **Keep local if:**
- Deeply integrated with app's state management
- Uses app-specific routing/context
- Hard to extract cleanly

### Practical Examples

#### Example 1: New Carousel Component

```typescript
// You just built a carousel for displaying images

❓ What type? → UI Component
❓ Church-agnostic? → Yes (no hardcoded content)
❓ Designed to be reusable? → Yes (common UI pattern)
❓ Tightly coupled? → No (just takes items prop)

✅ DECISION: Abstract to @church/nextjs-ui immediately
```

**Implementation:**
```typescript
// packages/nextjs/ui/carousel/carousel.tsx
export function Carousel({ items, autoPlay }: CarouselProps) {
  // Implementation
}

// apps/platform/src/app/page.tsx
import { Carousel } from '@church/nextjs-ui/carousel';
```

#### Example 2: Annual Meeting Registration Flow

```typescript
// You just built Woodside's annual meeting registration

❓ What type? → Business Logic
❓ Church-agnostic? → No (Woodside-specific content/flow)
❓ Designed to be reusable? → No (specific to Woodside)
❓ Tightly coupled? → Yes (uses Woodside's MP tables)

❌ DECISION: Keep in apps/platform
⏳ IF other churches need it later AND you can make it generic → Abstract then
```

**Implementation:**
```typescript
// apps/platform/src/app/annual-meeting/page.tsx
// Keep here for now
```

#### Example 3: MP API Helper - Get Contact with Households

```typescript
// You built a function to fetch contact with household data

❓ What type? → Data Pattern (MP API)
❓ Church-agnostic? → Yes (all churches have Contacts)
❓ Designed to be reusable? → Yes (common MP pattern)
❓ Tightly coupled? → No (just API call)

✅ DECISION: Abstract to @church/ministry-platform immediately
```

**Implementation:**
```typescript
// packages/core/ministry-platform/src/contacts.ts
export async function getContactWithHouseholds(
  contactId: number,
  userId: number // Always require for audit logging!
) {
  // Implementation
}
```

#### Example 4: Woodside Budget Calculator

```typescript
// You built a calculator for Woodside's specific budget categories

❓ What type? → Business Logic / Utility
❓ Church-agnostic? → No (Woodside's budget structure)
❓ Designed to be reusable? → No (Woodside-specific)
❓ Tightly coupled? → Yes (uses Woodside's budget categories)

❌ DECISION: Keep in apps/platform
```

### Quick Reference Table

| Code Type | Church-Agnostic? | Reusable Intent? | Coupled? | Decision |
|-----------|------------------|------------------|----------|----------|
| UI Component | ✅ | ✅ | ❌ | **Abstract now** to @church/nextjs-ui |
| UI Component | ❌ | - | - | Keep local, maybe abstract later |
| Business Logic | ✅ | ✅ | ❌ | Consider abstracting |
| Business Logic | ❌ | - | - | **Keep local** (Rule of Three) |
| MP API Pattern | ✅ | ✅ | ❌ | **Abstract now** to @church/ministry-platform |
| Data Schema (MP) | ✅ | ✅ | ❌ | **Abstract now** to @church/database |
| Utility Function | ✅ | - | ❌ | **Abstract now** |
| Custom Logic | ❌ | - | - | **Keep local** |

---

## Critical Patterns

### 1. Always Use $userId for Audit Logging

MinistryPlatform requires `$userId` for audit trails on stored procedures.

✅ **Correct:**
```typescript
import { z } from 'zod';

// ALWAYS include $userId in schema
export const updateContactSchema = z.object({
  contactId: z.number(),
  firstName: z.string(),
  $userId: z.number(), // Required for MP audit logging
});

// Service layer enforces this
async function updateContact(data: UpdateContactInput, userId: number) {
  return await mp.storedProcedure('api_UpdateContact', {
    ...data,
    $userId: userId, // TypeScript ensures this is passed
  });
}
```

❌ **Incorrect:**
```typescript
// Missing $userId - MP will reject or not audit properly
async function updateContact(data: UpdateContactInput) {
  return await mp.storedProcedure('api_UpdateContact', data);
}
```

**Pattern:** TypeScript types enforce `$userId` at compile time, preventing runtime errors.

### 2. CSS Theming via Custom Properties

Gospel Kit uses CSS custom properties for church branding (not hardcoded colors).

✅ **Correct:**
```typescript
// Uses semantic color tokens
<button className="bg-primary text-primary-foreground">
  Sign Up
</button>

// Churches customize in globals.css
:root {
  --brand-primary: #61bc47; /* Woodside green */
  --primary: var(--brand-primary);
}
```

❌ **Incorrect:**
```typescript
// Hardcoded color (can't be customized per church)
<button className="bg-[#61bc47] text-white">
  Sign Up
</button>
```

**Pattern:** Use `@church/tailwind-config` tokens, customize via CSS variables.

### 3. Raw TypeScript Packages (No Build Step)

Gospel Kit packages export raw `.ts` files for better developer experience.

✅ **Correct:**
```json
// packages/core/database/package.json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./schemas/*": "./src/schemas/*.ts"
  },
  "scripts": {
    "build": "echo 'Skipping build - using raw TypeScript files'"
  }
}
```

❌ **Incorrect:**
```json
// Don't add build step for internal packages
{
  "main": "./dist/index.js",
  "scripts": {
    "build": "tsc"
  }
}
```

**Pattern:** Next.js transpiles TypeScript, no need for pre-build. Faster, better DX.

### 4. Zod Schemas for Type Safety

Use Zod for runtime validation + TypeScript inference.

✅ **Correct:**
```typescript
// packages/core/database/src/schemas/contacts.ts
import { z } from 'zod';

export const contactSchema = z.object({
  Contact_ID: z.number(),
  First_Name: z.string(),
  Last_Name: z.string(),
  Email_Address: z.string().email().nullable(),
});

export type Contact = z.infer<typeof contactSchema>;

// Runtime validation
const contact = contactSchema.parse(apiResponse);
```

❌ **Incorrect:**
```typescript
// Just TypeScript types (no runtime validation)
export interface Contact {
  Contact_ID: number;
  First_Name: string;
  Last_Name: string;
  Email_Address: string | null;
}
```

**Pattern:** Zod validates API responses at runtime, catches breaking changes early.

---

## Code Style Guidelines

### Naming Conventions

- **Packages**: `@church/package-name` (kebab-case)
- **Components**: `PascalCase` (e.g., `ContactCard`, `EventList`)
- **Functions**: `camelCase` (e.g., `getContact`, `updateEvent`)
- **Files**: `kebab-case.tsx` or `PascalCase.tsx` for components
- **MP Fields**: `Snake_Case` (MinistryPlatform convention)

### File Organization

```
src/
├── app/              # Next.js app router
├── components/       # React components (local to app)
├── lib/              # Utilities (local to app)
├── services/         # Business logic / API calls (local to app)
└── types/            # TypeScript types (local to app)
```

**Rule:** If file is used across multiple apps → Move to package.

### Imports

Prefer package imports over relative paths for shared code:

✅ **Correct:**
```typescript
import { Contact } from '@church/database/schemas/contacts';
import { MinistryPlatformClient } from '@church/ministry-platform';
import { Button } from '@church/nextjs-ui/button';
```

❌ **Incorrect:**
```typescript
import { Contact } from '../../../packages/core/database/src/schemas/contacts';
```

---

## Common Tasks

### Adding a New UI Component

1. **Check if church-agnostic**
   - No hardcoded colors/content? → Continue
   - Has church-specific stuff? → Keep in app

2. **Create in @church/nextjs-ui**
   ```bash
   # packages/nextjs/ui/my-component/my-component.tsx
   ```

3. **Export from package**
   ```typescript
   // packages/nextjs/ui/src/index.ts
   export * from './my-component/my-component';
   ```

4. **Use in app**
   ```typescript
   import { MyComponent } from '@church/nextjs-ui/my-component';
   ```

### Adding a New MP API Pattern

1. **Create in @church/ministry-platform**
   ```typescript
   // packages/core/ministry-platform/src/contacts.ts
   export async function getContactByEmail(
     email: string,
     userId: number // Always include!
   ) {
     // Implementation
   }
   ```

2. **Create Zod schema in @church/database**
   ```typescript
   // packages/core/database/src/schemas/contacts.ts
   export const contactSchema = z.object({
     Contact_ID: z.number(),
     // ...
   });
   ```

3. **Use in app**
   ```typescript
   import { getContactByEmail } from '@church/ministry-platform';

   const contact = await getContactByEmail(email, session.contactId);
   ```

### Adding a New Micro-App

See `/new-micro-app` skill for scaffolding.

---

## Testing Strategy

- **Packages**: Should have tests (future enhancement)
- **Apps**: Test in browser during development
- **MP Integration**: Test with real MP instance

---

## Deployment

- **Vercel** - Primary deployment target
- **Environment Variables** - See `.env.example`
- **Team Variables** - Set shared MP credentials at Vercel team level

---

## Upstream Workflow (Church Forks Only)

> **Note:** This section only applies if you're working in a **church fork** of gospel-kit-template (e.g., Woodside's deployment). If you're in the gospel-kit-template repository itself, skip this section.

### Understanding the Fork Relationship

```
gospel-kit-template (canonical)
    ↓ clone
Woodside Deployment (church fork)
    ↓ you fix a bug
Should it go back to template?
    ↓ yes
Document in UPSTREAM_FIXES.md
    ↓ later
Backport to gospel-kit-template
    ↓ benefit
All other churches get the fix
```

### When Fixing Bugs in a Church Fork

**Always ask:** "Is this a template bug or church-specific?"

#### Template Bug (Backport to gospel-kit-template)
- Bug in core packages (`@church/ministry-platform`, `@church/database`, etc.)
- Bug in shared UI components (`@church/nextjs-ui`)
- Bug in auth flow (`@church/nextjs-auth`)
- General MinistryPlatform integration issues
- **Action:** Document in `UPSTREAM_FIXES.md` → Backport later

#### Church-Specific (Keep in fork only)
- Bug in church-specific business logic
- Church-specific stored procedures
- Hardcoded church data or workflows
- Custom features only this church uses
- **Action:** Fix in fork, don't backport

### Using UPSTREAM_FIXES.md

**1. When you fix a template bug:**

Use the `/mark-upstream` skill (recommended):
```
/mark-upstream
```

Or manually add to `UPSTREAM_FIXES.md`:
```markdown
### Fix API Token Refresh Logic

**Issue:** Access tokens weren't refreshing properly when expired, causing 401 errors.

**Fix Applied:**
- File: `packages/core/ministry-platform/src/client.ts:45-60`
- Commit: `abc123def`
- Date: 2024-12-05

**Details:**
Changed token refresh to check expiration 5 minutes before actual expiry instead of waiting for 401 response.
```

**2. Periodically review UPSTREAM_FIXES.md:**
- When you have 5+ pending fixes
- Before deploying to other churches
- During template maintenance sessions

**3. Backporting to template:**
1. Open gospel-kit-template repository
2. Apply each fix from `UPSTREAM_FIXES.md`
3. Test thoroughly in template
4. Commit with reference to church fork
5. Mark as "Applied to Template" in church fork's `UPSTREAM_FIXES.md`
6. Pull latest template into other church forks

### First Church Fork Will Expose Everything

The first church to use gospel-kit-template will discover:
- Bugs in core packages
- Missing features
- Integration issues
- Documentation gaps

**This is expected and valuable!** Document everything in `UPSTREAM_FIXES.md` so:
- Future churches benefit from fixes
- Template becomes battle-tested
- Common patterns emerge

### Example Workflow

**Scenario:** You're building Woodside's deployment and discover the token refresh is broken.

1. **Fix it in Woodside fork:**
   ```typescript
   // packages/core/ministry-platform/src/client.ts
   // Fix the token refresh logic
   ```

2. **Document for upstream:**
   ```bash
   /mark-upstream
   # Claude asks for details, adds to UPSTREAM_FIXES.md
   ```

3. **Continue building Woodside features**

4. **Later (weekly/monthly), backport fixes:**
   - Review `UPSTREAM_FIXES.md` in Woodside fork
   - Apply fixes to gospel-kit-template
   - Pull template updates into Woodside
   - Trinity Church (next deployment) gets fixes automatically

---

## Questions?

- Check `.architecture/` directory for Architecture Decision Records (ADRs)
- Review package READMEs for specific usage
- See SETUP.md for initial setup instructions
- For church forks: See `UPSTREAM_FIXES.md` for backporting workflow
