import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { aiosEventsPlugin } from './vite-plugin-aios-events';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.github.com https://*.supabase.co https://generativelanguage.googleapis.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    },
    plugins: [
      react(),
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
      aiosEventsPlugin()
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.test.ts',
          '**/*.test.tsx',
          'dist/',
          '.next/',
          'coverage/',
        ],
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      testTimeout: 10000,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
    },
    build: {
      target: 'esnext',
      chunkSizeWarningLimit: 600,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        external: ['core-js'],
        output: {
          manualChunks: (id) => {
            // Separate vendor chunks for heavy libraries with granular control
            if (id.includes('node_modules/recharts')) {
              return 'recharts-vendor';
            }
            if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
              return 'pdf-vendor';
            }
            if (id.includes('node_modules/pdfjs-dist')) {
              return 'pdf-worker';
            }
            if (id.includes('node_modules/@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('node_modules/@google/generative-ai')) {
              return 'gemini-vendor';
            }
            if (id.includes('node_modules/pixi') || id.includes('node_modules/@pixi')) {
              return 'pixi-vendor';
            }
            if (id.includes('node_modules/zustand')) {
              return 'zustand-vendor';
            }
            // Group React and core dependencies
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-vendor';
            }
            // Lazy-loaded components get their own chunks
            if (id.includes('Dashboard') || id.includes('TransactionList') || id.includes('Insights')) {
              const match = id.match(/(\w+)\.(tsx?)/);
              return match ? `lazy-${match[1]}` : undefined;
            }
          }
        }
      },
    }
  };
});
