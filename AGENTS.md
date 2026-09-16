# Agent guidelines

## Writing style

Applies to every piece of prose you produce: documentation, commit messages, pull request descriptions, code comments, and chat responses.

Write US English. Instead of an em dash, use the punctuation that fits the clause:

- Commas for short interruptions or clauses.
- Parentheses for asides.
- Colons for explanations, examples, or summaries.
- Semicolons to connect closely related independent clauses.
- Periods to split long sentences.

Rewrite the sentence when none of these fit, rather than falling back on double hyphens.

### Final reading pass

Read the finished text once more before handing it over, and fix what you find:

- **Sentence length.** Split every sentence of 40 words or more. Quotes from external sources stay verbatim.
- **Spelling.** Convert British spellings to US ones: `behaviour` to `behavior`, `initialise` to `initialize`, `colour` to `color`.
- **Em dashes.** Replace every `—` with an alternative from the list above.

The pass is done when all three checks have run over the whole text, not only the parts edited last.

### Markdown

Let prose flow: write each paragraph as one line and leave wrapping to the renderer. Commit message bodies are the one exception, hard wrapped at 72 columns as [Commit messages](docs/commits.md#commit-messages) describes.

Give every table an alignment indicator in its separator row:

| Setting | Scope  | Default |
|:--------|:------:|--------:|
| `theme` | global |    dark |

[markdownlint-cli2](.markdownlint-cli2.yaml) enforces these Markdown conventions in CI. Run `pnpm run lint-md` over any Markdown you edit and clear every finding before handing over.

## Documentation

[docs/](docs) is the source of truth for how the repository works, written for developers and agents alike. Read the page for the area a task touches before changing anything in it, and update that page when the change makes it stale:

- **Getting started** ([docs/getting-started.md](docs/getting-started.md)): installing, running the dev server (TLS certificates and the hosts entry), building.
- **Dependencies** ([docs/dependencies.md](docs/dependencies.md)): adding, updating or removing a package; a failing `pnpm install`.
- **Workspace** ([docs/workspace.md](docs/workspace.md)): the Angular workspace, the tsconfig files, areas, barrels, `@/<area>` aliases and file naming.
- **Testing** ([docs/testing.md](docs/testing.md)): specs, component harnesses, coverage, end-to-end tests and the compose stack.
- **Formatting and linting** ([docs/linting.md](docs/linting.md)): a Prettier, markdownlint, Stylelint or ESLint finding, or a change to one of their configs.
- **Branches, commits and pull requests** ([docs/commits.md](docs/commits.md)): naming a branch; writing a commit message; a hook that rejects a commit; titling and describing a pull request; the pull request template.
- **Docker image** ([docs/docker.md](docs/docker.md)): the Dockerfile, the bake file, nginx, base image updates and the Docker Hub texts under `.docker/hub`.
- **Continuous integration** ([docs/ci.md](docs/ci.md)): anything under `.github` other than the pull request template, including the conventions every workflow follows.
- **Releasing** ([docs/releasing.md](docs/releasing.md)): the changelog, cutting a release, `release.yml` and `scripts/release`.

[README.md](README.md) is the front page for someone who found the repository and [CONTRIBUTING.md](CONTRIBUTING.md) walks a contributor through a change. Both link to these pages and repeat nothing from them, so a fact belongs in one `docs/` page and nowhere else.

## Definition of done

A change is ready to hand over once every check under [Before opening a pull request](CONTRIBUTING.md#before-opening-a-pull-request) passes. Everything under [Making a change](CONTRIBUTING.md#making-a-change) holds as well: the specs, the changelog line, the commit messages, and the `docs/` page for the area still describing the repository as it now is.
