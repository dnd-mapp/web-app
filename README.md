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

Dependency versions live in the catalog in [pnpm-workspace.yaml](pnpm-workspace.yaml) rather than in `package.json`, because the workspace runs pnpm in strict catalog mode. Both files are maintained by `pnpm add`.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
