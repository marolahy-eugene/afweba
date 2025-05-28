import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiEdit, FiSave, FiX, FiSearch } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import firebaseService from '@/services/firebaseService';
import { useAuth } from '@/context/AuthContext';

export default function UserRolesManagement() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedRoles, setEditedRoles] = useState({});

  // Rediriger si l'utilisateur n'est pas administrateur
  useEffect(() => {
    if (user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, router]);

  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await firebaseService.getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin]);

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(searchLower) ||
      user.prenom?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.numeroOrdre?.toLowerCase().includes(searchLower) ||
      user.fonction?.toLowerCase().includes(searchLower)
    );
  });

  // Commencer l'édition des rôles d'un utilisateur
  const handleEditRoles = (userId, currentRoles) => {
    setEditingUserId(userId);
    setEditedRoles(currentRoles || {
      creationPatient: false,
      creationExamen: false,
      observer: false,
      enregistrer: false,
      analyser: false,
      interpreter: false,
      admin: false
    });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedRoles({});
  };

  // Mettre à jour un rôle spécifique
  const handleRoleChange = (role, value) => {
    setEditedRoles(prev => ({
      ...prev,
      [role]: value
    }));
  };

  // Sauvegarder les rôles modifiés
  const handleSaveRoles = async (userId) => {
    try {
      await firebaseService.updateUserRoles(userId, editedRoles);
      
      // Mettre à jour l'état local
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, roles: editedRoles };
        }
        return user;
      }));
      
      // Réinitialiser l'état d'édition
      setEditingUserId(null);
      setEditedRoles({});
    } catch (error) {
      console.error('Erreur lors de la mise à jour des rôles:', error);
      alert('Erreur lors de la mise à jour des rôles. Veuillez réessayer.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Gestion des Rôles Utilisateur
        </h1>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      N° Ordre
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nom et Prénom
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fonction
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rôles
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.numeroOrdre || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.nom} {user.prenom}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.fonction || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {user.telephone || '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {editingUserId === user.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`creationPatient-${user.id}`}
                                checked={editedRoles.creationPatient || false}
                                onChange={(e) => handleRoleChange('creationPatient', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`creationPatient-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Création patient
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`creationExamen-${user.id}`}
                                checked={editedRoles.creationExamen || false}
                                onChange={(e) => handleRoleChange('creationExamen', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`creationExamen-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Création examen
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`observer-${user.id}`}
                                checked={editedRoles.observer || false}
                                onChange={(e) => handleRoleChange('observer', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`observer-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Observer
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`enregistrer-${user.id}`}
                                checked={editedRoles.enregistrer || false}
                                onChange={(e) => handleRoleChange('enregistrer', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`enregistrer-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Enregistrer
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`analyser-${user.id}`}
                                checked={editedRoles.analyser || false}
                                onChange={(e) => handleRoleChange('analyser', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`analyser-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Analyser
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`interpreter-${user.id}`}
                                checked={editedRoles.interpreter || false}
                                onChange={(e) => handleRoleChange('interpreter', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`interpreter-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Interpréter
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`admin-${user.id}`}
                                checked={editedRoles.admin || false}
                                onChange={(e) => handleRoleChange('admin', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <label htmlFor={`admin-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Administrateur
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {user.roles?.creationPatient && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 mr-1 mb-1">Création patient</span>}
                            {user.roles?.creationExamen && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mr-1 mb-1">Création examen</span>}
                            {user.roles?.observer && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 mr-1 mb-1">Observer</span>}
                            {user.roles?.enregistrer && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100 mr-1 mb-1">Enregistrer</span>}
                            {user.roles?.analyser && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 mr-1 mb-1">Analyser</span>}
                            {user.roles?.interpreter && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100 mr-1 mb-1">Interpréter</span>}
                            {user.roles?.admin && <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 mr-1 mb-1">Administrateur</span>}
                            {(!user.roles || Object.keys(user.roles).every(key => !user.roles[key])) && <span className="text-gray-400 dark:text-gray-500">Aucun rôle</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingUserId === user.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleSaveRoles(user.id)}
                              className="flex items-center justify-center p-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                              title="Enregistrer"
                            >
                              <FiSave className="h-4 w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center justify-center p-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                              title="Annuler"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditRoles(user.id, user.roles)}
                            className="flex items-center justify-center p-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                            title="Modifier les rôles"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}