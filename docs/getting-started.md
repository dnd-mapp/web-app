# Getting started

## Prerequisites

| Tool    | Version |
|:--------|:--------|
| Node.js | 24.21.0 |
| pnpm    | 12.4.1  |

Both versions are pinned in [package.json](../package.json) through `devEngines`, so working with a different version stops with an error instead of a warning. pnpm is the only supported package manager, and running `npm` in this repository fails with `EBADDEVENGINES`. [mise](https://mise.jdx.dev) installs and switches between the pinned versions for you.

## Installing

```bash
pnpm install
```

Dependency versions live in catalogs in [pnpm-workspace.yaml](../pnpm-workspace.yaml) rather than in `package.json`; [Dependencies](dependencies.md) covers how to add, update and remove a package. The install also sets up the Git hooks described under [Commit hooks](commits.md#commit-hooks).

## Running the app

```bash
pnpm start
```

The dev server listens on `https://localhost.www.dndmapp.dev:4200`, serving over TLS with a certificate and key read from `.ssl/cert.pem` and `.ssl/key.pem`. Both are ignored by Git, so generate them once with [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
```

```bash
mkcert -cert-file .ssl/cert.pem -key-file .ssl/key.pem localhost.www.dndmapp.dev localhost 127.0.0.1 ::1
```

The first command adds the mkcert root certificate to the system trust store, so browsers accept the certificates it issues. The second issues a certificate that covers the `localhost.www.dndmapp.dev` hostname alongside the plain localhost names and addresses. The hostname is not a real DNS record, so point it at the loopback address in your hosts file (`/etc/hosts` on macOS and Linux, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```text
127.0.0.1 localhost.www.dndmapp.dev
::1       localhost.www.dndmapp.dev
```

The dev server accepts requests for `localhost` and the loopback addresses out of the box; `allowedHosts` in [angular.json](../angular.json) adds the custom hostname to that list. Until the hosts file is in place, `https://localhost:4200` works as a fallback.

## Building

```bash
pnpm run build
```

The production build lands in `dist/web-app`, with hashed file names, subresource integrity hashes on the emitted scripts and styles, and size budgets that warn at 500 kB and fail at 1 MB for the initial bundle. Run `pnpm run build -c development` for an unoptimized build with source maps. [Docker image](docker.md) describes how the build is packaged into the `dndmapp/web-app` image.
