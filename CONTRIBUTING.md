# Contributing

Thanks for helping build the D&D Mapp web app. This page walks through a change from checkout to merge; the pages under [docs/](docs) hold the details it links to.

## Setting up

Install the Node.js and pnpm versions listed under [Prerequisites](docs/getting-started.md#prerequisites), then run `pnpm install`. The install also puts the [Git hooks](docs/commits.md#commit-hooks) in place, which format and lint what you stage and check each commit message. Running the dev server needs TLS certificates and a hosts entry; [Running the app](docs/getting-started.md#running-the-app) covers both.

## Making a change

Work on a branch off `main`, named as [Branch names](docs/commits.md#branch-names) describes, and keep a pull request to one change, so it reads and reviews as one thing. Along the way:

- **Tests.** Every component gets a spec that drives it through a component harness, and a flow that needs the served application gets an end-to-end test; [Testing](docs/testing.md) says which is which. Coverage below 80% fails CI.
- **Changelog.** A change a user of the application notices gets one line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md), written for that user; [Changelog](docs/releasing.md#changelog) lists the categories. Tooling, tests, CI, the Docker image and documentation add no line.
- **Documentation.** When a change makes a page under `docs/` stale, update the page in the same pull request.
- **Commit messages.** Every message follows [Conventional Commits](docs/commits.md#commit-messages). A commit a hook rejects gets fixed rather than bypassed.

## Before opening a pull request

A change is ready once all of these pass locally:

```bash
pnpm run format-check && pnpm run lint-md && pnpm run lint-styles && pnpm run lint-ts && pnpm run lint-js && pnpm run build && pnpm run test-ci
```

```bash
docker build --check .
```

```bash
pnpm run e2e
```

```bash
pnpm exec commitlint --from origin/main
```

CI runs exactly these checks, described under [run-checks](docs/ci.md#run-checks). It runs the end-to-end tests against the pull request's Docker image rather than the dev server, so a change to the served app is only known to pass once that image is built and served.

## Pull requests

Open the pull request against `main`. [Continuous integration](docs/ci.md#pull-requests) then runs the checks as a single `CI` check, publishes a preview image as `dndmapp/web-app:pr-<N>` when the change touches what the image is built from, and runs the end-to-end tests against it. GitHub requests a review from the code owners. The pull request merges on its own once one of them has approved the last push and the checks have passed; there is no merge queue and no button to press. Pushing to the branch dismisses the approval, so it takes a fresh one. A draft pull request is left alone until it is marked ready for review.

A pull request from a fork cannot read the repository's credentials, so it gets no preview image, no end-to-end run and no auto-merge; a maintainer runs those and merges it by hand.

## Reporting a bug

Open an [issue](https://github.com/dnd-mapp/web-app/issues) with what you did, what you expected and what happened instead. A pull request with a failing test that shows the bug is the most useful report.

## Releases

Maintainers cut releases as [Releasing](docs/releasing.md#cutting-a-release) describes: one pull request that bumps the version and dates the changelog section, then a tag on the merge commit.
