# The container image is built once per pull request and promoted, not rebuilt

## Context

`0003-docker-bake-release-build.md` left the publishing workflow to #5: where the image is pushed, what it is tagged, and when. Two questions had to be answered.

**Registry.** The `docker-bake.hcl` `IMAGE` default is `dndmapp/web-app`, and ADR 0003 assumed CI would rewrite it to a `ghcr.io/...` path. We publish to Docker Hub instead. `dndmapp` is a personal Docker Hub account, and the image is meant to be pulled from there.

**Build versus promote.** A rebuild on merge is not bit-identical to the image reviewed on the pull request. `org.opencontainers.image.created` is a real timestamp, and any registry drift between the two builds (base images, pnpm packages) lands in `edge`. The alternative is to build once, on the pull request, and move that exact image forward.

## Decision

The image is built exactly once, on the pull request, and every later tag is a retag of that digest.

**Trigger gate.** The `.github/actions/detect-image-changes` composite wraps `dorny/paths-filter` and carries the list of paths that can change the built image: the `Dockerfile`, `.docker/`, `docker-bake.hcl`, `projects/`, the manifests, and the image workflows and composites. Keeping the filter and its pinned action version in one place is why it is a composite rather than a repeated step. Each of the three workflows below runs it as a `changes` job, and every image job is gated on `changes.outputs.image == 'true'`. The gate is a job-level `if`, never `on.*.paths`. A top-level path filter would leave the required `Image` check hanging pending on a docs-only pull request, whereas a job-level `if` reports it as skipped-success and satisfies branch protection.

**Pull request opened or updated** (`pull-request.yml`). After `ci` passes, the `image` job runs `docker buildx bake default` and pushes the result as `dndmapp/web-app:pr-<N>`, nothing else. That build is:

- multi-arch (`linux/amd64`, `linux/arm64`) under QEMU,
- attested with buildx `provenance` and `sbom` from the bake file,
- labelled and annotated from `docker/metadata-action`,
- layer-cached through GitHub Actions via `--set`.

`Image` is a required status check. When it runs, it must pass.

**Pull request merged** (`push-main.yml`). The `promote` job resolves the pull request from the merge commit (`gh api repos/{repo}/commits/{sha}/pulls`), then runs `docker buildx imagetools create --tag …:edge --tag …:sha-<short> …:pr-<N>`. That is a registry-side retag: it copies the multi-arch index and its attestation manifests without pulling or rebuilding. The `pr-<N>` tag is then deleted. The image that ships to `edge` is byte-for-byte the one the pull request tested, so its `created` and `revision` labels point at the pull-request build, not the merge.

**Pull request closed unmerged** (`pull-request-closed.yml`). The `cleanup` job deletes `pr-<N>`.

**Tag deletion.** `docker buildx imagetools` cannot delete a tag, so `.github/actions/dockerhub-delete-tag` calls the Docker Hub API. It fails on a missing tag by default, because `promote` just read that tag and its absence is a real error. It skips quietly when told to, because `cleanup` cannot know whether the build ever finished.

**Credentials.** Three scoped Docker Hub access tokens as GitHub Actions **and** Dependabot secrets: `DH_USERNAME`, `DH_READ_WRITE` (pull-request build), `DH_READ_WRITE_DELETE` (promote and cleanup). Dependabot needs its own copy because base-image digest bumps touch the `Dockerfile`, match the path gate, and must build and push like any other pull request.

**Release tags** (`latest`, `1.2.3`, `1.2`, `1`) are out of scope here. They belong to the release process, which will promote `edge` the same way.

## Considered options

- **Rebuild on merge.** Rejected: the merge image is not identical to the reviewed one, and a rebuild is minutes where a retag is seconds.
- **GHCR.** Rejected: the image is meant to be pulled from Docker Hub. GHCR's tighter GitHub integration (the package page provenance badge from `actions/attest-build-provenance`) does not apply once the image lives elsewhere.
- **`actions/attest-build-provenance` on top of the buildx attestations.** Rejected: a second, overlapping provenance record whose main payoff is the GHCR package-page badge.
- **A separate `dndmapp/web-app-staging` repository for `pr-<N>`.** Rejected: it doubles the bootstrap and adds a cross-repository copy on every merge. The only gain is keeping transient tags out of the public repository, and the cleanup automation already does that.
- **`sha-<short>` deferred until a deployer exists.** Reconsidered and included: `edge` is a moving pointer with no rollback handle, and the extra `--tag` is free.
- **Top-level `on.pull_request.paths` filter.** Rejected: a required check that never runs blocks the merge forever. A job-level `if` skips as success.

## Consequences

- `edge` carries the pull-request build's `created` timestamp and head SHA in its OCI labels. This is correct for "promote the exact bytes" and should not be "fixed" to the merge commit.
- `pr-<N>` tags are briefly visible in the public repository and depend on the cleanup automation. A pull request whose build failed and was then closed leaves a red `cleanup` run, because the tag it expected never existed. This is accepted as rare.
- A merge that races an in-flight `pr-<N>` build promotes the previous digest. Per-pull-request `cancel-in-progress` on the build keeps the window small, and there is no merge queue.
- Deleting a tag leaves its underlying manifest untagged until Docker Hub garbage-collects it.
- The first merge that introduces this pipeline has no `pr-<N>` to promote. `promote` logs a warning and exits 0.
- The interim `bake --print` and `docker build --check` checks left `.github/actions/ci` and now run only in the image job, that is, only when the path gate fires. Every change that could break the bake file or Dockerfile is in the `detect-image-changes` filter, so coverage is preserved, and now it is backed by a real build.
