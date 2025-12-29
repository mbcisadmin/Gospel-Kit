# Upstream Fixes for Gospel Kit Template

This file tracks bug fixes and improvements discovered during McLean Bible
Church's onboarding that should be backported to the gospel-kit-template
repository.

## Environment Variables Not Loading in Development

**Issue:** Root `.env` file was not being loaded by Next.js/Turbopack in the
monorepo setup, causing "MissingSecret" errors and "undefined" base URLs.

**Root Cause:**

1. `turbo.json` was only watching `.env.*local` files, not plain `.env`
2. `turbo.json` didn't declare required environment variables in `globalEnv`
3. Next.js 16 + Turbopack doesn't automatically load `.env` from parent
   directories

**Fix Applied:**

### 1. Update `turbo.json`

**File:** `/turbo.json` **Commit:** (pending) **Date:** 2025-12-29

Changed:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "globalEnv": ["NODE_ENV"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"],
      "env": [
        "MINISTRY_PLATFORM_BASE_URL",
        "MINISTRY_PLATFORM_CLIENT_ID",
        "NEXTAUTH_URL",
        "NODE_ENV"
      ]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

To:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env", "**/.env.*local"],
  "globalEnv": [
    "NODE_ENV",
    "MINISTRY_PLATFORM_BASE_URL",
    "MINISTRY_PLATFORM_CLIENT_ID",
    "MINISTRY_PLATFORM_CLIENT_SECRET",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "NEXT_PUBLIC_MINISTRY_PLATFORM_FILE_URL",
    "NEXT_PUBLIC_APP_NAME"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Changes:**

- Added `**/.env` to `globalDependencies` to watch root .env file
- Moved all env vars to `globalEnv` (applies to all tasks)
- Removed task-specific `env` arrays (redundant with `globalEnv`)

### 2. Update `package.json` dev script

**File:** `/package.json` **Commit:** (pending) **Date:** 2025-12-29

Changed:

```json
{
  "scripts": {
    "dev": "turbo run dev"
  }
}
```

To:

```json
{
  "scripts": {
    "dev": "dotenv -e .env -- turbo run dev"
  },
  "devDependencies": {
    "dotenv-cli": "^11.0.0"
  }
}
```

**Changes:**

- Use `dotenv-cli` to explicitly load root `.env` before running turbo
- Added `dotenv-cli` to devDependencies (already present in template)

### 3. Ensure `dotenv-cli` is in template dependencies

**File:** `/package.json` **Commit:** (pending) **Date:** 2025-12-29

Verify `dotenv-cli` is in `devDependencies` (it already is):

```json
{
  "devDependencies": {
    "dotenv-cli": "^11.0.0"
  }
}
```

**Why This Approach:**

- **Local development:** `dotenv-cli` loads root `.env`
- **Vercel deployment:** Organization-level env vars are injected automatically
- **Best practice:** Matches Turborepo + Vercel recommended setup
- **DX:** Single source of truth for env vars (root `.env` mirrors Vercel org
  vars)

**Testing:** After applying fixes, verify:

1. `npm run dev` starts without "MissingSecret" errors
2. Console shows:
   `MinistryPlatform provider initialized with base URL: https://...`
3. Not: `MinistryPlatform provider initialized with base URL: undefined`

---

## Status

- [ ] Applied to gospel-kit-template
- [x] Tested in McLean Bible Church fork
- [ ] Documented in template CHANGELOG
- [ ] Other churches notified of update

---

## Additional Notes

This bug would affect **every** church using the template, as the environment
variables are critical for:

- MinistryPlatform API connection
- NextAuth session encryption
- OAuth authentication

Priority: **HIGH** - Should be backported immediately.
