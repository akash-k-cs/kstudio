import { Code2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-editor-bg flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center animate-pulse">
          <Code2 className="w-8 h-8 text-white" />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary blur-xl opacity-30 animate-pulse" />
      </div>
      <p className="text-text-secondary mt-6 animate-pulse">{message}</p>
    </div>
  );
}
