# D&D Mapp web app

[![push main](https://github.com/dnd-mapp/web-app/actions/workflows/push-main.yaml/badge.svg?branch=main)](https://github.com/dnd-mapp/web-app/actions/workflows/push-main.yaml)
[![license](https://img.shields.io/github/license/dnd-mapp/web-app)](LICENSE)

The website and web application of [D&D Mapp](https://github.com/dnd-mapp). One Angular application serves both the public pages and the app.

The application is an empty scaffold for now. It is not deployed yet, and features land in later issues.

## Getting started

Install Node and pnpm in the versions that `devEngines` in `package.json` sets, then install the dependencies and the Chromium browser that the tests run in.

```bash
pnpm install
pnpm exec playwright install chromium
```

Serve the application on port 4200, or run the tests in watch mode with the Vitest UI.

```bash
pnpm start
pnpm test
```

## Contributing

Read the [shared contributing guide](https://github.com/dnd-mapp/.github/blob/main/CONTRIBUTING.md) for how to take part and the conventions that every D&D Mapp repository follows. The [contributing guide of this repository](docs/contributing/README.md) adds its layout and its checks.

## License

[MIT](LICENSE) © D&D Mapp
