<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- List of modified principles: Defined initial principles (Bun-Native, Idempotency, Opinionated Modernity, Interactive Experience, Self-Contained Deliverables).
- Added sections: Defined all sections (Security, Development, Governance).
- Templates requiring updates: plan-template.md (Generic reference valid).
- Follow-up TODOs: None.
-->
# Ainab Stack Constitution

## Core Principles

### I. Bun-Native Runtime
We prioritize Bun APIs (e.g., `Bun.file`, `Bun.write`, `Bun.argv`) for file I/O, shell interactions, and runtime tasks. We avoid Node.js compatibility layers unless strictly necessary for specific library support. This ensures maximum performance and simplicity, leveraging the runtime's native capabilities.

### II. Idempotency & Safety
Scripts and scaffolding tools MUST be safe to re-run. They MUST NOT overwrite user work without explicit consent (e.g., a `--force` flag). Tools should check for the existence of files or directories before creation and provide clear feedback or skips if artifacts already exist.

### III. Opinionated Modernity
We enforce the "Ainab Stack" defaults: Next.js (App Router), Tailwind CSS, Biome (for linting/formatting), Drizzle ORM (SQLite), and NextAuth. We do not support alternative configurations in the core scaffolder to maintain maintainability and a clear "golden path".

### IV. Interactive Experience
CLI tools MUST provide a helpful interactive mode. If arguments are missing, the tool should prompt the user for input rather than failing immediately. Feedback must be clear and color-coded (e.g., Blue for info, Green for success, Yellow for warning, Red for error).

### V. Self-Contained Deliverables
The output of any scaffolder or generator MUST be a fully functional project. `bun dev` (or the equivalent start command) MUST work immediately after setup without requiring manual intervention or additional configuration steps from the user.

## Security
- **No Secrets in Code**: Never commit secrets, API keys, or credentials. Use `.env` files and ensure they are added to `.gitignore`.
- **Dependency Safety**: Review dependencies for security vulnerabilities before adding them.

## Development
- **Script usage**: Use `bun run` for executing scripts to ensure the correct runtime environment.
- **Code Style**: Adhere to the rules enforced by Biome. Run `bun run lint:fix` before committing.

## Governance
This constitution governs the development of the Ainab Stack scaffolder and its generated templates.

**Amendments**: Changes to this constitution require a PR review and consensus from maintainers.
**Versioning**: We follow Semantic Versioning for this document.
- MAJOR: Removal or fundamental change of a core principle.
- MINOR: Addition of a new principle or significant clarification.
- PATCH: Typo fixes or minor wording adjustments.

**Version**: 1.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01