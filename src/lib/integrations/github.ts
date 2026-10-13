export interface GitHubProjectAdapter {
  readonly repository: string;
  listOpenIssues(): Promise<readonly { id: string; title: string; state: string }[]>;
  getDefaultBranch(): Promise<string>;
}

export class DemoGitHubAdapter implements GitHubProjectAdapter {
  readonly repository = "WasteOfADrumBum/TaskForge";

  async listOpenIssues() {
    return [
      { id: "TF-101", title: "Add deterministic workflow replay", state: "open" },
      { id: "TF-119", title: "Improve deployment docs", state: "open" },
    ] as const;
  }

  async getDefaultBranch() {
    return "main";
  }
}
