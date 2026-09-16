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

Dependency versions live in catalogs in [pnpm-workspace.yaml](pnpm-workspace.yaml) rather than in `package.json`, because the workspace runs pnpm in strict catalog mode. A `package.json` entry points at its catalog by name, as in `catalog:prettier`. Catalogs are grouped by the tool they belong to, so adding a package means choosing its catalog: `pnpm add --save-catalog-name <catalog> <package>`. A package tied to no tool, such as `@types/node`, goes in the default catalog with `pnpm add --save-catalog <package>` and is referenced as `catalog:`.

## Angular workspace

```bash
pnpm ng version
```

The repository is an [Angular CLI](https://angular.dev/tools/cli) workspace, configured in [angular.json](angular.json). It holds a single project, the `web-app` application under [projects/web-app](projects/web-app), and that is by design: this repository is the web frontend and nothing else. [tsconfig.json](tsconfig.json) carries the compiler options the project extends, with every strictness flag TypeScript offers turned on, plus the `@/<area>` path aliases that map onto the barrel files under `projects/web-app/src`. [tsconfig.tooling.json](tsconfig.tooling.json) is referenced from it as well and covers the JavaScript tooling files at the root and in each project, such as the ESLint configs. They are checked with `checkJs` and the Node.js types from `@types/node`, so the `// @ts-check` header in each of them is type-checked in the editor. TypeScript 6 no longer loads every package under `node_modules/@types` on its own, so the `types` entry is what brings the Node.js types in; the project tsconfig files keep them out of the browser code. Angular, its CLI and TypeScript share the `angular` catalog in [pnpm-workspace.yaml](pnpm-workspace.yaml), so they move together on upgrades. The CLI is configured to use pnpm for the packages it installs, and its usage analytics are turned off.

## Running the app

```bash
pnpm start
```

The dev server listens on `https://localhost.www.dndmapp.dev:4200`, serving over TLS with a certificate and key read from `.ssl/cert.pem` and `.ssl/key.pem`. Both are ignored by Git, so generate them once with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
```

```bash
mkcert -cert-file .ssl/cert.pem -key-file .ssl/key.pem localhost.www.dndmapp.dev localhost 127.0.0.1 ::1
```

The first command adds the mkcert root certificate to the system trust store, so browsers accept the certificates it issues. The second issues a certificate that covers the `localhost.www.dndmapp.dev` hostname alongside the plain localhost names and addresses. The hostname is not a real DNS record, so point it at the loopback address in your hosts file (`/etc/hosts` on macOS and Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```text
127.0.0.1 localhost.www.dndmapp.dev
::1       localhost.www.dndmapp.dev
```

The dev server accepts requests for `localhost` and the loopback addresses out of the box; `allowedHosts` in [angular.json](angular.json) adds the custom hostname to that list. Until the hosts file is in place, `https://localhost:4200` works as a fallback.

## Building

```bash
pnpm run build
```

The production build lands in `dist/web-app`, with hashed file names, subresource integrity hashes on the emitted scripts and styles, and size budgets that warn at 500 kB and fail at 1 MB for the initial bundle. Run `pnpm run build -c development` for an unoptimized build with source maps.

## Docker image

```bash
docker buildx bake --load
```

[docker-bake.hcl](docker-bake.hcl) describes the `dndmapp/web-app` image, and the command above builds it for your own platform, tags it `dndmapp/web-app:dev` and loads it into the local image store. [Dockerfile](Dockerfile) builds the image in two stages. The first starts from the `node:24.21.0` image, installs pnpm 12.4.1 through [pnpm's standalone installer](https://pnpm.io/installation#using-a-standalone-script), installs the dependencies from the lockfile and runs `pnpm run build`. The installer downloads the pnpm executable from the npm registry and checks it against the published checksum and npm signature before installing it. The second stage copies `dist/web-app/browser` into an [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged) image, which runs nginx as an unprivileged user. [.docker/nginx.conf](.docker/nginx.conf) listens on port 4200, the same port as the dev server, and hands unknown routes to `index.html` for the Angular router. It tells browsers to revalidate `index.html` on every load and to cache the hashed scripts and styles for a year. Both base images are pinned to a digest, with the tag kept in front of it for reference, so a build always starts from the same layers. [.dockerignore](.dockerignore) limits the build context to the files the build stage copies in.

```bash
docker run --rm -p 4200:4200 dndmapp/web-app:dev
```

The app is then served at `http://localhost:4200`.

```bash
TAGS=sha-1a2b3c4,dev PLATFORMS=linux/amd64,linux/arm64 docker buildx bake --push
```

The image name never changes; the variables in the bake file decide the rest, and they are set through the environment. `TAGS` lists the tags one build produces, comma separated, so a development build can come out as `sha-1a2b3c4` and `dev` at once and a release as `latest`, `1.2.3`, `1.2` and `1`. `PLATFORMS` lists the platforms to build for; left unset, the image is built for the builder's own platform. `CACHE_FROM` and `CACHE_TO` each name one [cache backend](https://docs.docker.com/build/cache/backends/) to import the layer cache from and to export it to, such as `type=gha,scope=web-app`. They default to empty, so a local build relies on the builder's own cache, and each holds a single specification rather than a list, since buildx splits a list variable on commas and a cache specification contains commas itself. All four are validated, so a malformed tag, a platform the nginx image cannot run on or a cache specification without a `type` stops the build with a message before it starts. The OCI labels that never change, such as the title, the license and the source repository, are set in the file. The version label defaults to `0.0.0-dev` and the created label to the time of the build. `docker buildx bake --print` shows the resolved configuration without building, and `docker buildx bake --check` runs the same [BuildKit build checks](https://docs.docker.com/reference/build-checks/) as `docker build --check .` over the Dockerfile as the bake file configures it.

In CI, tags and labels come from [docker/metadata-action](https://github.com/docker/metadata-action) rather than from `TAGS`. The action derives them from the Git ref and the repository, writes them to a bake file as a target named `docker-metadata-action`, and [docker/bake-action](https://github.com/docker/bake-action) reads that file after [docker-bake.hcl](docker-bake.hcl). The `web-app` target inherits from a target of that same name in the bake file, which holds the local defaults. Bake merges a target defined in two files attribute by attribute: the later file replaces the tags, merges its labels over the earlier ones and appends its annotations. The action's values therefore win in CI, and a local build never needs the action. The [build-image](.github/actions/build-image/action.yml) composite action wires the two together, and the `Build image` jobs in [pull-request.yml](.github/workflows/pull-request.yml) and [push-main.yml](.github/workflows/push-main.yml) run it with their own tag rules; [Continuous integration](#continuous-integration) describes when they run. Each job checks the repository out and the action sets `source: .`, so bake runs from the checkout instead of cloning the Git context itself. It reads the file the metadata action wrote into the runner's temporary directory by its absolute path. The action sets `DOCKER_METADATA_ANNOTATIONS_LEVELS` to `index,manifest`, so the action annotates the image index as well as each platform manifest, which is where registries read the description of a multi-platform image from. The bake file sets no annotations of its own, since bake would append them next to the action's. [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action) ahead of these steps provides the `docker-container` builder a multi-platform build needs. [docker/setup-qemu-action](https://github.com/docker/setup-qemu-action) is only needed once the serve stage runs something: it consists of `COPY` instructions, so nothing runs under emulation.

Every build attaches a [provenance attestation](https://docs.docker.com/build/metadata/attestations/slsa-provenance/) at `mode=max`, which records the build definition and the source it was built from, and an [SBOM attestation](https://docs.docker.com/build/metadata/attestations/sbom/) listing the packages in the image. Both are stored next to the image as attestation manifests, so once the image is pushed, `docker buildx imagetools inspect dndmapp/web-app:<tag>` lists them alongside the platform manifests. `bake-action` adds a provenance setting of its own only to a target that declares none, so the file's settings stand; setting its `provenance` input to `mode=max` on top adds the workflow run as the `builder-id`. Both base image digests point at multi-architecture indexes, so each target platform resolves its own layers, and the lockfile carries the native modules for both architectures. The build stage is declared with `--platform=$BUILDPLATFORM`: the compiled output is static files, so it runs once on the builder's own platform and every target's nginx stage copies from that single result, instead of repeating the compile under emulation. Attestations and multi-platform images both need a `docker-container` builder or Docker Desktop with the containerd image store; the classic image store cannot hold either.

## Testing

```bash
pnpm run test
```

[Vitest](https://vitest.dev) runs the `*.spec.ts` files in a headless Chromium driven by [Playwright](https://playwright.dev), through Angular's `unit-test` builder configured in [angular.json](angular.json) and [vitest.config.ts](projects/web-app/vitest.config.ts). The default configuration watches for changes and serves the Vitest UI at `http://localhost:51204/__vitest__/`. Components are tested through [Angular CDK component harnesses](https://material.angular.dev/cdk/testing/overview), which live in a `testing/` folder next to the code they exercise. Coverage is collected on every run and reported to `coverage/web-app`; the run fails below 80% on statements, branches, functions and lines. Run `pnpm run test-ci` for a single, non-interactive run with GitHub Actions annotations, and `pnpm run playwright-install` once to download the Chromium build Playwright drives.

## End-to-end testing

```bash
pnpm run e2e
```

[Playwright Test](https://playwright.dev) runs the `*.spec.ts` files under [projects/web-app/e2e](projects/web-app/e2e) in the same Chromium build the unit tests use, configured in [playwright.config.ts](projects/web-app/playwright.config.ts). The tests drive the dev server at `https://localhost:4200`: when nothing listens on that port the run starts `pnpm start` itself and stops it afterwards, and a server that is already running is reused. Either way the TLS certificates described under "Running the app" have to exist; the hosts entry is not needed, since the tests use the `localhost` fallback and ignore certificate errors. Output lands in `.playwright/`: an HTML report under `report`, which `pnpm exec playwright show-report .playwright/report` opens, and a trace for every failed test under `test-results`. Run `pnpm run e2e-ui` for Playwright's UI mode, which watches the files, runs tests on demand and shows a trace of each step.

## Formatting

```bash
pnpm run format
```

Prettier formats the file types allowed in [.prettierignore](.prettierignore), with [prettier-plugin-organize-imports](https://github.com/simonhaenisch/prettier-plugin-organize-imports) sorting imports and dropping unused ones as part of the same pass. Prettier reads [.editorconfig](.editorconfig) for indentation, line width and line endings, so [.prettierrc.json](.prettierrc.json) only carries what EditorConfig cannot express. Run `pnpm run format-check` to report violations without rewriting anything.

## Linting Markdown

```bash
pnpm run lint-md
```

[markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) checks every Markdown file that Git tracks against the rules in [.markdownlint-cli2.yaml](.markdownlint-cli2.yaml). The config turns off the line length rule, because paragraphs are written as one line, and pins the heading, list and table styles used throughout the repository. Run `pnpm run lint-md --fix` to apply every fix the rules can make on their own; the rest it reports for you to resolve by hand. The [vscode-markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) extension reads the same config and flags violations while you type.

## Linting styles

```bash
pnpm run lint-styles
```

[Stylelint](https://stylelint.io) checks every SCSS file under `projects/` against [.stylelintrc.json](.stylelintrc.json), which extends [stylelint-config-standard-scss](https://github.com/stylelint-scss/stylelint-config-standard-scss) and the error variant of [stylelint-config-clean-order](https://github.com/kutsan/stylelint-config-clean-order). The first parses the files as SCSS and brings Stylelint's standard rules plus the SCSS-specific ones: kebab-case selectors, variables and mixins, no duplicate or unknown properties, no invalid hex colors, and so on. The second enforces ordering: `@use` and Sass variables come before custom properties and mixin calls, declarations come before nested rules and media queries, and properties are grouped by concern (positioning, layout, box model, typography, and so on), with an empty line between groups once a block holds more than five declarations. Run `pnpm run lint-styles --fix` to reorder in place. The [vscode-stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint) extension reads the same config and flags violations while you type.

## Linting TypeScript and JavaScript

```bash
pnpm run lint-ts
```

```bash
pnpm run lint-js
```

[ESLint](https://eslint.org) checks the TypeScript files and component templates under `projects/` through the `lint` target that [angular-eslint](https://github.com/angular-eslint/angular-eslint)'s builder provides in [angular.json](angular.json), and the JavaScript files in the workspace through `lint-js`, which runs ESLint over `**/*.{js,mjs,cjs}` directly. ESLint picks the config for a file by walking up from the file's directory, so two configs share the work. [eslint.config.js](eslint.config.js) at the root holds the global rules. TypeScript files, including the `.mts` and `.cts` variants, get ESLint's recommended rules and the type-checked `recommended` and `stylistic` sets from [typescript-eslint](https://typescript-eslint.io). JavaScript files (`.js`, `.mjs` and `.cjs`) get ESLint's recommended rules without type information, plus the Node.js globals from [globals](https://github.com/sindresorhus/globals). They are tooling config such as `eslint.config.js` itself, which runs in Node.js; [tsconfig.tooling.json](tsconfig.tooling.json) type-checks them in the editor, while the lint stays untyped because the type-aware rules target TypeScript source. [projects/web-app/eslint.config.js](projects/web-app/eslint.config.js) spreads the root config and adds the Angular rules. Its TypeScript block extends angular-eslint's recommended rules and pins component selectors to `app-` element selectors in kebab-case and directive selectors to `app` attribute selectors in camelCase, matching `prefix` in angular.json. Templates, whether in an `.html` file or inline in a component, get angular-eslint's recommended template rules plus its accessibility rules. This is the layout `ng generate application` and `ng generate library` produce, since the `angular-eslint` collection is listed first under `schematicCollections` in angular.json; the other generators fall through to the Angular defaults. The type-checked rules read types through the TypeScript project service, so a file has to be included by one of the tsconfig files: [tsconfig.app.json](projects/web-app/tsconfig.app.json) covers the application code and [tsconfig.spec.json](projects/web-app/tsconfig.spec.json) covers the specs and the `testing/` folders. Their `include` patterns only match `.ts`, so an `.mts` or `.cts` file goes under `files`, the way [vitest.config.ts](projects/web-app/vitest.config.ts) does. The lint target's patterns match `.ts` and `.html` as well, like the angular-eslint schematic generates them, so such a file also needs a pattern there; the hook lints it either way, and a file no tsconfig includes fails with a parsing error instead of being skipped. The lint target stays scoped to `projects/web-app`, so a second project brings its own, while `lint-js` spans the whole workspace, since tooling files sit at the root and in the projects; ESLint's ignore list keeps build output and caches out. Run `pnpm run lint-ts --fix` or `pnpm run lint-js --fix` to apply every fix the rules can make on their own. The [vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension reads the same config and flags violations while you type.

## Linting commit messages

```bash
pnpm exec commitlint --from origin/main
```

[commitlint](https://commitlint.js.org) checks commit messages against the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, configured in [.commitlintrc.yaml](.commitlintrc.yaml). The config extends [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional), the rule set that mirrors the specification. A message opens with a lower-case type, then an optional scope in parentheses, then an optional `!` marking a breaking change, then a colon, a space and a subject. The allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style` and `test`. That whole first line stays within 100 characters, and the subject neither starts with a capital nor ends in a period. A blank line separates it from the body, and `BREAKING CHANGE:` in a footer spells out an incompatible change.

The config tightens two rules. config-conventional allows 100 columns in the body and the footer; this repository hard wraps both at 72, the width that keeps a message inside an 80 column terminal once `git log` has indented it by four. The subject keeps the 100-character limit, because it is one line and wrapping it is not an option. Messages Git writes itself, for merges, reverts, fixups and squashes, commitlint skips out of the box.

The command above lints every commit on the current branch that `origin/main` does not have, which is the set a pull request carries. Run `pnpm exec commitlint --last --verbose` to lint the commit that was written last. [Commit hooks](#commit-hooks) covers the hook that checks a message before the commit exists.

## Commit hooks

```bash
pnpm exec lefthook run pre-commit
```

[lefthook](https://lefthook.dev) installs the hooks defined in [lefthook.yml](lefthook.yml) as part of `pnpm install`, through its `postinstall` script; that is why `lefthook` is the one package allowed to run build scripts in [pnpm-workspace.yaml](pnpm-workspace.yaml). The `pre-commit` hook runs Prettier over the staged files and stages what it rewrote, then runs ESLint, Stylelint and markdownlint-cli2 in parallel, each over the staged files of the types it covers. A finding from any of them stops the commit. It skips itself during merges and rebases, and the `postinstall` script does nothing when `CI` is set, so neither GitHub Actions nor the Docker build installs hooks. The command above runs the hook over whatever is staged without committing.

```bash
pnpm exec lefthook run commit-msg .git/COMMIT_EDITMSG
```

The `commit-msg` hook runs next, once the message has been written. It hands the file Git passes it to commitlint, so a message that does not follow [Conventional Commits](#linting-commit-messages) stops the commit. The message is not lost: `git commit` leaves it in `.git/COMMIT_EDITMSG`, and `git commit -e -F .git/COMMIT_EDITMSG` reopens it for another try. The command above replays the hook over that same file.

Neither hook is the gate, because `git commit --no-verify` bypasses both. [Continuous integration](#continuous-integration) runs the file checks over the whole repository regardless.

## Continuous integration

GitHub Actions runs the checks on every pull request through [pull-request.yml](.github/workflows/pull-request.yml), and a pull request merges once that `CI` check has passed on its head commit; there is no merge queue. Two more workflows are described below: [pull-request-closed.yml](.github/workflows/pull-request-closed.yml) cleans up after a pull request closes, and [push-main.yml](.github/workflows/push-main.yml) publishes the development image once one merges. The `CI` job hands its setup to the [setup-workspace](.github/actions/setup-workspace/action.yml) composite action, which installs Node.js, pnpm and the dependencies in one step with [pnpm/setup](https://github.com/pnpm/setup). That action reads `devEngines` from [package.json](package.json), so CI uses the versions listed under [Prerequisites](#prerequisites), and it installs from the lockfile with `--frozen-lockfile`.

The checks themselves live in the [run-checks](.github/actions/run-checks/action.yml) composite action, one step per check: `pnpm run format-check`, `pnpm run lint-md`, `pnpm run lint-styles`, `pnpm run lint-ts`, `pnpm run lint-js`, `pnpm run build`, `docker build --check .` and `pnpm run test-ci`. A `pnpm run playwright-install` step ahead of the tests downloads the Chromium build they run in. The Docker step evaluates the [Dockerfile](Dockerfile) against [BuildKit's build checks](https://docs.docker.com/reference/build-checks/), which resolve the base images and lint every instruction without building the image. The `check=error=true` directive at the top of the Dockerfile makes a regular `docker build` fail on the same findings, so a local build catches them as well. The browser install sits there rather than in the setup, so a workflow that only needs the workspace set up does not pay for a browser it never starts. Adding a check means adding a step there, so every pull request runs the same set.

Commit messages are the exception. A `Lint commit messages` step sits in [pull-request.yml](.github/workflows/pull-request.yml) itself, between the setup and the checks, and runs commitlint over `base..head`, which holds the commits the pull request adds and nothing else. It stays out of [run-checks](.github/actions/run-checks/action.yml) because it needs something the other checks do not: a commit range, and the two ends of that range live in the `pull_request` payload rather than in the checkout. The checkout in that workflow therefore sets `fetch-depth: 0`, since the default shallow fetch leaves out the commits commitlint has to read. Since the step sits inside the existing job, the pull request reports a single `CI` check.

[pull-request.yml](.github/workflows/pull-request.yml) carries two more jobs, which publish a preview image of the pull request. `Detect image changes` runs the [detect-changes](.github/actions/detect-changes/action.yml) composite action, which hands the files the pull request changes to [dorny/paths-filter](https://github.com/dorny/paths-filter). The patterns mirror [.dockerignore](.dockerignore) plus the files that decide whether and how the image is built: the [Dockerfile](Dockerfile), [docker-bake.hcl](docker-bake.hcl), the two workflows that build it and the two actions they run. The action reports one output per filter, `image` being the only one so far, so other workflows can share it for their own change detection. On a pull request the filter reads the changed files through the GitHub API; the job checks the repository out only so the local action is on disk, and it runs alongside `CI`. `Build image` waits for it and runs when it reports a match and the pull request comes from a branch of this repository; a fork cannot read the registry credentials. The job checks the repository out and hands the [build-image](.github/actions/build-image/action.yml) composite action the tag rule `type=ref,event=pr` and the credentials, which a composite action cannot read on its own. The `DOCKERHUB_USERNAME` variable holds `dndmapp` and is no secret, since it is also the image's namespace. The `DOCKERHUB_TOKEN` organization secret holds the Docker Hub access token named `github dnd-mapp organization workflows` on the `dndmapp` account, with read and write access. The secret is shared with the repositories that push images, and replacing the token on expiry is one edit in the organization settings. The action then builds the image for `linux/amd64` and `linux/arm64` and pushes it as `dndmapp/web-app:pr-<N>`, with `N` the pull request number, through the steps described under [Docker image](#docker-image). The action also points `CACHE_FROM` and `CACHE_TO` at the [GitHub Actions cache](https://docs.docker.com/build/cache/backends/gha/) under the `web-app` scope, with `mode=max` so every stage's layers are exported, not only the final image's. GitHub hands a run the cache entries of its own branch and of `main`, so a pull request build reuses the layers `main` and its own earlier runs exported. The build stage with its installed dependencies is a hit until the Dockerfile or the lockfile changes. The cache holds layers only: the pnpm store behind the cache mount in the Dockerfile is not exported, so a lockfile change downloads the dependencies again. Buildx reaches the cache service through the runtime token the runner gives every JavaScript action, which bake-action passes on, so the job needs no permission beyond `contents: read`. `ignore-error=true` keeps a failed cache upload from failing a build whose image is already pushed. GitHub evicts entries that have not been read for a week, and the oldest ones once the repository's caches pass 10 GB. A pull request that leaves the image inputs alone skips the build.

[pull-request-closed.yml](.github/workflows/pull-request-closed.yml) removes that image once the pull request closes, whether it was merged or not. Its `Detect image changes` job runs the same composite action, so the two workflows can never disagree about which pull requests get an image, and checks out the pull request's head commit rather than the merge commit, which GitHub no longer provides for a closed pull request that conflicts with its base. `Delete image` waits for it, runs under the same two conditions as `Build image`, and calls the Docker Hub API with `curl`: it trades the username variable and the `DOCKERHUB_ADMIN_TOKEN` organization secret for a short-lived token at `/v2/auth/token`, then sends `DELETE /v2/repositories/dndmapp/web-app/tags/pr-<N>/`, the endpoint [docker/hub-tool](https://github.com/docker/hub-tool) uses, since Docker Hub documents no tag deletion. A 404 counts as done, because it means the build never pushed the tag or an earlier run already removed it. The job shares its concurrency group with `Build image`, so closing a pull request while its image is still building cancels the build first, and reopening it queues the new build behind the removal. `DOCKERHUB_ADMIN_TOKEN` holds a second access token on the `dndmapp` account, named `github dnd-mapp organization workflows (admin)`, with read, write and delete access. It is a separate token because Docker Hub has no delete-only scope and no per-repository scope for a personal access token: a token that can delete one tag can delete every tag in the account, so it is kept out of the build job, which runs the Dockerfile and every dependency, and given only to this job, which runs nothing but `curl` and `jq`. The secret is shared with the repositories that remove tags.

[push-main.yml](.github/workflows/push-main.yml) publishes the development image once a pull request merges, through the same two jobs. Its `Detect image changes` job runs the same [detect-changes](.github/actions/detect-changes/action.yml) action, so `main` gets a new image for exactly the merges whose pull request got a preview. On a push there is no pull request to ask the API about, so [dorny/paths-filter](https://github.com/dorny/paths-filter) diffs the pushed commit against the one before the push through git, fetching the history it needs itself. `Build image` waits for it, runs when it reports a match, and calls the [build-image](.github/actions/build-image/action.yml) action with the tag rules `type=raw,value=dev` and `type=sha`. The image lands as `dndmapp/web-app:dev` and `dndmapp/web-app:sha-<short>`, with the short commit being the first seven characters of the merge commit. Its build uses the same `web-app` cache scope. A push to `main` reads only the entries earlier `main` builds exported, since GitHub does not hand it a pull request's, and what it exports is what every pull request build starts from. Neither rule adds `latest`, which the metadata action reserves for release tags. The jobs never cancel each other and run one at a time in push order, so `dev` always points at the newest commit that changed the image and every such commit keeps its `sha-<short>` tag.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
