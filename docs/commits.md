# Branches, commits and pull requests

## Branch names

```bash
git switch -c docs/branch-conventions main
```

A branch is named `<type>/<summary>`. The type is the [Conventional Commits](#commit-messages) type of the change the branch carries, so it matches the commits on it. A pull request that mixes types takes the type of the commit that gives it its purpose, so a `feat` branch may carry `test` and `docs` commits. The summary names the change in a few lower-case words joined by hyphens: `ci/auto-merge`, `docs/restructure-documentation`, `fix/dice-roller-modifier`. GitHub repeats the name in the merge commit, `Merge pull request #22 from dnd-mapp/ci/auto-merge`, so the history says what each merge brought in.

Every branch starts from `main` and carries one change, the one its pull request describes; see [Making a change](../CONTRIBUTING.md#making-a-change). The pull request that [cuts a release](releasing.md#cutting-a-release) is `chore/release-<version>`. A branch a tool created under another name gets renamed before the pull request opens: `git branch -m <type>/<summary>`. GitHub deletes the branch once its pull request has merged, so a follow-up gets a branch of its own. Renovate's branches are the exception: they are named `renovate/<update>`, and its commits carry the type; see [Automated updates](dependencies.md#automated-updates).

## Commit messages

```bash
pnpm exec commitlint --from origin/main
```

[commitlint](https://commitlint.js.org) checks commit messages against the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification, configured in [.commitlintrc.yaml](../.commitlintrc.yaml). The config extends [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional), the rule set that mirrors the specification. The subject line reads `<type>(<scope>)!: <summary>`, with the scope and the `!` marking a breaking change both optional. The types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style` and `test`, and the whole line stays within 100 characters. Write the summary in the imperative, starting lower-case and ending without a period: `chore: add commitlint with the conventional config`.

A blank line separates the subject from the body, which says what changed and why. config-conventional allows 100 columns in the body and the footer; this repository hard wraps both at 72, the width that keeps a message inside an 80 column terminal once `git log` has indented it by four. The subject keeps the 100-character limit, because it is one line and wrapping it is not an option. A blank line separates paragraphs, and `BREAKING CHANGE:` in a footer spells out an incompatible change. Messages Git writes itself, for merges, reverts, fixups and squashes, commitlint skips out of the box.

The command above lints every commit on the current branch that `origin/main` does not have, which is the set a pull request carries. Run `pnpm exec commitlint --last --verbose` to lint the commit that was written last. CI runs the same check over the commits a pull request adds, see [CI](ci.md#ci), and the `commit-msg` hook below checks a message before the commit exists.

## Commit signing

The `Default branch` ruleset requires every commit on `main` to carry a signature GitHub shows as verified, and so does the `Stable tags` ruleset for release tags; see [Reviews and merging](ci.md#reviews-and-merging). Set up [commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification) once, with an SSH or GPG key added to your GitHub account as a signing key, and turn on `commit.gpgsign` and `tag.gpgsign` so Git signs without being asked. An unsigned commit in a pull request blocks the merge, and rewriting it to add the signature is the fix.

## Commit hooks

```bash
pnpm exec lefthook run pre-commit
```

[lefthook](https://lefthook.dev) installs the hooks defined in [lefthook.yml](../lefthook.yml) as part of `pnpm install`, through its `postinstall` script; that is why `lefthook` is the one package allowed to run build scripts in [pnpm-workspace.yaml](../pnpm-workspace.yaml). The `pre-commit` hook has Prettier rewrite the staged files and stage the result, then runs ESLint, Stylelint and markdownlint-cli2 in parallel, each over the staged files of the types it covers. A finding from any of them stops the commit. It skips itself during merges and rebases, and the `postinstall` script does nothing when `CI` is set, so neither GitHub Actions nor the Docker build installs hooks. The command above runs the hook over whatever is staged without committing.

```bash
pnpm exec lefthook run commit-msg .git/COMMIT_EDITMSG
```

The `commit-msg` hook runs next, once the message has been written. It hands the file Git passes it to commitlint, so a message that does not follow [Conventional Commits](#commit-messages) stops the commit. The message is not lost: `git commit` leaves it in `.git/COMMIT_EDITMSG`, and `git commit -e -F .git/COMMIT_EDITMSG` reopens it for another try. The command above replays the hook over that same file.

A commit either hook rejects gets fixed rather than bypassed with `git commit --no-verify`. Neither hook is the gate, though: [CI](ci.md) runs the file checks over the whole repository regardless, so `pre-commit` only shortens the feedback loop.

A new `pre-commit` check goes in as a job with a `glob` limited to the file types it covers and `{staged_files}` as its input, so it only sees the staged files. A check that rewrites files also sets `stage_fixed: true`.

## Pull requests

```bash
gh pr create --web
```

A pull request opens against `main` and carries the one change its [branch](#branch-names) was made for; see [Making a change](../CONTRIBUTING.md#making-a-change). Its title is the subject line of that change, written as [Commit messages](#commit-messages) describes: `<type>(<scope>)!: <summary>`, in the imperative, starting lower-case, ending without a period, within 100 characters, with the type of the branch. A pull request with one commit takes that commit's subject; one with several gets a subject that names the change as a whole, `ci: run the end-to-end tests against the image behind Caddy`. GitHub writes the title into the body of the merge commit, under `Merge pull request #24 from dnd-mapp/ci/e2e-tests`, so the branch name and the title together are what `git log` shows for a merge.

The description follows [.github/pull_request_template.md](../.github/pull_request_template.md), which GitHub fills into every new pull request and `gh pr create --web` opens in the browser. It is written for the reviewer, and for whoever reads the pull request later to learn why the repository looks the way it does. The template has four sections, each introduced by a comment that says what goes there:

- **What** says what changes, area by area, in enough detail that a reviewer knows what to expect before opening the diff. A pull request that resolves an issue ends this section with `Closes #<N>`, so GitHub closes the issue on merge.
- **Why** gives the reason for the change and names the alternatives that were passed over.
- **Worth a look** points the reviewer at what deserves attention: a decision that could have gone another way, a rule that is new rather than recorded, a follow-up that is deliberately not part of this pull request.
- **Verification** says what was checked beyond the checks CI runs: the dev server exercised by hand, a workflow observed on its first run, a link checked to resolve. The CI checks themselves need no mention, since the pull request shows their result.

A section with nothing to say is removed rather than filled with "none". The description describes the last push, the one an approval covers, so a push that changes what the pull request does updates it as well.

The `Default branch` ruleset merges with a merge commit, so every commit on the branch lands on `main` as it is; see [Reviews and merging](ci.md#reviews-and-merging). A fix a review asks for is folded into the commit it corrects, or becomes a commit of its own when it is a change in its own right. A commit that only says it addresses review comments is neither. Pushing dismisses the approval either way, so the rewrite costs no extra round.

A pull request that is not ready for review opens as a draft. A draft gets the same checks and the same preview image, and marking it ready for review is what turns [auto-merge](ci.md#auto-merge) on. Since an approved pull request merges on its own, one that is open and ready is one its author is willing to see merged as it stands.
