import { create } from 'zustand';
import type { FileContent } from '@kstudio/shared';

export interface EditorTab {
  path: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  isLoading: boolean;
}

interface EditorState {
  tabs: EditorTab[];
  activeTabPath: string | null;
  
  // Actions
  openFile: (file: FileContent) => void;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateTabContent: (path: string, content: string) => void;
  markTabSaved: (path: string) => void;
  closeAllTabs: () => void;
  closeSavedTabs: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabPath: null,

  openFile: (file) => {
    const { tabs } = get();
    const existingTab = tabs.find((t) => t.path === file.path);

    if (existingTab) {
      set({ activeTabPath: file.path });
      return;
    }

    const name = file.path.split('/').pop() || file.path;
    const newTab: EditorTab = {
      path: file.path,
      name,
      content: file.content,
      language: file.language || 'plaintext',
      isDirty: false,
      isLoading: false,
    };

    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabPath: file.path,
    }));
  },

  closeTab: (path) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.path !== path);
      let newActivePath = state.activeTabPath;

      if (state.activeTabPath === path) {
        const closedIndex = state.tabs.findIndex((t) => t.path === path);
        if (newTabs.length > 0) {
          newActivePath = newTabs[Math.min(closedIndex, newTabs.length - 1)].path;
        } else {
          newActivePath = null;
        }
      }

      return { tabs: newTabs, activeTabPath: newActivePath };
    });
  },

  setActiveTab: (path) => set({ activeTabPath: path }),

  updateTabContent: (path, content) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.path === path ? { ...tab, content, isDirty: true } : tab
      ),
    }));
  },

  markTabSaved: (path) => {
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.path === path ? { ...tab, isDirty: false } : tab
      ),
    }));
  },

  closeAllTabs: () => set({ tabs: [], activeTabPath: null }),

  closeSavedTabs: () => {
    set((state) => {
      const dirtyTabs = state.tabs.filter((t) => t.isDirty);
      const newActivePath = dirtyTabs.length > 0 ? dirtyTabs[0].path : null;
      return { tabs: dirtyTabs, activeTabPath: newActivePath };
    });
  },
}));
