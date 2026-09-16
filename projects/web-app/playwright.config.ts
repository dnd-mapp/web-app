import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const outputRoot = resolve(workspaceRoot, '.playwright');

// The dev server from `pnpm start`, reached by hostname rather than through the hosts entry README.md describes, so
// the tests run before that entry is in place.
const baseURL = 'https://localhost:4200';

const isCI = Boolean(process.env['CI']);

export default defineConfig({
    testDir: './e2e',
    outputDir: resolve(outputRoot, 'test-results'),
    fullyParallel: true,
    // A stray `test.only` would silently shrink the suite, so CI rejects it; locally it is a focusing tool.
    forbidOnly: isCI,
    retries: isCI ? 2 : 0,
    reporter: [isCI ? ['github'] : ['list'], ['html', { outputFolder: resolve(outputRoot, 'report'), open: 'never' }]],
    use: {
        baseURL: baseURL,
        // The dev server presents a certificate issued by mkcert, which the bundled Chromium does not necessarily
        // trust. The tests exercise the app, not the TLS setup, so certificate errors are ignored.
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'pnpm start',
        cwd: workspaceRoot,
        url: baseURL,
        ignoreHTTPSErrors: true,
        // A dev server already listening on the port is used as is, so `pnpm start` and `pnpm run e2e` coexist.
        reuseExistingServer: !isCI,
        timeout: 120_000,
    },
});
