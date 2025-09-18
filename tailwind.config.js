/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ffc107',
          DEFAULT: '#f0a500', // Warm Gold
          dark: '#c58a00',
        },
        secondary: {
          light: '#2d3f61',
          DEFAULT: '#1a2a4a', // Deep Blue
          dark: '#0e1a2f',
        },
        background: '#fdfaf2',
        'text-main': '#1a2a4a',
        'text-light': '#f5f5f5',
      },
      fontFamily: {
        sans: ['Campton', 'sans-serif'],
      },
      // --- ADD THIS TYPOGRAPHY CONFIGURATION ---
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.text-main'),
            '--tw-prose-headings': theme('colors.secondary.dark'),
            '--tw-prose-lead': theme('colors.text-main'),
            '--tw-prose-links': theme('colors.primary.dark'),
            '--tw-prose-bold': theme('colors.text-main'),
            '--tw-prose-counters': theme('colors.primary.dark'),
            '--tw-prose-bullets': theme('colors.primary.dark'),
            '--tw-prose-hr': theme('colors.gray[300]'),
            '--tw-prose-quotes': theme('colors.text-main'),
            '--tw-prose-quote-borders': theme('colors.primary.light'),
            '--tw-prose-captions': theme('colors.gray[700]'),
            '--tw-prose-code': theme('colors.text-main'),
            '--tw-prose-pre-code': theme('colors.text-light'),
            '--tw-prose-pre-bg': theme('colors.secondary.dark'),
            '--tw-prose-th-borders': theme('colors.gray[300]'),
            '--tw-prose-td-borders': theme('colors.gray[200]'),
            '--tw-prose-invert-body': theme('colors.text-light'),
            fontFamily: theme('fontFamily.sans').join(', '),
          },
        },
      }),
    },
  },
  // --- ADD THE PLUGIN HERE ---
  plugins: [
    require('@tailwindcss/typography'),
  ],
};