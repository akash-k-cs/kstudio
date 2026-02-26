import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RailwayService } from './railway.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../auth/schemas/user.schema';
import { DeployProjectDto } from './dto/railway.dto';

@Controller('railway')
@UseGuards(JwtAuthGuard)
export class RailwayController {
  constructor(private railwayService: RailwayService) {}

  @Post('deploy')
  async deploy(@Body() deployDto: DeployProjectDto, @CurrentUser() user: UserDocument) {
    return this.railwayService.deploy(
      deployDto.projectId,
      user._id.toString(),
      deployDto.environmentVariables,
    );
  }

  @Get('deployments')
  async getDeployments(
    @Query('projectId') projectId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.railwayService.getDeployments(projectId, user._id.toString());
  }

  @Get('logs/:deploymentId')
  async getLogs(
    @Param('deploymentId') deploymentId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.railwayService.getDeploymentLogs(deploymentId, user._id.toString());
  }
}
