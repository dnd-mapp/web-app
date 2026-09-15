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

## Formatting

```bash
pnpm run format
```

Prettier formats the file types allowed in [.prettierignore](.prettierignore), with [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) sorting imports and dropping unused ones as part of the same pass. Prettier reads [.editorconfig](.editorconfig) for indentation, line width and line endings, so [.prettierrc.json](.prettierrc.json) only carries what EditorConfig cannot express. Run `pnpm run format-check` to report violations without rewriting anything.

## Continuous integration

GitHub Actions runs the checks on every pull request and again in the merge queue, through [pull-request.yml](.github/workflows/pull-request.yml) and [merge-group.yml](.github/workflows/merge-group.yml). Both hand their setup to the [setup-workspace](.github/actions/setup-workspace/action.yml) composite action, which installs Node.js, pnpm and the dependencies in one step with [pnpm/setup](https://github.com/pnpm/setup). That action reads `devEngines` from [package.json](package.json), so CI uses the versions listed under [Prerequisites](#prerequisites), and it installs from the lockfile with `--frozen-lockfile`.

The only check today is `pnpm run format-check`. Later checks become extra steps in both workflows, so a pull request and its merge queue entry always run the same set.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
