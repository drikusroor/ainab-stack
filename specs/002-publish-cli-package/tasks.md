# Tasks: Publish CLI Package

**Input**: Design documents from `/specs/002-publish-cli-package/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included based on the plan's specification of `bun test` and the independent test criteria in `spec.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **CLI Package**: `packages/create-ainab-stack/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create package directory `packages/create-ainab-stack/`
- [x] T002 Initialize `packages/create-ainab-stack/package.json` with scoped name `@<owner>/create-ainab-stack` and version `0.0.1`
- [x] T003 [P] Create `packages/create-ainab-stack/tsconfig.json` for Bun environment
- [x] T004 [P] Create `packages/create-ainab-stack/.gitignore` and `packages/create-ainab-stack/.npmignore`
- [x] T005 Create `packages/create-ainab-stack/README.md` with initial description
- [x] T025 [P] Configure `publishConfig` in `packages/create-ainab-stack/package.json` for GitHub Packages
- [x] T026 Create `packages/create-ainab-stack/.npmrc` with GitHub registry configuration

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Install production dependencies (`commander`, `chalk`, `prompts`) in `packages/create-ainab-stack/`
- [x] T007 Install dev dependencies (`@types/node`, `@types/prompts`) in `packages/create-ainab-stack/`
- [x] T008 Create `packages/create-ainab-stack/src/index.ts` as main entry point placeholder
- [x] T009 Create `packages/create-ainab-stack/bin/cli.ts` with shebang `#!/usr/bin/env bun` and import from `src/index.ts`
- [x] T010 Configure `bin` entry in `packages/create-ainab-stack/package.json` pointing to `bin/cli.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Execute via Bunx (Priority: P1) 🎯 MVP

**Goal**: Execute the `ainab-stack` tool directly from the registry without manual installation.

**Independent Test**: Pack project locally and run via `bunx`.

### Implementation for User Story 1

- [x] T011 [US1] Initialize `commander` program in `packages/create-ainab-stack/src/index.ts` with version and description
- [x] T012 [US1] Add default command action to `packages/create-ainab-stack/src/index.ts` that logs a welcome message using `chalk`
- [x] T013 [US1] Implement `--help` flag configuration in `packages/create-ainab-stack/src/index.ts` (handled by commander, verify config)
- [x] T014 [US1] Verify executable permissions on `packages/create-ainab-stack/bin/cli.ts` (chmod +x if needed in build step, usually handled by npm)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently via `bun link` or local execution.

---

## Phase 4: User Story 2 - Scaffolding via Create Command (Priority: P2)

**Goal**: Initialize a new project using `bun create ainab-stack`.

**Independent Test**: Verify `bun create ainab-stack` prompts for name and creates directory.

### Implementation for User Story 2

- [x] T015 [P] [US2] Define `ScaffoldOptions` interface in `packages/create-ainab-stack/src/types.ts`
- [x] T016 [US2] Implement argument parsing for `[project-name]` in `packages/create-ainab-stack/src/index.ts`
- [x] T017 [US2] Implement interactive prompt logic using `prompts` in `packages/create-ainab-stack/src/prompts.ts` (ask for name if missing)
- [x] T018 [US2] Create scaffolding utility in `packages/create-ainab-stack/src/scaffold.ts` (directory creation, basic file writing)
- [x] T019 [US2] Integrate scaffolding utility into main action in `packages/create-ainab-stack/src/index.ts`
- [x] T020 [US2] Implement overwrite check (check if dir exists) in `packages/create-ainab-stack/src/scaffold.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T021 [P] Add `clean` and `build` scripts to `packages/create-ainab-stack/package.json`
- [x] T022 Update `packages/create-ainab-stack/README.md` with usage instructions (`bunx`, `bun create`)
- [x] T023 Verify `.npmignore` excludes source files if shipping transpiled (or verifying we ship ts directly via bun)
- [x] T024 [P] Add unit test for options parsing in `packages/create-ainab-stack/test/options.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: Depend on Foundation
- **Polish (Final Phase)**: Depends on User Stories

### User Story Dependencies

- **User Story 1 (P1)**: Independent after Foundation.
- **User Story 2 (P2)**: Extends US1, technically depends on the entry point structure from US1/Foundation.

### Parallel Opportunities

- T003 (`tsconfig.json`) and T004 (`.gitignore`) can run in parallel.
- T015 (`types.ts`) and T017 (`prompts.ts`) can run in parallel within US2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Implement T011-T014.
3. Verify `bunx` execution locally.

### Incremental Delivery

1. Foundation ready.
2. US1: Basic CLI running.
3. US2: Interactive scaffolding added.
