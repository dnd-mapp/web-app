# Continuous integration

GitHub Actions runs the checks on every pull request, publishes the `dndmapp/web-app` image from `main` and from release tags, and has the two environments pull it; see [Environments](#environments). The workflows live in [.github/workflows](../.github/workflows):

| Workflow                                                                | Trigger                                                               | Purpose                                                                                                                         |
|:------------------------------------------------------------------------|:----------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------|
| [pull-request.yml](../.github/workflows/pull-request.yml)               | `pull_request` against `main`                                         | Runs the checks, publishes a preview image and runs the end-to-end tests against it.                                            |
| [pull-request-opened.yml](../.github/workflows/pull-request-opened.yml) | `pull_request` limited to `opened`, `reopened` and `ready_for_review` | Turns auto-merge on.                                                                                                            |
| [pull-request-closed.yml](../.github/workflows/pull-request-closed.yml) | `pull_request` limited to `closed`                                    | Deletes the preview image.                                                                                                      |
| [push-main.yml](../.github/workflows/push-main.yml)                     | `push` to `main`                                                      | Runs the checks against the merged result, publishes the development image, updates the dev environment and updates Docker Hub. |
| [release.yml](../.github/workflows/release.yml)                         | `push` of a tag matching `v<major>.<minor>.<patch>`                   | Verifies and publishes a release and updates the production environment, see [Releasing](releasing.md#the-release-workflow).    |

There is no merge queue: a pull request merges once its `CI` check has passed on the head commit and a code owner has approved that commit, see [Reviews and merging](#reviews-and-merging).

## Conventions

Every workflow follows five conventions:

- **Pinned actions.** Use an action's latest release, referenced by the commit SHA that release points at, with the tag in a trailing comment: `uses: owner/action@<sha> # v1.2.3`. [Renovate](dependencies.md#automated-updates) updates the SHA and the comment together, and pins an action added by tag.
- **Pinned runners.** Name a specific runner image such as `ubuntu-24.04` rather than `ubuntu-latest`.
- **Named steps.** Every workflow, job and step carries a `name`.
- **Explicit shells.** Every step that uses `run` declares a `shell`, which composite actions require anyway and which gives workflow steps `pipefail` on top of the default `-e`.
- **Job settings.** Every job declares `timeout-minutes`, a `permissions` block narrowing the workflow-level `permissions: {}`, and a `concurrency` group. Pull request runs cancel in progress; pushes to `main` and release runs do not, because a canceled build would leave a commit without its image.

Steps shared between the workflows belong in a composite action under [.github/actions](../.github/actions), referenced as `./.github/actions/<name>`. Checking out the repository is the exception: a local action only resolves once a checkout has put it on disk, so that step stays in each workflow, even in a job whose only other step would not need one. A composite action cannot read secrets or variables of its own, which is why credentials travel as inputs.

A check that only one event can run goes into that event's workflow as a step in the existing job, not into a shared action and not into a job of its own. Commit message linting is the only one so far: it needs a commit range, and `pull_request` is the only payload carrying both ends of one. Keeping it inside the job means the pull request reports a single `CI` check, so the required checks do not have to know about it.

## Composite actions

### setup-workspace

[setup-workspace](../.github/actions/setup-workspace/action.yml) installs Node.js, pnpm and the dependencies in one step with [pnpm/setup](https://github.com/pnpm/setup). It reads `devEngines` from [package.json](../package.json), so CI uses the versions listed under [Prerequisites](getting-started.md#prerequisites), and it installs from the lockfile with `--frozen-lockfile`.

### run-checks

[run-checks](../.github/actions/run-checks/action.yml) holds the checks, one step per check: `pnpm run format-check`, `pnpm run lint-md`, `pnpm run lint-styles`, `pnpm run lint-ts`, `pnpm run lint-js`, `pnpm run build`, `docker build --check .` and `pnpm run test-ci`. A `pnpm run playwright-install` step ahead of the tests downloads the Chromium build they run in. It sits here rather than in the setup, so a workflow that only needs the workspace set up does not pay for a browser it never starts. The Docker step evaluates the Dockerfile against [BuildKit's build checks](https://docs.docker.com/reference/build-checks/), which resolve the base images and lint every instruction without building the image. Adding a check means adding a step here, so every pull request and every push to `main` runs the same set.

### detect-changes

[detect-changes](../.github/actions/detect-changes/action.yml) wraps [dorny/paths-filter](https://github.com/dorny/paths-filter) and reports one output per filter, so every workflow answers "what does this change touch" from the same place. Another workflow that needs to know what a change touches adds a filter and an output here rather than a filter of its own. Two filters exist so far:

- **`image`** mirrors [.dockerignore](../.dockerignore) plus the files that decide whether and how the image is built: the Dockerfile, the bake file, the three workflows that build it and the two actions they run. A change to `.dockerignore` therefore lands in this filter as well. The filter names `.docker/nginx.conf` rather than the folder, since `.docker` also holds the compose stack the image is not built from.
- **`hub`** covers the [Docker Hub texts](docker.md#docker-hub-page) under `.docker/hub`, plus this action and `push-main.yml`, which uploads them.

On a `pull_request` event the action lists the changed files through the GitHub API, whatever the activity type, so the job checks the repository out only to put the local action on disk. On a `push` event it diffs the pushed commit against the one before the push through git, fetching the history it needs itself, so a merge into `main` is judged by the same rules as its pull request. A push with no previous commit counts every file as changed.

### build-image

[build-image](../.github/actions/build-image/action.yml) takes the Docker Hub username and token and the tag rules `docker/metadata-action` should apply. It sets up Buildx with [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action), which provides the `docker-container` builder a multi-platform build needs, logs in to Docker Hub, derives the tags and labels with [docker/metadata-action](https://github.com/docker/metadata-action) and builds `linux/amd64` and `linux/arm64` with [docker/bake-action](https://github.com/docker/bake-action). [Metadata in CI](docker.md#metadata-in-ci) explains how the two actions and the bake file fit together. [docker/setup-qemu-action](https://github.com/docker/setup-qemu-action) is not needed: the serve stage consists of `COPY` instructions, so nothing runs under emulation.

Each job that runs the action checks the repository out, and the action sets `source: .`, so bake runs from the checkout instead of cloning the Git context itself. It reads the file the metadata action wrote into the runner's temporary directory by its absolute path. `DOCKER_METADATA_ANNOTATIONS_LEVELS` is set to `index,manifest`, so the image index is annotated as well as each platform manifest, which is where registries read the description of a multi-platform image from.

The action also points `CACHE_FROM` and `CACHE_TO` at the [GitHub Actions cache](https://docs.docker.com/build/cache/backends/gha/) under the `web-app` scope. `mode=max` exports every stage's layers, not only the final image's, so the build stage with its installed dependencies is a hit until the Dockerfile or the lockfile changes. GitHub hands a run the cache entries of its own branch and of `main`, so a pull request build reuses what `main` and its own earlier runs exported, and a `main` build reuses only its own. The cache holds layers only: the pnpm store behind the cache mount in the Dockerfile is not exported, so a lockfile change installs from the registry again. Buildx reaches the cache service through the runtime token the runner gives every JavaScript action, which bake-action passes on, so the job needs no permission beyond `contents: read`. `ignore-error=true` keeps a failed cache upload from failing a build whose image is already pushed. GitHub evicts entries that have not been read for a week, and the oldest ones once the repository's caches pass 10 GB.

### run-e2e

[run-e2e](../.github/actions/run-e2e/action.yml) takes the image tag to serve and the Docker Hub username and read-only token. It logs in to Docker Hub, since GitHub's runners share the addresses Docker Hub counts anonymous pulls against, installs the Playwright browsers, starts the [compose stack](testing.md#compose-stack) with `docker compose up --wait` and the tag in `WEB_APP_TAG`, and runs `pnpm run e2e`. `CI` is set on every run, so the Playwright config starts no dev server. Nothing stops the stack, since the runner is discarded with the job. When a step fails, the action prints the logs of both containers and uploads `.playwright/`, with the HTML report and the traces of the failed tests, as the `playwright-report` artifact, kept for seven days.

### deploy

[deploy](../.github/actions/deploy/action.yml) takes the tag an environment runs, the URL and token of the watchtower HTTP API, and the client ID and secret of a Tailscale OAuth client. It joins the tailnet with [tailscale/github-action](https://github.com/tailscale/github-action) and then sends `POST /v1/update?image=dndmapp/web-app:<tag>` to watchtower with `curl`, the token as the bearer token. Watchtower pulls the newest image behind the tag and recreates the container running it; see [Environments](#environments) for how the two fit together.

The runner joins as an ephemeral node tagged `tag:github-actions`, which the tailnet policy uses to decide what it may reach, and the action logs it out when the job ends. A new node takes a moment to become known across the tailnet, and until it is, the watchtower host refuses its connections. The action therefore pings the host and waits for an answer before the request goes out. A first step cuts the host out of the URL, since the ping takes a machine name or an address. The image filter names both the image and the tag, so watchtower touches the one container running that tag and leaves the other environment alone. A filtered update waits for a running one to finish rather than being refused.

The response arrives once the update is done, with a summary of what happened. The step reads the status code from the response rather than through `--fail`, so a refusal ends up in the log with its body. It fails on any status but 200, when no watched container runs the tag, and when watchtower reports a failed update. A container watchtower scanned but did not update already ran the newest image, which is what a rerun of the job sees, so that is a warning. Watchtower gives an update ten minutes by default and answers 408 after. `curl` waits a little longer than that and the calling job's timeout longer still, which keeps the reason for a failure in the log.

## Secrets and variables

The workflows read these from the `dnd-mapp` organization:

| Name                        | Kind     | Holds                                                                                                                                     |
|:----------------------------|:---------|:------------------------------------------------------------------------------------------------------------------------------------------|
| `DOCKERHUB_USERNAME`        | variable | `dndmapp`, the Docker Hub account that owns the image. It is no secret, since it is also the image's namespace.                           |
| `DOCKERHUB_TOKEN`           | secret   | The access token `github dnd-mapp organization workflows` on that account, with read and write access.                                    |
| `DOCKERHUB_READ_TOKEN`      | secret   | The access token `github dnd-mapp organization workflows (read-only)`, with read access.                                                  |
| `DOCKERHUB_ADMIN_TOKEN`     | secret   | The access token `github dnd-mapp organization workflows (admin)`, with read, write and delete access.                                    |
| `GH_APP_CLIENT_ID`          | variable | The client ID of the `dnd-mapp` GitHub App.                                                                                               |
| `GH_APP_PRIVATE_KEY`        | secret   | The private key of the `dnd-mapp` GitHub App.                                                                                             |
| `TAILSCALE_OAUTH_CLIENT_ID` | variable | The client ID of the Tailscale OAuth client the runners join the tailnet with. It names the client and grants nothing without the secret. |
| `TAILSCALE_OAUTH_SECRET`    | secret   | The secret of that OAuth client.                                                                                                          |
| `WATCHTOWER_URL`            | variable | The URL the watchtower HTTP API answers on inside the tailnet, `https://watchtower-dma.<tailnet>.ts.net`. It resolves nowhere else.       |
| `WATCHTOWER_TOKEN`          | secret   | The token watchtower expects as the bearer token, the value of its `WATCHTOWER_HTTP_API_TOKEN`.                                           |

The three Docker Hub tokens exist because a personal access token has no delete-only scope and no per-repository scope: a token that can delete one tag can delete every tag in the account. A build runs the Dockerfile and every dependency, so it gets `DOCKERHUB_TOKEN`, which can push and nothing more. The end-to-end tests pull and never push, and they run the tests and every dependency, so they get `DOCKERHUB_READ_TOKEN`. `DOCKERHUB_ADMIN_TOKEN` stays in the jobs that run no project code: deleting a tag and editing the Docker Hub page. The secrets are shared with the repositories that push and remove images, and replacing a token on expiry is one edit in the organization settings.

The Tailscale and watchtower entries belong to the [deploy](#deploy) action, which also runs no project code. [Environments](#environments) describes what they have to match on the other side.

## Pull requests

[pull-request.yml](../.github/workflows/pull-request.yml) runs four jobs.

### CI

`CI` checks the repository out with `fetch-depth: 0`, runs [setup-workspace](#setup-workspace), lints the commit messages and runs [run-checks](#run-checks). The `Lint commit messages` step runs commitlint over `base..head`, which holds the commits the pull request adds and nothing else. The two ends of that range live in the `pull_request` payload, and the full fetch is what puts the commits on disk for commitlint to read. [Commit messages](commits.md#commit-messages) describes the rules it applies.

### Detect changes

`Detect changes` runs alongside `CI`. It checks the repository out and runs [detect-changes](#detect-changes), whose `image` output decides whether the pull request gets a preview image.

### Build image

`Build image` needs `Detect changes` and runs when the filter reports a match and the head branch belongs to this repository; a fork cannot read the registry credentials, and its Dockerfile is not ours to publish. It hands [build-image](#build-image) the username variable, `DOCKERHUB_TOKEN` and the tag rule `type=ref,event=pr`, so the image lands as `dndmapp/web-app:pr-<N>`, with `N` the pull request number. A pull request that leaves the image inputs alone skips the build.

### End-to-end tests

`End-to-end tests` needs `Detect changes` and `Build image`. It checks the repository out, runs [setup-workspace](#setup-workspace) and hands [run-e2e](#run-e2e) the tag to serve, the username variable and `DOCKERHUB_READ_TOKEN`. The tag is `pr-<N>` when `Build image` succeeded and `dev` when the filter reported no image change, since the pull request's app is then the one `main` already serves. Any other outcome skips the job: a failed build, a failed filter, or a fork. `needs` alone would skip the job whenever `Build image` is skipped, so the condition starts with `!cancelled()`, which gets it evaluated regardless. The `Default branch` ruleset requires the check beside `CI` and `Build image`, and a skipped job passes a required check, so a pull request that skips it still merges.

## Auto-merge

[pull-request-opened.yml](../.github/workflows/pull-request-opened.yml) turns auto-merge on for every pull request, so GitHub merges it itself once the `Default branch` ruleset is satisfied: one approving review from a code owner on the last push and a passing `CI` check. Its single `Enable auto-merge` job runs `gh pr merge --auto --merge` against the pull request URL, so it needs no checkout, and `--merge` matches the one merge method the ruleset allows. The job runs on `reopened` as well, because closing a pull request turns auto-merge off, and on `ready_for_review`, because it skips drafts: GitHub does not enable auto-merge on one. It also skips pull requests from forks, which cannot read the app credentials. `gh` merges on the spot when nothing is left to wait for, so a reopened pull request that still has an approval and a green check does not stall. Pushing to the head branch dismisses the existing approval, so auto-merge waits for a fresh one; enabling it is a one-time step per pull request that the pushes do not undo.

The job authenticates as the `dnd-mapp` GitHub App rather than through the workflow token. [actions/create-github-app-token](https://github.com/actions/create-github-app-token) mints an installation token for the run from `GH_APP_CLIENT_ID` and `GH_APP_PRIVATE_KEY`, scoped to this repository and narrowed to `contents: write` and `pull-requests: write`, and revokes it when the job ends. GitHub performs the merge on behalf of whoever enabled auto-merge, and a merge on behalf of the workflow token starts no other workflow runs, so [push-main.yml](#pushes-to-main) would never build the development image. A merge on behalf of the app does, and it records `dnd-mapp[bot]` as the merger.

## Cleaning up

[pull-request-closed.yml](../.github/workflows/pull-request-closed.yml) removes the preview image once the pull request closes, merged or not, through two jobs. Its `Detect changes` job runs the same [detect-changes](#detect-changes) action, so the two workflows can never disagree about which pull requests get an image. It checks out the pull request's head commit rather than the merge commit, which GitHub no longer provides for a closed pull request that conflicts with its base. The head commit stays reachable and holds the filter that decided the build.

`Delete image` needs that job, runs under the same two conditions as `Build image`, and calls the Docker Hub API with `curl`. It trades the username variable and `DOCKERHUB_ADMIN_TOKEN` for a short-lived token at `/v2/auth/token`, then sends `DELETE /v2/repositories/dndmapp/web-app/tags/pr-<N>/`, the endpoint [docker/hub-tool](https://github.com/docker/hub-tool) uses, since Docker Hub documents no tag deletion. A 404 counts as done, because it means the build never pushed the tag or an earlier run already removed it. The job shares the `pull-request-build-image-<N>` concurrency group with `Build image`, so closing a pull request mid-build cancels the build before the tag is removed, and a build that starts on reopening waits for the removal to finish.

## Pushes to main

[push-main.yml](../.github/workflows/push-main.yml) runs once a pull request merges, through six jobs.

`CI` checks the merge commit out, runs [setup-workspace](#setup-workspace) and then [run-checks](#run-checks), so `main` gets the same checks the pull request got, this time against the merged result. There is no merge queue, so `main` may have moved on between the pull request's last `CI` run and its merge. Commit messages are not linted again, since a `push` event carries no commit range and the pull request already checked them.

`Detect changes` runs the same [detect-changes](#detect-changes) action, so `main` gets a new image for exactly the merges whose pull request got a preview, and exposes the `hub` output beside `image`.

`Build image` needs that job and `CI`, runs when the filter reports a match, and calls [build-image](#build-image) with `type=raw,value=dev` and `type=sha`. The image lands as `dndmapp/web-app:dev` and `dndmapp/web-app:sha-<short>`, with the short commit being the first seven characters of the merge commit. Neither rule makes `docker/metadata-action` add `latest`, which it reserves for release tags. The job's condition reads only the filter output, so a failed or canceled `CI` job skips the build, and a commit that fails `CI` never becomes the `dev` image. There is no fork check, since only this repository pushes to its `main` branch.

`End-to-end tests` needs `Detect changes` and `Build image` and runs under the same condition as in the pull request workflow minus the fork check. It serves `sha-<short>` when `Build image` succeeded and `dev` otherwise; a `Pick the image tag` step cuts the seven characters `type=sha` uses, since the expression syntax has no substring. The job does not need `CI`: the tests need the image, not the lints, so a merge that only fails a lint still gets its end-to-end result.

`Deploy to dev` needs `Build image` alone. It checks the repository out and hands [deploy](#deploy) the tag `dev`, so the dev environment serves the merge as soon as its image is on Docker Hub; see [Environments](#environments). It does not wait for the end-to-end tests: the environment exists to show the newest `main`, and the tests run against the same image on the runner in the meantime. A failing test therefore shows up beside a dev environment that already serves the commit. A skipped build skips the deployment with it, since `dev` then still points at the image the environment already runs.

`Update Docker Hub description` needs `Detect changes` alone and runs when the `hub` filter reports a match. It checks the repository out and runs [peter-evans/dockerhub-description](https://github.com/peter-evans/dockerhub-description), which uploads `overview.md` as the overview and the `short-description` input as the one-line description of `dndmapp/web-app`. A `Read the short description` step reads `short-description.txt` into that input first and fails with an annotation on the file when it exceeds the 100 characters Docker Hub allows; the action would only trim it with a warning. URL completion stays off, since the links in the overview are already absolute. The token is `DOCKERHUB_ADMIN_TOKEN`, since editing a repository's settings takes the delete scope, and like the delete job this one runs no project code. It needs neither `CI` nor `Build image`, since the texts describe the image rather than being part of it.

All six jobs use a fixed concurrency group without canceling, so builds and deployments run one at a time in push order. `dev` always ends up on the newest commit that changed the image, and every such commit gets its `sha-<short>` tag. A push to `main` reads only the cache entries earlier `main` builds exported, and what it exports is what every pull request build starts from.

## Environments

Two environments serve the image, both on one Docker host that runs a [watchtower](https://watchtower.nickfedor.com) container in HTTP API mode beside them:

| Environment | URL                             | Runs                     | Updated by                                                                 |
|:------------|:--------------------------------|:-------------------------|:---------------------------------------------------------------------------|
| production  | <https://www.dndmapp.nl.eu.org> | `dndmapp/web-app:latest` | `Deploy to production` in [release.yml](releasing.md#the-release-workflow) |
| dev         | <https://dev.dndmapp.nl.eu.org> | `dndmapp/web-app:dev`    | `Deploy to dev` in [push-main.yml](#pushes-to-main)                        |

Watchtower watches both containers, but polls nothing: with the HTTP API on, it updates when asked to. Each deployment job asks it through the [deploy](#deploy) action, right after the workflow has pushed the tag the environment runs. A merge to `main` therefore shows up on dev and a release on production within minutes, and nothing else moves either environment. Watchtower recreates the container with the same settings it had, so the compose file or run command on the host stays the source of truth for how each one is run.

The host is not on the public internet; the runners reach it over Tailscale. The pieces on the other side, none of which live in this repository:

- **Watchtower** runs with `WATCHTOWER_HTTP_API_ENDPOINTS=update` and a `WATCHTOWER_HTTP_API_TOKEN`, which is `WATCHTOWER_TOKEN` in the table above, and answers over HTTPS at the MagicDNS name of a tailnet node, which is `WATCHTOWER_URL`.
- **The tailnet policy** owns `tag:github-actions` and lets `tag:github-actions` reach the watchtower node on port 443, and nothing else.
- **The Tailscale OAuth client** behind `TAILSCALE_OAUTH_CLIENT_ID` and `TAILSCALE_OAUTH_SECRET` has the writable `auth_keys` scope and carries `tag:github-actions`, since the action tags the runner with it and an OAuth client may only hand out tags it carries.

## Reviews and merging

[.github/CODEOWNERS](../.github/CODEOWNERS) makes the `reviewers` team of the organization the owner of every path. The team holds the human maintainers and the `dnd-mapp-bot` account, so GitHub requests a review from it on every pull request and a review by the bot counts as a code owner review. A path that needs a different owner gets its own line below the `*` rule, since the last matching line wins.

The `Default branch` ruleset allows merge commits only, and requires one approving review from a code owner on the last push plus passing `CI`, `Build image` and `End-to-end tests` checks; a skipped job passes a required check. [Auto-merge](#auto-merge) then merges the pull request without anyone pressing the button. Nobody is on the bypass list, so `main` can neither be deleted nor force pushed, by anyone.

The same ruleset requires signed commits. Every commit a pull request brings to `main` needs a signature GitHub shows as verified, so a contributor sets up commit signing before their first pull request; see [Commit signing](commits.md#commit-signing). The merge commit itself is created and signed by GitHub.

It also requires a clean CodeQL result. Code scanning runs through GitHub's default setup rather than a workflow in the repository, so it does not appear in the table above. It analyzes JavaScript, TypeScript and the workflow files with the extended query suite, on every pull request and weekly on `main`. A pull request is blocked while it has an open alert of severity warning or higher, or a security alert of medium severity or higher. Fixing the finding or dismissing the alert with a reason unblocks it.

The `Stable tags` ruleset covers the release tags, `v<major>.<minor>.<patch>`: nobody creates, deletes or moves one, and each one has to be signed. The Maintain role is on its bypass list, so maintainers push release tags and are the only ones who could remove one. [Cutting a release](releasing.md#cutting-a-release) describes what that means for a release.
