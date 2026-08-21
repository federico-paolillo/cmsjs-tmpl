# Use configured agent profiles for task execution

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Maintain this document in accordance with `.agents/docs/PLANS.md` from the repository root.

## Purpose / Big Picture

After this change, the task workflow delegates planning, implementation, and independent review to the named agent profiles in `.codex/agents/`. Each profile owns its model and reasoning configuration, so the workflow never overrides those choices when starting a role session. Every selected task also leaves a durable execution plan under `.agents/plans/`, allowing a later agent to resume from the repository rather than reconstructing decisions from conversation history.

The behavior is observable by reading the configured `planner`, `worker`, and `reviewer` sequence in `.agents/skills/implement-task/SKILL.md`, parsing the four agent TOML files, and running `codex doctor --json` without a malformed-profile warning.

## Progress

- [x] (2026-08-21 12:14Z) Read the repository instructions, workflow skill, validation skill, PLANS.md, all current agent profiles, and the dirty worktree.
- [x] (2026-08-21 12:14Z) Obtain Coordinator approval for the bounded implementation plan.
- [x] (2026-08-21 12:14Z) Update the workflow skill and Coordinator, Planner, Worker, and Reviewer profiles.
- [x] (2026-08-21 12:14Z) Correct the single PLANS.md sentence that conflicts with Coordinator-only commit authority.
- [x] (2026-08-21 12:14Z) Run targeted validation and record the evidence here.
- [x] (2026-08-21 12:14Z) Receive a Reviewer finding that final review bookkeeping lacked an owner and obtain `APPROVED` + `DESIGN_READY` for the bounded Coordinator finalization protocol.
- [x] (2026-08-21 12:24Z) Apply and validate the bounded finalization-protocol remediation.
- [x] (2026-08-21 12:24Z) Receive bounded Reviewer findings about stopped-state ownership and incomplete ExecPlan coverage, with `APPROVED` + `DESIGN_READY` for factual Coordinator stopped-state bookkeeping.
- [x] (2026-08-21 12:29Z) Apply and validate the stopped-state protocol and comprehensive ExecPlan coverage.
- [x] (2026-08-21 12:31Z) Receive final `APPROVED` + `REVIEW_READY` after two remediation cycles and complete the retrospective.

## Surprises & Discoveries

- Observation: `.codex/agents/planner.toml` exists but is empty, and Codex ignores it as malformed.
  Evidence: Before implementation, `codex doctor --json` reported `planner.toml must define developer_instructions`.
- Observation: Python is installed through Mise but is not activated by `mise.toml`.
  Evidence: `mise exec -- python` failed with `python is installed but not activated`; the non-mutating form for validation is `mise exec python -- python`.
- Observation: The existing uncommitted workflow edit already removes the Worker's suggested effort from `implement-task`.
  Evidence: The pre-implementation diff changes `fresh high-effort Worker` to `fresh Worker`; this task must preserve and extend that edit.
- Observation: The skill validator needs PyYAML, which is absent from the repository's Mise-managed Python.
  Evidence: Direct execution failed with `ModuleNotFoundError: No module named 'yaml'`; `mise exec python -- uv run --with pyyaml ...` passed without changing repository dependencies.
- Observation: A successful `codex doctor --json` omits startup-warning fields instead of returning a zero-valued counter.
  Evidence: After populating Planner, `config.load` reported `status: ok` and its details contained no warning key.
- Observation: The original role boundaries left no actor authorized to close the ExecPlan after the final read-only review.
  Evidence: Reviewer could not edit files, Worker had already handed off for independent review, and Coordinator had no explicit post-review plan-bookkeeping authority.
- Observation: The first remediation still left no actor authorized to preserve a truthful living ExecPlan when a blocker or push failure stops the workflow.
  Evidence: Coordinator could finalize only after approval, while the role producing `BLOCKED` could not reliably record later Coordinator actions or a failed push.
- Observation: The bootstrap ExecPlan described the main role sequence but did not include the post-review finalization protocol in Plan of Work or its acceptance checks.
  Evidence: The protocol appeared only in living sections added during remediation, so the plan was not comprehensively self-contained as required by PLANS.md.

## Decision Log

- Decision: Use exact configured profiles in the fixed order `planner`, `worker`, then `reviewer`, without runtime model or reasoning overrides.
  Rationale: Role configuration belongs to `.codex/agents/*.toml`; keeping it there prevents the workflow and profile settings from drifting.
  Date/Author: 2026-08-21 / User and Coordinator
- Decision: Give every selected task one stable lowercase kebab-case ExecPlan path derived from its queue label or direct-task commit title.
  Rationale: A deterministic durable path makes resumption possible without conversation history.
  Date/Author: 2026-08-21 / User and Coordinator
- Decision: Amend only the commit-authority sentence in PLANS.md.
  Rationale: PLANS.md currently tells every implementing agent to commit frequently, while the approved workflow reserves commits for the Coordinator. The narrower workflow must remain enforceable without rewriting the planning standard.
  Date/Author: 2026-08-21 / Coordinator
