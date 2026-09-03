# Docker Bake definition for the web-app image. `docker buildx bake` is the one build entrypoint for release builds
# (CI) and for local smoke tests. See docs/adr/0003-docker-bake-release-build.md.
#
#   default - the release build. Multi-arch (linux/amd64 + linux/arm64), provenance + SBOM attestations, no output
#             set here (CI adds `--push`). Image tags are "${IMAGE}:<t>" for each <t> in the comma-separated TAGS
#             variable; OCI labels come from the docker-metadata-action target that CI merges in (#5), not from here.
#   local   - a one-arch, loadable build for poking at the image by hand: host platform only, no attestations, loaded
#             into the local image store as ${IMAGE}:local.
#
# Base images are NOT referenced here. They are pinned as tag@digest on the Dockerfile FROM lines so Dependabot can
# see them (docs/adr/0002-track-base-images-with-dependabot.md); routing them through a bake variable would hide them
# again. PNPM_VERSION likewise stays on its Dockerfile ARG default.

variable "IMAGE" {
  # Repository without a registry. CI overrides this with the GHCR path (#5).
  default = "dndmapp/web-app"
}

variable "TAGS" {
  # Comma-separated tag names, e.g. "edge,1.2.3". CI passes the docker/metadata-action output; the `edge`
  # default is the moving "tip of main" tag (see docs/adr/0003-docker-bake-release-build.md).
  default = "edge"
}

# Placeholder. In CI, docker/metadata-action generates a bake file that fills this target with the OCI labels and
# annotations. Locally it stays empty.
target "docker-metadata-action" {}

# Shared build config. Not built directly (the leading underscore is a convention for that).
target "_common" {
  context    = "."
  dockerfile = "Dockerfile"
  target     = "runtime"
}

target "default" {
  inherits  = ["_common", "docker-metadata-action"]
  platforms = ["linux/amd64", "linux/arm64"]
  attest    = ["type=provenance,mode=max", "type=sbom"]
  tags      = [for tag in split(",", TAGS) : "${IMAGE}:${tag}"]
}

target "local" {
  inherits = ["_common"]
  output   = ["type=docker"]
  tags     = ["${IMAGE}:local"]
}
