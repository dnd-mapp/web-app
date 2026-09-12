import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            provider: playwright(),
            screenshotFailures: false,
        },
        clearMocks: true,
        coverage: {
            reportsDirectory: 'coverage/web-app',
            provider: 'v8',
        },
        globals: true,
        open: false,
    },
});
