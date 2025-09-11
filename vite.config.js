import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default {
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
}
