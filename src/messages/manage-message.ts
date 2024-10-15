import { GitHubClient } from "@src/helpers";
import type { DependenciesList } from "@src/types";
import { draftMessage } from "./draft-message";

export async function manageMessage(
  newDependencies?: DependenciesList
): Promise<void> {
  const ghClient = GitHubClient.getClient();
  const actionMessageId = await ghClient.fetchMessage();
  const hasNewDependencies =
    newDependencies?.dependencies.length ||
    newDependencies?.devDependencies.length;

  if (!actionMessageId && !hasNewDependencies) return; // Early exit if no new dependencies and no existing message

  if (actionMessageId && !hasNewDependencies) return ghClient.deleteMessage(); // Delete existing message if no new dependencies

  if (!newDependencies) {
    throw new Error(
      "No new dependencies should have been solved by the previous conditions"
    );
  }

  const message = await draftMessage(newDependencies);
  await ghClient.setMessage(message);
}
