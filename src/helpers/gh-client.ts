/* eslint-disable @typescript-eslint/camelcase, @typescript-eslint/explicit-member-accessibility */
import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import type { GitHub } from "@actions/github/lib/utils";
import type { Package } from "@src/types";

export class GitHubClient {
  public readonly owner: string;
  public readonly prNumber: number;
  public readonly repo: string;
  private octokit: InstanceType<typeof GitHub>;
  private baseBranch?: string;
  private messageId?: number | false;
  private static hydratedInstance?: GitHubClient = undefined;

  constructor() {
    this.octokit = getOctokit(getInput("token"));
    const { number } = context.issue;
    const { owner, repo } = context.repo;
    this.owner = owner;
    this.prNumber = number;
    this.repo = repo;
  }

  public async createMessage(content: string): Promise<void> {
    if (this.messageId) return this.updateMessage(content);
    await this.octokit.rest.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.prNumber,
      body: content,
    });
  }

  public async deleteMessage(): Promise<void> {
    if (!this.messageId) return;
    await this.octokit.rest.issues.deleteComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: this.messageId,
    });
    this.messageId = false;
  }

  public async getBaseBranch(): Promise<string> {
    if (!this.baseBranch) {
      const { data } = await this.octokit.rest.pulls.get({
        pull_number: this.prNumber,
        owner: this.owner,
        repo: this.repo,
      });
      this.baseBranch = data.base.ref;
    }
    return this.baseBranch;
  }

  public async getPackage(file: string, baseBranch: string): Promise<Package> {
    try {
      const { data: fileInfo } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        path: file,
        ref: baseBranch,
        repo: this.repo,
      });

      if (Array.isArray(fileInfo)) {
        return {
          dependencies: {},
          devDependencies: {},
        };
      }

      if (fileInfo.type === "file") {
        const content = JSON.parse(
          Buffer.from(
            fileInfo.content,
            fileInfo.encoding as "base64"
          ).toString()
        );
        return {
          dependencies: content?.dependencies || {},
          devDependencies: content?.devDependencies || {},
        };
      }
      return {
        dependencies: {},
        devDependencies: {},
      };
    } catch (error) {
      return {
        dependencies: {},
        devDependencies: {},
      };
    }
  }

  public async fetchMessage(): Promise<number | undefined> {
    if (this.messageId === undefined) {
      const { data } = await this.octokit.rest.issues.listComments({
        owner: this.owner,
        repo: this.repo,
        issue_number: this.prNumber,
      });

      const actionMessages = data.filter((message) =>
        message.body?.includes("<!-- new-dependencies-action -->")
      );

      this.messageId = actionMessages.length ? actionMessages[0].id : false;
    }

    return this.messageId || undefined;
  }

  public async listFiles(): Promise<string[]> {
    const { data } = await this.octokit.rest.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber,
    });
    return data.map((file) => file.filename);
  }

  public async setMessage(content: string): Promise<void> {
    if (this.messageId === undefined) await this.fetchMessage();
    if (this.messageId) return this.updateMessage(content);
    await this.createMessage(content);
  }

  public async updateMessage(content: string): Promise<void> {
    if (!this.messageId) return this.createMessage(content);
    await this.octokit.rest.issues.updateComment({
      owner: this.owner,
      repo: this.repo,
      comment_id: this.messageId,
      body: content,
    });
  }

  public static getClient(): GitHubClient {
    if (!GitHubClient.hydratedInstance)
      GitHubClient.hydratedInstance = new GitHubClient();
    return GitHubClient.hydratedInstance;
  }
}
