# cellar-teller Agent Instructions

## Session Hand-off

- Before starting new work, read `docs/hand-off.md` if it exists.
- Use the hand-off document to confirm completed issues, current Supabase assumptions, branch caveats, and the next recommended issue.

## Branch Policy

- All implementation work must target the `dev` branch through pull requests.
- Do not open pull requests directly into `main` unless the user explicitly overrides this policy.
- GitHub Issues should include:
  - `Base Branch: dev`
  - `Working Branch: dev/<type>-<short-slug>`
- Working branches should be created from the latest `dev` branch.
- Preferred working branch prefixes:
  - `dev/feat-<short-slug>` for feature work.
  - `dev/fix-<short-slug>` for bug fixes.
  - `dev/chore-<short-slug>` for maintenance or tooling.
  - `dev/refactor-<short-slug>` for behavior-preserving refactors.
  - `dev/test-<short-slug>` for test-only work.

## Standard Issue-To-PR Flow

1. Start from the base branch:
   ```bash
   git checkout dev
   git pull --ff-only
   ```
2. Create or switch to the working branch named in the issue:
   ```bash
   git checkout -b dev/<type>-<short-slug>
   ```
3. After implementation and verification, open the PR into `dev`:
   ```bash
   gh pr create --base dev --head dev/<type>-<short-slug>
   ```

If the working branch already exists, use `git checkout dev/<type>-<short-slug>` instead of creating it.

## GitHub Text Policy
- Keep GitHub Issue, PR, commit, and comment text in English.
- Do not use emojis in GitHub Issue, PR, commit, or comment text.

## Commit & PR Policy
- 커밋과 PR은 한국어로 작성합니다.
