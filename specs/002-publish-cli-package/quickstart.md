# Quickstart: Publish CLI Package

## For Users

### Creating a New Project

To create a new Ainab Stack application, simply run:

```bash
bun create ainab-stack my-app
```

Or execute directly via `bunx`:

```bash
bunx ainab-stack my-app
```

Follow the interactive prompts if you don't supply a project name.

## For Maintainers

### Development

1. **Clone the repo**:
   ```bash
   git clone <repo-url>
   cd ainab-stack
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Link locally** (to test `bun create ainab-stack`):
   ```bash
   cd packages/create-ainab-stack # (assuming monorepo or project structure)
   bun link
   ```
   *Then elsewhere:*
   ```bash
   bun link create-ainab-stack
   bun create ainab-stack test-app
   ```

### Publishing

1. **Build**:
   ```bash
   bun run build
   ```

2. **Publish**:
   ```bash
   npm publish
   ```
