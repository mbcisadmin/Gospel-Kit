# Templates

Starter templates for creating new applications in Gospel Kit.

## Available Templates

### 1. Micro-App (`micro-app/`)

**Use for:** Church community tools within apps platform

- **Location:** `apps/platform/src/app/(app)/my-app/`
- **URL:** `apps.yourchurch.org/my-app`
- **Examples:** Projects dashboard, annual meeting voting, team scheduling, people search
- **Authentication:** Flexible (can be required, optional, or allow anonymous access)
- **Deployment:** Part of apps platform (single Vercel project)

[Read more →](./micro-app/README.md)

### 2. Microsite (`microsite/`)

**Use for:** Public-facing standalone websites

- **Location:** `microsites/groups/`
- **URL:** `groups.yourchurch.org`
- **Examples:** Groups directory, Events calendar, Serve portal
- **Authentication:** Optional
- **Deployment:** Separate Vercel project per microsite

[Read more →](./microsite/README.md)

### 3. Widget (`widget/`)

**Use for:** Embeddable components for WordPress/other platforms

- **Location:** `widgets/event-registration/`
- **URL:** `widgets.yourchurch.org/event-registration`
- **Examples:** Event forms, Donation buttons, Group finders
- **Authentication:** Optional
- **Deployment:** Separate project or routes

[Read more →](./widget/README.md)

## Quick Comparison

| Feature | Micro-App | Microsite | Widget |
|---------|-----------|-----------|--------|
| **Audience** | Church community (staff, volunteers, congregation) | Public & outreach | Public (embedded) |
| **Domain** | apps.yourchurch.org | groups.yourchurch.org | widgets.yourchurch.org |
| **Auth** | Flexible (required, optional, or anonymous) | Optional (usually public) | Optional |
| **Deployment** | Shared | Separate | Separate or shared |
| **Full Page** | Yes | Yes | No (embeds in parent) |
| **Example** | Projects, annual meeting voting, team scheduling | Groups directory, public events | Event registration form |

## Template Status

> **Note:** These templates are **placeholders** with documentation.
>
> Actual template code will be created when the first instance of each type is built.
> The README files define the structure and patterns to follow.

## Using Templates

### With Claude Skills (Recommended)

```bash
/new-micro-app     # Create a micro-app in apps/platform
/new-microsite     # Create a standalone microsite (when available)
/new-widget        # Create an embeddable widget (when available)
```

### Manual Copying

```bash
# Copy appropriate template
cp -r templates/microsite microsites/groups

# Follow README instructions in the template
```

## Development Workflow

1. **Start with Micro-Apps** - Easiest to build, part of existing platform
2. **Add Microsites** - When you need public-facing, standalone sites
3. **Build Widgets** - When WordPress integration is needed

---

**Next Steps:**
- Use `/new-micro-app` to build internal tools
- Create actual template code when patterns are established
- Document patterns in ADRs as they emerge
