// Vite config for the React build pipeline.
import { defineConfig } from 'vite'
// React plugin enables JSX and fast refresh.
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Register the React plugin.
  plugins: [react()],
})
