import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Page d'accueil qui redirige vers le tableau de bord ou la page de connexion
 */
export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // Rediriger vers le tableau de bord si l'utilisateur est authentifié
        router.replace('/dashboard');
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  // Afficher un indicateur de chargement pendant la redirection
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Chargement de l'application...</p>
      </div>
    </div>
  );
}