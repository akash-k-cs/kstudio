import { Github, Code2, Zap, Cloud } from 'lucide-react';
import { authApi } from '@/services/api';

export default function LoginPage() {
  const handleGitHubLogin = () => {
    window.location.href = authApi.getGithubAuthUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-center p-4">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,152,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,152,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      <div className="relative z-10 max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary mb-6 shadow-lg shadow-accent-primary/25">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Code Studio
          </h1>
          <p className="text-text-secondary text-lg">
            Your cloud development environment
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-editor-sidebar/80 backdrop-blur-xl border border-editor-border rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Features */}
            <div className="grid gap-4 mb-8">
              <div className="flex items-center gap-3 text-text-primary">
                <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                  <Github className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <p className="font-medium">GitHub Integration</p>
                  <p className="text-sm text-text-secondary">Clone, commit & push directly</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-text-primary">
                <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-secondary" />
                </div>
                <div>
                  <p className="font-medium">AI-Powered Coding</p>
                  <p className="text-sm text-text-secondary">OpenCode agent assistance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-text-primary">
                <div className="w-10 h-10 rounded-lg bg-accent-warning/10 flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-accent-warning" />
                </div>
                <div>
                  <p className="font-medium">One-Click Deploy</p>
                  <p className="text-sm text-text-secondary">Deploy to Railway instantly</p>
                </div>
              </div>
            </div>

            {/* GitHub Login Button */}
            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <Github className="w-6 h-6" />
              Continue with GitHub
            </button>

            <p className="text-center text-text-muted text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-8">
          Built with React, NestJS, Monaco Editor & Railway
        </p>
      </div>
    </div>
  );
}
