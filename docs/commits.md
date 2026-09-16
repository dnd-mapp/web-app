# Commits

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
