# Development Guide

This guide covers the day-to-day developer workflow for Gospel Kit.

## Table of Contents

- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Code Formatting](#code-formatting)
- [Testing](#testing)
- [Database Development](#database-development)
- [Git Workflow](#git-workflow)
- [IDE Setup](#ide-setup)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Format code
npm run format

# Check types and lint
npm run build
```

---

## Available Scripts

### Development

```bash
npm run dev              # Start all apps in development mode
npm run build            # Build all packages and apps
npm run lint             # Run ESLint on all packages
```

### Testing

```bash
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode (re-runs on file change)
npm run test:ui          # Open Vitest UI (visual test runner)
npm run test:coverage    # Generate test coverage report
```

### Code Formatting

```bash
npm run format           # Format all code with Prettier
npm run format:check     # Check if code is formatted (CI)
```

### Database (Neon PostgreSQL)

```bash
npm run db:generate      # Generate migration from schema changes
npm run db:migrate       # Apply migrations to database
npm run db:push          # Push schema changes (dev only)
npm run db:studio        # Open Drizzle Studio (visual DB browser)
```

---

## Code Formatting

We use **Prettier** with **Tailwind CSS plugin** for automatic code formatting.

### Automatic Formatting

**On Save (VS Code):**

- Open any file
- Make changes
- Save file (Cmd+S / Ctrl+S)
- Code auto-formats!

**Pre-Commit Hook:**

- Stage your changes: `git add .`
- Commit: `git commit -m "message"`
- Husky automatically formats staged files before commit
- If files change, commit again

### Manual Formatting

```bash
# Format all files
npm run format

# Format specific files
npx prettier --write "apps/platform/src/**/*.tsx"

# Check formatting without changing files
npm run format:check
```

### Prettier Configuration

See `.prettierrc.json`:

- Single quotes
- 2-space tabs
- Semicolons
- 100 character line width
- Tailwind classes auto-sorted

---

## Testing

We use **Vitest** for fast, modern testing.

### Writing Tests

Create test files next to the code you're testing:

```
src/
├── utils/
│   ├── formatDate.ts
│   └── formatDate.test.ts      # Test file
```

**Example test:**

```typescript
// packages/core/database/src/utils/formatDate.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-12-06');
    expect(formatDate(date)).toBe('December 6, 2024');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (best for development)
npm run test:watch

# Visual UI (interactive test runner)
npm run test:ui

# Coverage report
npm run test:coverage
```

### What to Test

**✅ DO test:**

- Zod schema validation (`ContactSchema.parse()`)
- Utility functions (date formatting, calculations)
- Business logic (budget calculations, eligibility rules)
- API helpers (MinistryPlatform client methods)

**❌ DON'T test:**

- React components (unless complex logic)
- Next.js API routes (integration tests instead)
- External API responses (use mocks)

### Testing Best Practices

1. **Test behavior, not implementation**

   ```typescript
   // ✅ Good: Tests the result
   expect(calculateTotal([10, 20, 30])).toBe(60);

   // ❌ Bad: Tests how it's calculated
   expect(calculateTotal).toHaveBeenCalledWith([10, 20, 30]);
   ```

2. **Use descriptive test names**

   ```typescript
   it('should reject invalid email format'); // ✅ Clear
   it('test email'); // ❌ Vague
   ```

3. **Keep tests simple and focused**
   - One assertion per test (usually)
   - Test one thing at a time
   - Easy to understand what failed

---

## Database Development

### MinistryPlatform

MinistryPlatform uses SQL Server. See `database/ministry-platform/` for:

- `baseline/` - Reference SQL for MP built-in tables
- `customizations/` - Custom tables and stored procedures
- `migrations/` - One-time migration scripts

**No ORM for MinistryPlatform** - Use raw SQL and Zod schemas.

### Neon PostgreSQL

Neon uses Drizzle ORM for type-safe database access.

#### 1. Define Schema

```typescript
// packages/core/database/src/neon/schemas/prayer-requests.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

export const prayerRequests = pgTable('prayer_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PrayerRequest = typeof prayerRequests.$inferSelect;
export type NewPrayerRequest = typeof prayerRequests.$inferInsert;
```

#### 2. Generate Migration

```bash
npm run db:generate
```

This creates SQL migration in `database/neon/migrations/`.

#### 3. Apply Migration

```bash
# Development (push directly)
npm run db:push

# Production (run migration)
npm run db:migrate
```

#### 4. Use in Code

```typescript
import { db } from '@church/database/neon/client';
import { prayerRequests } from '@church/database/neon/schemas/prayer-requests';
import { eq } from 'drizzle-orm';

// Select all approved prayers
const prayers = await db
  .select()
  .from(prayerRequests)
  .where(eq(prayerRequests.isApproved, true));
```

#### 5. Visual Database Browser

```bash
npm run db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`

---

## Git Workflow

### Pre-Commit Hooks (Husky)

Every commit automatically runs:

1. **Prettier** - Formats staged files

**If files are changed:**

```bash
git add .              # Stage formatted files
git commit -m "..."    # Commit again
```

**Note:** ESLint is NOT run automatically on commit (to avoid conflicts in
monorepo). Run `npm run lint` manually before committing or in CI.

### Commit Message Style

Use conventional commits:

```bash
# Features
git commit -m "feat: add prayer request widget"

# Bug fixes
git commit -m "fix: correct email validation in ContactSchema"

# Refactoring
git commit -m "refactor: reorganize database package structure"

# Documentation
git commit -m "docs: update DEVELOPMENT.md with testing guide"

# Chores
git commit -m "chore: update dependencies"
```

### Bypassing Hooks (Emergency Only)

```bash
# Skip pre-commit hooks (use sparingly!)
git commit --no-verify -m "emergency fix"
```

---

## IDE Setup

### VS Code (Recommended)

#### 1. Install Recommended Extensions

When you open the project, VS Code prompts:

> "This workspace has extension recommendations"

Click **Install All** or manually install:

- Prettier
- ESLint
- Tailwind CSS IntelliSense
- GitLens
- SQL Tools

#### 2. Settings Applied Automatically

See `.vscode/settings.json`:

- Format on save ✅
- Auto-fix ESLint on save ✅
- Tailwind IntelliSense enabled ✅
- TypeScript workspace version ✅

#### 3. Verify Setup

1. Open any `.tsx` file
2. Add some unformatted code:
   ```typescript
   const foo = { bar: 'baz' };
   ```
3. Save file (Cmd+S / Ctrl+S)
4. Code should auto-format:
   ```typescript
   const foo = { bar: 'baz' };
   ```

### Other IDEs

**WebStorm / IntelliJ:**

- Enable Prettier: Settings → Languages → JavaScript → Prettier
- Enable ESLint: Settings → Languages → JavaScript → ESLint
- Format on save: Settings → Tools → Actions on Save

**Cursor / Zed / Other:**

- Install Prettier extension
- Install ESLint extension
- Enable format on save in settings

---

## Troubleshooting

### Tests Failing

**Error:** "Cannot find module '@church/database'"

**Fix:**

```bash
# Rebuild packages
npm run build

# Or clean install
rm -rf node_modules package-lock.json
npm install
```

### Prettier Not Formatting

**Error:** Files don't format on save

**Fix:**

1. Check VS Code default formatter: `Cmd+Shift+P` → "Format Document With" →
   "Prettier"
2. Reload VS Code: `Cmd+Shift+P` → "Reload Window"
3. Check `.vscode/settings.json` exists

### Husky Hook Not Running

**Error:** Pre-commit hook doesn't run

**Fix:**

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare

# Make hook executable
chmod +x .husky/pre-commit
```

### TypeScript Errors in Tests

**Error:** "Cannot use import statement outside a module"

**Fix:** Vitest handles TypeScript automatically. Check `vitest.config.ts`
exists.

### Database Connection Failed

**Error:** Drizzle can't connect to Neon

**Fix:**

```bash
# Check .env has DATABASE_URL
cat .env | grep DATABASE_URL

# Test connection
npm run db:studio
```

---

## Advanced Topics

### Turborepo Caching

Turborepo caches build outputs for speed:

```bash
# Clear cache if issues
rm -rf .turbo
npm run build
```

### Testing Specific Packages

```bash
# Test only database package
npx vitest run packages/core/database

# Test only ministry-platform package
npx vitest run packages/core/ministry-platform
```

### Debugging Tests

```typescript
import { describe, it, expect } from 'vitest';

it('should debug this', () => {
  const result = someFunction();

  console.log('Debug:', result); // Shows in test output

  expect(result).toBe('expected');
});
```

Run with `npm run test:ui` for visual debugging.

---

## Known Issues

### NextAuth + Next.js 16 Compatibility

**Status:** Temporary workaround in place - all functionality works perfectly

**Background:** Gospel Kit uses Next.js 16.0.7, which introduced a breaking
change to API route signatures. Dynamic routes now receive a `context` parameter
with async `params`:

```typescript
// Next.js 16 requires:
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) { ... }
```

NextAuth v5 (currently beta.30) hasn't been updated for this yet, so their
handlers use the old signature.

**Our Solution:** We've added a compatibility wrapper in
`apps/platform/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
// Wrapper adapts NextAuth handlers to Next.js 16 signature
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) => {
  return await handlers.GET(req as any);
};
```

**Why This Works:**

- NextAuth's `[...nextauth]` route doesn't actually use the params
- All auth flows (sign in, callback, session, token refresh) work through the
  request object
- The wrapper simply accepts the new signature and passes through to NextAuth

**Impact:**

- ✅ All authentication functionality works perfectly
- ✅ No performance impact
- ✅ No security concerns
- ✅ Production-ready and safe to deploy

**What to Watch For:**

1. **Monitor NextAuth releases:**

   ```bash
   npm view next-auth versions --json | tail -10
   ```

2. **Check the GitHub issue:**
   https://github.com/nextauthjs/next-auth/issues/13302

3. **When NextAuth adds Next.js 16 support:**
   - Remove the wrapper from `route.ts`
   - Revert to simple export: `export const { GET, POST } = handlers`
   - Update in CHANGELOG.md

4. **For your own dynamic API routes:** Remember to await params in Next.js 16:
   ```typescript
   export async function GET(
     request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
   ) {
     const { id } = await params; // Must await!
   }
   ```

**Expected Timeline:** The wrapper will likely be needed for a few months until
NextAuth v5 goes stable (currently in beta) and adds official Next.js 16
support.

See **[CHANGELOG.md](./CHANGELOG.md)** for full upgrade notes.

---

## Getting Help

- **Template Issues:** See `TODO.md` for known issues
- **Architecture Questions:** See `.architecture/` ADRs
- **Setup Questions:** See `SETUP.md`
- **Contributing:** See `.github/CONTRIBUTING.md`

---

**Next Steps:**

- Read [SETUP.md](./SETUP.md) for initial church setup
- Review [.architecture/](./architecture/) for architecture decisions
- Check [TODO.md](./TODO.md) for known issues and future work
