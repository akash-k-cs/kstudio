import { IsString, IsOptional, IsObject } from 'class-validator';

export class DeployProjectDto {
  @IsString()
  projectId: string;

  @IsObject()
  @IsOptional()
  environmentVariables?: Record<string, string>;
}
