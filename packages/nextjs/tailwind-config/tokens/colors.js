/**
 * Color Tokens
 *
 * Base color system using CSS custom properties for easy theming.
 * Churches can override these values in their app's tailwind.config.
 */

module.exports = {
  colors: {
    // Semantic colors using CSS variables
    background: 'var(--background)',
    foreground: 'var(--foreground)',

    card: {
      DEFAULT: 'var(--card)',
      foreground: 'var(--card-foreground)',
    },

    popover: {
      DEFAULT: 'var(--popover)',
      foreground: 'var(--popover-foreground)',
    },

    primary: {
      DEFAULT: 'var(--primary)',
      foreground: 'var(--primary-foreground)',
    },

    secondary: {
      DEFAULT: 'var(--secondary)',
      foreground: 'var(--secondary-foreground)',
    },

    muted: {
      DEFAULT: 'var(--muted)',
      foreground: 'var(--muted-foreground)',
    },

    accent: {
      DEFAULT: 'var(--accent)',
      foreground: 'var(--accent-foreground)',
    },

    destructive: {
      DEFAULT: 'var(--destructive)',
      foreground: 'var(--destructive-foreground)',
    },

    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',

    // Chart colors
    chart: {
      1: 'var(--chart-1)',
      2: 'var(--chart-2)',
      3: 'var(--chart-3)',
      4: 'var(--chart-4)',
      5: 'var(--chart-5)',
    },

    // Sidebar colors
    sidebar: {
      DEFAULT: 'var(--sidebar)',
      foreground: 'var(--sidebar-foreground)',
      primary: 'var(--sidebar-primary)',
      'primary-foreground': 'var(--sidebar-primary-foreground)',
      accent: 'var(--sidebar-accent)',
      'accent-foreground': 'var(--sidebar-accent-foreground)',
      border: 'var(--sidebar-border)',
      ring: 'var(--sidebar-ring)',
    },
  },

  // Default brand colors (churches override in their globals.css)
  defaultBrandColors: {
    primary: '#61bc47',    // Green
    secondary: '#1c2b39',  // Dark blue
  },
};
