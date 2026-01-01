# Quickstart: Verify Setup Script

## Prerequisites
- Bun installed (`curl -fsSL https://bun.sh/install | bash`)

## Running Verification

1. **Standard Run**:
   ```bash
   bun run verify.ts
   ```

2. **Debug Mode** (See output and keep files):
   ```bash
   bun run verify.ts --verbose --keep
   ```

## Interpreting Results
- **Green checks**: Feature working as expected.
- **Red crosses**: Failure. The script will output the specific command that failed.

## Adding New Checks
Edit `verify.ts` and add a new `VerificationStep` to the `steps` array.
