# Hand-off Notes

## Current Repository State

- Date captured: 2026-06-09 KST.
- Default GitHub branch: `main`.
- Integration branch: `dev`.
- Latest merged PRs:
  - PR #37: Supabase client environment setup into `dev`.
  - PR #38: Supabase wine create/list flow into `dev`.
  - PR #39: `dev` merged into `main`.
- Completed and closed issues: #1, #2, #3, #5, #6, #7, #8.
- Intentionally still open: #4, because owner-scoped RLS is deferred while login-free prototyping is the priority.
- Next planned issue: #9, strengthen wine create form validation.

## Supabase State

The remote Supabase project already has `public.wines` created through SQL Editor. The app currently uses that existing schema instead of introducing an owner-scoped replacement schema.

The active schema is recorded in:

```text
supabase/migrations/20260609000000_existing_wines_inventory.sql
```

Important current constraints:

- The table uses columns such as `type`, `grape_variety`, `purchase_price`, `tasting_notes`, `is_cellar`, and `rating`.
- The current RLS policy allows anonymous read/write for rapid prototyping.
- Login and user-specific data isolation are not required for the immediate MVP flow.
- Do not apply an owner-scoped `owner_id = auth.uid()` migration until the product is ready to add login or user separation.

The reusable Supabase setup notes are in:

```text
docs/supabase.md
```

## Implemented MVP Flow

The current app supports:

- Vite environment configuration for Supabase URL and anon key.
- Supabase client initialization.
- Minimal wine domain types.
- `wineService.createWine`.
- `wineService.listWines`.
- A minimal wine create form.
- A Supabase-backed wine list with loading, empty, and error states.
- Manual verification of creating a wine and reading it back from Supabase.

The user confirmed Issue #8 manually: wine create/list works end to end.

## GitHub Issue Closing Policy

The repository default branch is `main`, so GitHub issue auto-close keywords only reliably close issues when they appear in a PR or commit that lands on `main`.

Current working pattern:

1. Feature PRs target `dev`.
2. Periodically merge `dev` into `main`.
3. To auto-close issues, include `Closes #...` lines in the `dev -> main` PR body.

If issues are completed through `dev` PRs but the `main` PR body does not include closing keywords, close those issues manually.

## Branch Naming Caveat

The original issue template used branch names like `dev/feat-example`. This conflicts with the existing local and remote `dev` branch because Git cannot have both `refs/heads/dev` and `refs/heads/dev/...`.

Use a non-conflicting branch name format for future work, such as:

```text
dev-feat-form-validation
dev-fix-wine-save-error
dev-chore-docs-sync
```

Base branch should still be `dev` unless the user explicitly changes the policy.

## Next Work

Start with Issue #9:

```text
feat: Strengthen wine create form validation
```

Recommended scope:

- Validate required `name` before calling Supabase.
- Validate numeric fields for `vintage`, `price`, and `rating`.
- Keep `rating` in the 1-5 range.
- Keep `vintage` in a reasonable range.
- Show clear inline or form-level messages before submit.
- Keep the form usable on mobile.

Before starting, update the local branch:

```bash
git checkout dev
git pull --ff-only
git checkout -b dev-feat-wine-form-validation
```

After implementation:

```bash
npm run build
npm run lint
git commit -m "feat: Strengthen wine create form validation" -m "Co-authored-by: Codex <codex@openai.com>"
git push -u origin dev-feat-wine-form-validation
gh pr create --base dev --head dev-feat-wine-form-validation
```

Commit messages should include:

```text
Co-authored-by: Codex <codex@openai.com>
```

## Outstanding Cleanup

- Issue #4 remains open by design. Revisit it when authentication or user-specific data isolation becomes a priority.
- There is likely a local stash named `wip: Korean GitHub text policy` containing updates to AGENTS.md and local skill files. Review it before future policy work:

```bash
git stash list
```

