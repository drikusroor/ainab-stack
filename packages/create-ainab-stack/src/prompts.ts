import prompts from "prompts";

export async function getProjectName() {
  const response = await prompts({
    type: "text",
    name: "projectName",
    message: "What is the name of your project?",
    initial: "my-ainab-app",
  });

  return response.projectName;
}
