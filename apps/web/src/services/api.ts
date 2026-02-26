import axios, { AxiosError } from 'axios';
import type { 
  User, 
  Project, 
  CreateProjectDto, 
  FileNode, 
  FileContent,
  GitHubRepo,
  CloneRepoDto,
  Deployment,
  DeployProjectDto,
} from '@kstudio/shared';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  getGithubAuthUrl: () => '/api/auth/github',
  
  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects');
    return data;
  },
  
  getById: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },
  
  create: async (dto: CreateProjectDto): Promise<Project> => {
    const { data } = await api.post('/projects', dto);
    return data;
  },
  
  update: async (id: string, dto: Partial<CreateProjectDto>): Promise<Project> => {
    const { data } = await api.patch(`/projects/${id}`, dto);
    return data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
  
  getFiles: async (id: string): Promise<FileNode> => {
    const { data } = await api.get(`/projects/${id}/files`);
    return data;
  },
  
  getFileContent: async (id: string, path: string): Promise<FileContent> => {
    const { data } = await api.get(`/projects/${id}/files/${encodeURIComponent(path)}`);
    return data;
  },
  
  saveFile: async (id: string, path: string, content: string): Promise<void> => {
    await api.patch(`/projects/${id}/files/${encodeURIComponent(path)}`, { content });
  },
  
  createFile: async (id: string, path: string, content = ''): Promise<void> => {
    await api.post(`/projects/${id}/files`, { path, content });
  },
  
  deleteFile: async (id: string, path: string): Promise<void> => {
    await api.delete(`/projects/${id}/files/${encodeURIComponent(path)}`);
  },
};

// GitHub API
export const githubApi = {
  getRepos: async (): Promise<GitHubRepo[]> => {
    const { data } = await api.get('/github/repos');
    return data;
  },
  
  cloneRepo: async (dto: CloneRepoDto): Promise<Project> => {
    const { data } = await api.post('/github/clone', dto);
    return data;
  },
  
  pushChanges: async (projectId: string, message: string): Promise<void> => {
    await api.post('/github/push', { projectId, message });
  },
  
  pullChanges: async (projectId: string): Promise<void> => {
    await api.post('/github/pull', { projectId });
  },
};

// Railway API
export const railwayApi = {
  deploy: async (dto: DeployProjectDto): Promise<Deployment> => {
    const { data } = await api.post('/railway/deploy', dto);
    return data;
  },
  
  getDeployments: async (projectId: string): Promise<Deployment[]> => {
    const { data } = await api.get(`/railway/deployments?projectId=${projectId}`);
    return data;
  },
};

// OpenCode API
export const opencodeApi = {
  sendMessage: async (projectId: string, message: string): Promise<{ response: string }> => {
    const { data } = await api.post('/opencode/chat', { projectId, message });
    return data;
  },
};

export default api;
