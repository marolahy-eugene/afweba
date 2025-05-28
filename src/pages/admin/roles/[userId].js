import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import firebaseService from '@/services/firebaseService';

const UserRoleManagementPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { ROLES } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editedRoles, setEditedRoles] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserAndRoles = async () => {
      try {
        setLoading(true);
        const userData = await firebaseService.getUserById(userId);
        if (userData) {
          setUser(userData);
          // Initialize editedRoles with current user roles or default empty roles
          setEditedRoles(userData.roles || {
            creationPatient: false,
            creationExamen: false,
            observer: false,
            enregistrer: false,
            analyser: false,
            interpreter: false,
            admin: false
          });
        } else {
          setError('Utilisateur non trouvé.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'utilisateur et de ses rôles:', err);
        setError('Erreur lors du chargement des informations de l\'utilisateur.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRoles();
  }, [userId]);

  const handleRoleChange = (role, value) => {
    setEditedRoles(prev => ({
      ...prev,
      [role]: value
    }));
  };

  const handleSaveRoles = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      await firebaseService.updateUserRoles(userId, editedRoles);
      setSaveSuccess(true);
      // Optionally update local user state if needed, though fetching again might be simpler
      // setUser(prevUser => ({ ...prevUser, roles: editedRoles }));
      setTimeout(() => setSaveSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error('Erreur lors de la sauvegarde des rôles:', err);
      setError('Erreur lors de la sauvegarde des rôles. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Vous pouvez maintenant utiliser userId pour charger et gérer les rôles de cet utilisateur spécifique

  return (
    <RoleBasedRoute roles={ROLES.ADMINISTRATEUR}>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-300 dark:text-white mb-6">
            Gestion des Rôles pour l'utilisateur : {userId}
          </h1>

          {loading && <p className="text-gray-600 dark:text-gray-400">Chargement des informations utilisateur...</p>}
          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

          {user && !loading && !error && (
            <div className="bg-custom dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-300 dark:text-white">{user.nom} {user.prenom}</p>
                <p className="text-sm my-3 text-gray-400 dark:text-gray-400">Email: {user.email}</p>
                <p className="text-sm text-gray-400 dark:text-gray-400">Fonction: {user.fonction || '-'}</p>
              </div>

              <h2 className="text-xl font-semibold text-gray-300 dark:text-white my-5">Modifier les Rôles</h2>
              <div className="bg-custom-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-6">
                {Object.keys(editedRoles).map(roleKey => (
                  <div key={roleKey} className="flex items-center">
                    <input
                      type="checkbox"
                      id={roleKey}
                      checked={editedRoles[roleKey] || false}
                      onChange={(e) => handleRoleChange(roleKey, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={roleKey} className="ml-2 block text-md text-gray-300 dark:text-gray-300">
                      {/* Convert camelCase roleKey to readable text */}
                      {roleKey.replace(/([A-Z])/g, ' $1').trim().replace('creation', 'Création ').replace('observer', 'Observer').replace('enregistrer', 'Enregistrer').replace('analyser', 'Analyser').replace('interpreter', 'Interpréter').replace('admin', 'Admin')}
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveRoles}
                disabled={isSaving}
                className={`px-4 py-2 rounded-md text-white ${isSaving ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50`}
              >
                {isSaving ? 'Sauvegarde en cours...' : 'Sauvegarder les Rôles'}
              </button>

              {saveSuccess && (
                <p className="mt-4 text-green-600 dark:text-green-400">Rôles sauvegardés avec succès !</p>
              )}
            </div>
          )}
        </div>
      </Layout>
    </RoleBasedRoute>
  );
};

export default UserRoleManagementPage;