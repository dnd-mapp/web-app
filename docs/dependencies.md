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

## Automated updates

```bash
docker run --rm -v "$PWD/renovate.json5:/usr/src/app/renovate.json5:ro" renovate/renovate renovate-config-validator --strict
```

[Renovate](https://docs.renovatebot.com) opens a pull request when a dependency has a newer version, configured in [renovate.json5](../renovate.json5). It runs as the [Mend Renovate app](https://github.com/apps/renovate) installed on the `dnd-mapp` organization, so there is no workflow for it under `.github`. Its pull requests are pull requests like any other: they get the same checks, the same code owner review and the same [auto-merge](ci.md#auto-merge), and Renovate's own automerge stays off, so nothing merges without an approval. The app commits through the GitHub API, which is what gives its commits the signature the `Default branch` ruleset requires. The command above validates the config after a change through Renovate's own image, since `npx` trips over `devEngines` and `pnpm dlx` over the build script policy of this repository; `configMigration` is on as well, so Renovate opens a pull request itself when an option it relies on is renamed.

Renovate covers three kinds of dependency:

- **Catalog packages.** Every named catalog in [pnpm-workspace.yaml](../pnpm-workspace.yaml) has a rule that groups its packages into one pull request, `build(deps): update angular catalog`, so the packages of one tool move together the way the catalogs intend. A new catalog gets a rule of its own; the default catalog is not grouped, since its packages have nothing in common. Major updates come in a pull request of their own. Renovate bumps the `~` range along with the lockfile (`rangeStrategy: bump`), so a patch release shows in the catalog rather than only in `pnpm-lock.yaml`, and it waits the same three days pnpm's [release age](#release-age) requires, since pnpm would refuse to resolve a younger version. Transitive dependencies only move through lock file maintenance, which refreshes `pnpm-lock.yaml` once a month.
- **Pinned versions.** The Node.js version is pinned in three places that have to agree: the `node` image the [Dockerfile](docker.md#dockerfile) builds in, `devEngines.runtime` in [package.json](../package.json) and the `engines` range. The pnpm version is pinned in two: `PNPM_VERSION` in the Dockerfile and `devEngines.packageManager`. Renovate reads `engines` but not `devEngines`, so regex managers in the config pick up the two pins under it and `PNPM_VERSION`, and two rules group everything named `node` and everything named `pnpm`, so one pull request moves each set. Only the active LTS line of Node.js is in use, so a new major is proposed once it enters LTS, the day the previous line moves to maintenance, and never before: the pins in `package.json` follow Node's release schedule through the `node-version` datasource, and a rule gives the `node` image the same `node` versioning. The base images in the Dockerfile and the compose stack are updated tag and digest together, and any image added without a digest gets one pinned. The `# syntax` directive keeps floating on the 1.x frontend.
- **GitHub Actions.** An action pinned as `owner/action@<sha> # v1.2.3` gets its SHA and its comment updated together, and an action referenced by tag gets pinned, as the [conventions](ci.md#conventions) require. These come as `ci(deps)` commits.

Commit messages follow [Conventional Commits](commits.md#commit-messages): `build(deps)` for a dependency and `ci(deps)` for an action, the types the history uses for both. Branches are named `renovate/<update>`, the one exception to the [branch naming](commits.md#branch-names), since the prefix is how Renovate tells its branches apart. A `Dependency Dashboard` issue lists every pending, open and rate-limited update; ticking a box there recreates a pull request that was closed. A failed lockfile update shows in the pull request as an artifact error with pnpm's output, which is where a peer conflict or a blocked build script from the settings above surfaces first.
