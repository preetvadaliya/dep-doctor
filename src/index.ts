import * as core from "@actions/core";
import { manageMessage } from "./messages";
import { analyseAllPackages, getPackageFiles } from "./packages";

async function run(): Promise<void> {
  try {
    const packageFiles = await getPackageFiles();
    if (!packageFiles.length) return manageMessage();
    const newDependencies = await analyseAllPackages(packageFiles);
    await manageMessage(newDependencies);
  } catch (error) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    core.setFailed((error as any).message);
  }
}

run();
