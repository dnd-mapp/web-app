# syntax=docker/dockerfile:1
# check=error=true

# The output of the build stage is static files, so it runs on the builder's own platform and is shared by every target
# platform of a multi-platform build, instead of being repeated under emulation for each of them.

# build Compile the application.
FROM --platform=$BUILDPLATFORM node:24.21.0@sha256:6dac556d980b7f0e5498d08f08cee0ca67798b4ad6c23964a9214920e67758d0 AS build

# Install the pnpm version pinned under devEngines in package.json through pnpm's standalone installer. It downloads
# the executable from the npm registry, checks it against the published checksum and npm signature, and installs it
# into PNPM_HOME, so the Node.js bundled with the image is not involved.
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}/bin:${PATH}"

# Make the install fail when the download does, instead of handing an empty script to sh.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.4.1 SHELL=/bin/sh ENV=/root/.shrc sh -

ENV CI="true"

WORKDIR /app

# Install dependencies from the lockfile first, so a change to the sources alone does not invalidate this layer. The
# cache mount keeps the content-addressable store, which lives under PNPM_HOME, between builds.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

COPY angular.json tsconfig.json ./
COPY projects ./projects

RUN pnpm run build

# The unprivileged image runs nginx as the nginx user (uid 101). The server block in .docker/nginx.conf listens on
# port 4200, the same port as the dev server.

# serve Serve the compiled application with nginx.
FROM nginxinc/nginx-unprivileged:1.31.5-alpine3.24-slim@sha256:736aa11ab9f9c320825722e411661c64559881e15e77f37137eef168ebe9515c AS serve

COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/web-app/browser /usr/share/nginx/html

EXPOSE 4200
