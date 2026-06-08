---
name: issue-management
description: Execute GitHub Issue mutations using gh or the GitHub API after explicit user approval. Use for bulk uploading approved implementation plans, creating ad-hoc bug or task issues, updating issues, or closing outdated issues during scope changes.
---

# Issue Management

Use this skill only when the user explicitly asks to create, update, or close GitHub Issues. This skill performs physical GitHub mutations through `gh` or the GitHub API.

All content sent to GitHub must be English-only and contain no emojis.

## Preconditions

1. Confirm the user explicitly requested a GitHub Issue mutation.
2. Inspect repository state with `git status --short`.
3. Check GitHub CLI availability and authentication with `gh --version` and `gh auth status`.
4. Verify the target repository with `gh repo view --json nameWithOwner`.
5. If labels are required, inspect available labels with `gh label list`.
6. Prefer existing `type: <name>` labels when present, such as `type: bug`. If the repo instead uses plain labels such as `bug`, use those. If neither exists, ask before creating labels unless the user already authorized label setup.

## Scenario 1: Bulk Upload From Plan

Trigger: the user approves `docs/implementation-plan.md` and asks to upload issues.

Workflow:

1. Read `docs/implementation-plan.md`.
2. Parse structured tasks from the plan.
3. For each task, extract title, goal, context, scope, base branch, working branch, labels, acceptance criteria, and out of scope.
4. Create one GitHub Issue per atomic task. Do not create one issue per milestone.
5. Attach the mapped milestone, type, and area labels.
6. If GitHub Milestones already exist and match the plan, use them. Otherwise use `milestone:<slug>` labels.
7. Ensure the issue body includes explicit branch instructions:
   - `Base Branch: dev`
   - `Working Branch: dev/<type>-<short-slug>`
8. Report created issue numbers, titles, base branches, and working branches.

Command pattern:

```bash
gh issue create --title "<title>" --body-file <body-file> --label "<label>" --label "<label>"
```

## Scenario 2: Ad-hoc Bug Or Task Creation

Trigger: the user reports a runtime bug or requests a quick enhancement and asks to create an issue.

Workflow:

1. Create a single issue immediately.
2. Skip `docs/implementation-plan.md` unless the user asks for planning first.
3. For bugs, use a `fix:` title and attach `type: bug` when available, or `bug` otherwise.
4. For maintenance, use `chore:` or `refactor:` and attach the matching type label.
5. Add area labels such as `frontend`, `backend`, `database`, `mobile`, or `ai` when clear.
6. Include `Base Branch: dev` and a working branch using `dev/<type>-<short-slug>`.

Ad-hoc issue body:

```markdown
## Goal
<One concise outcome.>

## Context
<Runtime report, observed behavior, or requested enhancement.>

## Scope
- <Small implementation item>

## Base Branch
`dev`

## Working Branch
`dev/<type>-<short-slug>`

## Labels
- `<type label>`
- `<area label>`

## Acceptance Criteria
- <Observable result>
- <Verification expectation>

## Out of Scope
- <Explicitly excluded work>
```

## Scenario 3: Change Control And Cleanup

Trigger: the user changes project scope, replaces a strategy, or asks to close outdated work.

Workflow:

1. Identify affected open issues with `gh issue list` and targeted searches.
2. Summarize the candidate issues before closing when more than one issue is affected.
3. Close outdated issues with reason `not_planned`.
4. Reference the new strategy in the close comment.
5. If replacement work is needed, create new issues from the approved plan or from the user's explicit request.

Command pattern:

```bash
gh issue close <number> --reason "not_planned" --comment "<English close note without emoji>"
```

## Label Policy

- Planned implementation: include one `milestone:<slug>` label plus type and area labels.
- Bug issue: `fix:` title and `type: bug` label when available, or `bug` otherwise.
- Feature issue: `feat:` title and `type: feature` label when available, or `feature` otherwise.
- Maintenance issue: `chore:` title and `type: chore` label when available, or `chore` otherwise.
- Refactor issue: `refactor:` title and `type: refactor` label when available, or `refactor` otherwise.
- Test issue: `test:` title and `type: test` label when available, or `test` otherwise.
- Documentation-only issue: `docs` label, with `chore:` or `docs:` title depending on repo convention.
- AI recommendation work: include `ai`.
- Mobile UI work: include `mobile`.

## Branch Policy

- Every issue created by this skill must include both `Base Branch` and `Working Branch` sections.
- Default base branch is `dev`.
- Default working branch format is `dev/<type>-<short-slug>`.
- Use `dev/feat-<short-slug>` for feature work, `dev/fix-<short-slug>` for bug fixes, `dev/chore-<short-slug>` for maintenance, `dev/refactor-<short-slug>` for refactors, and `dev/test-<short-slug>` for test work.
- The issue body should make the intended agent workflow clear:
  1. `git checkout dev`
  2. `git pull --ff-only`
  3. `git checkout -b dev/<type>-<short-slug>`
- If the working branch already exists, the agent should use `git checkout dev/<type>-<short-slug>` instead of creating it.
- PRs for these issues should target `dev` with `gh pr create --base dev --head dev/<type>-<short-slug>`.

## Safety Rules

- Do not mutate GitHub Issues from a draft implementation plan unless the user explicitly approves the plan and asks for upload.
- Do not close multiple issues without first identifying the affected issue numbers unless the user provided exact issue numbers.
- Do not send Korean text or emojis to GitHub Issues, PRs, comments, or labels.
- If `gh` is unavailable or unauthenticated, provide the exact commands or issue payloads and state that mutation could not be completed.
