import React, { useState, useEffect } from 'react';
import { FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiCheckCircle, FiUserCheck } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import { useAuth } from '@/context/AuthContext';
import firebaseService from '@/services/firebaseService';
import { format } from 'date-fns';

/**
 * Page de gestion des utilisateurs (accessible uniquement aux administrateurs)
 */
const UserManagement = () => {
  const { ROLES } = useAuth();
  
  // États pour la liste des utilisateurs
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour le modal de création/édition d'utilisateur
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    fonction: 'Receptionniste',
    genre: 'Homme',
    dateDeNaissance: '',
    lieuTravail: '',
    password: '',
    confirmPassword: '',
    roles: {
      enregistrer: false,
      observer: false,
      analyser: false,
      interpreter: false,
      creationExamen: false,
      creationPatient: false
    }
  });

  // Chargement des utilisateurs depuis Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await firebaseService.getAllUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Erreur lors du chargement des utilisateurs. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filtrer les utilisateurs en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filtered = users.filter(user => {
        return (
          (user.nom && user.nom.toLowerCase().includes(lowercasedFilter)) ||
          (user.prenom && user.prenom.toLowerCase().includes(lowercasedFilter)) ||
          (user.email && user.email.toLowerCase().includes(lowercasedFilter)) ||
          (user.fonction && user.fonction.toLowerCase().includes(lowercasedFilter))
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Ouvrir le modal pour créer un nouvel utilisateur
  const handleCreateUser = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      fonction: 'Receptionniste',
      genre: 'Homme',
      dateDeNaissance: '',
      lieuTravail: ''
    });
    setModalMode('create');
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  // Ouvrir le modal pour éditer un utilisateur existant
  const handleEditUser = (user) => {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      fonction: user.fonction || 'Receptionniste',
      genre: user.genre || 'Homme',
      dateDeNaissance: user.dateDeNaissance ? format(new Date(user.dateDeNaissance), 'yyyy-MM-dd') : '',
      lieuTravail: user.lieuTravail || '',
      roles: user.roles || {
        enregistrer: false,
        observer: false,
        analyser: false,
        interpreter: false,
        creationExamen: false,
        creationPatient: false
      }
    });
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await firebaseService.deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setSuccess('Utilisateur supprimé avec succès.');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        setError('Erreur lors de la suppression de l\'utilisateur. Veuillez réessayer plus tard.');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Gérer les changements de valeur dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('role_')) {
      const roleKey = name.replace('role_', '');
      setFormData(prev => ({
        ...prev,
        roles: {
          ...prev.roles,
          [roleKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Valider le formulaire avant soumission
  const validateForm = () => {
    if (!formData.nom) return 'Le nom est requis';
    if (!formData.prenom) return 'Le prénom est requis';
    if (!formData.email) return 'L\'email est requis';
    if (!formData.telephone) return 'Le téléphone est requis';
    // Validation d'email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Format d\'email invalide';
    if (modalMode === 'create' || formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';
      if (formData.password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return null;
  };

  // Soumettre le formulaire d'utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier la validité du formulaire
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données de l'utilisateur
      const userData = {
        ...formData,
        dateDeNaissance: formData.dateDeNaissance ? new Date(formData.dateDeNaissance).toISOString() : null,
        roles: formData.roles
      };
      if (!formData.password) delete userData.password;
      if (!formData.confirmPassword) delete userData.confirmPassword;
      
      if (modalMode === 'create') {
        // Créer un nouvel utilisateur
        const newUser = await firebaseService.addUser(userData);
        setUsers(prevUsers => [...prevUsers, newUser]);
        setSuccess('Utilisateur créé avec succès.');
      } else {
        // Mettre à jour un utilisateur existant
        const updatedUser = await firebaseService.updateUser(selectedUser.id, userData);
        setUsers(prevUsers => prevUsers.map(user => (user.id === selectedUser.id ? updatedUser : user)));
        setSuccess('Utilisateur mis à jour avec succès.');
      }
      
      // Fermer le modal après succès
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
      setError('Erreur lors de l\'enregistrement de l\'utilisateur. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <RoleBasedRoute roles={ROLES.ADMIN}>
      <Layout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Utilisateurs
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Créez, modifiez et gérez les comptes utilisateurs de la plateforme
            </p>
          </div>

          {/* Messages d'erreur ou de succès */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* En-tête avec boutons d'action et recherche */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <button
              onClick={handleCreateUser}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors mb-4 md:mb-0"
            >
              <FiUserPlus className="mr-2" />
              Ajouter un utilisateur
            </button>
            
            <div className="relative w-full md:w-64">
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
              {loading && users.length === 0 ? (
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fonction
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              {user.prenom && user.nom ? (
                                `${user.prenom[0]}${user.nom[0]}`
                              ) : (
                                <FiUserCheck className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.prenom} {user.nom}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.genre || 'Non spécifié'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.lieuTravail || 'Non spécifié'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.fonction || 'Non spécifié'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.telephone || 'Non spécifié'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {/* <button */}
                            <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-4"
                            title="Modifier"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            title="Supprimer"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Modal de création/édition d'utilisateur */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {modalMode === 'create' ? 'Créer un nouvel utilisateur' : 'Modifier l\'utilisateur'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Messages d'erreur ou de succès dans le modal */}
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded flex items-center">
                    <FiCheckCircle className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                )}

                {/* Formulaire d'utilisateur */}
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Nom */}
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                        required
                      />
                    </div>

                    {/* Prénom */}
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                        required
                      />
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Téléphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                        required
                      />
                    </div>

                    {/* Adresse */}
                    <div>
                      <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        name="adresse"
                        value={formData.adresse}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                      />
                    </div>

                    {/* Date de naissance */}
                    <div>
                      <label htmlFor="dateDeNaissance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        id="dateDeNaissance"
                        name="dateDeNaissance"
                        value={formData.dateDeNaissance}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                      />
                    </div>

                    {/* Fonction */}
                    <div>
                      <label htmlFor="fonction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fonction <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="fonction"
                        name="fonction"
                        value={formData.fonction}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                        required
                      >
                        <option value="Infirmier">Infirmier</option>
                        <option value="Technicien">Technicien</option>
                        <option value="Medecin">Médecin</option>
                        <option value="Professeur">Professeur</option>
                        <option value="Receptionniste">Réceptionniste</option>
                        <option value="Administrateur">Administrateur</option>
                      </select>
                    </div>

                    {/* Genre */}
                    <div>
                      <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Genre
                      </label>
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    {/* Lieu de travail */}
                    <div>
                      <label htmlFor="lieuTravail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lieu de travail
                      </label>
                      <input
                        type="text"
                        id="lieuTravail"
                        name="lieuTravail"
                        value={formData.lieuTravail}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-end space-x-3 mt-8">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement...
                        </>
                      ) : (
                        modalMode === 'create' ? 'Créer l\'utilisateur' : 'Mettre à jour'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </RoleBasedRoute>
  );
};

export default UserManagement;