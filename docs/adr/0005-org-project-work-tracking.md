# Work is tracked on an org-level GitHub Project, and status and priority move off labels

## Context

[PR #7](https://github.com/dnd-mapp/web-app/pull/7) shipped the `status: *` and `priority: *` label sets and the `story.yml` issue form that auto-applies `status: triage`. Its decision doc (`docs/wayfinder/story-issue-template/tickets/decide-story-template-shape.md`) flagged one caveat. If `dnd-mapp` ever adopts a GitHub Project, status and priority should become Project single-select fields and the labels should retire. Otherwise the two drift and become a second source of truth.

`dnd-mapp` now spans more than one repository with issues enabled: `web-app` and `agent-skills` today, with more later. Per-repo labels cannot give a single view across them, and keeping the label taxonomy in sync by hand across repos is work nobody will do. [Story #8](https://github.com/dnd-mapp/web-app/issues/8) is the adoption, widened to cross-repo tracking.

Issue types are already the right shape. `Story` is an org-level object (`orgs/dnd-mapp/issue-types`), usable from every repo, and it is deliberately not touched here. Only the status and priority facets are in question.

## Decision

**Work across `dnd-mapp` is tracked on one org-level GitHub Project, [`dnd-mapp/projects/8`](https://github.com/orgs/dnd-mapp/projects/8) ("D&D Mapp", public). Status and priority are Project single-select fields. The `status: *` and `priority: *` labels are deleted.**

**Fields.**

- `Status`: `Triage`, `Ready`, `In progress`, `In review`, `Blocked`, `Needs info`, `Done`, listed in that order. The first six are ported from the `status: *` labels one-for-one. `Done` is new, because a Project needs an explicit terminal option where closing the issue used to carry that meaning. A GitHub Projects status option has only a name, a colour, and a description, with no category above it, so the option order is the only structure the board gets.
- `Priority`: `Critical`, `High`, `Medium`, `Low`, ported from the `priority: *` labels. `Medium` is the default, so a new issue starts at normal priority and triage only moves it when the issue is unusual.
- `Type`: the built-in read-only field, shown on the board. It mirrors the issue type. It is not set in the Project and cannot drift.
- No iteration, estimate, or date fields. They are cheap to add later if a real need appears, unlike removing a field that tools have started keying off.

**The board is issues only.** Pull requests are short-lived here and the pull request list already tracks them. A PR that closes an issue still moves that issue's card, through the issue-closed path, not by being on the board itself.

**Automation is moderate.** Built-in workflows handle the mechanical ends. Adding an item to the project sets `Status: Triage`, closing it sets `Status: Done`, reopening it sets `Status: Triage`, and linking a pull request sets `Status: In review`. The middle transitions (`Ready`, `In progress`, `Blocked`, `Needs info`) are deliberate manual moves, so status carries human intent. Closed issues auto-archive after two weeks of inactivity.

**Auto-add targets `web-app` only.** The `dnd-mapp` org is on the GitHub Free plan, which allows a single auto-add workflow per Project, targeting one repository. That workflow points at `web-app` and adds every issue there (`is:issue`). Issues in other repos reach the board through the issue-template `projects:` key or a manual add. Making the template carry that key for every repo is folded into the follow-up Story that moves `story.yml` to `dnd-mapp/.github`.

**`story.yml` stops auto-applying `status: triage`.** New issues get their status from the item-added workflow instead. The form keeps `type: Story`.

**Migration is a single pass, no parallel window.** The eight open `web-app` Stories and `agent-skills` #22 are added to the board at `Status: Triage`. Then the ten labels are deleted from `web-app`. Only nine issues, all in one state, so a transition window would buy nothing.

## Considered options

- **Keep the labels, add the Project as a view on top.** Rejected: this is exactly the dual-source-of-truth the PR #7 caveat warned about. An issue can be closed with `status: in progress` still stuck on it, and the label set has to be renamed in every repo by hand.
- **Repo-level Project on `web-app`.** Rejected: it cannot pull `agent-skills` issues into the same board without per-issue fiddling, which defeats the Story.
- **A `type: *`-style label mirror of status and priority for portability.** Rejected: no issue here transfers to a foreign org, and the `work-item-type-mechanism` research already ruled this pattern out for the type facet for the same reasons.
- **Full automation, with workflows driving every status transition.** Rejected: on a small team, `Ready` and `In progress` are signals a person sends, not events a system infers. Only the unambiguous edges are automated.
- **Iteration and estimate fields now.** Rejected: no fixed cadence, and the `story-work-item-fields` research already ruled out story points. Add on demand.
- **Move `story.yml` to `dnd-mapp/.github` as an org-wide default template in this change.** Deferred to a follow-up Story: it means deleting `web-app`'s own form and enabling issues on `.github` / `.github-private`, which is wider than this Story needs to be. That Story is also where the template gains a `projects:` key, which is how repos other than `web-app` get onto the board given the Free-plan auto-add cap.

## Consequences

- Status and priority are no longer visible in the plain issue list or via `label:` search. They live on the board instead. This is the accepted cost of a single source of truth.
- Repos with issues disabled (`wiki`, `.github`, `.github-private`) contribute nothing to the board until issues are enabled.
- Cross-repo board membership leans on the issue-template `projects:` key, not auto-add, because of the Free-plan one-workflow cap. An issue filed by API or `gh` in a repo other than `web-app`, before the org-wide template lands, has to be added to the board by hand. Lifting the org to a paid plan, or adding an `actions/add-to-project` workflow per repo, would remove that gap if it starts to bite.
- The Project's field and workflow configuration is org state, not in this repo. The exact settings and the migration steps live in the pull request that introduced this ADR and in the team's local wayfinder notes. Applying them needs a `dnd-mapp` owner with a `project`-scoped token.
- `agent-skills` #22 has no issue type. The board's `Type` field shows blank for it until the `Task` type is seeded by its own Story.
