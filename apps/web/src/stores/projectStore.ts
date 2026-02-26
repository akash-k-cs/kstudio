import { create } from 'zustand';
import type { Project, FileNode } from '@kstudio/shared';
import { projectsApi } from '@/services/api';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  fileTree: FileNode | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; githubRepo?: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  fetchFileTree: (projectId: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, _get) => ({
  projects: [],
  currentProject: null,
  fileTree: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectsApi.getAll();
      set({ projects, isLoading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch projects', 
        isLoading: false 
      });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectsApi.create(data);
      set((state) => ({ 
        projects: [...state.projects, project], 
        isLoading: false 
      }));
      return project;
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create project', 
        isLoading: false 
      });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await projectsApi.delete(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete project', 
        isLoading: false 
      });
      throw err;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  fetchFileTree: async (projectId) => {
    try {
      const fileTree = await projectsApi.getFiles(projectId);
      set({ fileTree });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch files' 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
