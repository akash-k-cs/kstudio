import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FolderPlus, Github, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { githubApi } from '@/services/api';
import type { GitHubRepo } from '@kstudio/shared';
import clsx from 'clsx';

interface CreateProjectModalProps {
  onClose: () => void;
}

type TabType = 'blank' | 'github';

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabType>('blank');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub repos
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'github') {
      loadRepos();
    }
  }, [activeTab]);

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      const data = await githubApi.getRepos();
      setRepos(data);
    } catch {
      setError('Failed to load repositories');
    } finally {
      setLoadingRepos(false);
    }
  };

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'blank' && !name.trim()) {
      setError('Project name is required');
      return;
    }

    if (activeTab === 'github' && !selectedRepo) {
      setError('Please select a repository');
      return;
    }

    setIsSubmitting(true);
    try {
      let project;
      if (activeTab === 'blank') {
        project = await createProject({ name: name.trim(), description: description.trim() });
      } else {
        project = await githubApi.cloneRepo({
          repoFullName: selectedRepo!.fullName,
          projectName: name.trim() || selectedRepo!.name,
        });
      }
      onClose();
      navigate(`/project/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-editor-sidebar border border-editor-border rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-editor-border">
          <h2 className="text-xl font-semibold text-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-editor-border">
          <button
            onClick={() => setActiveTab('blank')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === 'blank'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <FolderPlus className="w-4 h-4" />
            Blank Project
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === 'github'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Github className="w-4 h-4" />
            Clone from GitHub
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-accent-error/10 border border-accent-error/30 rounded-lg text-accent-error text-sm">
              {error}
            </div>
          )}

          {activeTab === 'blank' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full bg-editor-bg border border-editor-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  rows={3}
                  className="w-full bg-editor-bg border border-editor-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Search Repositories
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your repos..."
                  className="w-full bg-editor-bg border border-editor-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-editor-border">
                {loadingRepos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    No repositories found
                  </div>
                ) : (
                  filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        setSelectedRepo(repo);
                        setName(repo.name);
                      }}
                      className={clsx(
                        'w-full text-left px-4 py-3 border-b border-editor-border last:border-b-0 transition-colors',
                        selectedRepo?.id === repo.id
                          ? 'bg-accent-primary/10 border-l-2 border-l-accent-primary'
                          : 'hover:bg-editor-hover'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Github className="w-4 h-4 text-text-secondary" />
                        <span className="font-medium text-text-primary">{repo.name}</span>
                        {repo.private && (
                          <span className="text-xs bg-editor-active text-text-secondary px-1.5 py-0.5 rounded">
                            Private
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-text-secondary mt-1 line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>

              {selectedRepo && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-editor-bg border border-editor-border rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
