---
description: Document a template bug fix for backporting to gospel-kit-template
---

# Mark Upstream Fix

This skill helps you document bugs fixed in a church fork that should be backported to gospel-kit-template.

## Usage

Run this skill when you've fixed a bug in shared packages or core functionality that other churches would benefit from.

```
/mark-upstream
```

## What This Skill Does

1. Checks if `UPSTREAM_FIXES.md` exists (creates from `.example` if needed)
2. Asks you for details about the fix
3. Gets the current git commit hash
4. Adds formatted entry to "Pending Backport" section
5. Saves and confirms

## When to Use

✅ **Use when fixing:**
- Bugs in `packages/core/*` (ministry-platform, database)
- Bugs in `packages/nextjs/*` (auth, ui, tailwind-config)
- MinistryPlatform integration issues
- General authentication/OAuth problems
- Shared component bugs

❌ **Don't use for:**
- Church-specific business logic
- Hardcoded church data/workflows
- Custom features only one church needs
- App-level bugs (unless they reveal package bugs)

## Instructions for Claude

When this skill is invoked:

1. **Check for UPSTREAM_FIXES.md:**
   ```bash
   if [ ! -f UPSTREAM_FIXES.md ]; then
     cp UPSTREAM_FIXES.md.example UPSTREAM_FIXES.md
   fi
   ```

2. **Ask the user for details:**
   - What was the bug/issue?
   - What files did you change?
   - Brief description of the fix

3. **Get current commit hash:**
   ```bash
   git log -1 --format="%h"
   ```

4. **Format the entry:**
   ```markdown
   ### [Short Title from User]

   **Issue:** [User's description of what was broken]

   **Fix Applied:**
   - File: [files from user]
   - Commit: [git hash]
   - Date: [today's date]

   **Details:**
   [User's description of the fix]

   ---
   ```

5. **Insert into UPSTREAM_FIXES.md:**
   - Add under "## Pending Backport" section
   - After the section header and example comment
   - Before any existing entries (newest first)

6. **Confirm to user:**
   ```
   ✓ Added to UPSTREAM_FIXES.md under "Pending Backport"

   When you're ready to backport:
   1. Open gospel-kit-template repository
   2. Review UPSTREAM_FIXES.md
   3. Apply fixes to template
   4. Move entries to "Applied to Template" section
   ```

## Example Output

After running `/mark-upstream`, the user should see:

```
Added to UPSTREAM_FIXES.md:

### Fix API Token Refresh Logic

**Issue:** Access tokens weren't refreshing properly when expired

**Fix Applied:**
- File: packages/core/ministry-platform/src/client.ts:45-60
- Commit: abc123d
- Date: 2024-12-05

**Details:**
Changed token refresh to check expiration 5 minutes before actual expiry
instead of waiting for 401 response.
```

## Notes

- This skill is ONLY for church forks, not gospel-kit-template itself
- Remind user to actually backport fixes periodically
- If many fixes accumulate (5+), suggest backporting soon
- This creates a paper trail for template improvements
