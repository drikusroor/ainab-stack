# Phase 0: Research

**Feature**: Verify Setup Script Idempotency
**Date**: 2026-01-01

## 1. Process Management & I/O

**Context**: The `verify.ts` script needs to run `setup.ts` and capture its output to determine success/failure, while potentially showing it to the user.

**Decision**: Use `Bun.spawn` with `stdio: ["ignore", "pipe", "pipe"]` (or inherit if verbose mode).
**Rationale**: `Bun.spawn` is the native way to handle subprocesses. We need to capture stdout/stderr to analyze for errors if needed, or stream them to the console.

**Implementation Note**:
```typescript
const proc = Bun.spawn(["bun", "run", "setup.ts", ...args], {
  cwd: tempDir,
  stdio: ["ignore", "inherit", "inherit"], // Let user see progress
});
const exitCode = await proc.exited;
```

## 2. Cleanup & Signal Handling

**Context**: We are creating temporary directories. If `verify.ts` is interrupted (Ctrl+C), we should try to clean up.

**Decision**: Use `process.on("SIGINT", ...)` to trigger cleanup logic.
**Rationale**: Standard Node/Bun signal handling.

**Implementation Note**:
```typescript
import { rm } from "node:fs/promises";

async function cleanup() {
  if (tempDir) await rm(tempDir, { recursive: true, force: true });
}

process.on("SIGINT", async () => {
  await cleanup();
  process.exit(1);
});
```

## 3. Idempotency Testing Strategy

**Context**: We need to run the setup twice.

**Decision**:
1. Run setup in `temp/project`.
2. Check exist code 0.
3. Run setup AGAIN in `temp/project`.
4. Check exit code 0.
5. Verify file hashes of key configs (optional) or just ensure build passes.

**Rationale**: Simplest valid test of "idempotency" implies the script doesn't crash and leaves the project in a valid state.

## 4. Stack Verification

**Context**: Need to check for `next-auth`, `drizzle`, etc.

**Decision**:
1. Check `package.json` dependencies.
2. Check existence of `auth.ts`, `drizzle.config.ts`, `biome.json`.
3. Check `src/app/layout.tsx` content (e.g. Providers).

**Rationale**: File existence + package presence is a strong enough signal for "verification" without parsing ASTs (which is overkill).
