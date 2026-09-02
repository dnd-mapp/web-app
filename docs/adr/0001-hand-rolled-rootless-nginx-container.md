# Hand-rolled rootless nginx for the container image

## Context

The `web-app` build emits a static SPA bundle. Containerising it needs a runtime image that serves those files with SPA-fallback routing, runs as non-root on an unprivileged port, and tolerates a read-only root filesystem. That last set of constraints lets the same image run unchanged under `docker compose` behind a reverse proxy and under Kubernetes with a hardened `securityContext`.

## Decision

The runtime stage starts from the official `nginx:<version>-alpine` image and is made rootless by hand: a custom `/etc/nginx/nginx.conf` with no `user` directive, `pid` and all temp paths relocated under `/tmp`, logs to stdout/stderr, `USER 101:101`, and `listen 4200`. We do not use `nginxinc/nginx-unprivileged`.

## Considered options

- **`nginxinc/nginx-unprivileged`** does exactly this rootless setup for us. Rejected because it is a separately-maintained image with its own release cadence and digest to track, it still ships a config we would override anyway for SPA routing and cache tiers, and pinning the official `nginx` image keeps our supply-chain surface to one well-known upstream (consistent with the repo's `minimumReleaseAge` and digest-pinning posture).
- **Caddy or a static-binary server on `scratch`** is smaller or simpler to configure, but it is a less familiar operational story. For Caddy it also means a large image whose headline auto-HTTPS feature is dead weight here, since TLS terminates upstream.

## Consequences

- The `nginx.conf` and `.docker/default.conf` in this repo are load-bearing: a base-image bump can change stock paths/permissions and must be re-verified against the rootless assumptions (writable `/tmp` only). See `0002-track-base-images-with-dependabot.md` for how these bumps are delivered and the `devEngines` coupling on the `node` image.
- Multi-arch, OCI labels, and provenance/attestation are deliberately **not** in the Dockerfile. The build stage is arch-neutral (`--platform=$BUILDPLATFORM`, the Angular output is architecture-independent) and a follow-up Docker Bake file owns the per-arch runtime build and all image metadata.
