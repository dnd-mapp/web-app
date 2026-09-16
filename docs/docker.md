# Docker image

The `dndmapp/web-app` image holds the compiled application, served by nginx. [.docker/hub/overview.md](../.docker/hub/overview.md) describes it for someone who found it on [Docker Hub](https://hub.docker.com/r/dndmapp/web-app); this page describes how it is built.

## Building locally

```bash
docker buildx bake --load
```

[docker-bake.hcl](../docker-bake.hcl) describes the image, and the command above builds it for your own platform, tags it `dndmapp/web-app:dev` and loads it into the local image store.

```bash
docker run --rm -p 4200:4200 dndmapp/web-app:dev
```

The app is then served at `http://localhost:4200`. The [compose stack](testing.md#compose-stack) serves the same image behind Caddy, the way the end-to-end tests want it.

## Dockerfile

[Dockerfile](../Dockerfile) builds the image in two stages. The first starts from the `node:24.21.0` image, installs pnpm 12.4.1 through [pnpm's standalone installer](https://pnpm.io/installation#using-a-standalone-script), installs the dependencies from the lockfile and runs `pnpm run build`. The installer downloads the pnpm executable from the npm registry and checks it against the published checksum and npm signature before installing it. The second stage copies `dist/web-app/browser` into an [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged) image, which runs nginx as an unprivileged user. [.docker/nginx.conf](../.docker/nginx.conf) listens on port 4200, the same port as the dev server, and hands unknown routes to `index.html` for the Angular router. It tells browsers to revalidate `index.html` on every load and to cache the hashed scripts and styles for a year. [.dockerignore](../.dockerignore) limits the build context to the files the build stage copies in; a change there also lands in the `detect-changes` filter described under [detect-changes](ci.md#detect-changes).

Both `FROM` lines pin the base image by digest, with the tag kept in front of it for reference: `image:tag@sha256:<digest>`. A build therefore always starts from the same layers. Updating an image means resolving the new digest with `docker buildx imagetools inspect <image>:<tag>` and changing tag and digest together. The Node.js tag has to match the runtime version under `devEngines` in [package.json](../package.json), and pnpm is installed with `PNPM_VERSION` set to that same pinned version, never through corepack or npm.

The Node.js `FROM` line keeps `--platform=$BUILDPLATFORM`: the build stage produces static files, so it runs once on the builder's platform during a multi-platform build and is shared by every target's nginx stage, instead of repeating the compile under emulation. Anything added to the build stage has to stay platform independent for that to hold.

The `check=error=true` directive at the top of the Dockerfile makes a regular `docker build` fail on the findings of [BuildKit's build checks](https://docs.docker.com/reference/build-checks/), so a local build catches what `docker build --check .` reports in CI.

## Bake file

```bash
TAGS=sha-1a2b3c4,dev PLATFORMS=linux/amd64,linux/arm64 docker buildx bake --push
```

[docker-bake.hcl](../docker-bake.hcl) is the one place that says how the image is built: its name, tags, platforms, attestations and OCI labels. Local builds and CI both run `docker buildx bake` against it, so a build option belongs in the file rather than on a command line. The image name never changes; whatever varies between builds is a `variable`, set through the environment, with a default that suits a local build and `validation` blocks that fail the build on a bad value:

- **`TAGS`** lists the tags one build produces, comma separated, so a development build can come out as `sha-1a2b3c4` and `dev` at once and a release as `latest`, `1.2.3`, `1.2` and `1`.
- **`PLATFORMS`** lists the platforms to build for; left unset, the image is built for the builder's own platform.
- **`CACHE_FROM`** and **`CACHE_TO`** each name one [cache backend](https://docs.docker.com/build/cache/backends/) to import the layer cache from and to export it to, such as `type=gha,scope=web-app`. They default to empty, so a local build relies on the builder's own cache. Each holds a single specification as a string rather than a list, since buildx splits a list variable on commas and a cache specification contains commas itself.

All four are validated, so a malformed tag, a platform the nginx image cannot run on or a cache specification without a `type` stops the build with a message before it starts. Custom `function` blocks are not available inside `validation` conditions, so a condition is written out inline, wrapped across lines to stay within 120 columns.

The OCI labels that never change, such as the title, the license and the source repository, are set in the file, and the created label is the time of the build. The version label is the version in [package.json](../package.json) with a `-dev` suffix, `0.0.0-dev` until the first release. It is set even for a local build, because the nginx base image carries a version label of its own that would otherwise show through. The [release workflow](releasing.md#the-release-workflow) checks the part before the suffix against the tag, and the release image gets its label from `docker/metadata-action`.

After changing the file, `docker buildx bake --print` shows the resolved configuration without building, and `docker buildx bake --check` runs the same BuildKit build checks as `docker build --check .` over the Dockerfile as the bake file configures it.

## Metadata in CI

In CI, tags and labels come from [docker/metadata-action](https://github.com/docker/metadata-action) rather than from `TAGS`. The action derives them from the Git ref and the repository, writes them to a bake file as a target named `docker-metadata-action`, and [docker/bake-action](https://github.com/docker/bake-action) reads that file after `docker-bake.hcl`. The `web-app` target inherits from a target of that same name in the bake file, which holds the local defaults for tags and labels. Bake merges a target defined in two files attribute by attribute: the later file replaces the tags, merges its labels over the earlier ones and appends its annotations. The action's values therefore win in CI, and a local build never needs the action. The target in the file sets no annotations, since bake would append them next to the action's. The [build-image](ci.md#build-image) composite action wires the two together, and each workflow that builds the image runs it with its own tag rules.

## Attestations and platforms

Every build attaches a [provenance attestation](https://docs.docker.com/build/metadata/attestations/slsa-provenance/) at `mode=max`, which records the build definition and the source it was built from, and an [SBOM attestation](https://docs.docker.com/build/metadata/attestations/sbom/) listing the packages in the image. Both are stored next to the image as attestation manifests, so once the image is pushed, `docker buildx imagetools inspect dndmapp/web-app:<tag>` lists them alongside the platform manifests. `bake-action` adds a provenance setting of its own only to a target that declares none, so the file's settings stand; setting its `provenance` input to `mode=max` on top adds the workflow run as the `builder-id`.

Both base image digests point at multi-architecture indexes, so each target platform resolves its own layers, and the lockfile carries the native modules for both architectures. Attestations and multi-platform images both need a `docker-container` builder or Docker Desktop with the containerd image store; the classic image store cannot hold either.

## Docker Hub page

[.docker/hub](../.docker/hub) holds the texts shown on the image's Docker Hub page. `overview.md` is the repository overview, written for someone who found the image on Docker Hub rather than for a developer of this repository. `short-description.txt` is the one-line description, which Docker Hub caps at 100 characters. Links in the overview are absolute, since Docker Hub does not resolve repository-relative ones. The [push-main.yml](ci.md#pushes-to-main) workflow uploads both to Docker Hub once a change to them reaches `main`, so the texts are edited here rather than in the repository settings on Docker Hub.
