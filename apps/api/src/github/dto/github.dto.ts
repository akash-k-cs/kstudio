import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CloneRepoDto {
  @IsString()
  repoFullName: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsString()
  @IsOptional()
  projectName?: string;
}

export class CommitChangesDto {
  @IsString()
  projectId: string;

  @IsString()
  message: string;
}

export class PushChangesDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsBoolean()
  @IsOptional()
  force?: boolean;
}

export class PullChangesDto {
  @IsString()
  projectId: string;
}
