import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            provider: playwright(),
            screenshotFailures: false,
        },
        coverage: {
            provider: 'v8',
        },
        open: false,
    },
});
