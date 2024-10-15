import { readFile } from "node:fs";
import { promisify } from "node:util";
import type { Package } from "@src/types";

const readFileAsync = promisify(readFile);

/**
 * Fetches the content of the requested local `package.json` file.
 *
 * @param file Path to the requested local `package.json` file.
 */
export async function getLocalPackageInfo(
  file = "package.json"
): Promise<Package> {
  try {
    const fileContent = await readFileAsync(file, { encoding: "utf8" });
    const content = JSON.parse(fileContent);
    return {
      dependencies: content?.dependencies || {},
      devDependencies: content?.devDependencies || {},
    };
  } catch (error) {
    return {
      dependencies: {},
      devDependencies: {},
    };
  }
}
