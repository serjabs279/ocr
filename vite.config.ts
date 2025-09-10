// This imports the defineConfig function from the vite library, which is used to create the configuration for the Vite development server and build tool.
import { defineConfig } from 'vite'
// This imports the official Vite plugin for Vue.js.
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// This exports the configuration for the Vite development server and build tool.
export default defineConfig({
  // This is where the plugins for Vite are defined.
  plugins: [vue()],
  // This is where the server options are defined.
  server: {
    // This is where the file system options are defined.
    fs: {
      // This allows serving files from the project root (and node_modules).
      allow: ['..'],
    },
  },
})
