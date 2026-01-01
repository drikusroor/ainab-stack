import { Command } from "commander";
import chalk from "chalk";
import { join } from "node:path";
import { getProjectName } from "./prompts.ts";
import { scaffold } from "./scaffold.ts";
import type { ScaffoldOptions } from "./types.ts";

export async function main() {
  const program = new Command();

  program
    .name("ainab-stack")
    .description("CLI to scaffold Ainab Stack projects")
    .version("0.0.3");

  program
    .argument("[project-name]", "Name of the project")
    .option("-f, --force", "Overwrite existing directory", false)
    .action(async (projectNameArg, options) => {
      console.log(chalk.blue(`Welcome to Ainab Stack CLI`));
      
      let projectName = projectNameArg;
      if (!projectName) {
        projectName = await getProjectName();
      }

      if (!projectName) {
        console.error(chalk.red("Project name is required."));
        process.exit(1);
      }

      const targetDir = join(process.cwd(), projectName);

      const scaffoldOptions: ScaffoldOptions = {
        projectName,
        targetDir,
        force: options.force,
      };

      await scaffold(scaffoldOptions);
    });

  program.parse();
}
