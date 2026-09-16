# Workspace

## Angular workspace

```bash
pnpm ng version
```

The repository is an [Angular CLI](https://angular.dev/tools/cli) workspace, configured in [angular.json](../angular.json). It holds a single project, the `web-app` application under [projects/web-app](../projects/web-app), and that is by design: this repository is the web frontend and nothing else. The CLI is configured to use pnpm for the packages it installs, and its usage analytics are turned off. Angular, its CLI and TypeScript share the `angular` catalog in [pnpm-workspace.yaml](../pnpm-workspace.yaml), so they move together on upgrades.

## TypeScript configuration

[tsconfig.json](../tsconfig.json) carries the compiler options the project extends, with every strictness flag TypeScript offers turned on, plus the `@/<area>` path aliases that map onto the barrel files under `projects/web-app/src`. [tsconfig.tooling.json](../tsconfig.tooling.json) is referenced from it as well and covers the JavaScript tooling files at the root, under `scripts` and in each project, such as the ESLint configs. They are checked with `checkJs` and the Node.js types from `@types/node`, so the `// @ts-check` header in each of them is type-checked in the editor. TypeScript 6 no longer loads every package under `node_modules/@types` on its own, so the `types` entry is what brings the Node.js types in; the project tsconfig files keep them out of the browser code.

Within the project, [tsconfig.app.json](../projects/web-app/tsconfig.app.json) covers the application code, [tsconfig.spec.json](../projects/web-app/tsconfig.spec.json) covers the specs and the `testing/` folders, and [tsconfig.e2e.json](../projects/web-app/tsconfig.e2e.json) covers the end-to-end tests and the Playwright config with the Node.js types. The type-checked ESLint rules read types through the TypeScript project service, so every TypeScript file has to be included by one of them; [TypeScript and JavaScript](linting.md#typescript-and-javascript) spells out the consequences.

## Application layout

The `web-app` application lives under `projects/web-app/src`, divided into areas such as `core`. Each area exposes its public symbols through an `index.ts` barrel, and `paths` in `tsconfig.json` maps `@/<area>` onto that barrel, so code outside the area imports from `@/core` rather than through a relative path. A new area is complete once it has a barrel and an alias for it, plus a `@/<area>/testing` alias when it ships harnesses. File and class naming follows the `schematics` defaults in `angular.json`: `root.component.ts` holds `RootComponent`, styles are SCSS, and guards, interceptors, pipes and resolvers use a `.` type separator.
