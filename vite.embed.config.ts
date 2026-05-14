import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/embed.tsx'),
      name: 'ChatbotWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        extend: true,
        assetFileNames: (assetInfo) => {
          // Preserve font file structure in dist-embed
          if (assetInfo.name && assetInfo.name.endsWith('.otf')) {
            return 'assets/fonts/Helvetica/OTF/[name][extname]'
          }
          if (assetInfo.name && assetInfo.name.endsWith('.ttf')) {
            return 'assets/fonts/Helvetica/Variable/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
    outDir: 'dist-embed',
    emptyOutDir: true,
    copyPublicDir: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

