# File ticket

Configuration for the `/file-ticket` agent skill.

## Target repo

`dnd-mapp/web-app`

## Default labels

None. The `status: *` and `priority: *` labels do not exist. Status and priority are fields on the [D&D Mapp project](https://github.com/orgs/dnd-mapp/projects/8), not labels. See [ADR 0005](../adr/0005-org-project-work-tracking.md).

## Tracker

`github`

## Project board

Every issue is added to the org-level [D&D Mapp project](https://github.com/orgs/dnd-mapp/projects/8) automatically and lands at `Status: Triage`. Do not set `Status` or `Priority` when filing. They are decided at triage.
