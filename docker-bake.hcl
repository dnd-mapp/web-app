# Docker Bake definition for the web-app image. `docker buildx bake` is the one build entrypoint for release builds
# (CI) and for local smoke tests. See docs/adr/0003-docker-bake-release-build.md.
#
#   default - the release build. Multi-arch (linux/amd64 + linux/arm64), provenance + SBOM attestations, no output
#             set here (CI adds `--push`). Image tags are "${IMAGE}:<t>" for each <t> in the comma-separated TAGS
#             variable; OCI labels and annotations come from the docker-metadata-action target that CI merges in
#             (docs/adr/0004-promotion-chain-docker-hub.md), not from here.
#   local   - a one-arch, loadable build for poking at the image by hand: host platform only, no attestations, loaded
#             into the local image store as ${IMAGE}:local.
#
# Base images are NOT referenced here. They are pinned as tag@digest on the Dockerfile FROM lines so Dependabot can
# see them (docs/adr/0002-track-base-images-with-dependabot.md); routing them through a bake variable would hide them
# again. PNPM_VERSION likewise stays on its Dockerfile ARG default.

variable "IMAGE" {
  # Docker Hub repository, no registry prefix. CI sets it explicitly. See docs/adr/0004-promotion-chain-docker-hub.md.
  default = "dndmapp/web-app"

  validation {
    condition     = IMAGE != "" && length(regexall("[:@[:space:]]", IMAGE)) == 0 && IMAGE == lower(IMAGE)
    error_message = "IMAGE must be a lowercase repository reference with no tag, digest, or whitespace (e.g. \"dndmapp/web-app\" or \"ghcr.io/dnd-mapp/web-app\")."
  }
}

variable "TAGS" {
  # Comma-separated tag names. CI sets this to "pr-<N>" for pull-request builds. The move to `edge` and
  # `sha-<short>` on merge is a retag, not a rebuild (docs/adr/0004-promotion-chain-docker-hub.md). The
  # `edge` default keeps a bare `docker buildx bake default` honest about what it would produce.
  default = "edge"

  validation {
    condition     = can(regex("^[[:alnum:]_][[:alnum:]_.-]{0,127}(,[[:alnum:]_][[:alnum:]_.-]{0,127})*$", TAGS))
    error_message = "TAGS must be a comma-separated list of valid image tags with no empty entries or whitespace (e.g. \"edge\" or \"pr-12,edge\")."
  }
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
