import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, Plus, RefreshCw } from 'lucide-react';
import type { FileNode, FileContent } from '@kstudio/shared';
import { LANGUAGE_MAP } from '@kstudio/shared';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { projectsApi } from '@/services/api';
import clsx from 'clsx';

interface SidebarProps {
  fileTree: FileNode | null;
  projectId: string;
}

export default function Sidebar({ fileTree, projectId }: SidebarProps) {
  const { fetchFileTree } = useProjectStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFileTree(projectId);
    setIsRefreshing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={clsx('w-4 h-4', isRefreshing && 'animate-spin')} />
          </button>
          <button
            className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {fileTree ? (
          <FileTreeNode node={fileTree} projectId={projectId} depth={0} />
        ) : (
          <div className="px-4 py-8 text-center text-text-muted text-sm">
            No files yet
          </div>
        )}
      </div>
    </div>
  );
}

interface FileTreeNodeProps {
  node: FileNode;
  projectId: string;
  depth: number;
}

function FileTreeNode({ node, projectId, depth }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const { openFile } = useEditorStore();
  const { activeTabPath } = useEditorStore();

  const handleClick = async () => {
    if (node.type === 'directory') {
      setIsExpanded(!isExpanded);
    } else {
      try {
        const content = await projectsApi.getFileContent(projectId, node.path);
        const ext = '.' + node.name.split('.').pop();
        const fileContent: FileContent = {
          path: node.path,
          content: content.content,
          language: LANGUAGE_MAP[ext] || 'plaintext',
        };
        openFile(fileContent);
      } catch (error) {
        console.error('Failed to open file:', error);
      }
    }
  };

  const isActive = activeTabPath === node.path;
  const paddingLeft = depth * 12 + 8;

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-1.5 py-1 px-2 cursor-pointer text-sm transition-colors',
          isActive
            ? 'bg-editor-active text-text-primary'
            : 'text-text-secondary hover:bg-editor-hover hover:text-text-primary'
        )}
        style={{ paddingLeft }}
      >
        {node.type === 'directory' ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-accent-warning" />
            ) : (
              <Folder className="w-4 h-4 flex-shrink-0 text-accent-warning" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 flex-shrink-0 text-accent-primary" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              // Directories first, then files
              if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
              }
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                projectId={projectId}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}
