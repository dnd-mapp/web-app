# web-app

The browser front-end of D&D Mapp, a single-page application built with Angular.

## Tech stack

- Angular 22 with standalone components, signals, and the `@angular/build` (esbuild and Vite) toolchain
- TypeScript 6 in strict mode
- Vitest running in a real browser (Playwright and Chromium) with Angular CDK component harnesses
- pnpm 11 workspace with strict [catalogs](https://pnpm.io/catalogs) for dependency versioning
- Prettier, ESLint (type-checked, `angular-eslint`), Stylelint, and markdownlint
- Husky, lint-staged, and commitlint for pre-commit and commit-message checks

## Prerequisites

- Node.js 24. The supported range is pinned in `devEngines` in `package.json`.
- pnpm 11 (`pnpm@11.24` or newer). Enable it with `corepack enable pnpm`, or install it through a version manager such as [mise](https://mise.jdx.dev/).
- [mkcert](https://github.com/FiloSottile/mkcert). The dev server runs over HTTPS and needs a local certificate.

pnpm enforces the Node and pnpm versions during install (`engineStrict`), so a mismatched toolchain fails immediately.

## Getting started

Install dependencies:

```bash
pnpm install
```

Point the dev-server hostname at your machine by adding this line to your hosts file (`/etc/hosts` on Linux and macOS, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```text
127.0.0.1 localhost.www.dnd-mapp.dev
```

Create a local TLS certificate for the dev server:

```bash
mkcert -install
mkcert -cert-file .ssl/cert.pem -key-file .ssl/key.pem localhost.www.dnd-mapp.dev 127.0.0.1 localhost
```

Start the dev server:

```bash
pnpm start
```

The app is served at <https://localhost.www.dnd-mapp.dev:4200> with live reload. The `.ssl/` directory is git-ignored.

## Scripts

| Command             | Description                                             |
|:--------------------|:--------------------------------------------------------|
| `pnpm start`        | Dev server at <https://localhost.www.dnd-mapp.dev:4200> |
| `pnpm build`        | Production build to `dist/`                             |
| `pnpm test`         | Unit tests in watch mode with the Vitest UI             |
| `pnpm test-ci`      | Unit tests once, with coverage and CI reporters         |
| `pnpm format`       | Format the repository with Prettier                     |
| `pnpm format-check` | Check formatting without writing changes                |
| `pnpm lint-ts`      | Lint TypeScript and templates with ESLint               |
| `pnpm lint-md`      | Lint Markdown with markdownlint                         |
| `pnpm lint-styles`  | Lint SCSS with Stylelint                                |

## Project structure

```text
projects/web-app/
├── public/            Static assets copied verbatim into the build
└── src/
    ├── core/          Application core
    │   ├── config/    App config and route table
    │   ├── root/      Root component
    │   └── testing/   Shared test harnesses
    ├── index.html
    ├── main.ts        Bootstraps RootComponent with appConfig
    └── styles.scss    Global styles
```

TypeScript path aliases (`tsconfig.json`):

- `@/app/core` maps to `projects/web-app/src/core`
- `@/app/core/testing` maps to `projects/web-app/src/core/testing`

## Testing

Tests run through `@angular/build:unit-test` on Vitest in a headless Chromium browser. Specs live next to the code they cover (`*.spec.ts`) and use [Angular CDK component harnesses](https://material.angular.io/cdk/test-harnesses) instead of querying the DOM directly.

```bash
pnpm test       # watch mode with the Vitest UI
pnpm test-ci    # single run with coverage
```

Coverage is enforced at 80% for branches, functions, lines, and statements. Reports are written to `coverage/` and `reports/`.

## Continuous integration

Every push to `main` and every pull request runs the shared [`.github/actions/ci`](.github/actions/ci/action.yml) composite action: formatting check, TypeScript, Markdown and style linting, a production build, and the test suite. Pull requests also validate that each commit message follows Conventional Commits.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, commit conventions, and dependency policy. Notable changes are recorded in [CHANGELOG.md](CHANGELOG.md).

## License

Released under the [MIT License](LICENSE).
