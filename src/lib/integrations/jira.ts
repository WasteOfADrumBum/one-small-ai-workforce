export interface JiraProjectAdapter {
  readonly baseUrl: string;
  listBacklogItems(): Promise<readonly { key: string; summary: string; status: string }[]>;
}

export class DemoJiraAdapter implements JiraProjectAdapter {
  readonly baseUrl = "https://taskforgejms.atlassian.net";

  async listBacklogItems() {
    return [
      { key: "TFJ-42", summary: "Implement worker permission model", status: "To Do" },
      { key: "TFJ-43", summary: "Design approval center audit trail", status: "In Progress" },
    ] as const;
  }
}
