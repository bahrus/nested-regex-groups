import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: ['index.ts', 'template.ts'],
            exclude: [
                'node_modules/',
                '**/*.test.ts',
                '**/*.config.ts',
                '**/*.d.ts',
                '**/*.js',
                'examples/'
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        }
    }
});
//# sourceMappingURL=vitest.config.js.map