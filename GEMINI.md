# ainab-stack Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-01

## Active Technologies
- TypeScript (Bun runtime) + `commander` (CLI parsing), `chalk` (if needed, or native colors), `prompts` (interactive). (002-publish-cli-package)
- N/A (File System I/O only). (002-publish-cli-package)

- TypeScript (Bun runtime) + `bun` (standard library: `Bun.spawn`, `Bun.file`, `Bun.write`) (001-verify-setup-script)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (Bun runtime): Follow standard conventions

## Recent Changes
- 002-publish-cli-package: Added TypeScript (Bun runtime) + `commander` (CLI parsing), `chalk` (if needed, or native colors), `prompts` (interactive).
- 002-publish-cli-package: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]

- 001-verify-setup-script: Added TypeScript (Bun runtime) + `bun` (standard library: `Bun.spawn`, `Bun.file`, `Bun.write`)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
