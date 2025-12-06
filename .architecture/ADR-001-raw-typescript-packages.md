# ADR-001: Raw TypeScript Packages

**Status**: Accepted
**Date**: 2024-12-05

## Context

Gospel Kit is a monorepo with shared packages consumed by Next.js applications. We need to decide whether internal packages should:

1. **Compile to JavaScript** (traditional approach)
   - Run `tsc` to build packages
   - Publish `dist/` with compiled `.js` files
   - Apps import compiled JavaScript

2. **Export raw TypeScript** (modern approach)
   - No build step for packages
   - Export raw `.ts` files directly
   - Let consuming apps transpile

Traditional approaches require build steps, watch modes, and complex tooling. Modern bundlers (Next.js, Vite) can consume TypeScript directly.

## Decision

**Gospel Kit packages will export raw TypeScript files** without a compilation step.

**Implementation:**
```json
// package.json
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

Apps consume packages directly:
```typescript
import { Contact } from '@church/database/schemas/contacts';
// Imports ./src/schemas/contacts.ts directly
```

Next.js transpiles everything during its build process.

## Consequences

### Positive Consequences

✅ **Faster development** - No build step, no watch mode needed for packages
✅ **Better DX** - Edit package code, see changes immediately
✅ **Simpler tooling** - No need to manage `tsc` configs per package
✅ **Easier debugging** - Source maps work perfectly (no build artifact mismatch)
✅ **Reduced complexity** - Fewer moving parts in monorepo
✅ **Type safety** - Apps get full TypeScript checking of package code

### Negative Consequences

❌ **External publishing harder** - If packages are published to npm, need separate build
  - **Mitigation**: Gospel Kit packages are internal-only (not published)

❌ **Requires modern bundler** - Consuming apps must support TypeScript
  - **Mitigation**: Next.js supports this out of the box

❌ **Package errors surface in app builds** - TypeScript errors in packages fail app builds
  - **Mitigation**: This is actually positive - catches issues earlier
  - **Mitigation**: CI runs `turbo build` which checks all packages

### Neutral Consequences

- Each app transpiles packages independently (slight build time increase)
  - In practice: negligible with Turbo caching
- Package changes invalidate app caches
  - Expected behavior for monorepo development

## Alternatives Considered

### Alternative 1: Compiled Packages

Build packages to JavaScript before consumption.

**Rejected because:**
- Slower development (must rebuild packages on every change)
- More complex tooling (tsc, watch mode, source maps)
- No significant benefits for internal packages

### Alternative 2: Hybrid Approach

Some packages raw TypeScript, some compiled.

**Rejected because:**
- Inconsistent developer experience
- Confusion about which packages use which approach
- All Gospel Kit packages benefit from raw TypeScript

## References

- [Next.js Transpile Packages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)
- [Turborepo Internal Packages](https://turbo.build/repo/docs/handbook/sharing-code/internal-packages)
