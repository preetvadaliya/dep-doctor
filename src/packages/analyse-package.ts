import { GitHubClient } from "@src/helpers";
import type { DependenciesList } from "@src/types";
import { getLocalPackageInfo } from "./local-package-info";

export async function analysePackage(file: string): Promise<DependenciesList> {
  const ghClient = GitHubClient.getClient();

  const baseBranch = await ghClient.getBaseBranch();
  const basePackage = await ghClient.getPackage(file, baseBranch);
  const baseDependencies = basePackage
    ? Object.keys(basePackage.dependencies)
    : [];
  const baseDevDependencies = basePackage
    ? Object.keys(basePackage.devDependencies)
    : [];

  const updatedPackage = await getLocalPackageInfo(file);
  const updatedDependencies = Object.keys(updatedPackage.dependencies);
  const updatedDevDependencies = Object.keys(updatedPackage.devDependencies);

  const newDependencies = updatedDependencies.filter(
    (dep) => !baseDependencies.includes(dep)
  );
  const newDevDependencies = updatedDevDependencies.filter(
    (dep) => !baseDevDependencies.includes(dep)
  );

  return {
    dependencies: newDependencies,
    devDependencies: newDevDependencies,
  };
}
