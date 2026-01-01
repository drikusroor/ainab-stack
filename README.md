# Ainab Stack

The official CLI for the Ainab Stack.

## Usage

You can scaffold a new project directly from this GitHub repository using Bun.

### Via bun create

```bash
bun create drikusroor/ainab-stack my-app
```

### Via bunx

```bash
bunx github:drikusroor/ainab-stack my-app
```

## Options

- `[project-name]`: Optional project name. If omitted, you'll be prompted.
- `-f, --force`: Overwrite target directory if it exists.
- `-v, --version`: Show version.
- `-h, --help`: Show help.

## Development

1. Install dependencies:
   ```bash
   bun install
   ```
2. Test locally:
   ```bash
   bun ./bin/cli.ts my-test-app
   ```