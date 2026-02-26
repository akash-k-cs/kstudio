export interface Project {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    githubRepo?: string;
    githubBranch?: string;
    railwayProjectId?: string;
    settings: ProjectSettings;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProjectSettings {
    language?: string;
    framework?: string;
    buildCommand?: string;
    startCommand?: string;
    envVariables?: Record<string, string>;
}
export interface CreateProjectDto {
    name: string;
    description?: string;
    githubRepo?: string;
    githubBranch?: string;
}
export interface UpdateProjectDto {
    name?: string;
    description?: string;
    settings?: Partial<ProjectSettings>;
}
