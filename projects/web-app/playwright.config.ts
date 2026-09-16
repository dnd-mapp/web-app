import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const outputRoot = resolve(workspaceRoot, '.playwright');

// Both servers the tests can run against listen here: the dev server from `pnpm start`, reached by hostname rather
// than through the hosts entry docs/getting-started.md describes, and Caddy in the compose stack under .docker, which
// terminates TLS in front of the published image.
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
        // The dev server presents a certificate issued by mkcert and Caddy one from its own local CA, neither of which
        // the bundled Chromium necessarily trusts. The tests exercise the app, not the TLS setup, so certificate errors
        // are ignored.
        ignoreHTTPSErrors: true,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // In CI the run-e2e action starts the compose stack before the tests, so no server is started here. Locally the dev
    // server stands in, unless something already listens on the port: a `pnpm start` from another terminal or the
    // compose stack started by hand is used as is.
    ...(isCI
        ? {}
        : {
              webServer: {
                  command: 'pnpm start',
                  cwd: workspaceRoot,
                  url: baseURL,
                  ignoreHTTPSErrors: true,
                  reuseExistingServer: true,
                  timeout: 120_000,
              },
          }),
});
