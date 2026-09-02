# Pull requests

Configuration for the `/pr` agent skill.

## Target branch

`main`

## Direct push to the target branch

Not allowed. The `main` branch has a repository ruleset that requires every change to land through a pull request, with the `CI` status check passing and signed commits. Work from a feature branch and open a pull request.

## Draft by default

`false`. Open pull requests ready for review unless a draft is requested.

## PR template

This repository has no `.github/PULL_REQUEST_TEMPLATE.md` of its own, and the organisation repository [`dnd-mapp/.github`](https://github.com/dnd-mapp/.github) has none either, so GitHub applies no template. Write the description from scratch.
