import { useAuth } from '@/hooks/useAuth';

/**
 * Composant pour contrôler l'accès aux fonctionnalités en fonction des rôles de l'utilisateur
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les enfants du composant
 * @param {string} props.requiredRole - Le rôle requis pour accéder à la fonctionnalité
 * @param {boolean} props.fallback - Élément à afficher si l'utilisateur n'a pas le rôle requis
 * @returns {React.ReactNode} - Le composant enfant si l'utilisateur est autorisé
 */
const RoleBasedAccess = ({ children, requiredRole, fallback = null }) => {
  const { user, checkUserPermission } = useAuth();

  // Vérifier si l'utilisateur a le rôle requis
  const hasPermission = user?.roles && user.roles[requiredRole] === true;

  // Si l'utilisateur a le rôle requis, afficher les enfants
  // Sinon, afficher le fallback ou null
  return hasPermission ? children : fallback;
};

export default RoleBasedAccess;