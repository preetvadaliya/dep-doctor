import { debug } from "@actions/core";
import type { DependenciesList } from "@src/types";
import packageJson, { type FullMetadata } from "package-json";

/**
 * Drafts the final message to be posted on the PR, listing new dependencies and their metadata.
 *
 * @param newDependencies The list of new dependencies (both prod and dev).
 */
export async function draftMessage(
  newDependencies: DependenciesList
): Promise<string> {
  const listDependencies = [
    ...newDependencies.dependencies,
    ...newDependencies.devDependencies,
  ];

  const info: Record<string, FullMetadata> = {};
  for (const dependency of listDependencies) {
    try {
      // @ts-ignore
      info[dependency] = await packageJson(dependency, { fullMetadata: true });
    } catch (error) {
      debug(`Package not found: ${dependency}`);
    }
  }

  const dependenciesTable = `
## Dependencies Added
| **Dependency** | **License** | **Description** |
| -------------- | ----------- | --------------- |
${newDependencies.dependencies
  .map((dep) => {
    const metadata = info[dep];
    return metadata
      ? `| ${metadata.name} | ${metadata.license || "N/A"} | ${
          metadata.description || "N/A"
        } |`
      : "";
  })
  .filter(Boolean)
  .join("\n")}
`;

  const devDependenciesTable = `
## Development Dependencies Added
| **Dependency** | **License** | **Description** |
| -------------- | ----------- | --------------- |
${newDependencies.devDependencies
  .map((dep) => {
    const metadata = info[dep];
    return metadata
      ? `| ${metadata.name} | ${metadata.license || "N/A"} | ${
          metadata.description || "N/A"
        } |`
      : "";
  })
  .filter(Boolean)
  .join("\n")}
`;

  const sections = [
    "<!-- new-dependencies-action -->",
    newDependencies.dependencies.length ? dependenciesTable : "",
    newDependencies.devDependencies.length ? devDependenciesTable : "",
  ];

  return sections.filter(Boolean).join("\n");
}
