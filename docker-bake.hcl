# Bake definition for the dndmapp/web-app image. The image name never changes; what differs between builds is which
# tags it gets, which platforms it is built for, where its layer cache lives and what the OCI labels say.
#
# A local build takes those from this file alone:
#
#     TAGS=sha-1a2b3c4,dev docker buildx bake --load
#
# CI takes them from docker/metadata-action instead. That action derives tags, labels and annotations from the Git ref
# and the repository, writes them into a bake file as a target named docker-metadata-action, and docker/bake-action
# reads that file after this one. Bake merges a target defined in several files attribute by attribute: a later list
# replaces an earlier one, a later map is merged over an earlier one and annotations are appended. The target of that
# name below therefore holds the local defaults, and the generated file supersedes them in CI.
#
# Buildx parses a list variable as comma separated values. Every variable is validated before the build starts, so a
# typo fails fast with a message instead of producing a wrongly tagged image.

# The tags a local build gets, without the image name: "dev", "sha-1a2b3c4", "1.2.3", "latest". Unused in CI, where
# docker/metadata-action supplies the tags.
variable "TAGS" {
    type    = list(string)
    default = ["dev"]

    validation {
        condition = length(TAGS) == length([
            for tag in TAGS : tag if can(regex("^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$", tag))
        ])
        error_message = "A tag matches [A-Za-z0-9_][A-Za-z0-9_.-]{0,127}. Got: ${join(", ", TAGS)}."
    }

    validation {
        condition     = length(TAGS) == length(distinct(TAGS))
        error_message = "TAGS lists a tag more than once. Got: ${join(", ", TAGS)}."
    }
}

# The platforms to build for. Empty means the builder's own platform, which is what a local build wants; CI passes
# linux/amd64,linux/arm64. The serve stage starts from a Linux image, so every entry has to be a Linux platform.
variable "PLATFORMS" {
    type    = list(string)
    default = []

    validation {
        condition = length(PLATFORMS) == length([
            for platform in PLATFORMS : platform if can(regex("^linux/[a-z0-9]+(/v[0-9]+)?$", platform))
        ])
        error_message = "A platform looks like linux/<arch> or linux/<arch>/<variant>. Got: ${join(", ", PLATFORMS)}."
    }

    validation {
        condition     = length(PLATFORMS) == length(distinct(PLATFORMS))
        error_message = "PLATFORMS lists a platform more than once. Got: ${join(", ", PLATFORMS)}."
    }
}

# Where the build imports its layer cache from and where it exports it to, one cache specification each, such as
# type=gha,scope=web-app or type=registry,ref=dndmapp/web-app:cache. Empty means the builder's own cache and nothing
# else, which is what a local build wants; CI passes the GitHub Actions cache. Each is a string rather than a list of
# strings, because buildx splits a list variable on commas and a cache specification has commas of its own.
variable "CACHE_FROM" {
    type    = string
    default = ""

    validation {
        condition     = CACHE_FROM == "" || can(regex("^type=[a-z0-9]+(,[a-z0-9_-]+=[^, ]+)*$", CACHE_FROM))
        error_message = "CACHE_FROM is empty or looks like type=<backend>[,<key>=<value>...]. Got: ${CACHE_FROM}."
    }
}

variable "CACHE_TO" {
    type    = string
    default = ""

    validation {
        condition     = CACHE_TO == "" || can(regex("^type=[a-z0-9]+(,[a-z0-9_-]+=[^, ]+)*$", CACHE_TO))
        error_message = "CACHE_TO is empty or looks like type=<backend>[,<key>=<value>...]. Got: ${CACHE_TO}."
    }
}

group "default" {
    targets = ["web-app"]
}

# Local defaults for what docker/metadata-action generates in CI: the tags and the OCI image labels, see
# https://github.com/opencontainers/image-spec/blob/main/annotations.md. In CI the action's tags replace these and its
# labels are merged over them, so a label the action also sets (title, description, url, source, version, created,
# revision, licenses) shows the action's value there. No annotations here: bake appends rather than replaces them, so
# any set here would end up next to the action's in CI.
target "docker-metadata-action" {
    tags = [for tag in TAGS : "dndmapp/web-app:${tag}"]

    # The version label is set even though a local build has no version, because the nginx base image carries a
    # version label of its own that would otherwise show through as the app's version.
    labels = {
        "org.opencontainers.image.title"       = "D&D Mapp web app"
        "org.opencontainers.image.description" = "The web frontend for D&D Mapp."
        "org.opencontainers.image.vendor"      = "D&D Mapp"
        "org.opencontainers.image.licenses"    = "MIT"
        "org.opencontainers.image.url"         = "https://github.com/dnd-mapp/web-app#readme"
        "org.opencontainers.image.source"      = "https://github.com/dnd-mapp/web-app"
        "org.opencontainers.image.version"     = "0.0.0-dev"
        "org.opencontainers.image.created"     = timestamp()
    }
}

target "web-app" {
    inherits = ["docker-metadata-action"]

    context    = "."
    dockerfile = "Dockerfile"
    target     = "serve"
    platforms  = PLATFORMS

    # Bake takes a list here, and an empty list means no cache import or export; compact drops the empty default.
    cache-from = compact([CACHE_FROM])
    cache-to   = compact([CACHE_TO])

    # Provenance at mode=max records the full build definition and source; the SBOM lists the packages in the image.
    # Both are attached to the image index as attestation manifests. The docker exporter only accepts them with the
    # containerd image store, and the registry exporter always does. docker/bake-action adds a provenance setting of
    # its own only to a target that declares none, so these stand in CI; its provenance input, when set, overrides the
    # mode here and adds the workflow run as builder-id.
    attest = [
        "type=provenance,mode=max",
        "type=sbom",
    ]
}
