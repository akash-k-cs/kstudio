import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Terminal, 
  Bot, 
  Rocket, 
  GitBranch, 
  Settings,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import type { Project } from '@kstudio/shared';
import clsx from 'clsx';

interface EditorLayoutProps {
  sidebar: React.ReactNode;
  editor: React.ReactNode;
  terminal: React.ReactNode | null;
  aiPanel: React.ReactNode | null;
  showTerminal: boolean;
  showAIPanel: boolean;
  onToggleTerminal: () => void;
  onToggleAIPanel: () => void;
  project: Project;
}

export default function EditorLayout({
  sidebar,
  editor,
  terminal,
  aiPanel,
  showTerminal,
  showAIPanel,
  onToggleTerminal,
  onToggleAIPanel,
  project,
}: EditorLayoutProps) {
  const navigate = useNavigate();
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [showSidebar, setShowSidebar] = useState(true);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingTerminal, setIsResizingTerminal] = useState(false);

  const handleSidebarResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);

    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.clientX - startX);
      setSidebarWidth(Math.max(180, Math.min(400, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  const handleTerminalResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingTerminal(true);

    const startY = e.clientY;
    const startHeight = terminalHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = startHeight - (e.clientY - startY);
      setTerminalHeight(Math.max(100, Math.min(500, newHeight)));
    };

    const handleMouseUp = () => {
      setIsResizingTerminal(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [terminalHeight]);

  return (
    <div className="h-screen flex flex-col bg-editor-bg select-none overflow-hidden">
      {/* Title Bar */}
      <header className="h-10 bg-editor-sidebar border-b border-editor-border flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded transition-colors"
            title="Dashboard"
          >
            <Home className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-editor-border" />
          <span className="text-text-primary font-medium text-sm">{project.name}</span>
          {project.githubRepo && (
            <span className="text-text-muted text-xs flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {project.githubBranch || 'main'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleAIPanel}
            className={clsx(
              'p-1.5 rounded transition-colors',
              showAIPanel 
                ? 'text-accent-secondary bg-accent-secondary/10' 
                : 'text-text-secondary hover:text-text-primary hover:bg-editor-hover'
            )}
            title="AI Assistant"
          >
            <Bot className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleTerminal}
            className={clsx(
              'p-1.5 rounded transition-colors',
              showTerminal 
                ? 'text-accent-primary bg-accent-primary/10' 
                : 'text-text-secondary hover:text-text-primary hover:bg-editor-hover'
            )}
            title="Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded transition-colors"
            title="Deploy"
          >
            <Rocket className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-editor-sidebar border-r border-editor-border flex flex-col items-center py-2 flex-shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={clsx(
              'p-2 rounded-lg transition-colors mb-2',
              showSidebar 
                ? 'text-text-primary bg-editor-active' 
                : 'text-text-secondary hover:text-text-primary'
            )}
            title={showSidebar ? 'Hide Explorer' : 'Show Explorer'}
          >
            {showSidebar ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <>
            <div
              className="flex-shrink-0 bg-editor-sidebar border-r border-editor-border overflow-hidden"
              style={{ width: sidebarWidth }}
            >
              {sidebar}
            </div>
            <div
              onMouseDown={handleSidebarResize}
              className={clsx(
                'w-1 cursor-col-resize hover:bg-accent-primary/50 transition-colors flex-shrink-0',
                isResizingSidebar && 'bg-accent-primary'
              )}
            />
          </>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {editor}
          </div>

          {/* Terminal */}
          {showTerminal && terminal && (
            <>
              <div
                onMouseDown={handleTerminalResize}
                className={clsx(
                  'h-1 cursor-row-resize hover:bg-accent-primary/50 transition-colors flex-shrink-0',
                  isResizingTerminal && 'bg-accent-primary'
                )}
              />
              <div 
                className="flex-shrink-0 overflow-hidden"
                style={{ height: terminalHeight }}
              >
                {terminal}
              </div>
            </>
          )}
        </div>

        {/* AI Panel */}
        {showAIPanel && aiPanel && (
          <div className="w-96 border-l border-editor-border flex-shrink-0 overflow-hidden">
            {aiPanel}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-accent-primary flex items-center justify-between px-3 text-white text-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            {project.githubBranch || 'main'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Code Studio</span>
        </div>
      </footer>
    </div>
  );
}
