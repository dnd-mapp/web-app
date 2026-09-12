# AGENTS.md

An Angular single-page application. Setup, scripts and CI are documented in [README.md](README.md); this file covers what the configuration does not enforce on its own.

## Commands

Use `pnpm run test-ci` for a one-shot test run. `pnpm test` opens the Vitest UI in watch mode and never exits.

`pnpm start` reads `.ssl/cert.pem` and `.ssl/key.pem`. An empty `.ssl/` means the certificate has not been issued yet, which is step 4 of the README.

Formatters fix, linters report: run `pnpm run format` and `pnpm run lint-ts` instead of correcting layout by hand. The pre-commit hook runs ESLint in check-only mode, so a rule violation blocks the commit until the source changes.

Reach for the `angular-cli` MCP server rather than recalling Angular APIs from memory: `get_best_practices` before writing a component, `search_documentation` for anything API-shaped.

## Imports

A feature publishes its public surface through a barrel `index.ts` and is consumed through the path alias registered in `tsconfig.json` under `compilerOptions.paths`. Relative paths stay inside a feature; anything crossing a feature boundary goes through the alias.

```ts
import { appConfig, RootComponent } from '@/core';
import { RootHarness } from '@/core/testing';
```

A new feature therefore lands three things together: the code, the barrel that exports it, and the alias. Test-only exports get a separate `testing` barrel and alias, which keeps harnesses out of the application bundle.

`verbatimModuleSyntax` is enabled, so type-only imports carry an inline `type` modifier: `import { type Routes } from '@angular/router'`.

## Components

zone.js is absent, so change detection is zoneless and anything that mutates state asynchronously has to be awaited. Signals are the default state primitive, and ESLint fails a class that reaches for a decorator where a signal function exists.

Files are named `<name>.component.ts` holding a matching `<Name>Component` class, mirroring the schematics in `angular.json`. `ng generate` produces that layout; match it when writing files by hand.

## Tests

Specs are `*.spec.ts` files beside the code they cover. Assert through a [CDK component harness](https://material.angular.dev/cdk/test-harnesses/overview) rather than querying the DOM, so selectors live in one place and every read awaits change detection. Harnesses go in `testing/harnesses/` next to their subject.

`projects/web-app/src/core/root/root.component.spec.ts` is the template to copy: a host component wrapping the subject, and a `setupTest` helper returning the harnesses a spec needs.

Coverage thresholds are enforced at 80%, so new behavior ships with its spec or `test-ci` fails.

## Markdown

Prose is unwrapped: one paragraph is one line, however long it runs. Prettier ignores Markdown and markdownlint has `MD013` off, so nothing reflows these files and a hand-wrapped paragraph stays wrapped.

## Dependencies

Versions live in the catalogs in `pnpm-workspace.yaml`, and `package.json` references them as `catalog:<name>`. `catalogMode` is `strict`, so a version written straight into `package.json` is rejected. New releases are held back for three days, which means a package published today will not resolve.

## Commits

Conventional commits with a lowercase subject, checked by commitlint both on commit and across the range of a pull request. Group work into commits by intent.
