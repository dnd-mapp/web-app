# Agent guidelines

## Writing style

Applies to every piece of prose you produce: documentation, commit messages, pull request descriptions, code comments, and chat responses.

Write US English. Instead of an em dash, use the punctuation that fits the clause:

- Commas for short interruptions or clauses.
- Parentheses for asides.
- Colons for explanations, examples, or summaries.
- Semicolons to connect closely related independent clauses.
- Periods to split long sentences.

Rewrite the sentence when none of these fit, rather than falling back on double hyphens.

### Final reading pass

Read the finished text once more before handing it over, and fix what you find:

- **Sentence length.** Split every sentence of 40 words or more. Quotes from external sources stay verbatim.
- **Spelling.** Convert British spellings to US ones: `behaviour` to `behavior`, `initialise` to `initialize`, `colour` to `color`.
- **Em dashes.** Replace every `—` with an alternative from the list above.

The pass is done when all three checks have run over the whole text, not only the parts edited last.

### Markdown

Let prose flow: write each paragraph as one line and leave wrapping to the renderer.

Give every table an alignment indicator in its separator row:

| Setting | Scope  | Default |
|:--------|:------:|--------:|
| `theme` | global |    dark |

[markdownlint-cli2](.markdownlint-cli2.yaml) enforces these Markdown conventions in CI. Run `pnpm run lint-md` over any Markdown you edit and clear every finding before handing over.

## Dependencies

pnpm 12 is the only supported package manager, enforced through `devEngines` in `package.json`. Running `npm` in this repository fails with `EBADDEVENGINES`.

Resolution settings live in `pnpm-workspace.yaml`. Four of them shape everyday work:

- **Strict catalogs.** Versions live in named catalogs rather than the default one, so `pnpm add <package>` needs `--save-catalog-name <name>` to say which catalog the version belongs in. It records the version there and writes `catalog:<name>` as the specifier in `package.json`. `pnpm remove` leaves the catalog entry behind, so delete that line yourself.
- **Release age.** Versions published less than three days ago do not resolve. Packages matching `@dnd-mapp/*` are exempt.
- **Peer dependencies.** Peers are never installed automatically, and an unmet peer fails the install, so add them as explicit dependencies.
- **Build scripts.** A dependency's install scripts stay blocked until it is listed under `allowBuilds`, and the install ends with `ERR_PNPM_IGNORED_BUILDS`. Run `pnpm approve-builds` to record the decision.

## Continuous integration

Workflows live in `.github/workflows` and run on `pull_request` and `merge_group`. Steps shared between them belong in a composite action under `.github/actions`, referenced as `./.github/actions/<name>`. Checking out the repository is the exception: a local action only resolves once a checkout has put it on disk, so that step stays in each workflow.

Every workflow follows four conventions:

- **Pinned actions.** Use an action's latest release, referenced by the commit SHA that release points at, with the tag in a trailing comment: `uses: owner/action@<sha> # v1.2.3`.
- **Pinned runners.** Name a specific runner image such as `ubuntu-24.04` rather than `ubuntu-latest`.
- **Named steps.** Every workflow, job and step carries a `name`.
- **Explicit shells.** Every step that uses `run` declares a `shell`, which composite actions require anyway and which gives workflow steps `pipefail` on top of the default `-e`.
- **Job settings.** Every job declares `timeout-minutes`, a `permissions` block narrowing the workflow-level `permissions: {}`, and a `concurrency` group. Pull request runs cancel in progress; merge queue runs do not, because cancelling one drops a merge already underway.

## Docker image

[Dockerfile](Dockerfile) builds the app in a Node.js stage and serves it from an nginx stage. Both `FROM` lines pin the base image by digest, with the tag kept in front of it: `image:tag@sha256:<digest>`. Updating an image means resolving the new digest with `docker buildx imagetools inspect <image>:<tag>` and changing tag and digest together. The Node.js tag has to match the runtime version under `devEngines` in `package.json`, and pnpm is installed through the standalone installer at `https://get.pnpm.io/install.sh` with `PNPM_VERSION` set to that same pinned version, never through corepack or npm. The Node.js `FROM` line keeps `--platform=$BUILDPLATFORM`: the build stage produces static files, so it runs once on the builder's platform during a multi-platform build and is shared by every target's nginx stage. Anything added to the build stage has to stay platform independent for that to hold.

## Application layout

The `web-app` application lives under `projects/web-app/src`, divided into areas such as `core`. Each area exposes its public symbols through an `index.ts` barrel, and `paths` in `tsconfig.json` maps `@/<area>` onto that barrel, so code outside the area imports from `@/core` rather than through a relative path. A new area is complete once it has a barrel and an alias for it, plus a `@/<area>/testing` alias when it ships harnesses. File and class naming follows the `schematics` defaults in `angular.json`: `root.component.ts` holds `RootComponent`, styles are SCSS, and guards, interceptors, pipes and resolvers use a `.` type separator.

## Testing

Specs run in a real Chromium through Vitest's browser mode, with `describe`, `it`, `expect` and `vi` available as globals. Every component is exercised through an [Angular CDK component harness](https://material.angular.dev/cdk/testing/overview) that lives in the area's `testing/harnesses` folder and is exported from `testing/index.ts`. A spec renders the component inside a throwaway host component, loads the harness with `TestbedHarnessEnvironment`, and asserts through the harness's methods; [root.component.spec.ts](projects/web-app/src/core/root/root.component.spec.ts) and [root.harness.ts](projects/web-app/src/core/testing/harnesses/root.harness.ts) are the pair to copy. The `testing/` folders stay out of the application build and out of coverage, as do `main.ts`, the barrels and the `config/` folders. Coverage fails below 80% on every metric, so a component without a spec fails CI.

A change is ready to hand over once `pnpm run format-check`, `pnpm run lint-md`, `pnpm run build` and `pnpm run test-ci` all pass; CI runs exactly these four, plus `docker build --check .`, which evaluates the Dockerfile against BuildKit's build checks without building an image. Running the dev server needs TLS certificates and a hosts entry, described under "Running the app" in [README.md](README.md).
