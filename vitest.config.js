import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                '**/*.test.ts',
                '**/*.config.ts',
                'examples/'
            ]
        }
    }
});
//# sourceMappingURL=vitest.config.js.map