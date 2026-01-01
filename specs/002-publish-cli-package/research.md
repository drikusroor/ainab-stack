# Research: Publish CLI Package

**Feature**: Publish CLI Package
**Status**: In Progress

## 1. Bun Create Compatibility

**Context**: The user wants to run `bun create ainab-stack`. We need to understand the naming conventions and requirements for this to work.

**Findings**:
- `bun create` typically looks for packages named `create-<name>` or `@<scope>/create-<name>`.
- If the user runs `bun create ainab-stack`, Bun will likely look for `create-ainab-stack` or assume it's a GitHub repo if the pattern matches `user/repo`.
- **Decision**: We should name the package `create-ainab-stack` (or scope it if needed, but the user asked for `ainab-stack`).
- **Rationale**: Standard convention for initializers.

## 2. CLI Argument Parsing

**Context**: Constitution prefers "Bun-Native" and "Opinionated Modernity".

**Options**:
- **Native (`Bun.argv`)**: Zero dependency, fast. Good for simple commands.
- **`commander`**: Standard, feature-rich, but adds weight.
- **`cac`**: Lightweight, popular in Vite/Vue ecosystem.
- **`minimist`/`mri`**: Very small, just parses args.

**Decision**: Use `mri` or native `Bun.argv` parsing if the interface is simple (just `[dir]`). If we have flags, `mri` is a good balance.
**Refinement**: For a robust CLI that might expand, `commander` is often the safest bet for help generation (`--help`) which is a requirement for "Interactive Experience" (Constitution IV). However, to adhere strictly to "Bun-Native" simplicity first, we will verify if we can do it with just Bun.
**Final Decision**: We will use `commander` (or a lightweight alternative like `cac`) to ensure robust `--help` and error handling as per Constitution IV ("Interactive Experience"). The "weight" is negligible in a dev tool.

## 3. Package Configuration

**Context**: Needs to be executable via `bunx`.

**Requirements**:
- `bin` entry in `package.json`.
- Shebang `#!/usr/bin/env bun` at the top of the entry file.
- `files` array including the `dist` or `src` files needed.

## 4. Scaffolding Approach

**Context**: Constitution II "Idempotency".

**Strategy**:
- Check target directory.
- If not empty, prompt user (Constitution IV "Interactive Experience").
- Use `Bun.write` for file creation.

## Decisions Summary

1. **Package Name**: `@<owner>/create-ainab-stack` (Scoped for GitHub Packages).
2. **CLI Library**: `commander` (for robust UX/Help).
3. **Runtime**: Bun (Shebang `#!/usr/bin/env bun`).
4. **Publishing**: GitHub Packages (requires `.npmrc` or `publishConfig`).
