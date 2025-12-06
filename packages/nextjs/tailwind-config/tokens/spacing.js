/**
 * Spacing & Layout Tokens
 *
 * Shared spacing scale, border radius, and layout utilities.
 */

module.exports = {
  borderRadius: {
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    DEFAULT: 'var(--radius)',
  },

  // Default radius value (churches can override in globals.css)
  defaultRadius: '0.125rem',

  spacing: {
    // Tailwind's default spacing scale works well for most cases
    // Add custom values here if needed
  },
};
