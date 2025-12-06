# @church/tailwind-config

Shared Tailwind CSS configuration and design tokens for Gospel Kit projects.

## Overview

This package provides a consistent design system across all Gospel Kit applications, including:

- **Color system** using CSS custom properties for easy theming
- **Typography** with Montserrat font family and size scales
- **Spacing & Layout** with standardized border radius and spacing
- **Reusable preset** that churches can extend with their branding

## Installation

This package is already installed as part of the Gospel Kit monorepo. No additional setup needed.

## Usage

### Basic Setup

In your app's `tailwind.config.ts`, import and use the preset:

```typescript
import type { Config } from 'tailwindcss';
import baseConfig from '@church/tailwind-config';

export default {
  presets: [baseConfig],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
```

### Customizing for Your Church

Extend the base configuration with your church's branding:

```typescript
import type { Config } from 'tailwindcss';
import baseConfig from '@church/tailwind-config';

export default {
  presets: [baseConfig],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Override specific colors if needed
        // (Usually done via CSS variables in globals.css)
      },
      fontFamily: {
        // Use a different font family
        sans: ['YourChurchFont', 'Montserrat', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

## Design Tokens

### Colors

Colors use CSS custom properties for runtime theming. Define your colors in `globals.css`:

```css
:root {
  --brand-primary: #61bc47;    /* Your primary color */
  --brand-secondary: #1c2b39;  /* Your secondary color */

  --primary: var(--brand-primary);
  --secondary: var(--brand-secondary);
  /* ... other color mappings */
}
```

Then use them in your components:

```tsx
<button className="bg-primary text-primary-foreground">
  Click me
</button>
```

**Available semantic colors:**
- `background` / `foreground`
- `card` / `card-foreground`
- `popover` / `popover-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `border`, `input`, `ring`
- `chart-1` through `chart-5`
- `sidebar` (with variants)

### Typography

**Font Families:**
- `font-sans` → Montserrat (default)
- `font-mono` → Geist Mono

**Font Sizes:**
- `text-xs` through `text-9xl`

**Font Weights:**
- `font-light` (300)
- `font-normal` (400)
- `font-medium` (500)
- `font-semibold` (600)
- `font-bold` (700)
- `font-extrabold` (800)
- `font-black` (900)

**Letter Spacing:**
- `tracking-wide` (0.025em) - For buttons
- `tracking-wider` (0.05em) - For navigation

### Spacing & Layout

**Border Radius:**
- `rounded-sm` → `calc(var(--radius) - 4px)`
- `rounded-md` → `calc(var(--radius) - 2px)`
- `rounded-lg` → `var(--radius)` (default)
- `rounded-xl` → `calc(var(--radius) + 4px)`

Set your base radius in `globals.css`:

```css
:root {
  --radius: 0.5rem; /* Adjust to your preference */
}
```

## Importing Individual Tokens

You can also import individual token files:

```javascript
import colors from '@church/tailwind-config/tokens/colors';
import typography from '@church/tailwind-config/tokens/typography';
import spacing from '@church/tailwind-config/tokens/spacing';
```

## Dark Mode

The color system automatically supports dark mode via CSS variables. Define dark mode colors in your `globals.css`:

```css
.dark {
  --background: oklch(0.18 0.005 0);
  --foreground: oklch(0.95 0 0);
  /* ... other dark mode colors */
}
```

## Examples

### Church-Specific Branding

**Example 1: Woodside Bible Church**
```css
/* globals.css */
:root {
  --brand-primary: #61bc47;  /* Woodside green */
  --brand-secondary: #1c2b39;
}
```

**Example 2: Another Church**
```css
/* globals.css */
:root {
  --brand-primary: #c41e3a;  /* Church red */
  --brand-secondary: #2c3e50;
}
```

No changes needed in JavaScript/TypeScript - colors automatically update!

### Using Design Tokens

```tsx
// Typography
<h1 className="font-bold text-4xl tracking-tight">
  Welcome to Our Church
</h1>

// Colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Sign Up
</button>

// Spacing
<div className="rounded-lg border border-border p-6">
  Content here
</div>

// Semantic colors
<div className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Secondary text</p>
</div>
```

## Benefits

✅ **Consistent design** across all Gospel Kit apps
✅ **Easy church branding** via CSS variables
✅ **Type-safe** with TypeScript support
✅ **Extendable** for church-specific needs
✅ **Dark mode ready** out of the box
✅ **Single source of truth** for design tokens

## Contributing

When adding new design tokens:

1. Add to appropriate file in `tokens/`
2. Export from `index.js`
3. Document in this README
4. Update apps to use new tokens
5. Test across light/dark modes
