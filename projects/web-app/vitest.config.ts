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
            reportOnFailure: true,
            reportsDirectory: 'coverage/web-app',
        },
        globals: true,
        open: false,
        sequence: {
            shuffle: true,
        },
    },
});
