export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  htmlUrl: string;
  cloneUrl: string;
  defaultBranch: string;
  language?: string;
  updatedAt: Date;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

export interface CloneRepoDto {
  repoFullName: string;
  branch?: string;
  projectName?: string;
}

export interface CommitChangesDto {
  projectId: string;
  message: string;
  files: Array<{
    path: string;
    action: 'add' | 'modify' | 'delete';
  }>;
}

export interface PushChangesDto {
  projectId: string;
  branch?: string;
  force?: boolean;
}
