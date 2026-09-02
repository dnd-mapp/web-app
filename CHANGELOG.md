# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Angular 22 application scaffold with standalone components, signals, and routing.
- Vitest browser-mode unit tests with Angular CDK component harnesses and 80% coverage thresholds.
- Prettier, ESLint (type-checked, `angular-eslint`), Stylelint (`stylelint-config-standard-scss` and `stylelint-config-clean-order`), and markdownlint configuration.
- Conventional Commits enforcement through commitlint and a Husky `commit-msg` hook.
- Husky `pre-commit` hook running lint-staged (ESLint, Stylelint, markdownlint, Prettier).
- GitHub Actions CI for pushes to `main` and pull requests via a shared composite action, plus pull-request commit-message validation.
- pnpm workspace with strict catalogs (`angular`, `eslint`, `vitest`, `prettier`, `stylelint`, `markdown`, `commitlint`) and a `minimumReleaseAge` supply-chain policy.
- HTTPS dev server on `localhost.www.dnd-mapp.dev` with local certificate and hosts-file setup.
- Multi-stage `Dockerfile` building the SPA with pnpm and serving it from a rootless nginx image (non-root, unprivileged port 4200, read-only-root-filesystem friendly), with `.docker/` nginx config and a `.dockerignore`.
- `Story` issue form (`.github/ISSUE_TEMPLATE/story.yml`) using the native `Story` issue type, plus `priority: *` and `status: *` label sets; new Stories open as `status: triage`.
- `README.md` and `CONTRIBUTING.md`.
- MIT `LICENSE` and package manifest metadata.

[Unreleased]: https://github.com/dnd-mapp/web-app
