---
name: canonical-validation
description: Select and run the repository's canonical validation commands for the areas changed, and report the results.
---

# Canonical Validation

Use this skill before a validated implementation or review handoff.

## Procedure

1. If the repository documents a canonical aggregate validation entrypoint, run
   it.
2. Otherwise determine which areas changed and run all applicable canonical Mise
   tasks from `mise.toml`:
   - Backend changes:
     - `mise run be:build`
     - `mise run be:test`
     - `mise run be:lint`
   - Frontend changes:
     - `mise run fe:build`
     - `mise run fe:test`
     - `mise run fe:lint`
     - `mise run fe:check`
   - Run both sets when both backend and frontend changed.
3. Do not hand off validated work until all applicable canonical tasks pass
   without errors.
4. Report the commands run and their outcomes in the handoff.

## Interpretation

- Native configuration rendering, image building, and release-archive assembly
  count as build validation when applicable.
- Prefer a tool's native parser, renderer, compiler, or build command over a
  bespoke structural validator.
- Add a custom structural validator only when native tooling cannot prove a
  required invariant.
- Follow the repository-wide Verification Guidelines in `AGENTS.md` when
  deciding what additional focused tests are required.
