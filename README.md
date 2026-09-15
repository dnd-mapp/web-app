# web-app

![GitHub License](https://img.shields.io/github/license/dnd-mapp/web-app)

The web frontend for D&D Mapp, a companion for tabletop D&D: manage characters, roll dice, build maps and lore, and play out combat and exploration in a VTT powered by a custom game engine built on the game rules.

## Prerequisites

| Tool    | Version |
|:--------|:--------|
| Node.js | 24.21.0 |
| pnpm    | 12.4.1  |

Both versions are pinned in [package.json](package.json) through `devEngines`, so working with a different version stops with an error instead of a warning. [mise](https://mise.jdx.dev) installs and switches between the pinned versions for you.

## Getting started

```bash
pnpm install
```

Dependency versions live in named catalogs in [pnpm-workspace.yaml](pnpm-workspace.yaml) rather than in `package.json`, because the workspace runs pnpm in strict catalog mode. A `package.json` entry points at its catalog by name, as in `catalog:prettier`. Catalogs are grouped by the tool they belong to, so adding a package means choosing its catalog: `pnpm add --save-catalog-name <catalog> <package>`.

## Angular workspace

```bash
pnpm ng version
```

The repository is an [Angular CLI](https://angular.dev/tools/cli) workspace, configured in [angular.json](angular.json). It holds a single project, the `web-app` application under [projects/web-app](projects/web-app), and that is by design: this repository is the web frontend and nothing else. [tsconfig.json](tsconfig.json) carries the compiler options the project extends, with every strictness flag TypeScript offers turned on, plus the `@/<area>` path aliases that map onto the barrel files under `projects/web-app/src`. Angular, its CLI and TypeScript share the `angular` catalog in [pnpm-workspace.yaml](pnpm-workspace.yaml), so they move together on upgrades. The CLI is configured to use pnpm for the packages it installs, and its usage analytics are turned off.

## Running the app

```bash
pnpm start
```

The dev server listens on `https://localhost.www.dndmapp.dev:4200`, serving over TLS with a certificate and key read from `.ssl/cert.pem` and `.ssl/key.pem`. Both are ignored by Git, so generate them once with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
```

```bash
mkcert -cert-file .ssl/cert.pem -key-file .ssl/key.pem localhost.www.dndmapp.dev localhost 127.0.0.1 ::1
```

The first command adds the mkcert root certificate to the system trust store, so browsers accept the certificates it issues. The second issues a certificate that covers the `localhost.www.dndmapp.dev` hostname alongside the plain localhost names and addresses. The hostname is not a real DNS record, so point it at the loopback address in your hosts file (`/etc/hosts` on macOS and Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```text
127.0.0.1 localhost.www.dndmapp.dev
::1       localhost.www.dndmapp.dev
```

The dev server accepts requests for `localhost` and the loopback addresses out of the box; `allowedHosts` in [angular.json](angular.json) adds the custom hostname to that list. Until the hosts file is in place, `https://localhost:4200` works as a fallback.

## Building

```bash
pnpm run build
```

The production build lands in `dist/web-app`, with hashed file names, subresource integrity hashes on the emitted scripts and styles, and size budgets that warn at 500 kB and fail at 1 MB for the initial bundle. Run `pnpm run build -c development` for an unoptimized build with source maps.

## Docker image

```bash
docker build -t dnd-mapp/web-app .
```

[Dockerfile](Dockerfile) builds the production image in two stages. The first starts from the `node:24.21.0` image, installs pnpm 12.4.1 through [pnpm's standalone installer](https://pnpm.io/installation#using-a-standalone-script), installs the dependencies from the lockfile and runs `pnpm run build`. The installer downloads the pnpm executable from the npm registry and checks it against the published checksum and npm signature before installing it. The second stage copies `dist/web-app/browser` into an [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged) image, which runs nginx as an unprivileged user. [.docker/nginx.conf](.docker/nginx.conf) listens on port 4200, the same port as the dev server, hands unknown routes to `index.html` for the Angular router, tells browsers to revalidate `index.html` on every load and to cache the hashed scripts and styles for a year. Both base images are pinned to a digest, with the tag kept in front of it for reference, so a build always starts from the same layers. [.dockerignore](.dockerignore) limits the build context to the files the build stage copies in.

```bash
docker run --rm -p 4200:4200 dnd-mapp/web-app
```

The app is then served at `http://localhost:4200`.

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t dnd-mapp/web-app --push .
```

The image builds for several platforms at once. Both base image digests point at multi-architecture indexes, so each target resolves its own layers, and the lockfile carries the native modules for both architectures. The build stage is declared with `--platform=$BUILDPLATFORM`: the compiled output is static files, so it runs once on the builder's own platform and every target's nginx stage copies from that single result, instead of repeating the compile under emulation. Producing a multi-platform image needs a `docker-container` builder or Docker Desktop with the containerd image store; a plain `docker build` keeps producing a single-platform image for the current machine.

## Testing

```bash
pnpm run test
```

[Vitest](https://vitest.dev) runs the `*.spec.ts` files in a headless Chromium driven by [Playwright](https://playwright.dev), through Angular's `unit-test` builder configured in [angular.json](angular.json) and [vitest.config.ts](projects/web-app/vitest.config.ts). The default configuration watches for changes and serves the Vitest UI at `http://localhost:51204/__vitest__/`. Components are tested through [Angular CDK component harnesses](https://material.angular.dev/cdk/testing/overview), which live in a `testing/` folder next to the code they exercise. Coverage is collected on every run and reported to `coverage/web-app`; the run fails below 80% on statements, branches, functions and lines. Run `pnpm run test-ci` for a single, non-interactive run with GitHub Actions annotations, and `pnpm run playwright-install` once to download the Chromium build Playwright drives.

## Formatting

```bash
pnpm run format
```

Prettier formats the file types allowed in [.prettierignore](.prettierignore), with [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) sorting imports and dropping unused ones as part of the same pass. Prettier reads [.editorconfig](.editorconfig) for indentation, line width and line endings, so [.prettierrc.json](.prettierrc.json) only carries what EditorConfig cannot express. Run `pnpm run format-check` to report violations without rewriting anything.

## Linting Markdown

```bash
pnpm run lint-md
```

[markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) checks every Markdown file that Git tracks against the rules in [.markdownlint-cli2.yaml](.markdownlint-cli2.yaml). The config turns off the line length rule, because paragraphs are written as one line, and pins the heading, list and table styles used throughout the repository. Run `pnpm run lint-md --fix` to apply every fix the rules can make on their own; the rest it reports for you to resolve by hand. The [vscode-markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) extension reads the same config and flags violations while you type.

## Linting styles

```bash
pnpm run lint-styles
```

[Stylelint](https://stylelint.io) checks every SCSS file under `projects/` against [.stylelintrc.json](.stylelintrc.json), which extends [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss) and the error variant of [stylelint-config-clean-order](https://github.com/kutsan/stylelint-config-clean-order). The first parses the files as SCSS and brings Stylelint's standard rules plus the SCSS-specific ones: kebab-case selectors, variables and mixins, no duplicate or unknown properties, no invalid hex colors, and so on. The second enforces ordering: `@use` and Sass variables come before custom properties and mixin calls, declarations come before nested rules and media queries, and properties are grouped by concern (positioning, layout, box model, typography, and so on), with an empty line between groups once a block holds more than five declarations. Run `pnpm run lint-styles --fix` to reorder in place. The [vscode-stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) extension reads the same config and flags violations while you type.

## Continuous integration

GitHub Actions runs the checks on every pull request and again in the merge queue, through [pull-request.yml](.github/workflows/pull-request.yml) and [merge-group.yml](.github/workflows/merge-group.yml). Both hand their setup to the [setup-workspace](.github/actions/setup-workspace/action.yml) composite action, which installs Node.js, pnpm and the dependencies in one step with [pnpm/setup](https://github.com/pnpm/setup). That action reads `devEngines` from [package.json](package.json), so CI uses the versions listed under [Prerequisites](#prerequisites), and it installs from the lockfile with `--frozen-lockfile`.

The checks themselves live in the [run-checks](.github/actions/run-checks/action.yml) composite action, one step per check: `pnpm run format-check`, `pnpm run lint-md`, `pnpm run lint-styles`, `pnpm run build`, `docker build --check .` and `pnpm run test-ci`, with a `pnpm run playwright-install` step ahead of the tests to download the Chromium build they run in. The Docker step evaluates the [Dockerfile](Dockerfile) against [BuildKit's build checks](https://docs.docker.com/reference/build-checks/), which resolve the base images and lint every instruction without building the image. The `check=error=true` directive at the top of the Dockerfile makes a regular `docker build` fail on the same findings, so a local build catches them as well. The browser install sits there rather than in the setup, so a workflow that only needs the workspace set up does not pay for a browser it never starts. Adding a check means adding a step there, so a pull request and its merge queue entry always run the same set.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
