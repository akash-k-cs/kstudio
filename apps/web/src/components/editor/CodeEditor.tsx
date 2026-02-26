import { useCallback, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useEditorStore } from '@/stores/editorStore';
import { projectsApi } from '@/services/api';
import { DEFAULT_EDITOR_SETTINGS } from '@kstudio/shared';
import { FileCode2 } from 'lucide-react';

type IStandaloneCodeEditor = Parameters<OnMount>[0];

interface CodeEditorProps {
  projectId: string;
}

export default function CodeEditor({ projectId }: CodeEditorProps) {
  const { tabs, activeTabPath, updateTabContent, markTabSaved } = useEditorStore();
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);

  const activeTab = tabs.find((t) => t.path === activeTabPath);

  // Handle Ctrl/Cmd+S at document level to prevent browser default
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const currentTab = useEditorStore.getState().tabs.find(
          (t) => t.path === useEditorStore.getState().activeTabPath
        );
        if (currentTab && currentTab.isDirty) {
          try {
            await projectsApi.saveFile(projectId, currentTab.path, currentTab.content);
            markTabSaved(currentTab.path);
            console.log('File saved:', currentTab.path);
          } catch (error) {
            console.error('Failed to save file:', error);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [projectId, markTabSaved]);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Also add keyboard shortcut in Monaco editor
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
      async () => {
        const currentTab = useEditorStore.getState().tabs.find(
          (t) => t.path === useEditorStore.getState().activeTabPath
        );
        if (currentTab && currentTab.isDirty) {
          try {
            await projectsApi.saveFile(projectId, currentTab.path, currentTab.content);
            markTabSaved(currentTab.path);
            console.log('File saved:', currentTab.path);
          } catch (error) {
            console.error('Failed to save file:', error);
          }
        }
      }
    );
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeTabPath && value !== undefined) {
        updateTabContent(activeTabPath, value);
      }
    },
    [activeTabPath, updateTabContent]
  );

  if (!activeTab) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-editor-bg text-text-muted">
        <FileCode2 className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Select a file to start editing</p>
        <p className="text-sm mt-2">Use the explorer on the left to browse files</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={activeTab.language}
      value={activeTab.content}
      onChange={handleEditorChange}
      onMount={handleEditorMount}
      theme="vs-dark"
      options={{
        ...DEFAULT_EDITOR_SETTINGS,
        readOnly: activeTab.isLoading,
      }}
      loading={
        <div className="h-full flex items-center justify-center bg-editor-bg">
          <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
        </div>
      }
    />
  );
}
