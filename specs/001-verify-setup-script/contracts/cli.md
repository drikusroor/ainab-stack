# CLI Contract: verify.ts

**Command**: `bun run verify.ts [options]`

## Options

| Flag | Short | Type | Default | Description |
|------|-------|------|---------|-------------|
| `--keep` | `-k` | boolean | `false` | Do not delete the temporary directory after the run. Useful for debugging failed verifications. |
| `--verbose` | `-v` | boolean | `false` | Stream stdout/stderr from the setup script and build tools to the console. By default, output is suppressed unless an error occurs. |
| `--dir` | `-d` | string | `(random)` | Specify a directory to run verification in. If it exists, it might be overwritten depending on setup.ts logic. |

## Output Format

### Standard Output (Success)
```text
[INFO] Starting verification in /tmp/verify-xyz...
[PASS] Setup Script (Fresh) (2500ms)
[PASS] Idempotency Check (Setup re-run) (1200ms)
[PASS] Stack: Next.js detected
[PASS] Stack: Tailwind detected
[PASS] Stack: Biome detected
[PASS] Stack: Drizzle detected
[PASS] Build Check (bun run build) (4500ms)
[PASS] Lint Check (bun run lint) (800ms)
[PASS] Type Check (tsc) (1500ms)

✅ Verification Complete! All checks passed.
```

### Standard Output (Failure)
```text
[INFO] Starting verification in /tmp/verify-xyz...
[PASS] Setup Script (Fresh) (2500ms)
[FAIL] Build Check
       Error: Command failed with exit code 1
       (Output logs...)
       
❌ Verification Failed. Use --keep to inspect /tmp/verify-xyz
```

## Exit Codes

- `0`: All checks passed.
- `1`: One or more checks failed.
