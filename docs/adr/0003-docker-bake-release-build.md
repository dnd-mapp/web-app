# Docker Bake owns the release build

## Context

The repo-root `Dockerfile` is deliberately lean (see `0001-hand-rolled-rootless-nginx-container.md`): a single-arch build with no image metadata and no attestations. The release-oriented concerns still have to live somewhere so that `docker buildx bake` is the one build entrypoint for CI and for local checks.

Those concerns are: a multi-arch runtime image (`linux/amd64` and `linux/arm64`), SLSA provenance and an SBOM, and the OCI image labels (`source`, `revision`, `created`, `version`, `licenses`, `title`, `description`).

## Decision

A repo-root `docker-bake.hcl` with a shared `_common` target (context, Dockerfile, `runtime` stage) and two built targets:

- **`default`**: the release build. Multi-arch, `attest = ["type=provenance,mode=max", "type=sbom"]`. It sets no `output`; the CI workflow (#5) adds `--push`. Image references are `${IMAGE}:${tag}` for each tag in the comma-separated `TAGS` variable. `IMAGE` defaults to `dndmapp/web-app` and CI overrides it with the GHCR path. `TAGS` defaults to `edge`, the moving "tip of `main`" tag.
- **`local`**: the same build for hand testing. Host platform only, no attestations, loaded into the local image store as `${IMAGE}:local`. It inherits only `_common`, so the attestations on `default` do not leak in (a child cannot reliably clear an inherited `attest` list).

The `attest` list form is used rather than the `provenance` / `sbom` shorthands because `docker buildx bake --print` (the CI guard below) does not echo the shorthands.

OCI labels are not written in the bake file. CI runs `docker/metadata-action`, which generates a bake file defining a `docker-metadata-action` target. `default` inherits a local stub of that target, so the CI-generated labels and annotations merge in. `licenses`, `title`, and `description` therefore come from `metadata-action`'s inputs, not a second copy in the bake file.

Base image references stay as `tag@sha256:digest` on the Dockerfile `FROM` lines. The bake file does not pass `NODE_IMAGE` / `NGINX_IMAGE` (or `PNPM_VERSION`) as build args. Issue #3 asked for a "base-image digest passthrough so the values stay defined in one place", but routing an image through a bake variable and `FROM ${IMAGE}` is exactly the form Dependabot cannot resolve (`0002-track-base-images-with-dependabot.md`).

The shared CI composite action (`.github/actions/ci`) gains `docker buildx bake --print default local` (parses the HCL and resolves every variable and `inherits` chain) and `docker build --check .` (BuildKit's Dockerfile linter). CI does not build the image until #5; these two checks are the interim guard.

The release tag scheme is owned by #5, where `docker/metadata-action` produces the `TAGS` value: `edge` for the tip of `main`, plus an immutable `sha-<short>` tag. `latest` and the semver tag are deferred until the first `v*` git tag. `edge` is chosen over the alternatives for a reason. `latest` carries no "newest" guarantee per Docker's own guidance, and projects like nginx wire it to a *less* stable line. The bare branch name `main` works but says less. `next` is a version-stream label, not a branch pointer. Alpine and `docker/metadata-action` both define `edge` as "the last commit of the active branch", so it states exactly what this build is.

## Considered options

- **Pass base-image digests through bake.** Rejected: contradicts `0002`, since Dependabot stops seeing the images.
- **Write the static OCI labels (`licenses`, `title`, `description`) into the bake file.** Rejected: a second source of truth alongside `package.json` that would drift. `metadata-action` reads them from the repo and its inputs.
- **A single target with CI-vs-local switched entirely through variables.** Rejected: a named `local` target is a clearer, memorable local command (`docker buildx bake local`) than remembering which variables to set.
- **`local` inheriting `default` and disabling attestations.** Rejected: `attest = []` and the `provenance = false` / `sbom = false` shorthands do not override an inherited `attest` list. Only re-listing every entry with `disabled=true` works, and a shared `_common` parent is simpler.
- **`bake --check` for the Dockerfile lint.** Rejected in favour of `docker build --check .`. `--check` is the Dockerfile linter regardless of how it is invoked, and going through bake only adds the HCL parse that `--print` already covers.

## Consequences

- The build is not bit-for-bit reproducible: `org.opencontainers.image.created` is a real build timestamp and `SOURCE_DATE_EPOCH` is not set. Reproducible builds are a deliberate non-goal for now.
- `provenance` and `sbom` attestations produce an OCI image index, which cannot be loaded into the classic Docker image store. This is why `local` turns them off. A bare `docker buildx bake default` without `--push` builds to cache and warns.
- The `docker-metadata-action` stub target must stay in the bake file. Removing it breaks the `inherits` on `default` whenever the CI-generated bake file is absent (every local run, and `bake --print` in CI).
- The interim `bake --print` / `docker build --check` steps run on every push and pull request but do not exercise the actual image build or the `FROM`-line digests. That gap closes with #5.
