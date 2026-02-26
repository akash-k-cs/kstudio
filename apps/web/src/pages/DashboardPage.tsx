import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderGit2, Github, Clock, Trash2, ExternalLink, LogOut } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import type { Project } from '@kstudio/shared';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projects, fetchProjects, deleteProject, isLoading } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenProject = (project: Project) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      setDeletingId(projectId);
      try {
        await deleteProject(projectId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <header className="border-b border-editor-border bg-editor-sidebar/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">Code Studio</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatarUrl}
                alt={user?.username}
                className="w-9 h-9 rounded-full ring-2 ring-editor-border"
              />
              <span className="text-text-primary font-medium">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Projects</h2>
            <p className="text-text-secondary">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FolderGit2 className="w-16 h-16 text-text-muted mb-4" />
            <h3 className="text-xl font-medium text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-6">
              Create your first project or clone from GitHub
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project)}
                className="group bg-editor-sidebar border border-editor-border rounded-xl p-5 cursor-pointer hover:border-accent-primary/50 hover:bg-editor-active transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-editor-active flex items-center justify-center">
                    <FolderGit2 className="w-6 h-6 text-accent-primary" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {project.githubRepo && (
                      <a
                        href={`https://github.com/${project.githubRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-editor-hover rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id)}
                      disabled={deletingId === project.id}
                      className="p-2 text-text-secondary hover:text-accent-error hover:bg-editor-hover rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-1 truncate">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-text-muted">
                  {project.githubRepo && (
                    <div className="flex items-center gap-1.5">
                      <Github className="w-4 h-4" />
                      <span className="truncate max-w-[120px]">{project.githubRepo}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
