---
description: "Task list for Verify Setup Script feature"
---

# Tasks: Verify Setup Script Idempotency and Correctness

**Input**: Design documents from `specs/001-verify-setup-script/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/cli.md

**Tests**: Custom integration testing via the `verify.ts` script itself (as defined in plan).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create `verify.ts` file in repository root
- [x] T002 Define `VerificationStep` and `TestResult` interfaces in `verify.ts`
- [x] T003 [P] Implement `parseArgs` utility for CLI options in `verify.ts`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T004 Implement `Logger` class with color output (PASS/FAIL/INFO) in `verify.ts`
- [x] T005 Implement `createTempDir` and `cleanup` (signal handling) logic in `verify.ts`
- [x] T006 Implement `Bun.spawn` wrapper for executing commands with verbose/silent modes in `verify.ts`

**Checkpoint**: CLI runs, parses args, creates/cleans temp dir, and has logging.

## Phase 3: User Story 1 - Verify Fresh Setup (Priority: P1)

**Goal**: Run setup on a fresh directory and validate build/lint/typecheck.

**Independent Test**: `bun run verify.ts` runs setup and passes if `bun run build` succeeds in the temp dir.

### Implementation for User Story 1

- [x] T007 [US1] Implement `runSetupScript` step (executes `setup.ts` in temp dir) in `verify.ts`
- [x] T008 [US1] Implement `checkBuild` step (`bun run build`) in `verify.ts`
- [x] T009 [US1] Implement `checkLint` step (`bun run lint`) in `verify.ts`
- [x] T010 [US1] Implement `checkTypes` step (`tsc --noEmit`) in `verify.ts`
- [x] T011 [US1] Orchestrate steps in main execution loop in `verify.ts`

**Checkpoint**: `bun run verify.ts` successfully bootstraps a project and runs its validation commands.

## Phase 4: User Story 2 - Verify Idempotency (Priority: P2)

**Goal**: Ensure re-running setup doesn't break the project.

**Independent Test**: `bun run verify.ts` runs setup twice and reports success.

### Implementation for User Story 2

- [x] T012 [US2] Implement `runSetupScriptAgain` step (idempotency check) in `verify.ts`
- [x] T013 [US2] Validate exit code 0 on second run in `verify.ts`
- [x] T014 [US2] Ensure `checkBuild` runs AFTER the second setup run in `verify.ts`

**Checkpoint**: Verification suite now includes an explicit "Idempotency Check" step.

## Phase 5: User Story 3 - Comprehensive Stack Verification (Priority: P3)

**Goal**: specific checks for "Ainab Stack" components.

**Independent Test**: Output shows checks for NextAuth, Drizzle, etc.

### Implementation for User Story 3

- [x] T015 [P] [US3] Implement `checkNextAuth` (file/dep existence) in `verify.ts`
- [x] T016 [P] [US3] Implement `checkDrizzle` (schema/config existence) in `verify.ts`
- [x] T017 [P] [US3] Implement `checkTailwindBiome` (config existence) in `verify.ts`
- [x] T018 [US3] Register stack verification steps in main loop in `verify.ts`

**Checkpoint**: All specific stack component checks are active.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation

- [x] T019 Update `README.md` to mention `bun run verify.ts` usage
- [x] T020 [P] Implement proper timeout handling for spawned processes in `verify.ts`
- [x] T021 [P] Refine error reporting (show stderr on failure even in non-verbose mode) in `verify.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on T001.
- **User Stories (Phase 3+)**: All depend on Phase 2.
  - US1 is the MVP.
  - US2 extends US1.
  - US3 extends US1 (can be parallel with US2, but conceptually verified after).

### Parallel Opportunities

- T003, T006 (Utils)
- T015, T016, T017 (Stack checks) can be written independently.

## Implementation Strategy

### MVP First (User Story 1)

1. Build the harness (Phases 1 & 2).
2. Implement basic "run setup + run build" (Phase 3).
3. Validate manually.

### Incremental Delivery

1. Add Idempotency (Phase 4).
2. Add granular Stack Checks (Phase 5).
