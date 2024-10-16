import { GitHubClient } from "@src/helpers";

/**
 * Lists all updated package files in the current pull request
 *
 * @param context Context to use for the GitHub API call
 */
export const getPackageFiles = async (): Promise<string[]> => {
  // lists all updated files in the current pull request
  const ghClient = GitHubClient.getClient();
  const files = await ghClient.listFiles();

  // returns the filtered list of package files
  return files.filter((file) => file.includes("package.json"));
};
