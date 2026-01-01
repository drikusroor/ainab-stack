import { join } from "node:path";
import { existsSync, cpSync } from "node:fs";

export async function main() {
  const args = Bun.argv.slice(2);
  let projectName = args.find(arg => !arg.startsWith("-"));
  const force = args.includes("--force") || args.includes("-f");

  console.log("\x1b[34m%s\x1b[0m", "Welcome to Ainab Stack CLI");

  if (!projectName) {
    projectName = prompt("What is the name of your project?", "my-ainab-app") || "my-ainab-app";
  }

  const targetDir = join(process.cwd(), projectName);

  if (existsSync(targetDir) && !force) {
    console.error("\x1b[31m%s\x1b[0m", `Directory ${projectName} already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  console.log("\x1b[32m%s\x1b[0m", `\nScaffolding project in ${targetDir}...`);

  // When running via 'bun create user/repo', we are inside the cloned repo
  // The template is in the 'template' folder relative to this script
  const templateDir = join(import.meta.dir, "..", "template");

  if (!existsSync(templateDir)) {
    // Fallback for different execution contexts
    console.error("\x1b[31m%s\x1b[0m", "Template directory not found.");
    process.exit(1);
  }

  try {
    cpSync(templateDir, targetDir, { recursive: true });
    
    // Update package.json name
    const pkgPath = join(targetDir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = await Bun.file(pkgPath).json();
      pkg.name = projectName;
      await Bun.write(pkgPath, JSON.stringify(pkg, null, 2));
    }

    console.log("\x1b[34m%s\x1b[0m", `\nDone! Now run:\n`);
    console.log(`  cd ${projectName}`);
    console.log(`  bun install`);
    console.log(`  bun dev\n`);
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "Failed to scaffold project:", err);
    process.exit(1);
  }
}