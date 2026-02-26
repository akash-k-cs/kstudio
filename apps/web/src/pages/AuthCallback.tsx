import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/layout/LoadingScreen';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAccessToken, checkAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(errorParam);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (token) {
        setAccessToken(token);
        await checkAuth();
        navigate('/dashboard');
      } else {
        setError('No authentication token received');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, setAccessToken, checkAuth, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-accent-error text-xl mb-4">Authentication Failed</div>
          <p className="text-text-secondary">{error}</p>
          <p className="text-text-muted mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen message="Completing sign in..." />;
}
