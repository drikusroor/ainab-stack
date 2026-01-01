# Data Model: Verification System

## Entities

### VerificationStep
Represents a single logical check performed by the suite.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable name of the step (e.g., "Check NextAuth") |
| `description` | string | What is being checked |
| `critical` | boolean | If true, failure stops execution immediately |
| `action` | `() => Promise<void>` | The logic to execute |

### TestResult
Represents the outcome of a `VerificationStep`.

| Field | Type | Description |
|-------|------|-------------|
| `stepName` | string | Reference to the step |
| `status` | enum | `PASS` \| `FAIL` \| `SKIP` |
| `error` | Error? | Exception info if failed |
| `durationMs` | number | Execution time |

## State Management

The script maintains a `context` object passed between steps:

```typescript
interface VerifyContext {
  tempDir: string;
  projectPath: string;
  projectName: string;
}
```
