import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { projectsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import EditorLayout from '@/components/layout/EditorLayout';
import Sidebar from '@/components/sidebar/Sidebar';
import EditorTabs from '@/components/editor/EditorTabs';
import CodeEditor from '@/components/editor/CodeEditor';
import TerminalPanel from '@/components/terminal/TerminalPanel';
import AIPanel from '@/components/ai/AIPanel';
import LoadingScreen from '@/components/layout/LoadingScreen';

export default function EditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, fetchFileTree, fileTree } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        navigate('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        const project = await projectsApi.getById(projectId);
        setCurrentProject(project);
        await fetchFileTree(projectId);
        
        // Connect socket and join project room (awaiting connection)
        socketService.connect();
        await socketService.joinProject(projectId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();

    return () => {
      if (projectId) {
        socketService.leaveProject(projectId);
      }
    };
  }, [projectId, navigate, setCurrentProject, fetchFileTree]);

  if (isLoading) {
    return <LoadingScreen message="Loading project..." />;
  }

  if (error || !currentProject) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-accent-error text-xl mb-4">Failed to load project</div>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout
      sidebar={<Sidebar fileTree={fileTree} projectId={projectId!} />}
      editor={
        <div className="flex flex-col h-full">
          <EditorTabs />
          <CodeEditor projectId={projectId!} />
        </div>
      }
      terminal={showTerminal ? <TerminalPanel projectId={projectId!} /> : null}
      aiPanel={showAIPanel ? <AIPanel projectId={projectId!} onClose={() => setShowAIPanel(false)} /> : null}
      showTerminal={showTerminal}
      showAIPanel={showAIPanel}
      onToggleTerminal={() => setShowTerminal(!showTerminal)}
      onToggleAIPanel={() => setShowAIPanel(!showAIPanel)}
      project={currentProject}
    />
  );
}
