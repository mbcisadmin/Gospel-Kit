# Widgets

This directory contains embeddable widgets for use on WordPress sites and other platforms.

## What Goes Here

Standalone, embeddable widgets that can be added to any website:

- **Event registration forms** - Embed on WordPress event pages
- **Small group finders** - Searchable group directory
- **Donation buttons** - Quick giving widgets
- **Prayer request forms** - Submit prayer requests
- **Sermon player** - Audio/video sermon embed

## Structure

```
widgets/
├── event-registration/    # Event RSVP widget
├── group-finder/          # Groups directory widget
├── donate-button/         # Donation widget
└── prayer-request/        # Prayer form widget
```

## How Widgets Work

Widgets use a **Next.js + Vite** build pattern (NO iframes):

1. **Develop** in Next.js with full React features
2. **Bundle** with Vite to single JavaScript file
3. **Deploy** to Vercel (serves both Next.js app and widget bundle)
4. **Embed** via `<script>` tag - renders directly in parent page

**Why not iframes?** Direct embedding provides better UX, native scrolling, and seamless WordPress integration.

## Widget vs Microsite vs App

| Feature | Apps | Microsites | Widgets |
|---------|------|-----------|---------|
| **URL** | apps.yourchurch.org | groups.yourchurch.org | widgets.yourchurch.org/event-registration |
| **Usage** | Internal tools | Full websites | Embeddable components |
| **Deployment** | Single project | One per site | One per widget |
| **Integration** | Standalone | Standalone | Embedded in WordPress |

## Creating a New Widget

Use the template in `templates/widget/`:

```bash
# Copy template
cp -r templates/widget widgets/event-registration

# Install dependencies
cd widgets/event-registration
npm install

# Configure
cp .env.example .env

# Develop
npm run dev
```

Or use a Claude skill (when available):
```bash
/new-widget
```

## Embedding Widgets

### Primary Method: Script Tag (Recommended)

```html
<!-- Container for widget -->
<div id="event-registration-widget" data-event-id="123"></div>

<!-- Single script tag loads and initializes widget -->
<script src="https://widgets.yourchurch.org/widget/event-registration.js"></script>
```

**How it works:**
1. Script loads bundled React app (Vite IIFE format)
2. Widget auto-initializes on page load
3. Finds container by ID and renders React app
4. All CSS is inlined in JavaScript bundle
5. Reads auth token from `localStorage` if needed

**See working examples:** RSVP Widget, Prayer Widget

### Fallback: iFrame (If needed)

```html
<!-- Only use if script tag embedding causes conflicts -->
<iframe
  src="https://widgets.yourchurch.org/event-registration?eventId=123"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

**Note:** iframes are NOT recommended due to scrolling, styling, and auth token access limitations.

## Build Process (Next.js + Vite)

Widgets use a dual-build system:

### Development: Next.js
```bash
npm run dev  # Standard Next.js development server
```

### Production: Vite Bundle
```bash
npm run build:widget  # Vite bundles to public/widget/*.js
```

**Vite Configuration Example:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'public/widget',
    lib: {
      entry: path.resolve(__dirname, 'widget/index.tsx'),
      name: 'EventRegistrationWidget',
      formats: ['iife'],
      fileName: () => 'event-registration.js',
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,  // Single file bundle
        globals: {},
      },
    },
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin(),  // Inline CSS in JS bundle
  ],
});
```

**What gets deployed:**
- Next.js app at `widgets.yourchurch.org/event-registration` (for development/preview)
- Widget bundle at `widgets.yourchurch.org/widget/event-registration.js` (for embedding)

**See:** `NextJS/Widgets/RSVP/vite.config.ts` for working example

## Shared Packages

Widgets can use:
- `@church/ministry-platform` - MP API client
- `@church/database` - Zod schemas
- `@church/nextjs-ui` - UI components (styled for embedding)
- `@church/tailwind-config` - Theme tokens

## Styling for Embedding

**CSS Strategy:** All CSS is bundled into the JavaScript file via `vite-plugin-css-injected-by-js`.

**Best practices:**
- ✅ Use Tailwind with high specificity (components are scoped to widget container)
- ✅ Respond to parent container width (widgets are responsive)
- ✅ Use inline styles for critical above-the-fold content
- ✅ Avoid global CSS selectors that could conflict with parent page
- ✅ Test on actual WordPress page to catch conflicts early

**How CSS injection works:**
```typescript
// Widget renders in container
<div id="my-widget-root">
  <div className="widget-container bg-white p-4">
    <!-- Widget content with Tailwind classes -->
  </div>
</div>

// All Tailwind CSS is automatically injected into <head> by Vite plugin
```

**No external stylesheets needed** - everything is self-contained in the .js bundle.

## Deployment

Each widget deploys to Vercel as a **separate project** or **route**:

**Option A: Separate Projects** (simple)
- `event-registration.yourchurch.org`
- `group-finder.yourchurch.org`

**Option B: Single Widget Server** (organized)
- `widgets.yourchurch.org/event-registration`
- `widgets.yourchurch.org/group-finder`

## Examples to Build

- **Event Registration** - RSVP forms for WordPress event pages
- **Group Finder** - Browse groups, embed in "Connect" page
- **Quick Give** - Donation buttons for any page
- **Prayer Requests** - Submit prayer needs
- **Sermon Player** - Embed latest sermon
- **Contact Form** - General contact/info request forms

## WordPress Integration

Widgets integrate with WordPress via:
1. **Custom shortcode** (recommended - cleanest UX)
2. **HTML block** with script tag
3. **Custom HTML widget** in sidebar

### Shortcode Implementation

```php
// In WordPress plugin or functions.php
function gospel_kit_widget_shortcode($atts) {
  $atts = shortcode_atts([
    'type' => 'event-registration',
    'event_id' => '',
  ], $atts);

  $widget_id = 'gk-widget-' . uniqid();
  $script_url = 'https://widgets.yourchurch.org/widget/' . esc_attr($atts['type']) . '.js';

  return sprintf(
    '<div id="%s" data-event-id="%s"></div>
    <script src="%s"></script>',
    esc_attr($widget_id),
    esc_attr($atts['event_id']),
    esc_url($script_url)
  );
}
add_shortcode('gospel_kit_widget', 'gospel_kit_widget_shortcode');
```

**Usage in WordPress:**
```
[gospel_kit_widget type="event-registration" event_id="123"]
```

### Direct HTML Block

```html
<!-- In WordPress HTML block -->
<div id="event-registration-widget" data-event-id="123"></div>
<script src="https://widgets.yourchurch.org/widget/event-registration.js"></script>
```

---

**Status:** Template structure defined, awaiting first implementation
**Next Steps:** Build first widget when church needs WordPress integration
