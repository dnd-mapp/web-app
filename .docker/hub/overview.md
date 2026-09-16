# D&D Mapp web app

The web frontend for D&D Mapp, a companion for tabletop D&D: manage characters, roll dice, and build maps and lore. Then play out combat and exploration in a virtual tabletop powered by a custom game engine built on the game rules.

The image holds the compiled application, served by nginx. It contains no backend and takes no configuration: pull it, run it, and open it in a browser.

## Quick start

```bash
docker run --rm -p 4200:4200 dndmapp/web-app:latest
```

The app is then served at `http://localhost:4200`.

## Tags

| Tag           | What it points at                                                                                    |
|:--------------|:-----------------------------------------------------------------------------------------------------|
| `latest`      | The newest release.                                                                                  |
| `1.2.3`       | One release. It never moves.                                                                         |
| `1.2`         | The newest patch release of that minor version.                                                      |
| `1`           | The newest release of that major version.                                                            |
| `dev`         | The newest commit on `main` that changed the image. Unreleased, and it moves with every such commit. |
| `sha-<short>` | The image built from one `main` commit, named after the first seven characters of its hash.          |
| `pr-<N>`      | A preview of pull request `N`. It is deleted once the pull request closes.                           |

Releases within major version zero get no `0` tag, since semver promises no compatibility between them. Every release is announced as a [GitHub release](https://github.com/dnd-mapp/web-app/releases), with the changes since the previous release as its notes. Pin a release tag for anything that has to stay put; `latest` and `dev` move.

## Platforms

Every tag is a multi-platform image for `linux/amd64` and `linux/arm64`.

## What is inside

The image is built in two stages from the [Dockerfile](https://github.com/dnd-mapp/web-app/blob/main/Dockerfile) in the repository. A Node.js stage installs the dependencies from the lockfile and compiles the application. An nginx stage copies the result into `nginxinc/nginx-unprivileged`, the Alpine variant of the official nginx image that runs as an unprivileged user. Both base images are pinned by digest.

nginx runs as the `nginx` user (uid 101) and listens on port `4200`, so the container needs no root and no privileged port. Its server configuration:

- Hands every route that matches no file to the application, so deep links and page reloads work.
- Serves `index.html` with `Cache-Control: no-cache`, so a new deployment is picked up on the next load.
- Serves scripts and styles, whose file names carry a content hash, as immutable for a year.
- Compresses text responses with gzip.

## Running behind a reverse proxy

The container speaks plain HTTP. Terminate TLS in a reverse proxy in front of it and forward requests to port `4200`. With [Caddy](https://caddyserver.com), for example:

```text
app.example.com {
    reverse_proxy web-app:4200
}
```

## Provenance and SBOM

Every image carries a [SLSA provenance attestation](https://docs.docker.com/build/metadata/attestations/slsa-provenance/), which records the build definition and the source it was built from, and an [SBOM attestation](https://docs.docker.com/build/metadata/attestations/sbom/) listing the packages in the image. Both sit next to the image as attestation manifests:

```bash
docker buildx imagetools inspect dndmapp/web-app:latest
```

## Source

Source code, issues and the changelog live at [github.com/dnd-mapp/web-app](https://github.com/dnd-mapp/web-app). The project is licensed under the MIT License.
