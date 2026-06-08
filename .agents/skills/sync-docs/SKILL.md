---
name: sync-docs
description: "Synchronize README.md and docs before creating a pull request. Use right before PR creation, after implementation is complete, or when the user asks to prevent documentation rot. Scan modified files, update README.md or files under docs/ when behavior, setup, API, schema, workflow, or user-facing usage changed, then commit documentation updates with a docs: Update... message."
---

# Sync Docs

Use this skill immediately before creating a pull request.

## Workflow

1. Run `git status --short` and inspect modified files.
2. Inspect relevant diffs with `git diff --stat`, `git diff`, and `git diff --cached` if staged changes exist.
3. Decide whether documentation needs updates. Documentation is required when changes affect setup, commands, environment variables, API behavior, database schema, migrations, user workflows, UI behavior, deployment, or project conventions.
4. Search existing docs first: `README.md`, `docs/`, and nearby feature documentation. Update existing docs instead of creating new files unless the repo already organizes docs that way.
5. Keep documentation concise, English-only, and emoji-free.
6. Run relevant checks when practical.
7. Commit only documentation changes with a message beginning `docs: Update...`.

## Documentation Targets

- Use `README.md` for project-wide setup, commands, architecture overview, and common workflows.
- Use files under `docs/` for detailed feature, database, API, deployment, or operational notes.
- If no docs update is needed, state why in the PR preparation notes.

## Commit Rules

- Documentation sync must be its own commit when code changes are already committed.
- Use this exact message shape: `docs: Update <topic> documentation`.
- Do not include code changes in the docs commit unless a documentation build requires a tiny generated metadata update.
- Do not create a docs commit when there are no documentation changes.

## Final Note For PRs

Record one of these for the later PR checklist:

- `Documentation synchronized: yes`, with changed doc paths.
- `Documentation synchronized: not needed`, with a short reason.
