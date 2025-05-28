import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave, FiUserPlus } from 'react-icons/fi';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import firebaseService from '@/services/firebaseService';

export default function UsersAdminPage() {
  const { user, isAuthenticated, loading: authLoading, hasRole, ROLES } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    adresse: '',
    fonction: ROLES.RECEPTIONNISTE,
    specialite: ''
  });
  
  // Rediriger si non authentifié ou non administrateur
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && isAuthenticated && !hasRole(ROLES.ADMINISTRATEUR)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, hasRole, router, ROLES.ADMINISTRATEUR]);

  // Charger la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersData = await firebaseService.getAllUsers();
        setUsers(usersData);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        setError('Impossible de charger la liste des utilisateurs.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && hasRole(ROLES.ADMINISTRATEUR)) {
      fetchUsers();
    }
  }, [isAuthenticated, hasRole, ROLES.ADMINISTRATEUR]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const searchValue = searchTerm.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(searchValue) ||
      user.prenom?.toLowerCase().includes(searchValue) ||
      user.email?.toLowerCase().includes(searchValue) ||
      user.fonction?.toLowerCase().includes(searchValue)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Réinitialiser les erreurs
    setError(null);

    // Vérifier les champs obligatoires
    const requiredFields = ['nom', 'prenom', 'email', 'fonction'];
    // Si c'est un nouvel utilisateur ou si le mot de passe est modifié, ajouter password et confirmPassword
    if (!currentUser || formData.password) {
      requiredFields.push('password', 'confirmPassword');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs obligatoires: ${missingFields.join(', ')}.`);
      return false;
    }

    // Vérifier le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide.');
      return false;
    }

    // Vérifier les mots de passe
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas.');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Préparer les données utilisateur
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password, // Dans un système réel, le mot de passe serait hashé
        telephone: formData.telephone || '',
        adresse: formData.adresse || '',
        fonction: formData.fonction,
        specialite: formData.specialite || ''
      };
      
      if (currentUser) {
        // Mise à jour d'un utilisateur existant
        await firebaseService.updateUser(currentUser.id, userData);
        
        // Mettre à jour la liste des utilisateurs
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === currentUser.id ? { ...u, ...userData } : u
          )
        );
      } else {
        // Création d'un nouvel utilisateur
        const newUser = await firebaseService.addUser(userData);
        
        // Ajouter le nouvel utilisateur à la liste
        setUsers(prevUsers => [...prevUsers, newUser]);
      }
      
      // Fermer le modal et réinitialiser le formulaire
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
      setError(`Une erreur est survenue: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      fonction: user.fonction || ROLES.RECEPTIONNISTE,
      specialite: user.specialite || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        setLoading(true);
        await firebaseService.deleteUser(userId);
        
        // Mettre à jour la liste des utilisateurs
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        setError(`Une erreur est survenue: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const openAddModal = () => {
    setCurrentUser(null);
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      confirmPassword: '',
      telephone: '',
      adresse: '',
      fonction: ROLES.RECEPTIONNISTE,
      specialite: ''
    });
    setError(null);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-custom">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Utilisateurs</h1>
          
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <FiUserPlus className="mr-2" />
            Ajouter un utilisateur
          </button>
        </div>
        
        {/* Barre de recherche */}
        <div className="mb-6 relative">
          <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400">
              <FiSearch size={20} />
            </div>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Liste des utilisateurs */}
        <div className="bg-custom rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Aucun utilisateur trouvé.'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-custom-3">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fonction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-custom divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.prenom} {user.nom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.fonction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.telephone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Modal pour ajouter/modifier un utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-custom rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {currentUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="nom" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="telephone" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="adresse" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Adresse
                  </label>
                  <textarea
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="fonction" className="block font-medium text-gray-300 dark:text-gray-300 mb-1 text-md">
                    Fonction *
                  </label>
                  <select
                    id="fonction"
                    name="fonction"
                    value={formData.fonction}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value={ROLES.ADMINISTRATEUR}>Administrateur</option>
                    <option value={ROLES.MEDECIN}>Medecin</option>
                    <option value={ROLES.INFIRMIER}>Infirmier</option>
                    <option value={ROLES.TECHNICIEN}>Technicien</option>
                    <option value={ROLES.RECEPTIONNISTE}>Receptionniste</option>
                    <option value={ROLES.PROFESSEUR}>Professeur</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="specialite" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Spécialité
                  </label>
                  <input
                    type="text"
                    id="specialite"
                    name="specialite"
                    value={formData.specialite}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {currentUser ? 'Nouveau mot de passe' : 'Mot de passe *'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    required={!currentUser}
                    placeholder={currentUser ? 'Laissez vide pour ne pas changer' : ''}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {currentUser ? 'Confirmer le nouveau mot de passe' : 'Confirmer le mot de passe *'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    required={!currentUser}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <FiSave className="mr-2" />
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}