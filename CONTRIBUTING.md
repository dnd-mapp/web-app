# Contributing

Thanks for contributing. This guide covers the workflow and conventions for the `web-app` repository.

## Development setup

Follow [Getting started](README.md#getting-started) in the README to install dependencies, create the dev-server certificate, and run the app. `pnpm install` also installs the Git hooks through Husky.

## Workflow

1. Branch off `main`. Use a short, descriptive name such as `feat/fog-of-war` or `fix/route-guard`.
2. Make your change, with tests.
3. Run the full check suite locally (see [Quality checks](#quality-checks)).
4. Open a pull request against `main`. CI must pass before it can merge.

## Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). commitlint checks them in the `commit-msg` hook and again on every pull request, using `@commitlint/config-conventional`.

Format:

```text
<type>(<optional scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, `chore`, `perf`, `style`, `revert`.

Examples:

```text
feat(map): render fog-of-war overlay
fix: guard against missing route params
chore(deps): bump angular to 22.1.6
```

Check a message without committing by piping it in:

```bash
echo "feat: add fog-of-war overlay" | pnpm commitlint
```

## Git hooks

`pnpm install` runs the `prepare` script, which installs two hooks with Husky:

- `pre-commit` runs lint-staged against staged files only:
  - `*.ts` and `*.html`: `eslint --fix`, then Prettier
  - `*.scss`: `stylelint --fix`, then Prettier
  - `*.md`: `markdownlint-cli2 --fix`
  - `*.json`, `*.yaml`, `*.js` and similar: Prettier
- `commit-msg` runs commitlint.

`git commit --no-verify` skips the hooks. CI runs the same checks, so a skipped hook only defers the failure.

## Code style

- EditorConfig (`.editorconfig`) sets indentation, LF line endings, and a final newline. Install the plugin for your editor.
- Prettier owns formatting. Do not hand-format. Run `pnpm format`.
- ESLint (`eslint.config.mjs`) runs type-checked rules and `angular-eslint`. Component selectors use the `app-` prefix; directive selectors use the `app` prefix in camelCase.
- Stylelint (`.stylelintrc.json`) extends `stylelint-config-standard-scss` and orders properties with `stylelint-config-clean-order`.
- Generate new building blocks with `ng generate`. The schematics are configured for SCSS and `angular-eslint`.
- Prefer standalone components, signals for state, and `inject()` over constructor parameters.

## Testing

- Put each spec next to its subject: `thing.ts` and `thing.spec.ts`.
- Prefer [CDK component harnesses](https://material.angular.io/cdk/test-harnesses) over raw DOM access. Shared harnesses live in `src/core/testing` and are exported from `@/app/core/testing`.
- Keep coverage at 80% or above for branches, functions, lines, and statements. `config/`, `testing/`, `index.ts`, and `main.ts` are excluded.
- Use `pnpm test` while developing. Use `pnpm test-ci` to reproduce CI locally.

## Dependencies

The repository uses [pnpm catalogs](https://pnpm.io/catalogs) with `catalogMode: strict`. Every version lives in a named catalog in `pnpm-workspace.yaml`, and `package.json` references `catalog:<name>` rather than a version range.

To add or update a package:

1. Add or bump the entry in the right catalog in `pnpm-workspace.yaml`. Create a new catalog if none fits.
2. Reference it from `package.json` as `catalog:<name>`.
3. Run `pnpm install`.

Two policies in `pnpm-workspace.yaml` affect version choices:

- `minimumReleaseAge: 4320` rejects any package published in the last three days. Choose an older version or wait.
- `trustPolicy: no-downgrade` prevents dependency versions from moving backwards.

## Quality checks

Run what CI runs:

```bash
pnpm format-check
pnpm lint-ts
pnpm lint-md
pnpm lint-styles
pnpm build
pnpm test-ci
```

## Changelog

Add a bullet under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for any change someone using the web app would notice. Build tooling, CI, dependency bumps, and repository housekeeping do not belong there. The file follows [Keep a Changelog](https://keepachangelog.com/).
