# web-app

The D&D Mapp web client: an [Angular](https://angular.dev) single-page application, served over HTTPS in development and built as a fully static bundle.

## Requirements

| Tool                                            | Version   | Why                                                                    |
|:------------------------------------------------|:----------|:-----------------------------------------------------------------------|
| [Node.js](https://nodejs.org)                   | `24.21.0` | Pinned through `devEngines.runtime`; a mismatch fails the install.     |
| [pnpm](https://pnpm.io)                         | `12.4.0`  | Pinned through `devEngines.packageManager`; other managers are unused. |
| [mkcert](https://github.com/FiloSottile/mkcert) | any       | Issues the locally trusted certificate the dev server needs.           |

`engineStrict` is enabled, so pnpm refuses to run on an unsupported Node.js version rather than warning. Both pins live in `package.json`, which leaves two ways to satisfy them.

The first is to install both tools by hand: Node.js from its [downloads page](https://nodejs.org/en/download), and pnpm through its [standalone installer](https://pnpm.io/installation), which needs neither Node.js nor Corepack:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

```powershell
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

The version the installer lands on hardly matters, since pnpm manages its own version by default: it reads `devEngines.packageManager` and switches to the pinned release before running a command.

The second is to hand both tools to [mise](https://mise.jdx.dev), which reads the pins straight out of `package.json` rather than a `mise.toml` of its own. Those idiomatic version files are disabled by default, so enable them once per tool:

```bash
mise settings add idiomatic_version_file_enable_tools node
mise settings add idiomatic_version_file_enable_tools pnpm
```

Both commands write to the global `~/.config/mise/config.toml`, leaving the repository free of mise configuration. `mise install` in the repository root then provisions Node.js from `devEngines.runtime` and pnpm from `devEngines.packageManager`, and follows both as the manifest changes.

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Install the test browser

The unit tests run in a real Chromium instance, which has to be downloaded once:

```bash
pnpm run playwright-install
```

### 3. Trust a local certificate authority

```bash
mkcert -install
```

### 4. Issue the development certificate

The dev server reads `.ssl/cert.pem` and `.ssl/key.pem`. Both files are ignored by Git, so every clone issues its own:

```bash
mkcert -cert-file .ssl/cert.pem -key-file .ssl/key.pem localhost.www.dndmapp.dev localhost 127.0.0.1 ::1
```

### 5. Map the development hostname

`localhost.www.dndmapp.dev` has no public DNS record, so point it at the loopback address in your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` elsewhere):

```text
127.0.0.1 localhost.www.dndmapp.dev
```

### 6. Serve the application

```bash
pnpm start
```

The application is then available at both <https://127.0.0.1:4200> and <https://localhost.www.dndmapp.dev:4200>, and rebuilds on every change.

## Scripts

All scripts are run with `pnpm run <name>`.

### Development

| Script  | Description                                                                         |
|:--------|:------------------------------------------------------------------------------------|
| `start` | Serves the application over HTTPS on port `4200` and rebuilds on change.            |
| `build` | Builds the production bundle into `dist/`, enforcing the budgets in `angular.json`. |
| `ng`    | Escape hatch for any Angular CLI command that has no script of its own.             |

### Tests

| Script               | Description                                                             |
|:---------------------|:------------------------------------------------------------------------|
| `test`               | Runs the unit tests in watch mode with the Vitest UI.                   |
| `test-ci`            | Runs the unit tests once, with the reporters CI uses.                   |
| `playwright-install` | Installs the Chromium build (and its system dependencies) tests run in. |

### Formatting and linting

Every linter comes as a pair: the bare name fixes what it can, the `-check` variant only reports. CI runs the `-check` variants exclusively.

| Script              | Fixes | Covers                                        |
|:--------------------|:-----:|:----------------------------------------------|
| `format`            |  yes  | Prettier over every supported file.           |
| `format-check`      |  no   | Prettier over every supported file.           |
| `lint-ts`           |  yes  | ESLint over TypeScript and Angular templates. |
| `lint-ts-check`     |  no   | ESLint over TypeScript and Angular templates. |
| `lint-md`           |  yes  | markdownlint over every Markdown file.        |
| `lint-md-check`     |  no   | markdownlint over every Markdown file.        |
| `lint-styles`       |  yes  | Stylelint over the SCSS under `projects/`.    |
| `lint-styles-check` |  no   | Stylelint over the SCSS under `projects/`.    |

Prettier owns formatting everywhere except Markdown, which `.prettierignore` hands to markdownlint outright. Line width is 120 columns, indentation is four spaces, and imports are sorted by `prettier-plugin-organize-imports`. The shared editor defaults live in `.editorconfig`.

## Project layout

```text
.github/            Composite actions and the CI workflows that call them
.ssl/               Locally issued development certificate (ignored by Git)
projects/web-app/   The application
├── public/         Static assets copied verbatim into the bundle
├── src/
│   ├── core/       Application-wide configuration, the root component and test harnesses
│   ├── index.html  Document shell
│   ├── main.ts     Bootstrap entry point
│   └── styles.scss Global styles and design tokens
└── vitest.config.mts
angular.json        Workspace, build, test and lint targets
pnpm-workspace.yaml Dependency catalogs and pnpm settings
tsconfig.json       Compiler options and path aliases, extended by every project tsconfig
```

Features are exposed through a barrel `index.ts` and consumed through a path alias rather than a relative path, which makes `tsconfig.json` the index of what each feature publishes:

```ts
import { appConfig, RootComponent } from '@/core';
import { RootHarness } from '@/core/testing';
```

Adding a feature therefore means adding its barrel file and registering the matching alias under `compilerOptions.paths`.

## Testing

Tests run through the Angular CLI's `unit-test` builder on [Vitest](https://vitest.dev), in a headless Chromium driven by Playwright, so components are exercised in a real browser rather than a DOM emulation. Specs are any `**/*.spec.ts` file.

Components are asserted through [CDK component harnesses](https://material.angular.dev/cdk/test-harnesses/overview) rather than by querying the DOM directly: a harness keeps the selectors in one place and the specs readable. Harnesses live next to the code they cover, under `testing/harnesses/`, and are published from a `testing` barrel.

Coverage is collected on every run, with thresholds enforced at 80% for branches, functions, lines and statements. Entry points, barrels, configuration and test-only helpers are excluded, since covering them measures nothing. The HTML report is written to `coverage/web-app/`.

## Dependencies

Versions are declared once, in the catalogs in `pnpm-workspace.yaml`, and referenced from `package.json` as `catalog:<name>`. `catalogMode` is `strict`, so a dependency that is not in a catalog is rejected; add the version to the appropriate catalog instead of writing a range into `package.json`.

Two guards apply to updates: `minimumReleaseAge` holds new releases back for three days, and `trustPolicy` set to `no-downgrade` rejects a resolution that would move a package backward.

## Committing

[Lefthook](https://lefthook.dev) installs the Git hooks on install, so nothing extra is needed. On commit, markdownlint, Stylelint and Prettier fix and restage the staged files, after which ESLint validates the result without fixing; its fixes carry semantic weight and belong in a reviewed edit rather than in a hook.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and are checked by commitlint, both on commit and across the whole range of a pull request:

```text
feat(map): add tile layer switching
fix(auth): stop refreshing an expired session
```

## Continuous integration

`.github/workflows/pull-request.yml` runs on every pull request and `.github/workflows/merge-group.yml` runs in the merge queue; both call the same composite action, so a pull request and its queue entry are verified identically. The suite checks formatting, lints TypeScript, Markdown and styles, builds the application, and runs the tests.

Workflow permissions start empty and each job opts back into only what it needs, action versions are pinned to a commit SHA, and checkout never persists credentials.

## Editor setup

Tasks, launch configurations and the Angular CLI MCP server are checked in for both VS Code (`.vscode/`) and JetBrains IDEs (`.idea/`), so every script is available from the IDE and the application can be debugged in Chrome against the running dev server.

## License

Released under the [MIT License](LICENSE).
