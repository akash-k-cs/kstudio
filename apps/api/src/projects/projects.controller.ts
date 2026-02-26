import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';
import { CreateProjectDto, UpdateProjectDto, SaveFileDto, CreateFileDto } from './dto/project.dto';
import { ProjectDocument } from './schemas/project.schema';

// Transform MongoDB document to frontend-friendly format
function transformProject(project: ProjectDocument) {
  const obj = project.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    ownerId: obj.ownerId.toString(),
    githubRepo: obj.githubRepo,
    githubBranch: obj.githubBranch,
    railwayProjectId: obj.railwayProjectId,
    settings: obj.settings,
    workspacePath: obj.workspacePath,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private filesService: FilesService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: UserDocument) {
    const projects = await this.projectsService.findAll(user._id.toString());
    return projects.map(transformProject);
  }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: UserDocument) {
    const project = await this.projectsService.create(createProjectDto, user._id.toString());
    return transformProject(project);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    const project = await this.projectsService.findById(id, user._id.toString());
    return transformProject(project);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: UserDocument,
  ) {
    const project = await this.projectsService.update(id, updateProjectDto, user._id.toString());
    return transformProject(project);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    await this.projectsService.delete(id, user._id.toString());
    return { message: 'Project deleted' };
  }

  // File operations
  @Get(':id/files')
  async getFiles(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.filesService.getFileTree(id, user._id.toString());
  }

  @Get(':id/files/*')
  async getFile(@Param('id') id: string, @Param() params: any, @CurrentUser() user: UserDocument) {
    // Extract file path from wildcard
    const filePath = params['0'] || '';
    return this.filesService.readFile(id, filePath, user._id.toString());
  }

  @Post(':id/files')
  async createFile(
    @Param('id') id: string,
    @Body() createFileDto: CreateFileDto,
    @CurrentUser() user: UserDocument,
  ) {
    await this.filesService.createFile(
      id,
      createFileDto.path,
      createFileDto.content || '',
      user._id.toString(),
    );
    return { message: 'File created' };
  }

  @Patch(':id/files/*')
  async saveFile(
    @Param('id') id: string,
    @Param() params: any,
    @Body() saveFileDto: SaveFileDto,
    @CurrentUser() user: UserDocument,
  ) {
    const filePath = params['0'] || '';
    await this.filesService.writeFile(id, filePath, saveFileDto.content, user._id.toString());
    return { message: 'File saved' };
  }

  @Delete(':id/files/*')
  async deleteFile(@Param('id') id: string, @Param() params: any, @CurrentUser() user: UserDocument) {
    const filePath = params['0'] || '';
    await this.filesService.deleteFile(id, filePath, user._id.toString());
    return { message: 'File deleted' };
  }
}
