/**
 * Tailwind theme tokens derived from the frozen design contract at
 * /code/.plans/designs/ (design-plan.json + wizard-*.html / postpurchase-*.html):
 * navy header ink, slate canvas, a single accent blue, green/amber/red
 * semantic encoding, tabular numerals for money, monospace hashes,
 * light theme, >=1280px layout.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // core surfaces
        ink: '#0e1b2c', // navy header / darkest text
        'ink-2': '#243447',
        body: '#33414f', // default text
        muted: '#5f6f80',
        faint: '#8a97a6',
        canvas: '#f2f4f8', // slate page background
        panel: '#ffffff',
        line: '#dbe2ea',
        'line-soft': '#e9eef4',
        // single accent
        accent: {
          DEFAULT: '#1e56d6',
          ink: '#16409f',
          soft: '#e9effc',
          line: '#c4d4f5',
        },
        // semantic: green = on/verified, amber = priced consequence, red = declined/excluded
        good: {
          DEFAULT: '#0e7c3f',
          bg: '#e7f4ec',
          line: '#bfe2cc',
        },
        warn: {
          DEFAULT: '#96590a',
          bg: '#fdf3e0',
          line: '#efd8a7',
          deep: '#b06a00',
        },
        bad: {
          DEFAULT: '#b3251e',
          bg: '#fdefee',
          line: '#f1c7c4',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Text',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      fontSize: {
        // mockup type scale: 11 / 12 / 13 / 14 (body) / 16 / 20 / 28 / 40
        '2xs': ['11px', '1.4'],
        xs: ['12px', '1.45'],
        sm: ['13px', '1.5'],
        base: ['14px', '1.5'],
        md: ['16px', '1.45'],
        lg: ['20px', '1.35'],
        xl: ['28px', '1.25'],
        '2xl': ['40px', '1.15'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,27,44,.06), 0 4px 14px rgba(14,27,44,.04)',
      },
      maxWidth: {
        shell: '1160px',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
};
