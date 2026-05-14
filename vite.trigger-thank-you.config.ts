import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/triggers/thankYouTrigger.embed.ts'),
      name: 'ChatWidgetThankYouTrigger',
      fileName: 'thank-you-trigger',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        extend: true,
      },
    },
    outDir: 'dist-embed',
    emptyOutDir: false,
    copyPublicDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

