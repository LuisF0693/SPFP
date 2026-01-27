import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData.ts',
            ],
            lines: 70,
            functions: 70,
            branches: 70,
            statements: 70,
        },
        include: ['src/**/*.test.{ts,tsx}'],
        exclude: [
            'node_modules',
            'dist',
            '.idea',
            '.git',
            '.cache',
            'build',
        ],
        testTimeout: 10000,
        hookTimeout: 10000,
        isolate: true,
        threads: true,
        maxThreads: 4,
        minThreads: 1,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
