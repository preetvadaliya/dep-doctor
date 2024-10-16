import { debug, getInput, setOutput } from "@actions/core";
import type { DependenciesList, PackageInfo } from "@src/types";
import packageJson from "package-json";

/**
 * Drafts the final message to be posted on the PR, listing new dependencies
 * and their metadata.
 *
 * @param newDependencies The list of new dependencies (both prod and dev).
 */
export const draftMessage = async (
  newDependencies: DependenciesList
): Promise<string> => {
  const listDependencies = [
    ...newDependencies.dependencies,
    ...newDependencies.devDependencies,
  ];

  const info: Record<string, PackageInfo> = {};
  for (const dependency of listDependencies) {
    try {
      const packageInfo = await packageJson(dependency, { fullMetadata: true });
      info[dependency] = {
        name: packageInfo.name,
        description: packageInfo.description,
        version: packageInfo.version,
        license: packageInfo.license,
      };
    } catch (error) {
      debug(`Package not found: ${dependency}`);
    }
  }

  const dependenciesTable = `
| **Index** | **Context (Description)** | **Name** | **Version** | **License** |
| --------- | -------------------------- | -------- | ----------- | ----------- |
${newDependencies.dependencies
  .map((dep, index) => {
    const metadata = info[dep];
    return metadata
      ? `| ${index + 1} | ${metadata.description || "N/A"} | ${
          metadata.name
        } | ${metadata.version || "N/A"} | ${metadata.license || "N/A"} |`
      : "";
  })
  .filter(Boolean)
  .join("\n")}
`;

  const devDependenciesTable = `
| **Index** | **Context (Description)** | **Name** | **Version** | **License** |
| --------- | -------------------------- | -------- | ----------- | ----------- |
${newDependencies.devDependencies
  .map((dep, index) => {
    const metadata = info[dep];
    return metadata
      ? `| ${index + 1} | ${metadata.description || "N/A"} | ${
          metadata.name
        } | ${metadata.version || "N/A"} | ${metadata.license || "N/A"} |`
      : "";
  })
  .filter(Boolean)
  .join("\n")}
`;

  const template = getInput("template");
  if (newDependencies.dependencies.length >= 0 ? dependenciesTable : "") {
    template.replace("{$DEPS}", dependenciesTable);
  }
  if (newDependencies.devDependencies.length >= 0 ? devDependenciesTable : "") {
    template.replace("{$DEV_DEPS}", devDependenciesTable);
  }
  const sections = ["<!-- new-dependencies-action -->", template];
  setOutput("report", template);
  return sections.filter(Boolean).join("\n");
};
