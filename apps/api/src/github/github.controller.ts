import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';
import { CloneRepoDto, CommitChangesDto, PullChangesDto } from './dto/github.dto';
import { ProjectDocument } from '../projects/schemas/project.schema';

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

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Get('repos')
  async getRepos(@CurrentUser() user: UserDocument) {
    const repos = await this.githubService.getRepos(user);
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
      language: repo.language,
      updatedAt: repo.updated_at,
    }));
  }

  @Post('clone')
  async cloneRepo(@Body() cloneRepoDto: CloneRepoDto, @CurrentUser() user: UserDocument) {
    const project = await this.githubService.cloneRepo(
      cloneRepoDto.repoFullName,
      cloneRepoDto.branch,
      cloneRepoDto.projectName,
      user,
    );
    return transformProject(project);
  }

  @Post('push')
  async pushChanges(@Body() commitDto: CommitChangesDto, @CurrentUser() user: UserDocument) {
    return this.githubService.pushChanges(
      commitDto.projectId,
      commitDto.message,
      undefined,
      user,
    );
  }

  @Post('pull')
  async pullChanges(@Body() pullDto: PullChangesDto, @CurrentUser() user: UserDocument) {
    return this.githubService.pullChanges(pullDto.projectId, user);
  }

  @Get('repos/:owner/:repo/branches')
  async getBranches(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.githubService.getBranches(`${owner}/${repo}`, user);
  }

  @Get('status/:projectId')
  async getStatus(@Param('projectId') projectId: string, @CurrentUser() user: UserDocument) {
    return this.githubService.getStatus(projectId, user);
  }
}
