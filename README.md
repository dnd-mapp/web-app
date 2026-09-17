# D&D Mapp web app

[![License](https://img.shields.io/github/license/dnd-mapp/web-app)](LICENSE)
[![Push main](https://github.com/dnd-mapp/web-app/actions/workflows/push-main.yml/badge.svg)](https://github.com/dnd-mapp/web-app/actions/workflows/push-main.yml)
[![Docker Hub](https://img.shields.io/docker/pulls/dndmapp/web-app?logo=docker&label=Docker%20Hub)](https://hub.docker.com/r/dndmapp/web-app)

The web frontend for D&D Mapp, a companion for tabletop D&D: manage characters, roll dice, and build maps and lore. Then play out combat and exploration in a virtual tabletop powered by a custom game engine built on the game rules.

Built with [Angular](https://angular.dev) and TypeScript, tested with [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev), and shipped as the [dndmapp/web-app](https://hub.docker.com/r/dndmapp/web-app) Docker image.

## Getting started

Install Node.js 24.21.0 and pnpm 12.4.1, the versions pinned in [package.json](package.json), then:

```bash
pnpm install
```

```bash
pnpm start
```

The dev server serves over TLS, so the first run needs certificates from mkcert and a hosts entry. [Getting started](docs/getting-started.md) walks through both, and through building the app.

## Running the Docker image

```bash
docker run --rm -p 4200:4200 dndmapp/web-app:latest
```

The app is then served at `http://localhost:4200`. `latest` is the newest release and `dev` follows the newest commit on `main`; the [Docker Hub page](https://hub.docker.com/r/dndmapp/web-app) lists every tag. [Docker image](docs/docker.md) describes how the image is built and how to build it locally.

## Documentation

| Page                                                   | Covers                                                                                              |
|:-------------------------------------------------------|:----------------------------------------------------------------------------------------------------|
| [Getting started](docs/getting-started.md)             | Prerequisites, installing, running the dev server over TLS, building.                               |
| [Dependencies](docs/dependencies.md)                   | pnpm catalogs, the resolution settings that shape adding or updating a package, and Renovate.       |
| [Workspace](docs/workspace.md)                         | The Angular workspace, the tsconfig files and how the application is laid out into areas.           |
| [Design system](docs/design-system.md)                 | The primitive and semantic design tokens and the rule for adding one.                               |
| [Localization](docs/localization.md)                   | ngx-translate: the message keys a template reads, the dictionaries behind them, and the locales.    |
| [Testing](docs/testing.md)                             | Unit tests with component harnesses, end-to-end tests and the compose stack they run on.            |
| [Formatting and linting](docs/linting.md)              | Prettier, markdownlint, Stylelint and ESLint, and how their configs fit together.                   |
| [Branches, commits and pull requests](docs/commits.md) | Branch names, Conventional Commits, commitlint, the Git hooks lefthook installs, and pull requests. |
| [Docker image](docs/docker.md)                         | The Dockerfile, the bake file, attestations and the Docker Hub page texts.                          |
| [Continuous integration](docs/ci.md)                   | The workflows, the composite actions they share, secrets, and how pull requests merge.              |
| [Releasing](docs/releasing.md)                         | The changelog, cutting a release and the release workflow.                                          |

[CONTRIBUTING.md](CONTRIBUTING.md) walks a contributor through a change, [AGENTS.md](AGENTS.md) holds the guidelines coding agents follow, and [CHANGELOG.md](CHANGELOG.md) records what changed for users of the application.

## Contributing

Pull requests are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) walks through a change from checkout to merge: setting up, commit messages, the checks to run and how a pull request gets reviewed and merged.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
