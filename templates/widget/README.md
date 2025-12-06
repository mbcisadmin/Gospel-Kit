# Widget Template

Template for creating embeddable widgets for WordPress and other platforms.

## What is a Widget?

Widgets are **small, focused applications** that embed in existing websites:

- **Build:** Next.js for development, Vite for production bundle
- **Embed:** `<script>` tag (NO iframes - renders directly in parent page)
- **Deploy:** `widgets.yourchurch.org/widget/event-registration.js`
- **Purpose:** Add MP functionality to WordPress, Squarespace, etc.
- **Pattern:** Single JavaScript bundle with CSS inlined

## When to Use This Template

Use this template when building:
- ✅ Event registration forms (embed on WordPress event pages)
- ✅ Group finder (embed in "Connect" page)
- ✅ Donation buttons (embed anywhere)
- ✅ Prayer request forms
- ✅ Sermon players

**Don't use for:**
- ❌ Full websites → Use `templates/microsite/`
- ❌ Internal tools → Use `templates/micro-app/`

## How to Use

### Option 1: Claude Skill (When Available)

```bash
/new-widget
```

### Option 2: Manual Creation

```bash
# Copy template to widgets directory
cp -r templates/widget widgets/event-registration

# Navigate and install
cd widgets/event-registration
npm install

# Configure
cp .env.example .env

# Develop
npm run dev
```

## Template Structure (To Be Built)

When this template is created, it will include:

```
templates/widget/
├── widget/
│   └── index.tsx              # Widget entry point (Vite bundles this)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Next.js dev preview
│   │   └── api/
│   │       └── route.ts       # Widget API endpoints
│   ├── components/
│   │   ├── WidgetContainer.tsx # Root widget component
│   │   └── WidgetUI.tsx       # Widget implementation
│   └── lib/
│       └── widgetInit.ts      # Auto-initialization logic
├── public/
│   └── widget/                # Vite build output (generated)
│       └── my-widget.js       # Bundled widget (deployed)
├── .env.example
├── package.json
├── vite.config.ts             # Vite bundler config
├── next.config.ts             # Next.js dev server config
└── README.md
```

**See working examples:**
- `NextJS/Widgets/RSVP/` - RSVP widget with Vite setup
- `NextJS/Widgets/Prayer/` - Prayer widget with Vite setup

## Widget Requirements

Widgets must:

- ✅ **Single bundle** - All code + CSS in one .js file (Vite IIFE format)
- ✅ **Auto-initialize** - Find container and render on page load
- ✅ **Scoped styles** - CSS injected without conflicts
- ✅ **Responsive** - Adapt to parent container width
- ✅ **Fast** - Tree-shaken, minified, optimized bundle
- ✅ **Auth-aware** - Read token from `localStorage` if needed

## Embedding Methods

### Primary Method: Script Tag (Recommended)

Direct rendering in parent page (NO iframe):

```html
<!-- Container where widget renders -->
<div id="event-registration-widget" data-event-id="123"></div>

<!-- Single script tag - loads and initializes widget -->
<script src="https://widgets.yourchurch.org/widget/event-registration.js"></script>
```

**How it works:**
1. Vite bundles React app to IIFE format (Immediately Invoked Function Expression)
2. Script loads and auto-executes on page load
3. Widget finds container by ID and renders React app
4. CSS is automatically injected into `<head>` by Vite plugin
5. Auth token (if needed) is read from `localStorage.getItem('mpp-widgets_AuthToken')`

**Key benefit:** Native scrolling, better UX, seamless WordPress integration

### Fallback: iFrame (Only if needed)

Use only if script tag embedding causes CSS/JS conflicts:

```html
<iframe
  src="https://widgets.yourchurch.org/event-registration?eventId=123"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

**Limitations:**
- Cannot access `localStorage` from parent page (auth issues)
- Scrolling complications (nested scrollbars)
- Height must be manually set
- Less integrated feel

## Build Configuration

### Vite Config (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cssInjectedByJsPlugin } from 'vite-plugin-css-injected-by-js';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(), // Inline CSS in JS bundle
  ],
  build: {
    outDir: 'public/widget',
    lib: {
      entry: path.resolve(__dirname, 'widget/index.tsx'),
      name: 'MyWidget',
      formats: ['iife'],
      fileName: () => 'my-widget.js',
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true, // Single file bundle
        globals: {},
      },
    },
  },
});
```

### Widget Entry Point (widget/index.tsx)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import WidgetContainer from '../src/components/WidgetContainer';

// Auto-initialize on page load
const container = document.getElementById('my-widget-root');
if (container) {
  const root = createRoot(container);
  root.render(<WidgetContainer />);
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:widget": "vite build",
    "build:all": "npm run build && npm run build:widget"
  }
}
```

## Styling for Embedding

**Strategy:** Use Tailwind CSS - all styles are automatically inlined in the JavaScript bundle.

```typescript
// components/WidgetContainer.tsx
export default function WidgetContainer() {
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Event Registration</h1>
      {/* Widget content with Tailwind classes */}
    </div>
  );
}
```

**CSS is automatically:**
- Processed by Tailwind
- Bundled by Vite
- Injected into `<head>` by `vite-plugin-css-injected-by-js`
- Scoped to avoid parent page conflicts (Tailwind's high specificity helps)

**No external stylesheet needed** - everything is in the .js file.

## WordPress Integration

### Shortcode Method (Recommended)

Create WordPress plugin or add to functions.php:

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

## Example Widgets

- **Event Registration** - RSVP forms for events
- **Group Finder** - Search and browse small groups
- **Quick Give** - Simple donation form
- **Prayer Request** - Submit prayer needs
- **Sermon Player** - Latest sermon audio/video
- **Contact Form** - General inquiry form

## Deployment

### Vercel Configuration

Each widget deploys as a separate Vercel project:

**Build Settings:**
- Root directory: `widgets/event-registration` (or use monorepo filter)
- Build command: `npm run build:all` (builds both Next.js and Vite bundle)
- Output directory: `.next` (Next.js default)

**What gets deployed:**
- Next.js app at `widgets.yourchurch.org/event-registration` (dev preview, API routes)
- Widget bundle at `widgets.yourchurch.org/widget/event-registration.js` (for embedding)

**Environment Variables:**
- Set team-wide MP credentials (shared across all widgets)
- Set project-specific `NEXTAUTH_SECRET` and `NEXTAUTH_URL`

### Production Workflow

1. **Develop:** `npm run dev` (Next.js dev server)
2. **Build widget:** `npm run build:widget` (Vite bundles to `public/widget/`)
3. **Test bundle:** Serve `public/widget/*.js` locally and embed in test page
4. **Deploy:** `git push` (Vercel builds both Next.js and widget)
5. **Embed:** Use `https://widgets.yourchurch.org/widget/event-registration.js` in WordPress

---

**Status:** Template not yet built
**Next Steps:** Build template when first WordPress integration is needed
**Pattern:** Next.js for development + Vite for production bundle
**Examples:** See `NextJS/Widgets/RSVP/` and `NextJS/Widgets/Prayer/` for working implementations
