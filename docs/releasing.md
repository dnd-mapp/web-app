# Releasing

## Changelog

[CHANGELOG.md](../CHANGELOG.md) follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and records what a user of the application notices: a page, a feature, a changed behavior, a fix. Such a change lands as one line under `## [Unreleased]`, in the category it belongs to (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed` or `Security`), written for that user rather than for a developer. Tooling, tests, CI, the Docker image and documentation leave the file untouched. Cutting a release renames the section to the version and its date, opens a new empty `[Unreleased]` section above it and adds the link for the version at the bottom. The release workflow refuses a tag whose version has no such section and publishes its contents as the release notes.

## Cutting a release

A release starts with one pull request that:

1. Sets `version` in [package.json](../package.json) to the new version.
2. Sets the `org.opencontainers.image.version` label in [docker-bake.hcl](../docker-bake.hcl) to that version with the `-dev` suffix the file keeps for local builds.
3. Renames the `[Unreleased]` section of [CHANGELOG.md](../CHANGELOG.md) to `## [<version>] - <today>` and opens a new empty `[Unreleased]` section above it for the next change. The links at the bottom follow: `[Unreleased]` compares the new tag with `HEAD`, and the version compares its tag with the previous one (the first release links to its tag instead).

Once it has merged, tag the merge commit and push the tag:

```bash
git tag v1.2.3 && git push origin v1.2.3
```

The tag has to be `v<major>.<minor>.<patch>` with plain numbers: no pre-release or build suffix and no leading zero. The `Stable tags` ruleset lets only the Maintain role push such a tag and requires it to be signed, so the release is cut by a maintainer with [commit signing](commits.md#commit-signing) set up. The ruleset also stops the tag from being deleted or moved once pushed, and a maintainer leaves it alone as well. The image tags and the GitHub release already point at that commit, so a release that turns out wrong gets a new patch version rather than a retag. The release workflow does the rest and publishes `dndmapp/web-app:1.2.3`, `:1.2`, `:1` and `:latest`, then a [GitHub release](https://github.com/dnd-mapp/web-app/releases) named `Release v1.2.3` with the changelog section as its notes.

## The release workflow

[release.yml](../.github/workflows/release.yml) runs on a `push` of a tag matching `v<major>.<minor>.<patch>`, through three jobs. The trigger glob accepts nothing with a pre-release or build suffix, but it cannot reject a leading zero, so the first job starts by checking the tag against the strict pattern.

`Verify the release` checks the tagged commit out, runs the [setup-workspace](ci.md#setup-workspace) action for the pinned Node.js, and then runs four scripts from [scripts/release](../scripts/release), one step each. Each script reports a failure as a workflow annotation, sets its own step output and can be run by hand before a tag is pushed; `workflow.js` there holds what they share.

- `parse-tag.js` rejects anything but strict semver and sets the version output.
- `check-package-version.js` requires `version` in `package.json` to equal the version the tag names.
- `check-bake-version.js` requires the `org.opencontainers.image.version` label in `docker-bake.hcl` to equal it as well, with or without the `-dev` suffix. It reads the label from the resolved configuration through `docker buildx bake --print` rather than from the file's text.
- `release-notes.js` requires `CHANGELOG.md` to have a heading `## [1.2.3] - YYYY-MM-DD` and prints the lines between it and the next version heading or the link definitions at the bottom. It fails on an empty section and sets the notes output, through a heredoc with a random delimiter since the notes span several lines.

`Build image` needs that job and calls the [build-image](ci.md#build-image) action with `type=semver,pattern={{version}}`, `type=semver,pattern={{major}}.{{minor}}` and `type=semver,pattern={{major}}`, so the image lands as `dndmapp/web-app:1.2.3`, `:1.2` and `:1`. The major rule carries `enable=${{ !startsWith(github.ref, 'refs/tags/v0.') }}`, so a `0.y.z` release gets no `0` tag: semver promises no compatibility within major version zero, and a tag that cannot promise it would mislead. `docker/metadata-action` adds `latest` on its own for a semver tag, the one case its default `latest=auto` flavor covers, and the version pattern comes first so the action uses it as the image's version label.

`Create the GitHub release` needs both jobs and runs [softprops/action-gh-release](https://github.com/softprops/action-gh-release) with `Release <tag>` as the name and the notes as the body, once the image the release announces is on Docker Hub. It is the one job with `contents: write`, and it runs nothing but that action, without a checkout; the build runs the Dockerfile and every dependency under `contents: read`. The workflow token is enough, since no workflow listens for the `release` event.

The checks are not run again: the tagged commit is a `main` commit that [push-main.yml](ci.md#pushes-to-main) already checked. All three jobs use fixed concurrency groups without cancelling, so releases run one at a time in push order and `latest` ends up on the newest tag.
