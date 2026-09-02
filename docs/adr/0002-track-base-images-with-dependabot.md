# Track container base image digests with Dependabot

## Context

The repo-root `Dockerfile` pins both base images by `tag@sha256` digest. A digest never changes on its own, so upstream security rebuilds of `node:24.20.0-alpine` and `nginx:1.31.4-alpine3.24` stay invisible until someone bumps them by hand.

Dependabot's `docker` ecosystem can raise those bumps as pull requests, but only for an image written directly on a `FROM` line. It does not resolve an image held in an `ARG` default and consumed as `FROM ${IMAGE}` ([dependabot-core#4597](https://github.com/dependabot/dependabot-core/issues/4597), closed "not planned"). The Dockerfile used exactly that `ARG` form.

The GitHub Actions in `.github/workflows/` and `.github/actions/` are pinned by commit SHA and drift the same way.

## Decision

1. Both base images move onto their `FROM` lines as `name:tag@sha256:digest`. The `NODE_IMAGE` and `NGINX_IMAGE` build args are removed; `PNPM_VERSION` stays an `ARG`.
2. `.github/dependabot.yml` gains a `docker` entry (directory `/`, the repo-root `Dockerfile`) and a `github-actions` entry covering the workflows and the composite action under `.github/actions/`.
3. Both run weekly with a 3-day `cooldown`, mirroring `minimumReleaseAge: 4320` in `pnpm-workspace.yaml`. Commit messages use the `chore(deps):` prefix documented in `CONTRIBUTING.md`.
4. The `node` image is held to digest-only updates. Its tag is locked to `devEngines.runtime` in `package.json` under `engineStrict`, so a tag bump without the matching `devEngines` change fails CI. Dependabot ignores `node` tag bumps (`versions: [">= 0"]`); digest-only refreshes still arrive, because they run through a separate code path that the ignore rules never consult. A `node` tag bump is done by hand together with `devEngines.runtime` and the `FROM` line, the same way catalog versions are bumped by hand.
5. `nginx` has no such coupling. Dependabot updates its tag and digest together.
6. The `docker` entry is not grouped, so a blocked `node` pull request cannot hold back an `nginx` security bump. The `github-actions` entry groups all updates into one pull request.

## Considered options

- **Keep the `ARG` form.** Rejected: Dependabot cannot see the images, which defeats the purpose.
- **Pin `node` as a digest-only reference (`node@sha256:...`, no tag).** Rejected: Dependabot then tracks the `latest` tag's digest rather than `24.20.0-alpine` ([dependabot-core#1971](https://github.com/dependabot/dependabot-core/issues/1971)).
- **Relax `devEngines.runtime` to a range so tag bumps stop breaking CI.** Rejected: `engineStrict` and the exact pin are deliberate, and the coupling only bites on a real Node patch release, which is rare.
- **Group the `docker` updates into one pull request.** Rejected: it couples the hand-held `node` bump to the automatic `nginx` one.

## Consequences

- A `node` tag bump is manual work. The Dockerfile header comment and the `dependabot.yml` comment both spell out the steps.
- A digest-only pull request can go stale rather than roll forward: Dependabot will not supersede or reopen one for an unchanged tag ([dependabot-core#7387](https://github.com/dependabot/dependabot-core/issues/7387), [#9024](https://github.com/dependabot/dependabot-core/issues/9024)). Review and merge them promptly.
- If GitHub enables the `docker_digest_only_update_suppression` experiment ([dependabot-core#15103](https://github.com/dependabot/dependabot-core/pull/15103)) for this repo, digest-only pull requests stop. The setting is not controllable from `dependabot.yml`.
- CI does not build the image, so the `FROM`-line change is not exercised until the container build is wired up (#5).
- Auto-merging the low-risk updates (digest-only, action patches) is deferred to #13.
