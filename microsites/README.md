# Microsites

This directory contains standalone Next.js applications for public-facing church websites.

## What Goes Here

Each microsite is a **separate Next.js application** for a specific domain:

- **groups.yourchurch.org** - Small groups directory and registration
- **events.yourchurch.org** - Event calendar and registration
- **serve.yourchurch.org** - Volunteer opportunities and sign-ups
- **give.yourchurch.org** - Donation portal

## Structure

```
microsites/
├── groups/          # Groups microsite (e.g., groups.yourchurch.org)
├── events/          # Events microsite (e.g., events.yourchurch.org)
├── serve/           # Serve microsite (e.g., serve.yourchurch.org)
└── give/            # Giving microsite (e.g., give.yourchurch.org)
```

## How Microsites Differ from Apps

| Feature | Apps Platform (`apps/platform`) | Microsites (`microsites/*`) |
|---------|--------------------------------|----------------------------|
| **URL** | apps.yourchurch.org | groups.yourchurch.org |
| **Auth** | Flexible (required, optional, anonymous) | Optional (usually public) |
| **Audience** | Church community (staff, volunteers, congregation) | Public & outreach |
| **Deployment** | Single Vercel project | One project per microsite |
| **Purpose** | Church tools (dashboards, voting, scheduling) | Public registration, information |

## Creating a New Microsite

Use the template in `templates/microsite/`:

```bash
# Copy template
cp -r templates/microsite microsites/groups

# Install dependencies
cd microsites/groups
npm install

# Configure
cp .env.example .env
# Edit .env with church-specific settings

# Develop
npm run dev
```

Or use a Claude skill (when available):
```bash
/new-microsite
```

## Shared Packages

Microsites can use all shared packages:
- `@church/ministry-platform` - MP API client
- `@church/database` - Zod schemas
- `@church/nextjs-auth` - NextAuth (if auth needed)
- `@church/nextjs-ui` - UI components
- `@church/tailwind-config` - Theme tokens

## Deployment

Each microsite deploys to Vercel as a **separate project**:

1. Create Vercel project for the microsite
2. Set root directory: `microsites/groups`
3. Configure environment variables
4. Add custom domain: `groups.yourchurch.org`
5. Deploy!

## Examples to Build

- **Groups Finder** - Browse and join small groups
- **Event Calendar** - View upcoming events, register, get directions
- **Serve Portal** - Sign up for volunteer opportunities
- **Giving Portal** - Online donation forms
- **Resources Library** - Downloadable resources, sermons, etc.

---

**Status:** Template structure defined, awaiting first implementation
**Next Steps:** Build first microsite when church needs it
