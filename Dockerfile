# syntax=docker/dockerfile:1
# check=error=true

# The output of the build stage is static files, so it runs on the builder's own platform and is shared by every target
# platform of a multi-platform build, instead of being repeated under emulation for each of them.

# build Compile the application.
FROM --platform=$BUILDPLATFORM node:24.21.0@sha256:22553920add6fb1fd909104346924cd30b4b3ac76ca2980f3b8dba8ede3cf945 AS build

# Install the pnpm version pinned under devEngines in package.json through pnpm's standalone installer. It downloads
# the executable from the npm registry, checks it against the published checksum and npm signature, and installs it
# into PNPM_HOME, so the Node.js bundled with the image is not involved.
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}/bin:${PATH}"

# Make the install fail when the download does, instead of handing an empty script to sh.
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=12.4.2 SHELL=/bin/sh ENV=/root/.shrc sh -

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
FROM nginxinc/nginx-unprivileged:1.31.6-alpine3.24-slim@sha256:dcc9bf9c084901dddbbce305130a7295c5637b6a8fce3e29cf678d86336982e4 AS serve

COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/web-app/browser /usr/share/nginx/html

EXPOSE 4200
