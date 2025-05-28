import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant pour protéger une route en fonction du rôle de l'utilisateur
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les enfants du composant
 * @param {string|string[]} props.roles - Le ou les rôles autorisés à accéder à la route
 * @param {string} props.redirectTo - La route de redirection en cas d'accès non autorisé
 * @returns {React.ReactNode} - Le composant enfant si l'utilisateur est autorisé
 */
const RoleBasedRoute = ({ children, roles, redirectTo = '/login' }) => {
  const { user, isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading) return;

    const checkAuthorization = async () => {
      setIsChecking(true);

      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      if (!isAuthenticated) {
        setIsAuthorized(false);
        await router.replace(redirectTo);
        return;
      }

      // Vérifier si l'utilisateur a le rôle requis
      if (!hasRole(roles)) {
        setIsAuthorized(false);
        // Si l'utilisateur est connecté mais n'a pas le rôle requis,
        // rediriger vers le tableau de bord spécifique à son rôle
        if (user && user.role) {
          switch (user.role) {
            case 'receptionniste':
              await router.replace('/dashboard/receptionniste');
              break;
            case 'infirmier':
              await router.replace('/dashboard/infirmier');
              break;
            case 'medecin':
              await router.replace('/dashboard/medecin');
              break;
            case 'professeur':
              await router.replace('/dashboard/professeur');
              break;
            case 'technicien':
              await router.replace('/dashboard/technicien');
              break;
            case 'administrateur':
              await router.replace('/dashboard/administrateur');
              break;
            default:
              await router.replace('/dashboard');
          }
        } else {
          await router.replace(redirectTo);
        }
      } else {
        setIsAuthorized(true);
      }

      setIsChecking(false);
    };

    checkAuthorization();
  }, [isAuthenticated, loading, hasRole, roles, redirectTo, router, user]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Ne rien afficher si l'utilisateur n'est pas autorisé (pendant la redirection)
  if (!isAuthorized) {
    return null;
  }

  // Afficher le contenu si l'utilisateur est autorisé
  return children;
};

// Ajout de getInitialProps pour compatibilité avec les anciennes versions
RoleBasedRoute.getInitialProps = async (ctx) => {
  return {
    props: {}
  };
};

export default RoleBasedRoute;