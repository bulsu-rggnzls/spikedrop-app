/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          base: 'var(--color-bg-base)',
          header: 'var(--color-bg-header)',
          surface: 'var(--color-bg-surface)',
          'surface-elevated': 'var(--color-bg-surface-elevated)',
          'surface-hover': 'var(--color-bg-surface-hover)',
          inset: 'var(--color-bg-inset)',
          'inset-subtle': 'var(--color-bg-inset-subtle)',
          'border-subtle': 'var(--color-border-subtle)',
          'border-default': 'var(--color-border-default)',
          'border-focus': 'var(--color-border-focus)',
          'text-main': 'var(--color-text-main)',
          'text-body': 'var(--color-text-body)',
          'text-muted': 'var(--color-text-muted)',
          'text-dim': 'var(--color-text-dim)',
          primary: 'var(--color-primary)',
          success: 'var(--color-success)',
          'success-hover': 'var(--color-success-hover)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)'
        },
        valorant: {
          red: 'var(--color-primary)',
          dark: 'var(--color-bg-base)',
          surface: 'var(--color-bg-surface-elevated)',
          border: 'var(--color-border-focus)',
          text: 'var(--color-text-main)'
        },
        spotify: {
          green: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          dark: 'var(--color-bg-inset)',
          surface: 'var(--color-bg-surface)'
        }
      },
      fontFamily: {
        sans: ['var(--font-family-sans)'],
        mono: ['var(--font-family-mono)']
      },
      fontSize: {
        '2xs': ['var(--text-2xs)', { lineHeight: 'var(--line-height-tight)' }],
        xs: ['var(--text-xs)', { lineHeight: 'var(--line-height-normal)' }],
        sm: ['var(--text-sm)', { lineHeight: 'var(--line-height-normal)' }],
        base: ['var(--text-base)', { lineHeight: 'var(--line-height-normal)' }],
        lg: ['var(--text-lg)', { lineHeight: 'var(--line-height-normal)' }],
        xl: ['var(--text-xl)', { lineHeight: 'var(--line-height-tight)' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--line-height-tight)' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--line-height-tight)' }]
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        inner: 'var(--shadow-inner)',
        'glow-valorant': 'var(--shadow-glow-valorant)',
        'glow-spotify': 'var(--shadow-glow-spotify)',
        'badge-valorant': 'var(--shadow-badge-valorant)',
        'badge-spotify': 'var(--shadow-badge-spotify)'
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        smooth: 'var(--transition-smooth)',
        slow: 'var(--transition-slow)'
      }
    },
  },
  plugins: [],
}
