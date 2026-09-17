# Testing

## Unit tests

```bash
pnpm run test
```

[Vitest](https://vitest.dev) runs the `*.spec.ts` files in a real, headless Chromium driven by [Playwright](https://playwright.dev), through Angular's `unit-test` builder configured in [angular.json](../angular.json) and [vitest.config.ts](../projects/web-app/vitest.config.ts). `describe`, `it`, `expect` and `vi` are available as globals. The default configuration watches for changes and serves the Vitest UI at `http://localhost:51204/__vitest__/`. Run `pnpm run test-ci` for a single, non-interactive run with GitHub Actions annotations, and `pnpm run playwright-install` once to download the Chromium build Playwright drives.

Every component is exercised through an [Angular CDK component harness](https://material.angular.dev/cdk/testing/overview) that lives in the area's `testing/harnesses` folder and is exported from `testing/index.ts`. A spec declares a throwaway host component whose template renders the component under test, hands it together with the harness class to `setupTestEnvironment` from `@/testing`, and asserts through the harness's methods. The helper, under [shared/testing](../projects/web-app/src/shared/testing), configures the TestBed, provides the application's texts as described in [Localization](localization.md#setup), renders the host and loads the harness, so a spec holds only what makes it specific and asserts on the words a user reads. A component that needs more than those texts passes the providers for it as `providers`, such as the router for a component that renders an outlet. A harness for a component that embeds another locates the inner one through its harness with `locatorFor`, never through its markup, and a harness whose component appears several times on a page offers a static `with` that builds a `HarnessPredicate` to pick one out, as `ButtonHarness.with({ label })` does. [root.component.spec.ts](../projects/web-app/src/core/root/root.component.spec.ts) and [root.harness.ts](../projects/web-app/src/core/testing/harnesses/root.harness.ts) are the pair to copy.

Coverage is collected on every run and reported to `coverage/web-app`. The run fails below 80% on statements, branches, functions and lines, so a component without a spec fails CI. The `testing/` folders stay out of the application build and out of coverage, as do `main.ts`, the barrels and the `config/` folders; `tsconfig.spec.json` includes them alongside the specs, so the type-checked ESLint rules can resolve them.

## End-to-end tests

```bash
pnpm run e2e
```

End-to-end tests are a separate layer, run by [Playwright Test](https://playwright.dev) rather than Vitest. The `*.spec.ts` files under [projects/web-app/e2e](../projects/web-app/e2e) run in the same Chromium build the unit tests use, configured in [playwright.config.ts](../projects/web-app/playwright.config.ts), against `https://localhost:4200`. A test belongs there when it needs the served application rather than a rendered component: bootstrapping, routing, or a flow across several pages. Anything a component harness can observe stays a spec. Tests find elements through Playwright's role and text locators, never through class names or structure, so a markup change does not break them.

Locally, when nothing listens on the port, the run starts `pnpm start` itself and stops it afterwards; a server that is already running is reused. Either way the TLS certificates described under [Running the app](getting-started.md#running-the-app) have to exist. The hosts entry is not needed, since the tests use the `localhost` fallback and ignore certificate errors. In CI the config starts nothing, because `CI` is set and the [run-e2e](ci.md#run-e2e) action has already brought up the compose stack described below.

Output lands in `.playwright/`, which Git, Prettier and ESLint ignore: an HTML report under `report`, which `pnpm exec playwright show-report .playwright/report` opens, and a trace for every failed test under `test-results`. Run `pnpm run e2e-ui` for Playwright's UI mode, which watches the files, runs tests on demand and shows a trace of each step.

[tsconfig.e2e.json](../projects/web-app/tsconfig.e2e.json) covers the tests and the config with the Node.js types, and the root `tsconfig.json` references it so the type-checked ESLint rules resolve them. The `e2e/` folder, `playwright.config.ts` and `tsconfig.e2e.json` stay out of the application build and the Docker context, listed in `.dockerignore` and mirrored in the `detect-changes` filter like the spec files.

## Compose stack

```bash
docker compose --file .docker/compose.yaml up --wait
```

The end-to-end tests can also run against the Docker image instead of the dev server, through the compose stack in [.docker/compose.yaml](../.docker/compose.yaml). It serves a `dndmapp/web-app` image behind [Caddy](https://caddyserver.com), which terminates TLS at `https://localhost:4200` with a certificate from its own local CA, configured in [.docker/Caddyfile](../.docker/Caddyfile), and forwards requests to nginx in the app container. `--wait` returns once Caddy's health check has reached the app through the whole chain.

`WEB_APP_TAG` picks the image tag and defaults to `dev`, the tag `docker buildx bake --load` produces, so the command above serves the local build; `WEB_APP_TAG=pr-12` serves a pull request's preview image. With the stack listening on the port, `pnpm run e2e` uses it instead of starting the dev server, and `docker compose --file .docker/compose.yaml down` stops it. The Caddy image is pinned the way the base images in the Dockerfile are, tag and digest together. The stack stays out of the Docker build context through the `*` rule in `.dockerignore`, and the `detect-changes` filter names `.docker/nginx.conf` rather than the folder for the same reason. This is the setup CI runs the tests in, described under [End-to-end tests](ci.md#end-to-end-tests) in the CI documentation.
