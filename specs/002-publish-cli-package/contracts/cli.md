# CLI Contract: ainab-stack

**Command**: `ainab-stack` (and `create-ainab-stack`)
**Version**: 1.0.0

## Usage

```bash
bunx ainab-stack [project-name] [options]
# OR
bun create ainab-stack [project-name] [options]
```

## Arguments

| Argument | Required | Description | Default |
|----------|----------|-------------|---------|
| `project-name` | No | Name of the project directory to create. | User is prompted if omitted. |

## Options

| Flag | Short | Description |
|------|-------|-------------|
| `--help` | `-h` | Display help information. |
| `--version` | `-v` | Display version number. |
| `--force` | `-f` | Overwrite target directory if it exists. |

## Interactive Prompts

If `project-name` is not provided:
1. **Prompt**: "What is the name of your project?"
   - **Type**: Text
   - **Validation**: Non-empty, URL-safe characters preferred.

## Exit Codes

- `0`: Success.
- `1`: General error (e.g., directory permission denied, user cancelled).
