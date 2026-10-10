# Contributing to dnd-mapp/web-app

This page adds the details of `dnd-mapp/web-app` to the [shared contributing guide](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md). Read that guide first, including the section on [frontend repositories](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md#frontend-repositories).

This repository holds the website and the web application of D&D Mapp, in one Angular application. It is an empty scaffold for now: it builds and passes its checks, and features land in later issues.

## Project layout

The repository is an Angular workspace with a single application project, `web-app`, in the root of the repository.

| File                             | Purpose                                                                                  |
|:---------------------------------|:-----------------------------------------------------------------------------------------|
| `angular.json`                   | The workspace config, with the build, serve, and test targets of the application         |
| `src/index.html`                 | The page that loads the application                                                      |
| `src/main.ts`                    | The entry point, which bootstraps `RootComponent`                                        |
| `src/core/index.ts`              | The public API of the core, which the rest of the application imports as `@/core`        |
| `src/core/config/app.config.ts`  | The providers of the application, such as the router                                     |
| `src/core/config/app.routes.ts`  | The routes of the application, which holds none yet                                      |
| `src/core/root/root.component*`  | The root component, which renders the router outlet                                      |
| `vitest.config.ts`               | The Vitest options that the test target in `angular.json` has no builder option for      |
| `tsconfig.json`                  | The compiler options of the workspace, which refers to the app, spec, and tools projects |

`tsconfig.json` maps each `@/` path alias to the `index.ts` it exports from. Import through the alias from outside a folder, and through a relative path inside it.

The application runs without Zone.js, which is the default since Angular 21. It renders in the browser only. Server-side rendering and prerendering wait for the decision on deployment.

## Components

- Give selectors the `app` prefix, such as `app-root`. The prefix tells the components of the application apart from those of `@dnd-mapp/ui`, which use `dma`.
- Name files and classes after the [2016 Angular style guide](https://v19.angular.dev/style-guide): put the type in both, such as `RootComponent` in `root.component.ts`. ESLint checks the class suffixes of components and directives.
- Write the styles in SCSS.
- Keep the components accessible. ESLint checks the templates against the accessibility rules of angular-eslint.

Generate a component with the Angular CLI, and pass the folder of its area with `--path`, since the CLI writes to `src/app` otherwise. The schematic defaults in `angular.json` apply the 2016 naming, so it writes `<name>.component.ts`, `.html`, `.scss`, and `.spec.ts` files:

```bash
pnpm ng generate component <name> --path src/<folder>
```

## Building and testing

The `start` script serves the application on port 4200 and rebuilds it on changes. The `build` script builds it for production into `dist/web-app`.

```bash
pnpm start
pnpm run build
```

Tests use Vitest through the Angular unit-test builder, and run in headless Chromium through [Playwright](https://playwright.dev/). The builder sets up the Angular `TestBed`, and the Vitest globals, such as `describe`, `it`, `expect`, and `vi`, are available without an import. The test target in `angular.json` holds the test options, and coverage must stay above its thresholds. Its `development` configuration is the default and runs in watch mode with the Vitest UI. The `ci` configuration runs the tests once.

`tsconfig.json` refers to three projects: `tsconfig.app.json` for the application, `tsconfig.spec.json` for the specs, and `tsconfig.tools.json` for the config files. Only the spec project has the types of the Vitest globals, so the application cannot use them by mistake.

Install the browser as the section on [frontend repositories](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md#frontend-repositories) describes before you run the tests.

## Checks

On top of the [shared checks](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md#checks), the `CI` job runs `lint-ts`, `typecheck`, `build`, and `test-ci`. Run them yourself before you open a pull request.

```bash
pnpm run lint-ts
pnpm run typecheck
pnpm run build
pnpm run test-ci
```

The `lint-ts` script lints the code and the templates with ESLint and angular-eslint. The `typecheck` script checks the TypeScript projects with `tsc -b`, and the `build` script checks the templates. Use `pnpm test` to run the tests in watch mode with the Vitest UI.

## Deployment and releases

The application is not deployed or released yet, so the repository has no changelog and no release workflows. A later issue decides where it is hosted and how it is released.

## Code style

Give every class member an explicit access modifier, such as `public` or `protected`, including properties, methods, and static members. ESLint checks this with the `explicit-member-accessibility` rule of typescript-eslint.
