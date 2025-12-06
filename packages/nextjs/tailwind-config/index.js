/**
 * Gospel Kit - Shared Tailwind CSS Configuration
 *
 * This preset provides a consistent design system across all Gospel Kit projects.
 * Churches can extend or override these settings in their app's tailwind.config.
 *
 * Usage in your app:
 * ```js
 * import baseConfig from '@church/tailwind-config'
 *
 * export default {
 *   presets: [baseConfig],
 *   content: ['./src/**\/*.{ts,tsx}'],
 *   theme: {
 *     extend: {
 *       // Your church-specific overrides
 *     }
 *   }
 * }
 * ```
 */

const colors = require('./tokens/colors');
const typography = require('./tokens/typography');
const spacing = require('./tokens/spacing');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: colors.colors,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      letterSpacing: typography.letterSpacing,
      borderRadius: spacing.borderRadius,
    },
  },
  plugins: [],
};
