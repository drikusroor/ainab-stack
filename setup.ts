import { spawn } from "bun";
import { mkdir, exists, rm } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";

// --- CLI ARGUMENT PARSING ---
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: "string", short: "n" },
    db: { type: "string", default: "sqlite.db" },
    force: { type: "boolean", short: "f" },
  },
  allowPositionals: true,
});

async function promptInput(question: string, fallback?: string): Promise<string> {
  process.stdout.write(`\x1b[36m? ${question} \x1b[0m`);
  if (fallback) process.stdout.write(`\x1b[90m(${fallback}) \x1b[0m`);
  const result = prompt(""); 
  return result?.trim() || fallback || "";
}

// --- CONFIGURATION ---
console.log(`\x1b[1m🛠️  Bun Stack Scaffolder\x1b[0m\n`);

let projectName = values.name || positionals[0];
if (!projectName) {
  projectName = await promptInput("What is your project name?", "my-bun-app");
}

const dbFileName = values.db || "sqlite.db";
const projectPath = join(process.cwd(), projectName);

// --- UTILS ---
async function run(cmd: string[], cwd: string = projectPath) {
  if (!cmd[0].includes("rm")) console.log(`\x1b[34m➜ ${cmd.join(" ")}\x1b[0m`);
  
  const proc = spawn(cmd, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    console.error(`\x1b[31m✖ Command failed: ${cmd.join(" ")}\x1b[0m`);
    process.exit(exitCode);
  }
}

async function write(path: string, content: string) {
  await Bun.write(path, content.trim());
}

// --- MAIN EXECUTION ---

// 1. Cleanup / Init Directory
if (await exists(projectPath)) {
  if (values.force) {
    console.warn(`\x1b[33m⚠️  --force detected. Deleting existing ${projectName}...\x1b[0m`);
    await rm(projectPath, { recursive: true, force: true });
    await mkdir(projectPath, { recursive: true });
  } else {
    console.log(`\x1b[33m⚠️  Directory "${projectName}" already exists. Proceeding with idempotent update...\x1b[0m`);
  }
} else {
  await mkdir(projectPath, { recursive: true });
}

// 2. Create Next.js App
if (!(await exists(join(projectPath, "package.json")))) {
  console.log(`\n🚀 Initializing Next.js in \x1b[1m${projectName}\x1b[0m...`);
  await run([
    "bun", "create", "next-app", ".",
    "--typescript",
    "--tailwind",
    "--eslint",
    "--app",
    "--src-dir",
    "--import-alias", "@/*",
    "--use-bun",
    "--yes"
  ], projectPath);
} else {
  console.log(`\n⏭️  Next.js already initialized in \x1b[1m${projectName}\x1b[0m. Skipping...`);
}

// 2.5 Verify Folder Exists (redundant now but safe)
if (!(await exists(projectPath))) {
    console.error(`\x1b[31m❌ Critical Error: The folder "${projectName}" was not created.\x1b[0m`);
    process.exit(1);
}

// 3. Install Dependencies
console.log("\n📦 Updating Stack Dependencies...");
await run([
  "bun", "add",
  "drizzle-orm",
  "@libsql/client",
  "next-auth@beta",
  "@tanstack/react-query",
  "class-variance-authority", 
  "clsx", 
  "tailwind-merge", 
  "lucide-react"
]);

await run([
  "bun", "add", "-D",
  "drizzle-kit",
  "@biomejs/biome", 
  "bun-types"
]);

// 4. Configure Biome.js
console.log("\n🧹 Configuring Biome...");
// Only init Biome if it's not already there or if we really want to reset
if (!(await exists(join(projectPath, "biome.json")))) {
  await run(["bunx", "--bun", "biome", "init"]);
}

// Check for ESLint config before trying to migrate
const eslintConfigExists = (await exists(join(projectPath, ".eslintrc.json"))) || 
                           (await exists(join(projectPath, "eslint.config.mjs"))) ||
                           (await exists(join(projectPath, "eslint.config.js")));

if (eslintConfigExists) {
  await run(["bunx", "--bun", "biome", "migrate", "eslint", "--write"]);
  await run(["bun", "remove", "eslint", "eslint-config-next"]);
  await run(["rm", "-f", ".eslintrc.json", "eslint.config.mjs", "eslint.config.js"]);
} else {
  console.log("⏭️  No ESLint config found. Skipping migration...");
}

