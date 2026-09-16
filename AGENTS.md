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

### Commit messages

[commitlint](.commitlintrc.yaml) checks every commit message against Conventional Commits, so the subject line reads `<type>(<scope>)!: <summary>`, with the scope and the `!` both optional. The types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style` and `test`, and the whole line stays within 100 characters. Write the summary in the imperative, starting lower-case and ending without a period: `chore: add commitlint with the conventional config`.

A blank line separates the subject from the body, which says what changed and why. The body and any footer are hard wrapped at 72 columns, which is the one place the one-line-paragraph rule under "Markdown" does not apply: a commit message is read through `git log`, which indents it by four, so 72 keeps it inside an 80 column terminal. A blank line separates paragraphs. `BREAKING CHANGE:` in a footer describes an incompatible change.

## Dependencies

pnpm 12 is the only supported package manager, enforced through `devEngines` in `package.json`. Running `npm` in this repository fails with `EBADDEVENGINES`.

Resolution settings live in `pnpm-workspace.yaml`. Four of them shape everyday work:

- **Strict catalogs.** Versions live in catalogs rather than in `package.json`. `pnpm add <package>` needs `--save-catalog-name <name>` to say which named catalog the version belongs in, or `--save-catalog` for the default catalog, which holds packages tied to no tool, such as `@types/node`. It records the version there and writes `catalog:<name>` or `catalog:` as the specifier in `package.json`. `pnpm remove` leaves the catalog entry behind, so delete that line yourself.
- **Release age.** Versions published less than three days ago do not resolve. Packages matching `@dnd-mapp/*` are exempt.
- **Peer dependencies.** Peers are never installed automatically, and an unmet peer fails the install, so add them as explicit dependencies.
- **Build scripts.** A dependency's install scripts stay blocked until it is listed under `allowBuilds`, and the install ends with `ERR_PNPM_IGNORED_BUILDS`. Run `pnpm approve-builds` to record the decision. `lefthook` is the one entry set to `true`: its `postinstall` script installs the Git hooks.

## Commit hooks

[lefthook.yml](lefthook.yml) defines two hooks. `pre-commit` has Prettier rewrite the staged files and stage the result, then runs ESLint, Stylelint and markdownlint-cli2 in parallel over the staged files of the types they cover. `commit-msg` then runs commitlint over the message file Git hands it, which is what enforces the format under "Commit messages". A commit either hook rejects gets fixed, not bypassed with `--no-verify`.

A new `pre-commit` check goes in as a job with a `glob` limited to the file types it covers and `{staged_files}` as its input, so it only sees the staged files. A check that rewrites files also sets `stage_fixed: true`. CI runs the same file checks over the whole repository, so `pre-commit` never replaces the checks listed under "Testing".

## Continuous integration

Workflows live in `.github/workflows` and run on `pull_request` and `merge_group`. Steps shared between them belong in a composite action under `.github/actions`, referenced as `./.github/actions/<name>`. Checking out the repository is the exception: a local action only resolves once a checkout has put it on disk, so that step stays in each workflow, even in a job whose only other step would not need one.

A check that only one event can run goes into that event's workflow as a step in the existing job, not into a shared action and not into a job of its own. Commit message linting is the only one so far: it needs a commit range, and `pull_request` is the only payload carrying both ends of one, so a `Lint commit messages` step sits in `pull-request.yml` between the setup and the checks. Keeping it inside the job means both workflows report the same `CI` check, so the required checks do not have to know about it.

`pull-request.yml` also publishes a preview image through two jobs beside `CI`. `Detect image changes` checks the repository out and runs the `detect-changes` composite action, which wraps `dorny/paths-filter` with patterns that mirror `.dockerignore` plus the files that decide whether and how the image is built: the Dockerfile, the bake file, the workflow and the action itself. A change to `.dockerignore` therefore lands in that filter as well, and the filter is edited in the action alone. The action is not specific to the image: it exposes one output per filter, so another workflow that needs to know what a pull request changes adds a filter and an output there rather than a filter of its own. `Build image` needs that job and runs when it reports a match and the head branch belongs to this repository; a fork cannot read the registry credentials, and its Dockerfile is not ours to publish. The job logs in to Docker Hub with the `DOCKERHUB_USERNAME` variable (`dndmapp`, the account that owns the image) and the `DOCKERHUB_TOKEN` organization secret, then builds `linux/amd64` and `linux/arm64` and pushes `dndmapp/web-app:pr-<N>` through the `docker/metadata-action` and `docker/bake-action` steps described under "Docker image". The filter reads the changed files through the GitHub API, so `Detect image changes` checks out only to put the local action on disk; `Build image` checks the repository out and runs bake from it with `source: .`, rather than from the Git context bake-action would otherwise clone itself.

Every workflow follows five conventions:

- **Pinned actions.** Use an action's latest release, referenced by the commit SHA that release points at, with the tag in a trailing comment: `uses: owner/action@<sha> # v1.2.3`.
- **Pinned runners.** Name a specific runner image such as `ubuntu-24.04` rather than `ubuntu-latest`.
- **Named steps.** Every workflow, job and step carries a `name`.
- **Explicit shells.** Every step that uses `run` declares a `shell`, which composite actions require anyway and which gives workflow steps `pipefail` on top of the default `-e`.
- **Job settings.** Every job declares `timeout-minutes`, a `permissions` block narrowing the workflow-level `permissions: {}`, and a `concurrency` group. Pull request runs cancel in progress; merge queue runs do not, because cancelling one drops a merge already underway.

## Docker image

[Dockerfile](Dockerfile) builds the app in a Node.js stage and serves it from an nginx stage. Both `FROM` lines pin the base image by digest, with the tag kept in front of it: `image:tag@sha256:<digest>`. Updating an image means resolving the new digest with `docker buildx imagetools inspect <image>:<tag>` and changing tag and digest together. The Node.js tag has to match the runtime version under `devEngines` in `package.json`, and pnpm is installed through the standalone installer at `https://get.pnpm.io/install.sh` with `PNPM_VERSION` set to that same pinned version, never through corepack or npm. The Node.js `FROM` line keeps `--platform=$BUILDPLATFORM`: the build stage produces static files, so it runs once on the builder's platform during a multi-platform build and is shared by every target's nginx stage. Anything added to the build stage has to stay platform independent for that to hold.

[docker-bake.hcl](docker-bake.hcl) is the one place that says how the image is built: its name, tags, platforms, attestations and OCI labels. Local builds and CI both run `docker buildx bake` against it, so a build option belongs in the file rather than on a command line. The image name stays `dndmapp/web-app`; whatever varies between local builds is a `variable`, set through the environment, with a default that suits a local build and `validation` blocks that fail the build on a bad value. CI takes tags and labels from `docker/metadata-action` instead of from the variables: the action writes them into a bake file as a target named `docker-metadata-action`, and `docker/bake-action` reads that file after this one. Bake merges a target defined in two files attribute by attribute: a later list replaces the earlier one, a later map is merged over it, and annotations are appended. The `docker-metadata-action` target in the file therefore holds the local defaults for tags and labels and sets no annotations, which would otherwise sit next to the action's in CI. The version label is set locally even though a local build has no version, because the nginx base image carries a version label of its own that would otherwise show through. Custom `function` blocks are not available inside `validation` conditions, so a condition is written out inline, wrapped across lines to stay within 120 columns. After changing the file, `docker buildx bake --print` shows the resolved configuration and `docker buildx bake --check` runs the build checks against it.

## Application layout

The `web-app` application lives under `projects/web-app/src`, divided into areas such as `core`. Each area exposes its public symbols through an `index.ts` barrel, and `paths` in `tsconfig.json` maps `@/<area>` onto that barrel, so code outside the area imports from `@/core` rather than through a relative path. A new area is complete once it has a barrel and an alias for it, plus a `@/<area>/testing` alias when it ships harnesses. File and class naming follows the `schematics` defaults in `angular.json`: `root.component.ts` holds `RootComponent`, styles are SCSS, and guards, interceptors, pipes and resolvers use a `.` type separator.

## Testing

Specs run in a real Chromium through Vitest's browser mode, with `describe`, `it`, `expect` and `vi` available as globals. Every component is exercised through an [Angular CDK component harness](https://material.angular.dev/cdk/testing/overview) that lives in the area's `testing/harnesses` folder and is exported from `testing/index.ts`. A spec renders the component inside a throwaway host component, loads the harness with `TestbedHarnessEnvironment`, and asserts through the harness's methods; [root.component.spec.ts](projects/web-app/src/core/root/root.component.spec.ts) and [root.harness.ts](projects/web-app/src/core/testing/harnesses/root.harness.ts) are the pair to copy. The `testing/` folders stay out of the application build and out of coverage, as do `main.ts`, the barrels and the `config/` folders; `tsconfig.spec.json` includes them alongside the specs, so the type-checked ESLint rules can resolve them. Coverage fails below 80% on every metric, so a component without a spec fails CI.

A change is ready to hand over once `pnpm run format-check`, `pnpm run lint-md`, `pnpm run lint-styles`, `pnpm run lint-ts`, `pnpm run lint-js`, `pnpm run build` and `pnpm run test-ci` all pass; CI runs exactly these seven, plus `docker build --check .`, which evaluates the Dockerfile against BuildKit's build checks without building an image, and commitlint over the commits a pull request adds. Running the dev server needs TLS certificates and a hosts entry, described under "Running the app" in [README.md](README.md).
