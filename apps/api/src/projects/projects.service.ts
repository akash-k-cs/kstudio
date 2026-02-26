import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  private workspacesDir: string;

  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private configService: ConfigService,
  ) {
    this.workspacesDir = this.configService.get<string>('WORKSPACES_DIR') || '/tmp/kstudio-workspaces';
  }

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.create({
      ...createProjectDto,
      ownerId: new Types.ObjectId(userId),
    });

    // Create workspace directory
    const workspacePath = path.join(this.workspacesDir, project._id.toString());
    await fs.mkdir(workspacePath, { recursive: true });
    
    project.workspacePath = workspacePath;
    await project.save();

    // Create initial files
    await fs.writeFile(
      path.join(workspacePath, 'README.md'),
      `# ${createProjectDto.name}\n\n${createProjectDto.description || 'A new Code Studio project.'}\n`,
    );

    return project;
  }

  async findAll(userId: string): Promise<ProjectDocument[]> {
    return this.projectModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<ProjectDocument> {
    const project = await this.projectModel.findById(id);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<ProjectDocument> {
    const project = await this.findById(id, userId);
    
    Object.assign(project, updateProjectDto);
    await project.save();

    return project;
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.findById(id, userId);

    // Delete workspace directory
    if (project.workspacePath) {
      try {
        await fs.rm(project.workspacePath, { recursive: true, force: true });
      } catch (error) {
        console.error('Failed to delete workspace:', error);
      }
    }

    await project.deleteOne();
  }

  async getWorkspacePath(projectId: string, userId: string): Promise<string> {
    const project = await this.findById(projectId, userId);
    
    if (!project.workspacePath) {
      const workspacePath = path.join(this.workspacesDir, project._id.toString());
      await fs.mkdir(workspacePath, { recursive: true });
      project.workspacePath = workspacePath;
      await project.save();
    }

    return project.workspacePath;
  }
}
