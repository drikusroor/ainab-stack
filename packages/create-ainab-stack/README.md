# @drikusroor/create-ainab-stack

The official CLI for the Ainab Stack.

## Usage

You can use the CLI to scaffold a new project using `bunx` or `bun create`.

### Via bunx

```bash
bunx @drikusroor/create-ainab-stack my-app
```

### Via bun create

```bash
bun create @drikusroor/ainab-stack my-app
```

## Options

- `[project-name]`: Optional project name. If omitted, you'll be prompted.
- `-f, --force`: Overwrite target directory if it exists.
- `-v, --version`: Show version.
- `-h, --help`: Show help.

## Development

To test the CLI locally:

1. Link the package:
   ```bash
   cd packages/create-ainab-stack
   bun link
   ```
2. Use it:
   ```bash
   bunx ainab-stack my-test-app
   ```