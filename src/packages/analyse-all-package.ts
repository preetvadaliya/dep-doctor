import type { DependenciesList } from "@src/types";
import { analysePackage } from "./analyse-package";

/**
 * Returns the list of all new dependencies not existing in the base branch
 * for all the packages provided as a parameter.
 *
 * @param files List of packages to analyze with the base branch.
 */
export const analyseAllPackages = async (
  files: string[]
): Promise<DependenciesList> => {
  const dependencies: DependenciesList = {
    dependencies: [],
    devDependencies: [],
  };

  for (const file of files) {
    const result = await analysePackage(file);

    dependencies.dependencies.push(...result.dependencies);
    dependencies.devDependencies.push(...result.devDependencies);
  }

  return dependencies;
};
