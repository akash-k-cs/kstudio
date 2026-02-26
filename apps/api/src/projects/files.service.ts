import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { ProjectsService } from './projects.service';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  modifiedAt?: Date;
}

@Injectable()
export class FilesService {
  constructor(private projectsService: ProjectsService) {}

  async getFileTree(projectId: string, userId: string): Promise<FileNode> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);
    return this.buildFileTree(workspacePath, '');
  }

  private async buildFileTree(basePath: string, relativePath: string): Promise<FileNode> {
    const fullPath = path.join(basePath, relativePath);
    const stats = await fs.stat(fullPath);
    const name = path.basename(fullPath) || 'root';

    if (stats.isDirectory()) {
      const entries = await fs.readdir(fullPath);
      const children = await Promise.all(
        entries
          .filter((entry) => !this.shouldIgnore(entry))
          .map((entry) => this.buildFileTree(basePath, path.join(relativePath, entry))),
      );

      return {
        name,
        path: relativePath || '.',
        type: 'directory',
        children: children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
      };
    }

    return {
      name,
      path: relativePath,
      type: 'file',
      size: stats.size,
      modifiedAt: stats.mtime,
    };
  }

  private shouldIgnore(name: string): boolean {
    const ignoreList = [
      'node_modules',
      '.git',
      '.DS_Store',
      'dist',
      'build',
      '.cache',
      '.env',
      '.env.local',
    ];
    return ignoreList.includes(name) || name.startsWith('.');
  }

  async readFile(projectId: string, filePath: string, userId: string): Promise<{ content: string; path: string }> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);
    const fullPath = path.join(workspacePath, filePath);

    // Security: ensure path is within workspace
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(workspacePath))) {
      throw new NotFoundException('File not found');
    }

    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content, path: filePath };
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async writeFile(projectId: string, filePath: string, content: string, userId: string): Promise<void> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);
    const fullPath = path.join(workspacePath, filePath);

    // Security: ensure path is within workspace
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(workspacePath))) {
      throw new NotFoundException('Invalid path');
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async createFile(projectId: string, filePath: string, content: string, userId: string): Promise<void> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);
    const fullPath = path.join(workspacePath, filePath);

    // Security: ensure path is within workspace
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(workspacePath))) {
      throw new NotFoundException('Invalid path');
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async deleteFile(projectId: string, filePath: string, userId: string): Promise<void> {
    const workspacePath = await this.projectsService.getWorkspacePath(projectId, userId);
    const fullPath = path.join(workspacePath, filePath);

    // Security: ensure path is within workspace
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(path.resolve(workspacePath))) {
      throw new NotFoundException('Invalid path');
    }

    try {
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        await fs.rm(fullPath, { recursive: true });
      } else {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }
}
