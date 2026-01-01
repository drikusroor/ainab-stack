# Data Model: Publish CLI Package

## Entities

### ScaffoldOptions

Represents the user's choices for generating the project.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `projectName` | `string` | The name of the directory/project to create. | Non-empty, valid directory name. |
| `targetDir` | `string` | Absolute path to the destination. | Must be writable. |
| `force` | `boolean` | Whether to overwrite existing files. | Default `false`. |

### PackageManifest

Represents the `package.json` structure for the CLI itself.

| Field | Type | Description | Value |
|-------|------|-------------|-------|
| `name` | `string` | Package name. | `@<owner>/create-ainab-stack` |
| `bin` | `object` | Executable mapping. | `{"ainab-stack": "./bin/cli.js"}` |
| `type` | `string` | Module type. | `module` |
| `publishConfig`| `object` | Registry config. | `{"registry": "https://npm.pkg.github.com"}` |