// Update package.json scripts
console.log("\n📝 Updating package.json scripts...");
const packageJsonPath = join(projectPath, "package.json");
const packageJson = await Bun.file(packageJsonPath).json();
packageJson.scripts = {
  ...packageJson.scripts,
  "lint": "bun run biome check",
  "lint:fix": "bun run biome check --write --unsafe"
};
await write(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Update biome.json for Tailwind
console.log("⚙️  Configuring Biome for Tailwind...");
const biomeJsonPath = join(projectPath, "biome.json");
if (await exists(biomeJsonPath)) {
  const biomeJson = await Bun.file(biomeJsonPath).json();
  if (!biomeJson.css) biomeJson.css = {};
  if (!biomeJson.css.parser) biomeJson.css.parser = {};
  biomeJson.css.parser.cssModules = true; 
  biomeJson.css.parser.tailwindDirectives = true;
  await write(biomeJsonPath, JSON.stringify(biomeJson, null, 2));
}

// 5. Initialize Shadcn UI
console.log("\n🎨 Initializing Shadcn UI...");
if (!(await exists(join(projectPath, "components.json")))) {
  await run(["bunx", "--bun", "shadcn@latest", "init", "-y"]);
} else {
  console.log("⏭️  Shadcn UI already initialized. Skipping init...");
}

const shadcnConfig = {
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
};
await write(join(projectPath, "components.json"), JSON.stringify(shadcnConfig, null, 2));

// 6. Configure Drizzle & SQLite
console.log(`\n🗄️  Configuring Drizzle (DB: ${dbFileName})...`);

const drizzleConfig = `
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME || "file:${dbFileName}",
  },
});
`;
await write(join(projectPath, "drizzle.config.ts"), drizzleConfig);

await mkdir(join(projectPath, "src/lib"), { recursive: true });
const dbClient = `
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database(process.env.DB_FILE_NAME || '${dbFileName}');
export const db = drizzle(sqlite);
`;
await write(join(projectPath, "src/lib/db.ts"), dbClient);

await mkdir(join(projectPath, "src/db"), { recursive: true });
const dbSchema = `
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  email: text("email").unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
`;
await write(join(projectPath, "src/db/schema.ts"), dbSchema);

// 7. Configure NextAuth
console.log("\n🔐 Configuring NextAuth v5...");
const authConfig = `
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
  },
} satisfies NextAuthConfig;
`;
await write(join(projectPath, "auth.config.ts"), authConfig);

const authFile = `
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ async authorize(c) { return null; } })],
});
`;
await write(join(projectPath, "auth.ts"), authFile);

const middleware = `
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
export default NextAuth(authConfig).auth;
export const config = { matcher: ['/((?!api|_next/static|_next/image|.*\\\\.png$).*)'] };
`;
await write(join(projectPath, "middleware.ts"), middleware);

// 8. Setup React Query
console.log("\n📡 Configuring TanStack Query...");
const queryProvider = `
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
`;
await write(join(projectPath, "src/app/providers.tsx"), queryProvider);

const layoutPath = join(projectPath, "src/app/layout.tsx");
if (await exists(layoutPath)) {
  let layoutContent = await Bun.file(layoutPath).text();
  
  if (!layoutContent.includes("import Providers from \"./providers\";")) {
    layoutContent = layoutContent.replace(
      "import \"./globals.css\";",
      "import \"./globals.css\";\nimport Providers from \"./providers\";"
    );
  }
  
  if (!layoutContent.includes("<Providers>")) {
    layoutContent = layoutContent.replace("{children}", "<Providers>{children}</Providers>");
  }
  
  await write(layoutPath, layoutContent);
}

// 9. GitHub Spec Kit (using uvx)
console.log("\n📜 Initializing GitHub Spec Kit...");
try {
  await run(["uvx", "--from", "git+https://github.com/github/spec-kit.git", "specify", "init", "--here", "--force", "--ai", "gemini"], projectPath);
} catch (e) {
  console.warn("⚠️  Spec Kit skipped (uvx not found or failed).");
}

// 9.5 Final Polish
console.log("\n✨ Polishing project...");

// Fix tsconfig.json for Bun types
const tsconfigPath = join(projectPath, "tsconfig.json");
if (await exists(tsconfigPath)) {
  const tsconfig = await Bun.file(tsconfigPath).json();
  if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
  if (!tsconfig.compilerOptions.types) tsconfig.compilerOptions.types = [];
  if (!tsconfig.compilerOptions.types.includes("bun-types")) {
    tsconfig.compilerOptions.types.push("bun-types");
    await write(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  }
}

// Ensure tailwind.config.ts exists (required for Shadcn)
const tailwindConfigPath = join(projectPath, "tailwind.config.ts");
if (!(await exists(tailwindConfigPath))) {
  const defaultTailwindConfig = `
import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
`;
  await write(tailwindConfigPath, defaultTailwindConfig);
  // Also install tailwindcss-animate since we used it
  await run(["bun", "add", "tailwindcss-animate"], projectPath);
}

// Run Biome to format everything
try {
  await run(["bun", "run", "lint:fix"], projectPath);
} catch (e) {
  console.warn("⚠️  Lint fix had some issues, but continuing.");
}

// 10. Initial Git Commit
console.log("\n🎁 Creating initial commit...");
try {
  if (!(await exists(join(projectPath, ".git")))) {
    await run(["git", "init"], projectPath);
  }
  
  await run(["git", "add", "."], projectPath);
  
  // Check if there are changes to commit to avoid error on empty commit
  const statusProc = spawn(["git", "status", "--porcelain"], { cwd: projectPath });
  const statusOutput = await new Response(statusProc.stdout).text();
  
  if (statusOutput.trim().length > 0) {
    await run(["git", "commit", "-m", "Initial commit from Bun Stack Scaffolder"], projectPath);
    console.log("✅ Initial commit created.");
  } else {
    console.log("⏭️  No changes to commit.");
  }
} catch (e) {
  console.warn("⚠️  Git commit failed. You might need to configure your git user.name and user.email.");
}

console.log(`\n\x1b[32m✅ Setup Complete!\x1b[0m`);
console.log(`\nNext steps:`);
console.log(`  cd ${projectName}`);
console.log(`  bun dev\n`);
