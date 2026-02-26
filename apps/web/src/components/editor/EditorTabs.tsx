import { X, Circle } from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import clsx from 'clsx';

export default function EditorTabs() {
  const { tabs, activeTabPath, setActiveTab, closeTab } = useEditorStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center bg-editor-sidebar border-b border-editor-border overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.path === activeTabPath;
        return (
          <div
            key={tab.path}
            onClick={() => setActiveTab(tab.path)}
            className={clsx(
              'group flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer border-r border-editor-border transition-colors',
              isActive
                ? 'bg-editor-bg text-text-primary'
                : 'bg-editor-sidebar text-text-secondary hover:text-text-primary'
            )}
          >
            <span className="truncate text-sm flex-1">{tab.name}</span>
            <div className="flex items-center">
              {tab.isDirty && (
                <Circle className="w-2 h-2 fill-accent-primary text-accent-primary mr-1" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.path);
                }}
                className={clsx(
                  'p-0.5 rounded transition-colors',
                  isActive || tab.isDirty
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                  'hover:bg-editor-hover'
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
