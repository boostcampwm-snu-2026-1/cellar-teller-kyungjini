---
name: issue-breakdown
description: Analyze high-level specifications such as docs/system-architecture.md or comprehensive change requests and decompose them into docs/implementation-plan.md without calling the GitHub API. Use for planning, roadmap decomposition, milestone grouping, and issue-ready task drafting.
---

# Issue Breakdown

Use this skill to turn broad project direction into an organized technical roadmap. This skill does not create, update, or close GitHub Issues. For physical GitHub Issue mutations, use `issue-management` only after an explicit user trigger.

## Workflow

1. Read `docs/system-architecture.md`.
2. Inspect the current repository state with `git status --short` and file discovery such as `rg --files`.
3. Cross-reference local docs, schema files, migrations, source files, and README content when the plan touches database behavior, persistence, APIs, routes, or workflows.
4. Group the work into high-level milestones. Milestones are planning groups, not issue-sized work.
5. Under each milestone, break the implementation into atomic, reviewable tasks that should fit under roughly 100-150 lines of production code when practical.
6. For every task, define Goal, Context, Scope, Base Branch, Working Branch, Labels, Acceptance Criteria, and Out of Scope.
7. Save the complete output into `docs/implementation-plan.md`.
8. Keep the document in English only and use no emojis.

## Task Format

Use this structure for each task in `docs/implementation-plan.md`:

```markdown
### <number>. <conventional-prefix> <task title>

## Goal
<One concise outcome.>

## Context
<Relevant repo and architecture findings. Cite file paths when useful.>

## Scope
- <Small implementation item>
- <Small implementation item>

## Base Branch
`dev`

## Working Branch
`dev/<type>-<short-slug>`

## Labels
- `milestone:<slug>`
- `<type label>`
- `<area label>`

## Acceptance Criteria
- <Observable result>
- <Test or verification expectation>

## Out of Scope
- <Explicitly excluded work>
```

## Sizing Rules

- Do not create one task per milestone.
- Split large work by boundary: schema, RLS, service, provider, UI shell, interaction, validation, tests, docs, or migration.
- Do not mix unrelated behavior in one task.
- Each task should have one outcome and one primary owner surface.
- Include tests or verification in the same task unless the test work is large enough to become its own task.

## Branch And Label Guidance

- The integration branch is `dev`.
- Every task should explicitly declare `Base Branch: dev`.
- Recommended working branch form is `dev/<type>-<short-slug>`.
- Use `dev/feat-<short-slug>` for feature work, not `dev/feature-<short-slug>`, unless the user explicitly requests the longer form.
- Future agents should start work by checking out the base branch and creating or checking out the working branch.
- Use conventional prefixes in task titles: `feat:`, `fix:`, `chore:`, `refactor:`, or `test:`.
- Use `feat:` with the repository's feature type label, preferably `type: feature` when available or `feature` otherwise.
- Use `fix:` with the repository's bug type label, preferably `type: bug` when available or `bug` otherwise.
- Use `chore:` with the repository's chore type label, preferably `type: chore` when available or `chore` otherwise.
- Use `refactor:` with the repository's refactor type label, preferably `type: refactor` when available or `refactor` otherwise.
- Use `test:` with the repository's test type label, preferably `type: test` when available or `test` otherwise.
- Use `docs` for documentation-only work.
- Add area labels where useful: `frontend`, `backend`, `database`, `mobile`, `ai`.
- Add exactly one milestone label such as `milestone:app-shell`, `milestone:cellar-dnd`, or `milestone:recommendation-mock`.

## cellar-teller Scope Notes

- MVP wine input is manual only.
- Photo capture, photo upload, and AI-assisted wine draft are backlog work.
- LLM API use is limited to drinking recommendation.
- Recommendation planning must include both mock provider and real LLM provider tasks.
