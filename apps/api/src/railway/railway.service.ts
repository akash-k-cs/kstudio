import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Deployment, DeploymentDocument } from './schemas/deployment.schema';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class RailwayService {
  private apiToken: string;
  private apiUrl = 'https://backboard.railway.app/graphql/v2';

  constructor(
    @InjectModel(Deployment.name) private deploymentModel: Model<DeploymentDocument>,
    private configService: ConfigService,
    private projectsService: ProjectsService,
  ) {
    this.apiToken = this.configService.get<string>('RAILWAY_API_TOKEN') || '';
  }

  async deploy(
    projectId: string,
    userId: string,
    environmentVariables?: Record<string, string>,
  ): Promise<DeploymentDocument> {
    if (!this.apiToken) {
      throw new BadRequestException('Railway API token not configured');
    }

    const project = await this.projectsService.findById(projectId, userId);

    // Create deployment record
    const deployment = await this.deploymentModel.create({
      projectId: new Types.ObjectId(projectId),
      status: 'pending',
    });

    // Start deployment process asynchronously
    this.startDeployment(deployment, project.workspacePath!, environmentVariables).catch(
      (error) => {
        this.updateDeploymentStatus(deployment._id.toString(), 'failed', error.message);
      },
    );

    return deployment;
  }

  private async startDeployment(
    deployment: DeploymentDocument,
    workspacePath: string,
    environmentVariables?: Record<string, string>,
  ): Promise<void> {
    try {
      await this.updateDeploymentStatus(deployment._id.toString(), 'building');

      // Create or get Railway project
      const railwayProject = await this.getOrCreateRailwayProject(deployment.projectId.toString());

      // Create service if needed
      const service = await this.getOrCreateService(railwayProject.id, workspacePath);

      // Set environment variables if provided
      if (environmentVariables && Object.keys(environmentVariables).length > 0) {
        await this.setEnvironmentVariables(service.id, environmentVariables);
      }

      await this.updateDeploymentStatus(deployment._id.toString(), 'deploying');

      // Trigger deployment
      const railwayDeployment = await this.triggerDeployment(service.id, workspacePath);

      deployment.railwayDeploymentId = railwayDeployment.id;
      deployment.railwayServiceId = service.id;
      deployment.url = railwayDeployment.url;
      deployment.status = 'success';
      await deployment.save();
    } catch (error) {
      await this.updateDeploymentStatus(
        deployment._id.toString(),
        'failed',
        error instanceof Error ? error.message : 'Deployment failed',
      );
    }
  }

  private async graphqlRequest(query: string, variables?: Record<string, any>): Promise<any> {
    const response = await axios.post(
      this.apiUrl,
      { query, variables },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data;
  }

  private async getOrCreateRailwayProject(kstudioProjectId: string): Promise<{ id: string; name: string }> {
    const query = `
      mutation CreateProject($name: String!) {
        projectCreate(input: { name: $name }) {
          id
          name
        }
      }
    `;

    const result = await this.graphqlRequest(query, {
      name: `kstudio-${kstudioProjectId.slice(-8)}`,
    });

    return result.projectCreate;
  }

  private async getOrCreateService(
    railwayProjectId: string,
    _workspacePath: string,
  ): Promise<{ id: string }> {
    const query = `
      mutation CreateService($projectId: String!, $name: String!) {
        serviceCreate(input: { projectId: $projectId, name: $name }) {
          id
        }
      }
    `;

    const result = await this.graphqlRequest(query, {
      projectId: railwayProjectId,
      name: 'web',
    });

    return result.serviceCreate;
  }

  private async setEnvironmentVariables(
    serviceId: string,
    variables: Record<string, string>,
  ): Promise<void> {
    const query = `
      mutation SetVariables($serviceId: String!, $variables: EnvironmentVariables!) {
        variableCollectionUpsert(input: { serviceId: $serviceId, variables: $variables })
      }
    `;

    await this.graphqlRequest(query, {
      serviceId,
      variables,
    });
  }

  private async triggerDeployment(
    serviceId: string,
    _workspacePath: string,
  ): Promise<{ id: string; url?: string }> {
    // In a real implementation, you would push the code to Railway
    // For now, return a mock deployment
    return {
      id: `deploy-${Date.now()}`,
      url: `https://kstudio-${serviceId.slice(-8)}.railway.app`,
    };
  }

  private async updateDeploymentStatus(
    deploymentId: string,
    status: Deployment['status'],
    errorMessage?: string,
  ): Promise<void> {
    await this.deploymentModel.findByIdAndUpdate(deploymentId, {
      status,
      ...(errorMessage && { errorMessage }),
    });
  }

  async getDeployments(projectId: string, userId: string): Promise<DeploymentDocument[]> {
    // Verify user has access to project
    await this.projectsService.findById(projectId, userId);

    return this.deploymentModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }

  async getDeploymentLogs(deploymentId: string, userId: string): Promise<string[]> {
    const deployment = await this.deploymentModel.findById(deploymentId);
    if (!deployment) {
      throw new BadRequestException('Deployment not found');
    }

    // Verify user has access to project
    await this.projectsService.findById(deployment.projectId.toString(), userId);

    return deployment.logs;
  }
}
