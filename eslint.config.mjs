// ESLint 9 flat config for Next.js 16 + Shadcn UI + Tailwind v4.
// Native flat config without FlatCompat to avoid circular structure validator crashes.
import tsLint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default tsLint.config(
  // 1. TypeScript recommended configs
  ...tsLint.configs.recommended,

  // 2. Next.js recommended flat config (custom rule set)
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // 3. Globals & Ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.opencode/**',
      '.openspec/**',
      'next-env.d.ts',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'dist/**',
      'build/**',
    ],
  },

  // 4. Custom overrides
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
    },
  }
)
