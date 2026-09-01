# syntax=docker/dockerfile:1
#
# Multi-stage image for the web-app Angular SPA.
#
#   build   - compiles the app with pnpm. Architecture-neutral: the output is
#             static files, so this stage runs on $BUILDPLATFORM and is not
#             re-run per target arch under `buildx --platform ...`.
#   runtime - stock nginx:alpine made rootless by hand (see
#             docs/adr/0001-hand-rolled-rootless-nginx-container.md).
#
# Multi-arch, OCI labels, and provenance/attestation are owned by a separate
# Docker Bake file, not this Dockerfile.
#
# Base images are pinned by digest. Bump them together with `devEngines` in
# package.json (Node) and the nginx tag below. A `docker` Dependabot ecosystem
# entry is the intended way to keep them current.

# node:24.20.0-alpine  (exact patch to satisfy devEngines.runtime + engineStrict)
ARG NODE_IMAGE=node:24.20.0-alpine@sha256:e67514e5d0f6c46656005e1b693b2ec9d52e80b641307de684d4a015ba7a4eaf
# nginx:1.31.4-alpine3.24
ARG NGINX_IMAGE=nginx:1.31.4-alpine3.24@sha256:db35bfc6b2951e7f8a72db5db120288c127ffaeeb4a6d4b95a26fead017d5913
ARG PNPM_VERSION=11.24.0


# ---- build ------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS build

ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm/bin:$PATH \
    CI=true

# pnpm via the standalone installer (no corepack), version-pinned. The installer
# and its own package store live under /pnpm; the project's package store is a
# separate, cache-mounted directory (below) so the mount can't shadow the CLI.
RUN wget -qO- https://get.pnpm.io/install.sh \
    | env PNPM_VERSION="${PNPM_VERSION}" SHELL="$(command -v sh)" ENV=/dev/null sh - \
    && pnpm --version

WORKDIR /app

# Dependency layer: only re-run when the manifests or lockfile change. The
# cache mount is a separate filesystem, so pnpm copies from the store into
# node_modules instead of hard-linking.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --ignore-scripts \
        --store-dir /root/.pnpm-store --package-import-method copy

# App sources. tsconfig.app.json / tsconfig.spec.json live under projects/web-app/.
COPY angular.json tsconfig.json ./
COPY projects ./projects

RUN pnpm build

# Pre-compress compressible assets once so nginx can serve them with gzip_static.
RUN find dist/web-app/browser -type f \
        \( -name '*.js' -o -name '*.css' -o -name '*.mjs' -o -name '*.html' \
        -o -name '*.json' -o -name '*.svg' -o -name '*.ico' -o -name '*.txt' \
        -o -name '*.webmanifest' \) \
        -exec gzip -9 -k -f {} +


# ---- runtime --------------------------------------------------------------
FROM ${NGINX_IMAGE} AS runtime

# Rootless nginx config. Replaces the stock files; see .docker/ for details.
# The ipv6 entrypoint helper is dropped: our default.conf already listens on
# [::], and on a read-only root filesystem the helper only logs a failed edit.
RUN rm /etc/nginx/conf.d/default.conf /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
COPY --chown=101:101 .docker/nginx.conf   /etc/nginx/nginx.conf
COPY --chown=101:101 .docker/default.conf /etc/nginx/conf.d/default.conf

# The built site plus the bundled-dependency license notices Angular emits.
COPY --chown=101:101 --from=build /app/dist/web-app/browser/            /usr/share/nginx/html/
COPY --chown=101:101 --from=build /app/dist/web-app/3rdpartylicenses.txt /usr/share/nginx/html/3rdpartylicenses.txt

# Drop to the image's built-in unprivileged user, referenced numerically so
# Kubernetes `runAsNonRoot` passes without a username lookup.
USER 101:101

# Same port as the Angular dev server. Unprivileged, so no extra capability.
EXPOSE 4200
STOPSIGNAL SIGQUIT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:4200/healthz || exit 1
