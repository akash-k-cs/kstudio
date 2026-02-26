export interface Deployment {
  id: string;
  projectId: string;
  railwayDeploymentId: string;
  status: DeploymentStatus;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DeploymentStatus = 
  | 'pending'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface DeployProjectDto {
  projectId: string;
  environmentVariables?: Record<string, string>;
}

export interface RailwayProject {
  id: string;
  name: string;
  environments: RailwayEnvironment[];
}

export interface RailwayEnvironment {
  id: string;
  name: string;
  deploymentTriggers: {
    branch: string;
  };
}