- Decision: Run the unchanged skill validator with ephemeral PyYAML through uv.
  Rationale: This validates the skill with its supplied checker without adding a project dependency or modifying the user's Python installation.
  Date/Author: 2026-08-21 / Worker
- Decision: Give Coordinator narrow ExecPlan bookkeeping authority only after `APPROVED` and `REVIEW_READY`.
  Rationale: The Reviewer approved this ownership protocol through the required read-only design checkpoint. It closes the living document without weakening independent review or letting Coordinator change implementation substance.
  Date/Author: 2026-08-21 / Reviewer and Coordinator
- Decision: Permit Coordinator to record factual stopped state after `BLOCKED` or push failure when the plan update is safely isolatable.
  Rationale: The Reviewer approved this narrow ownership protocol through a read-only design checkpoint. It preserves resumability without implying approval, completion, or authority for substantive edits.
  Date/Author: 2026-08-21 / Reviewer and Coordinator

## Outcomes & Retrospective

The implementation and both bounded remediations pass targeted validation. The workflow now covers post-approval finalization and factual stopped-state bookkeeping while preserving the read-only Reviewer, substantive-edit prohibitions, blocker semantics, and Coordinator-only commit authority. Final independent review returned `APPROVED` + `REVIEW_READY`; no findings remain.

## Context and Orientation

`.agents/skills/implement-task/SKILL.md` defines the repository's complete direct-task and Markdown-queue workflow. The configured Coordinator follows that skill and starts role sessions through whatever monitorable orchestration mechanism is available. An orchestration mechanism is the environment facility that starts a role session, reports its state, and preserves its transcript; this repository intentionally does not prescribe a particular product or require a subagent implementation.

`.codex/agents/coordinator.toml`, `.codex/agents/planner.toml`, `.codex/agents/worker.toml`, and `.codex/agents/reviewer.toml` configure the four roles. A completion signal is the exact final transcript line by which a role hands control back to the Coordinator. The Planner owns `PLAN_READY`, the Worker owns `WORK_READY`, the Reviewer owns `REVIEW_READY` and `DESIGN_READY`, and the Coordinator owns `SESSION_COMPLETE`. Every role can instead return `BLOCKED: <reason>`.

An ExecPlan is the durable, self-contained implementation specification governed by `.agents/docs/PLANS.md`. Every task receives one file under `.agents/plans/`. The Planner creates it before approval; the Worker maintains its living sections while implementing or remediating; the Reviewer verifies that it accurately describes the resulting work; and the Coordinator includes it in the task commit.

The worktree contains extensive unrelated application changes. This task may modify only the workflow skill, the four profiles, PLANS.md's contradictory commit sentence, `.agents/plans/.gitkeep`, and this ExecPlan. The existing uncommitted removal of the Worker effort hint in `implement-task` is task-related and must be preserved.

## Plan of Work

First, revise `implement-task` so the configured Coordinator starts fresh sessions using the named `planner`, `worker`, and `reviewer` profiles in that order. The Planner must read PLANS.md fully, inspect the task and worktree, and create the task's ExecPlan. The Coordinator must reject a planning handoff when the file is absent or nonconforming, reuse the Planner for bounded revisions, authorize a fresh Worker only after approval, and reuse the Worker and Reviewer for remediation and design-checkpoint rounds. The existing five-round caps and generic 20-minute quiet-window policy remain. No instruction may suggest a model, reasoning effort, named orchestration product, or mandatory subagent mechanism.

Next, make the agent profiles authoritative for role configuration. Set Coordinator, Planner, and Reviewer to `gpt-5.6-sol` with high reasoning effort, and Worker to `gpt-5.6-terra` with high reasoning effort. Populate the empty Planner profile with planning-only authority. Remove plan creation and `PLAN_READY` from the Worker. Require the Worker to execute and maintain the approved ExecPlan. Require the Reviewer to compare the implementation and validation evidence with both the authoritative task and the living ExecPlan. Keep each profile limited to its role-specific authority, duties, prohibitions, and signals; shared engineering rules remain in AGENTS.md.

Finally, make the approved minimal correction in PLANS.md so commit frequency is conditional on the governing workflow granting commit authority. Do not otherwise rewrite PLANS.md. Keep `.agents/plans/.gitkeep` unchanged so the workflow support directory remains explicit.

After normal review, permit Coordinator to edit the ExecPlan only when Reviewer returns both `APPROVED` and `REVIEW_READY`. That edit records review evidence, closes review-related Progress, finalizes Outcomes & Retrospective, and appends the required revision note before staging. `CHANGES_REQUESTED` must route to the same Worker and Reviewer without finalization. Any change to implementation scope, technical decisions, validation claims, authoritative requirements, or implementation files remains outside Coordinator authority.

When `BLOCKED: <reason>` or a push failure stops the workflow, permit Coordinator to record only the factual stop reason and evidence, current progress, required next decision or prerequisite, and required revision note when the update can be isolated safely. This exception must not close the task, imply approval or completion, or authorize substantive changes. If isolation is unsafe, the plan remains unchanged and the ordinary blocker handoff reports the failure.

