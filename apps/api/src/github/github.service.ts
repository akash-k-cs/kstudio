import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import simpleGit, { SimpleGit } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs/promises';
import { UserDocument } from '../auth/schemas/user.schema';
import { ProjectsService } from '../projects/projects.service';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  updated_at: string;
}

@Injectable()
export class GithubService {
  private workspacesDir: string;

  constructor(
    private configService: ConfigService,
    private projectsService: ProjectsService,
  ) {
    this.workspacesDir = this.configService.get<string>('WORKSPACES_DIR') || '/tmp/kstudio-workspaces';
  }

  async getRepos(user: UserDocument): Promise<GitHubRepo[]> {
    const response = await axios.get<GitHubRepo[]>('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
      params: {
        sort: 'updated',
        per_page: 100,
      },
    });

    return response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      default_branch: repo.default_branch,
      language: repo.language,
      updated_at: repo.updated_at,
    }));
  }

  async cloneRepo(
    repoFullName: string,
    branch: string | undefined,
    projectName: string | undefined,
    user: UserDocument,
  ) {
    // Create project first
    const name = projectName || repoFullName.split('/')[1];
    const project = await this.projectsService.create(
      {
        name,
        description: `Cloned from ${repoFullName}`,
        githubRepo: repoFullName,
        githubBranch: branch,
      },
      user._id.toString(),
    );

    const workspacePath = project.workspacePath;
    if (!workspacePath) {
      throw new BadRequestException('Failed to create workspace');
    }

    // Clone repository
    const cloneUrl = `https://${user.accessToken}@github.com/${repoFullName}.git`;
    const git: SimpleGit = simpleGit();

    try {
      // Remove existing directory if any
      await fs.rm(workspacePath, { recursive: true, force: true });
      
      // Clone the repository
      await git.clone(cloneUrl, workspacePath, branch ? ['--branch', branch] : []);

      // Update project with branch info
      const repoGit = simpleGit(workspacePath);
      const branchInfo = await repoGit.branch();
      project.githubBranch = branchInfo.current;
      await project.save();

      return project;
    } catch (error) {
      // Cleanup on failure
      await this.projectsService.delete(project._id.toString(), user._id.toString());
      throw new BadRequestException(`Failed to clone repository: ${error.message}`);
    }
  }

  async pushChanges(
    projectId: string,
    message: string,
    branch: string | undefined,
    user: UserDocument,
  ) {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, user._id.toString());
    const git = simpleGit(workspacePath);

    // Configure git user
    await git.addConfig('user.email', user.email);
    await git.addConfig('user.name', user.username);

    // Add all changes
    await git.add('.');

    // Commit
    await git.commit(message);

    // Push
    const targetBranch = branch || (await git.branch()).current;
    await git.push('origin', targetBranch);

    return { message: 'Changes pushed successfully', branch: targetBranch };
  }

  async pullChanges(projectId: string, user: UserDocument) {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, user._id.toString());
    const git = simpleGit(workspacePath);

    const result = await git.pull();
    
    return {
      message: 'Changes pulled successfully',
      changes: result.summary,
    };
  }

  async getBranches(repoFullName: string, user: UserDocument) {
    const response = await axios.get(
      `https://api.github.com/repos/${repoFullName}/branches`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    return response.data;
  }

  async getStatus(projectId: string, user: UserDocument) {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, user._id.toString());
    const git = simpleGit(workspacePath);

    const status = await git.status();
    
    return {
      current: status.current,
      tracking: status.tracking,
      ahead: status.ahead,
      behind: status.behind,
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      staged: status.staged,
      conflicted: status.conflicted,
    };
  }
}
