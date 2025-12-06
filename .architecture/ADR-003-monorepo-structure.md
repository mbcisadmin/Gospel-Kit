# ADR-003: Monorepo Structure

**Status**: Accepted
**Date**: 2024-12-05

## Context

Gospel Kit needs to share code across multiple church applications while remaining flexible and maintainable. We need to decide on the repository structure.

**Options:**
1. **Monorepo** - Single repo with multiple packages/apps
2. **Polyrepo** - Separate repos for each package/app
3. **Hybrid** - Core packages in monorepo, apps in separate repos

**Requirements:**
- Share code between apps (auth, UI components, MP client)
- Easy to develop across multiple packages
- Simple for churches to clone and customize
- Clear boundaries between shared and church-specific code

## Decision

**Use a Turborepo monorepo with strict package organization rules.**

**Structure:**
```
gospel-kit-template/
├── apps/
│   └── platform/              # Main church apps platform
├── packages/
│   ├── core/                  # Framework-agnostic
│   │   ├── database/          # Zod schemas, data models
│   │   └── ministry-platform/ # MP API client
│   └── nextjs/                # Next.js-specific
│       ├── auth/              # NextAuth + MP OAuth
│       ├── ui/                # React components
│       └── tailwind-config/   # Design tokens
├── .architecture/             # ADRs
├── CLAUDE.md                  # AI assistant guidance
└── package.json               # Workspace root
```

**Organization Rules:**
1. `packages/core/*` - No React/Next.js dependencies
2. `packages/nextjs/*` - Can depend on React/Next.js
3. `apps/*` - Applications (not published as packages)
4. Packages can depend on other packages
5. Apps can depend on packages (never vice versa)

## Consequences

### Positive Consequences

✅ **Code sharing** - Easy to share code across apps
✅ **Atomic changes** - Update auth package, all apps get update
✅ **Single clone** - Churches clone one repo, get everything
✅ **Consistent tooling** - One set of scripts, configs, dependencies
✅ **Fast builds** - Turborepo caches and parallelizes builds
✅ **Clear boundaries** - Directory structure enforces package rules
✅ **Easy refactoring** - Move code between packages easily

### Negative Consequences

❌ **Larger repo** - More code to clone/download
  - **Mitigation**: Sparse checkout for advanced users

❌ **Complexity for small churches** - Might only need one app
  - **Mitigation**: Can delete unused packages/apps

❌ **Dependency conflicts** - Shared dependencies must match versions
  - **Mitigation**: Workspace ensures single version per dependency

### Neutral Consequences

- All packages share `node_modules` (good for disk space, can confuse newcomers)
- Changes to shared packages affect all apps (expected behavior)
- Must use `npm install` at root (not in individual packages)

## Package Organization Details

### Why `core/` and `nextjs/` Subdirectories?

**Before (flat structure):**
```
packages/
├── database/
├── ministry-platform/
├── nextjs-auth/
├── nextjs-ui/
└── tailwind-config/
```

**After (categorized structure):**
```
packages/
├── core/
│   ├── database/
│   └── ministry-platform/
└── nextjs/
    ├── auth/
    ├── ui/
    └── tailwind-config/
```

**Benefits:**
- Clear dependency rules (core can't depend on nextjs)
- Easier to find packages by category
- Future-proof for other frameworks (packages/vue/, packages/svelte/)
- Enforces framework-agnostic design for core packages

### Package Naming

- **Scope**: All packages use `@church/` scope
  - Avoids naming conflicts with npm packages
  - Clear that these are Gospel Kit packages
  - Example: `@church/ministry-platform`

- **Names**: kebab-case without framework prefix
  - ✅ `@church/auth` (not `@church/nextjs-auth`)
    - Path shows it's Next.js: `packages/nextjs/auth`
  - ✅ `@church/ministry-platform` (framework-agnostic)

## Alternatives Considered

### Alternative 1: Polyrepo

Separate Git repos for each package and app.

**Rejected because:**
- Hard to make atomic changes across packages
- Version management complexity
- Churches must clone multiple repos
- Duplicate tooling configs

### Alternative 2: Hybrid Approach

Core packages in monorepo, apps in separate repos.

**Rejected because:**
- Complicates development workflow
- Hard to test package changes against apps
- Churches still need multiple repos

### Alternative 3: Lerna/Nx

Use Lerna or Nx instead of Turborepo.

**Rejected because:**
- Turborepo is simpler and faster for our use case
- Better caching and parallelization
- Vercel (deployment target) maintains Turborepo

## Migration Path

If Gospel Kit grows significantly, we can:

1. **Extract packages to npm** - Publish core packages independently
2. **Split apps** - Move apps to separate repos, consume published packages
3. **Keep monorepo** - Most churches benefit from monorepo simplicity

Decision: Keep monorepo unless clear need for polyrepo emerges.

## References

- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Monorepo.tools](https://monorepo.tools/)
- [Why Google Stores Billions of Lines in a Single Repo](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext)
