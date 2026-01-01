import { spawn } from "bun";
import { mkdir, rm, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parseArgs } from "node:util";

// --- T002: Interfaces ---
interface VerificationStep {
  name: string;
  description: string;
  critical?: boolean;
  action: (context: VerifyContext) => Promise<void>;
}

interface TestResult {
  stepName: string;
  status: "PASS" | "FAIL" | "SKIP";
  error?: Error;
  durationMs: number;
}

interface VerifyContext {
  tempDir: string;
  projectPath: string;
  projectName: string;
  keep: boolean;
  verbose: boolean;
}

// --- T003: parseArgs ---
const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    keep: { type: "boolean", short: "k", default: false },
    verbose: { type: "boolean", short: "v", default: false },
    dir: { type: "string", short: "d" },
  },
  allowPositionals: true,
});

// --- T004: Logger ---
class Logger {
  static info(msg: string) {
    console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`);
  }

  static pass(step: string, duration?: number) {
    const time = duration ? ` (${duration}ms)` : "";
    console.log(`\x1b[32m[PASS]\x1b[0m ${step}${time}`);
  }

  static fail(step: string, error?: Error) {
    console.log(`\x1b[31m[FAIL]\x1b[0m ${step}`);
    if (error) {
      console.error(`       \x1b[31mError: ${error.message}\x1b[0m`);
      if (values.verbose && error.stack) {
        console.error(error.stack);
      }
    }
  }

  static warn(msg: string) {
    console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`);
  }
}

// --- T006: Bun.spawn Wrapper ---
async function runCommand(cmd: string[], cwd: string, verbose: boolean = false): Promise<void> {
  if (verbose) {
    console.log(`\x1b[90m> ${cmd.join(" ")}\x1b[0m`);
  }

  const proc = spawn(cmd, {
    cwd,
    stdout: verbose ? "inherit" : "pipe",
    stderr: verbose ? "inherit" : "pipe",
  });

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    let stderrOutput = "";
    if (!verbose) {
      // Capture stderr if we weren't streaming it
      stderrOutput = await new Response(proc.stderr).text();
    }
    throw new Error(`Command failed with exit code ${exitCode}${stderrOutput ? `:\n${stderrOutput}` : ""}`);
  }
}

// --- T005: Temp Dir & Cleanup ---
async function createVerifyContext(): Promise<VerifyContext> {
  const baseDir = values.dir || await mkdtemp(join(tmpdir(), "verify-"));
  
  if (values.dir) {
      // Ensure the directory exists if user provided one
      await mkdir(baseDir, { recursive: true });
  }

  return {
    tempDir: baseDir,
    projectPath: join(baseDir, "my-bun-app"), // setup.ts defaults to my-bun-app if not interactive
    projectName: "my-bun-app",
    keep: values.keep || false,
    verbose: values.verbose || false,
  };
}

async function cleanup(context: VerifyContext) {
  if (context.keep) {
    Logger.info(`Keeping temporary directory: ${context.tempDir}`);
    return;
  }
  
  Logger.info(`Cleaning up temporary directory: ${context.tempDir}`);
  try {
    await rm(context.tempDir, { recursive: true, force: true });
  } catch (e) {
    Logger.warn(`Failed to cleanup: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// --- Main Execution ---
async function main() {
  Logger.info("Starting verification...");
  
  const context = await createVerifyContext();
  Logger.info(`Working directory: ${context.tempDir}`);

  // Register Cleanup Hooks
  process.on("SIGINT", async () => {
    Logger.warn("Received SIGINT, cleaning up...");
    await cleanup(context);
    process.exit(1);
  });

  const steps: VerificationStep[] = [];
  const results: TestResult[] = [];
  let allPassed = true;

  // --- Phase 3: User Story 1 Steps ---
  steps.push({
    name: "Setup Script (Fresh)",
    description: "Run setup.ts in the temporary directory",
    critical: true,
    action: async (ctx) => {
      const setupScriptPath = join(process.cwd(), "setup.ts");
      // We run the setup script FROM the temp dir, pointing to the script in root
      // We pass --name to avoid prompt
      await runCommand(
        ["bun", "run", setupScriptPath, "--name", ctx.projectName, "--force"],
        ctx.tempDir,
        ctx.verbose
      );
    },
  });

  // --- Phase 4: User Story 2 (Idempotency) ---
  steps.push({
    name: "Idempotency Check",
    description: "Run setup.ts AGAIN to ensure idempotency",
    critical: true,
    action: async (ctx) => {
      const setupScriptPath = join(process.cwd(), "setup.ts");
      // Re-run setup
      await runCommand(
        ["bun", "run", setupScriptPath, "--name", ctx.projectName], // No --force, it should handle existing directory
        ctx.tempDir,
        ctx.verbose
      );
    },
  });

  // --- Phase 5: Stack Verification ---
  async function checkFile(ctx: VerifyContext, relPath: string) {
    const path = join(ctx.projectPath, relPath);
    if (!(await Bun.file(path).exists())) {
        throw new Error(`Missing expected file: ${relPath}`);
    }
  }

  steps.push({
    name: "Stack: NextAuth",
    description: "Verify NextAuth configuration files",
    action: async (ctx) => {
        await checkFile(ctx, "auth.ts");
        await checkFile(ctx, "auth.config.ts");
        await checkFile(ctx, "middleware.ts");
    },
  });

  steps.push({
    name: "Stack: Drizzle",
    description: "Verify Drizzle ORM configuration files",
    action: async (ctx) => {
        await checkFile(ctx, "drizzle.config.ts");
        await checkFile(ctx, "src/db/schema.ts");
        await checkFile(ctx, "src/lib/db.ts");
    },
  });

   steps.push({
    name: "Stack: Tailwind & Biome",
    description: "Verify Tailwind and Biome configuration files",
    action: async (ctx) => {
        await checkFile(ctx, "tailwind.config.ts");
        await checkFile(ctx, "biome.json");
        await checkFile(ctx, "components.json"); // Shadcn
    },
  });

  steps.push({
    name: "Build Check",
    description: "Run bun run build in the generated project",
    action: async (ctx) => {
      await runCommand(["bun", "run", "build"], ctx.projectPath, ctx.verbose);
    },
  });

  steps.push({
    name: "Lint Check",
    description: "Run bun run lint (Biome)",
    action: async (ctx) => {
      await runCommand(["bun", "run", "lint"], ctx.projectPath, ctx.verbose);
    },
  });

  steps.push({
    name: "Type Check",
    description: "Run tsc --noEmit",
    action: async (ctx) => {
        // Next.js projects usually have typescript installed.
        // We use bunx to execute tsc from node_modules
      await runCommand(["bunx", "tsc", "--noEmit"], ctx.projectPath, ctx.verbose);
    },
  });

  // Execution Loop
  for (const step of steps) {
    const start = performance.now();
    try {
      await step.action(context);
      const duration = Math.round(performance.now() - start);
      Logger.pass(step.name, duration);
      results.push({ stepName: step.name, status: "PASS", durationMs: duration });
    } catch (e) {
      const duration = Math.round(performance.now() - start);
      Logger.fail(step.name, e instanceof Error ? e : new Error(String(e)));
      results.push({ stepName: step.name, status: "FAIL", error: e instanceof Error ? e : new Error(String(e)), durationMs: duration });
      allPassed = false;
      
      if (step.critical) {
        Logger.fail("Critical step failed. Aborting.");
        break;
      }
    }
  }

  // Cleanup
  await cleanup(context);

  if (!allPassed) {
    Logger.fail("Verification failed.");
    process.exit(1);
  } else {
    Logger.pass("Verification Complete! All checks passed.");
    process.exit(0);
  }
}

if (import.meta.main) {
  main();
}
