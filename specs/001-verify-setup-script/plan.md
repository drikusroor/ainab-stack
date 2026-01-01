# Implementation Plan: Verify Setup Script Idempotency and Correctness

**Branch**: `001-verify-setup-script` | **Date**: 2026-01-01 | **Spec**: [specs/001-verify-setup-script/spec.md](spec.md)
**Input**: Feature specification from `specs/001-verify-setup-script/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a `verify.ts` script using Bun to validate the `setup.ts` scaffolder. The script will execute `setup.ts` in a temporary directory, verify the presence of "Ainab Stack" files (Next.js, Tailwind, Biome, etc.), run the generated project's build/lint/test commands, and perform idempotency checks by re-running the setup.

## Technical Context

**Language/Version**: TypeScript (Bun runtime)
**Primary Dependencies**: `bun` (standard library: `Bun.spawn`, `Bun.file`, `Bun.write`)
**Storage**: File system (temporary directories)
**Testing**: Custom verification logic (integration testing via CLI orchestration)
**Target Platform**: Local CLI (Linux, macOS)
**Project Type**: CLI Script
**Performance Goals**: Verification run < 5 minutes (network dependent)
**Constraints**: Must run in a clean environment; requires Internet access.
**Scale/Scope**: Single script, local execution.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

*   **I. Bun-Native Runtime**: ✅ Verification script will use `Bun` APIs (spawn, file) exclusively.
*   **II. Idempotency & Safety**: ✅ The script tests idempotency. It will operate in a temp dir or explicitly provided test dir to avoid destroying user data.
*   **III. Opinionated Modernity**: ✅ It validates the presence of the required stack.
*   **IV. Interactive Experience**: ✅ Will provide clear colored output (pass/fail).
*   **V. Self-Contained Deliverables**: N/A (Internal tool).

## Project Structure

### Documentation (this feature)

```text
specs/001-verify-setup-script/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
/
├── setup.ts             # Target script (already exists)
├── verify.ts            # NEW: Verification orchestrator
└── .specify/            # Existing spec kit
```

**Structure Decision**: Single `verify.ts` script in root to sit alongside `setup.ts` for easy execution.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | | |
