import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  githubRepo?: string;

  @IsString()
  @IsOptional()
  githubBranch?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  settings?: {
    language?: string;
    framework?: string;
    buildCommand?: string;
    startCommand?: string;
    envVariables?: Record<string, string>;
  };
}

export class SaveFileDto {
  @IsString()
  content: string;
}

export class CreateFileDto {
  @IsString()
  path: string;

  @IsString()
  @IsOptional()
  content?: string;
}
