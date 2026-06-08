---
name: create-pr
description: Create structured GitHub pull requests from dev/<type>-<short-slug> branches to dev. Use when the user asks to create a PR, open a pull request, prepare a PR description, or submit completed work for review. Enforce English-only PR text, no emojis, synchronized documentation, small reviewable scope, and a checklist that includes mobile viewport verification.
---

# Create PR

Use this skill to create a reviewable pull request after implementation and documentation sync are complete.

For cellar-teller, PRs should normally be opened from the issue's `Working Branch` into the issue's `Base Branch`. Defaults are `Working Branch: dev/<type>-<short-slug>` and `Base Branch: dev`. PR labels should mirror the related issue labels, especially `bug` or `type: bug` for bug fixes and `milestone:<slug>` for planned work.

## Preconditions

1. Confirm the current branch with `git branch --show-current`.
2. Require source branch pattern `dev/<type>-<short-slug>`, such as `dev/feat-wine-create-form`, `dev/fix-cellar-drop-rollback`, `dev/chore-supabase-env`, or `dev/refactor-storage-service`. If the branch does not match, ask before proceeding unless the user explicitly provided another source branch.
3. Use the related issue's `Base Branch` as the target branch. If the issue does not specify one, use `dev` unless the user explicitly says otherwise.
4. Run `git status --short`. Do not create a PR with uncommitted changes unless the user explicitly requests a draft plan instead of actual PR creation.
5. Ensure `sync-docs` has been considered. If docs were updated, they should be committed. If no docs were needed, include the reason in the PR body.
6. Keep all PR text in English only. Do not use emojis.
7. Identify the related issue labels before creating the PR. Apply the same type label and milestone label to the PR where possible.

## PR Creation Workflow

1. Inspect recent commits with `git log --oneline <base-branch>..HEAD`.
2. Inspect changed files with `git diff --name-status <base-branch>...HEAD`.
3. Run relevant tests or checks when practical. If checks cannot be run, state why in the PR body.
4. Create the PR with `gh pr create --base <base-branch> --head <current-branch> --title "<title>" --body-file <file>` when GitHub CLI is available and authenticated.
5. If `gh` is unavailable or unauthenticated, prepare the PR title and body exactly and state that creation could not be completed.
6. Apply labels after PR creation when `gh` supports the repository labels. Use labels that mirror the issue, for example `milestone:cellar-dnd`, `feature`, `frontend`, and `mobile`.

## Title Rules

Use a concise conventional-style title in English without emoji:

```text
feat: Add cellar inventory filtering
fix: Correct wine note persistence
chore: Update project tooling
refactor: Simplify tasting note flow
test: Add cellar API coverage
```

Use `fix:` for bug PRs and apply the `bug` label. Use `feat:` with the `feature` label for new user-visible behavior.

## PR Body Template

Use this template:

```markdown
## Summary
- <Main change>
- <Supporting change>

## Scope
- <Changed area or feature>
- <Changed area or feature>

## Branches
- Base Branch: `<base-branch>`
- Working Branch: `<head-branch>`

## Labels
- <Expected PR labels, including milestone and type>

## Documentation
- <Docs synchronized: yes, paths changed>
- <Or docs synchronized: not needed, reason>

## Verification
- <Command run and result>
- <Manual check, if applicable>

## Checklist
- [ ] English-only text
- [ ] No emojis
- [ ] Documentation synchronized or explicitly not needed
- [ ] Mobile viewport checked
- [ ] Changes are small enough for review
```

## Reviewability Rules

- Do not hide large scope behind a short PR description.
- If the diff is too broad, recommend splitting before PR creation.
- Include mobile viewport verification for UI changes. If the change is not UI-related, mark the checklist item only after noting `Not UI-related` in verification.
- Use the issue's Base Branch as the PR base branch. If unspecified, use `dev` by default. Do not target `main` unless the user explicitly requests it.
- For PRs that fix bug issues, ensure both the source issue and PR carry the `bug` label.
