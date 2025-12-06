# ADR-002: CSS Variable Theming

**Status**: Accepted
**Date**: 2024-12-05

## Context

Gospel Kit is a template used by multiple churches. Each church needs to apply their own branding (colors, fonts, etc.). We need to decide how churches customize the look and feel.

**Options considered:**
1. **Hardcode in Tailwind config** - Each church modifies `tailwind.config.ts`
2. **CSS custom properties** - Define colors as CSS variables, override in `globals.css`
3. **JavaScript theme provider** - Runtime theme switching via React context
4. **Sass variables** - Use Sass for theming

**Requirements:**
- Easy for churches to customize (non-developers can change colors)
- Support dark mode
- No rebuild required for simple color changes
- Compatible with Tailwind CSS

## Decision

**Use CSS custom properties (variables) for all theme customization.**

**Implementation:**

1. **Define semantic color tokens in Tailwind config:**
```typescript
// @church/tailwind-config
colors: {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  // ... all semantic tokens
}
```

2. **Churches customize in globals.css:**
```css
:root {
  --brand-primary: #61bc47;    /* Church's primary color */
  --brand-secondary: #1c2b39;   /* Church's secondary color */

  /* Map to semantic tokens */
  --primary: var(--brand-primary);
  --secondary: var(--brand-secondary);
  /* ... */
}

.dark {
  /* Dark mode overrides */
  --primary: oklch(0.65 0 0);
  /* ... */
}
```

3. **Components use semantic tokens:**
```tsx
<button className="bg-primary text-primary-foreground">
  Click Me
</button>
```

Result: Churches change 2 hex codes in `globals.css`, entire app updates.

## Consequences

### Positive Consequences

✅ **Runtime theming** - No rebuild required for color changes
✅ **Simple for churches** - Change 2 hex codes, done
✅ **Dark mode support** - CSS variables can be overridden in `.dark` selector
✅ **Semantic naming** - Components use `bg-primary`, not `bg-green-500`
✅ **Browser compatibility** - CSS variables supported in all modern browsers
✅ **No JavaScript overhead** - Pure CSS solution
✅ **Preview in DevTools** - Can test colors live in browser

### Negative Consequences

❌ **Limited TypeScript safety** - Can't type-check CSS variable values
  - **Mitigation**: Document expected format in `globals.css` comments

❌ **Runtime errors possible** - Invalid CSS variable values fail silently
  - **Mitigation**: Provide well-documented examples

❌ **Can't use in JavaScript** - Need `getComputedStyle()` to access variables
  - **Mitigation**: Rarely needed; use Tailwind classes instead

### Neutral Consequences

- Tailwind config is stable (doesn't change per church)
- All customization happens in one file (`globals.css`)
- Churches can't add new semantic tokens without editing Tailwind config
  - This is intentional - prevents token sprawl

## Alternatives Considered

### Alternative 1: Hardcode in Tailwind Config

Churches edit `tailwind.config.ts` to change colors.

**Rejected because:**
- Requires rebuild for every color change
- More complex for non-technical users
- Merge conflicts when updating Gospel Kit

### Alternative 2: JavaScript Theme Provider

Use React context to provide theme at runtime.

**Rejected because:**
- Adds JavaScript overhead
- More complex implementation
- Tailwind can't access JS variables
- CSS variables solve this more elegantly

### Alternative 3: Sass Variables

Use Sass for theming.

**Rejected because:**
- Requires Sass build step
- Can't change without rebuild
- CSS variables are native and more powerful

## Examples

### Example 1: Church Rebranding

Woodside Bible changes from green (#61bc47) to blue (#2563eb):

```css
/* globals.css - BEFORE */
:root {
  --brand-primary: #61bc47;
}

/* globals.css - AFTER */
:root {
  --brand-primary: #2563eb;
}
```

No other files change. No rebuild. Entire app updates.

### Example 2: Dark Mode Support

```css
:root {
  --background: oklch(1 0 0);        /* White */
  --foreground: oklch(0.2 0.005 0);  /* Dark gray */
}

.dark {
  --background: oklch(0.18 0.005 0); /* Dark */
  --foreground: oklch(0.95 0 0);     /* Light gray */
}
```

Components automatically adapt when `.dark` class is added to `<html>`.

## References

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Tailwind CSS Variables](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [shadcn/ui Theming Approach](https://ui.shadcn.com/docs/theming) (similar pattern)
