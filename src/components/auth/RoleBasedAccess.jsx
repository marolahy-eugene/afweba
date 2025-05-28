import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant pour contrôler l'accès aux fonctionnalités en fonction du rôle de l'utilisateur
 * @param {Object} props - Propriétés du composant
 * @param {Array|string} props.allowedRoles - Rôles autorisés à accéder au contenu
 * @param {React.ReactNode} props.children - Contenu à afficher si l'utilisateur a le rôle requis
 * @param {React.ReactNode} [props.fallback=null] - Contenu à afficher si l'utilisateur n'a pas le rôle requis
 * @param {Array|string} [props.permissions=[]] - Permissions requises pour accéder au contenu
 * @param {boolean} [props.requireAllPermissions=false] - Si true, toutes les permissions sont requises, sinon une seule suffit
 */
const RoleBasedAccess = ({
  allowedRoles,
  children,
  fallback = null,
  permissions = [],
  requireAllPermissions = false,
}) => {
  const { user, hasRole, checkUserPermission } = useAuth();

  // Si l'utilisateur n'est pas connecté, afficher le fallback
  if (!user) return fallback;

  // Vérifier si l'utilisateur a le rôle requis
  const hasRequiredRole = hasRole(allowedRoles);

  // Si des permissions sont spécifiées, vérifier si l'utilisateur a les permissions requises
  let hasRequiredPermissions = true;
  if (permissions.length > 0) {
    if (Array.isArray(permissions)) {
      if (requireAllPermissions) {
        // Toutes les permissions sont requises
        hasRequiredPermissions = permissions.every(permission => checkUserPermission(permission));
      } else {
        // Au moins une permission est requise
        hasRequiredPermissions = permissions.some(permission => checkUserPermission(permission));
      }
    } else {
      // Une seule permission est spécifiée
      hasRequiredPermissions = checkUserPermission(permissions);
    }
  }

  // Si l'utilisateur a le rôle requis et les permissions requises, afficher le contenu
  if (hasRequiredRole && hasRequiredPermissions) {
    return children;
  }

  // Sinon, afficher le fallback
  return fallback;
};

export default RoleBasedAccess;