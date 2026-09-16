# Dependencies

pnpm 12 is the only supported package manager, enforced through `devEngines` in [package.json](../package.json); see [Prerequisites](getting-started.md#prerequisites). Resolution settings live in [pnpm-workspace.yaml](../pnpm-workspace.yaml). Four of them shape everyday work.

## Strict catalogs

Versions live in catalogs in `pnpm-workspace.yaml` rather than in `package.json`, because the workspace runs pnpm in strict catalog mode. A `package.json` entry points at its catalog by name, as in `catalog:prettier`. Catalogs are grouped by the tool they belong to, so adding a package means choosing its catalog:

```bash
pnpm add --save-catalog-name <catalog> <package>
```

A package tied to no tool, such as `@types/node`, goes in the default catalog with `pnpm add --save-catalog <package>` and is referenced as `catalog:`. Either form records the version in the catalog and writes the `catalog:<name>` or `catalog:` specifier in `package.json`. Angular, its CLI and TypeScript share the `angular` catalog, so they move together on upgrades. `pnpm remove` leaves the catalog entry behind, so delete that line yourself.

## Release age

Versions published less than three days ago do not resolve. Packages matching `@dnd-mapp/*` are exempt.

## Peer dependencies

Peers are never installed automatically, and an unmet peer fails the install, so add them as explicit dependencies.

## Build scripts

A dependency's install scripts stay blocked until it is listed under `allowBuilds`, and the install ends with `ERR_PNPM_IGNORED_BUILDS`. Run `pnpm approve-builds` to record the decision. `lefthook` is the one entry set to `true`: its `postinstall` script installs the Git hooks described under [Commit hooks](commits.md#commit-hooks).