## Concrete Steps

Work from `/Users/federico.paolillo/src/cmsjs-tmpl`.

Edit the workflow files described above with focused patches. After each stopping point, update `Progress`, `Surprises & Discoveries`, and `Decision Log` when the actual work differs from this specification.

Validate the skill structure with:

    mise exec python -- uv run --with pyyaml python /Users/federico.paolillo/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/implement-task

Expect a success message and exit status zero.

Parse and semantically inspect the profiles with a short inline Python program executed as:

    mise exec python -- python - <<'PY'
    # Load .codex/agents/*.toml with tomllib and assert the required contract.
    PY

The program must assert all four names and non-empty instructions, exact model and reasoning settings, signal ownership, configured role ordering, absence of runtime effort/model suggestions in `implement-task` and Coordinator instructions, and absence of product-specific orchestration or mandatory-subagent wording.

Run:

    codex doctor --json

Expect no startup warning naming any of the four modified profiles. Inspect this ExecPlan against every mandatory section in `.agents/docs/PLANS.md`, then inspect `git diff` and `git status --short` to confirm unrelated changes remain untouched.

## Validation and Acceptance

Acceptance requires all targeted commands to exit zero. `quick_validate.py` must accept the `implement-task` skill. Python's standard `tomllib` must parse all four profiles and prove their exact models, high reasoning effort, role-specific completion signals, and required instructions. The workflow and Coordinator must select configured role names without containing an orchestration-time model or reasoning override. `codex doctor --json` must contain no malformed agent-role warning.

A manual semantic read must show that each task always receives a conforming ExecPlan before implementation, that Planner revisions and Worker remediation reuse the correct task sessions, that Reviewer checks the implementation and ExecPlan, and that the generic quiet window and cycle caps remain. Backend and frontend validation do not apply because no application source or runtime configuration is changed.

The semantic assertions must also prove that post-review finalization requires both `APPROVED` and `REVIEW_READY`, that `CHANGES_REQUESTED` routes to remediation without finalization, and that finalization cannot change implementation scope, technical decisions, validation claims, authoritative requirements, or implementation files. They must prove separately that `BLOCKED: <reason>` and push failure allow only safely isolated factual stopped-state bookkeeping, do not imply approval or completion, preserve the blocker handoff when isolation fails, and carry the same substantive-edit prohibitions. Reviewer must remain read-only and Coordinator must remain the only role authorized to commit and push.

## Idempotence and Recovery

All edits are ordinary text changes and can be applied or validated repeatedly. Validation writes only temporary or Codex diagnostic state, not tracked application files. If a targeted file changes concurrently, stop before overwriting it and compare the new content with this plan. Do not reset, restore, stage, commit, or push; the Coordinator owns those operations after independent approval.

## Artifacts and Notes

The baseline diagnostic eliminated was:

    Ignoring malformed agent role definition: agent role file at .../.codex/agents/planner.toml must define `developer_instructions`

The targeted validation results were:

    Skill is valid!
    TOML and semantic workflow assertions passed
    TOML, role, signal, finalization, orchestration, and ExecPlan assertions passed
    TOML, signals, finalization, stopped-state, orchestration, and ExecPlan assertions passed
    codex doctor: config.load=ok, no startup-warning fields

The pre-existing task-related diff to preserve removes `high-effort` from the Worker-session instruction. All application-code modifications, deletions, and untracked files outside the workflow paths listed in this plan belong to other work and must remain unchanged.

## Interfaces and Dependencies

No runtime library or dependency is added. The public repository workflow interface consists of the named profiles `coordinator`, `planner`, `worker`, and `reviewer`; top-level profile keys `model` and `model_reasoning_effort`; durable ExecPlans at `.agents/plans/<slug>.md`; and the exact completion signals described in Context and Orientation.

For a queue task, derive `<slug>` from the complete top-level checkbox label, including its identifier when present. For a direct task, derive it from the Coordinator's imperative commit title. Lowercase the source, replace every run outside `a-z` and `0-9` with one hyphen, and trim leading or trailing hyphens. Reuse an existing plan for the same selected task rather than deriving a second path.

Revision note (2026-08-21): Created this ExecPlan after Coordinator approval to bootstrap the mandatory durable-plan workflow and record the implementation baseline.

Revision note (2026-08-21): Updated progress, discoveries, decisions, outcomes, and validation evidence after completing the approved implementation.

Revision note (2026-08-21): Recorded the review finding, approved design checkpoint, and bounded remediation that gives Coordinator post-approval ExecPlan bookkeeping authority.

Revision note (2026-08-21): Recorded successful remediation validation while leaving final independent review and its bookkeeping open.

Revision note (2026-08-21): Recorded remediation cycle 2 findings and the approved factual stopped-state protocol, and expanded the implementation and acceptance narrative while leaving validation and final review open.

Revision note (2026-08-21): Recorded successful remediation cycle 2 validation while leaving final independent review and finalization open.

Revision note (2026-08-21): Coordinator recorded final Reviewer approval, closed review-related progress, and finalized the retrospective before staging.
