// ESLint flat config for React + hooks in this project.
// Core ESLint presets.
import js from '@eslint/js'
// Browser globals for linting.
import globals from 'globals'
// React hooks lint rules.
import reactHooks from 'eslint-plugin-react-hooks'
// React refresh lint rules for Vite.
import reactRefresh from 'eslint-plugin-react-refresh'
// Flat config helpers.
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore generated output.
  globalIgnores(['dist']),
  {
    // Apply to JS and JSX sources.
    files: ['**/*.{js,jsx}'],
    // Base and React-specific rule sets.
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      // Expose browser globals like window/document.
      globals: globals.browser,
      parserOptions: {
        // Enable modern syntax and JSX.
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow unused vars starting with capital or underscore.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
