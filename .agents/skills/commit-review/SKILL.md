---
name: commit-review
description: "Review repository changes before creating any commit. Use whenever the user asks Codex to commit, prepare a commit, write a commit message, stage changes, or verify changes before committing. Enforce English-only content, no emojis, small reviewable commits, and conventional commit prefixes: feat:, fix:, chore:, refactor:, test:."
---

# Commit Review

Use this skill immediately before any commit operation.

For cellar-teller, commits should stay aligned with the issue and PR type labels. For example, a `bug` issue and PR should normally use a `fix:` commit, while `feature`, `chore`, `refactor`, and `test` labels should map to `feat:`, `chore:`, `refactor:`, and `test:` commits respectively.

## Required Checks

1. Run `git status --short` to inspect modified, staged, untracked, and deleted files.
2. Run `git diff --stat` and inspect relevant `git diff` content before staging or committing.
3. If files are already staged, also inspect `git diff --cached --stat` and relevant `git diff --cached` content.
4. Identify whether the change is small and coherent. If multiple unrelated changes are present, do not combine them silently; commit only the coherent subset or ask the user how to split them.
5. Check user-facing text, commit message text, and generated issue or PR text for English-only content and no emojis.
6. Do not revert user changes. Work with the current tree and avoid destructive commands.

## Commit Scope Rules

- Prefer one behavioral purpose per commit.
- Avoid committing generated artifacts, dependency changes, or formatting churn unless they are required by the change.
- Keep commit messages concise and conventional.
- Allowed prefixes: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`.
- Do not use `docs:` in this skill unless the user is only committing documentation. The `sync-docs` skill owns pre-PR documentation commits.
- The branch should normally be a `dev/<type>-<short-slug>` branch that will target `dev` in the PR.

## Review Output

Before committing, summarize:

- Files that will be included.
- Any risky or surprising changes.
- Tests or checks run.
- The exact commit message.

## Commit Message Rules

Use this form:

```text
<prefix>: <English summary without emoji>
```

Choose prefixes by intent:

- `feat:` for new user-visible behavior.
- `fix:` for bug fixes.
- `chore:` for maintenance, tooling, config, or dependency work.
- `refactor:` for behavior-preserving code restructuring.
- `test:` for test-only changes.

If a good conventional prefix is unclear, inspect the diff again and choose the narrowest accurate prefix.
